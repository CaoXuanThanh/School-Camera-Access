"use strict";

const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const { mkdtemp, readFile, rm } = require("node:fs/promises");
const { once } = require("node:events");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");

async function until(check, label, limit = 15000) {
  const deadline = Date.now() + limit;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await delay(50);
  }
  throw new Error("Timed out waiting for " + label);
}

function executable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.platform === "win32") {
    const paths = ["ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"]
      .filter((key) => process.env[key])
      .map((key) => join(process.env[key], "Google/Chrome/Application/chrome.exe"));
    const path = paths.find(existsSync);
    if (path) return path;
  }
  if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "google-chrome";
}

async function launchChrome() {
  const profile = await mkdtemp(join(tmpdir(), "camera-qa-"));
  const args = [
    "--headless=new", "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0",
    "--user-data-dir=" + profile, "--autoplay-policy=no-user-gesture-required",
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-component-update"
  ];
  if (process.env.CHROME_NO_SANDBOX === "1") args.push("--no-sandbox");
  if (process.platform === "win32") {
    args.push("--disable-gpu", "--in-process-gpu", "--disable-software-rasterizer", "--disable-gpu-compositing");
  }
  const child = spawn(executable(), [...args, "about:blank"], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
  let startupError;
  let diagnostics = "";
  child.on("error", (error) => { startupError = error; });
  child.stderr.on("data", (data) => { diagnostics = (diagnostics + data).slice(-3000); });
  const exited = new Promise((resolve) => {
    child.once("error", resolve);
    child.once("exit", resolve);
  });
  let socket;
  const commands = new Map();
  const listeners = new Map();
  let token = 0;

  async function close() {
    if (socket?.readyState === WebSocket.OPEN) {
      // Chrome closes the connection before replying to Browser.close.
      socket.send(JSON.stringify({ id: ++token, method: "Browser.close" }));
      socket.close();
    } else if (child.pid) child.kill();
    const exitedNormally = await Promise.race([exited.then(() => true), delay(4000, false, { ref: false })]);
    if (!exitedNormally) {
      child.kill();
      await exited;
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
  }

  try {
    socket = await until(async () => {
      if (startupError) throw startupError;
      if (child.exitCode !== null) throw new Error("Chrome exited during startup");
      let contents;
      try {
        contents = await readFile(join(profile, "DevToolsActivePort"), "utf8");
      } catch (error) {
        if (!["ENOENT", "EPERM", "EBUSY"].includes(error.code)) throw error;
        return null;
      }
      const [port, path] = contents.trim().split(/\r?\n/);
      if (!/^\d+$/.test(port) || !path?.startsWith("/devtools/browser/")) return null;
      const attempt = new WebSocket("ws://127.0.0.1:" + port + path);
      try {
        const opened = await Promise.race([once(attempt, "open").then(() => true), delay(1000, false, { ref: false })]);
        if (opened) return attempt;
      } catch {
        // A port can be advertised before its loopback WebSocket accepts connections.
      }
      attempt.close();
      return null;
    }, "Chrome DevTools");
  } catch (error) {
    await close();
    throw new Error("Chrome could not start: " + error.message + ". Set CHROME_PATH if needed. " + diagnostics, { cause: error });
  }

  socket.addEventListener("message", ({ data }) => {
    const response = JSON.parse(data);
    const request = commands.get(response.id);
    if (request) {
      commands.delete(response.id);
      clearTimeout(request.timer);
      if (response.error) request.reject(new Error(request.method + ": " + response.error.message));
      else request.resolve(response.result);
    } else if (response.method) listeners.get(response.sessionId)?.(response.method, response.params);
  });
  socket.addEventListener("close", () => {
    for (const request of commands.values()) {
      clearTimeout(request.timer);
      request.reject(new Error("Chrome disconnected: " + request.method));
    }
    commands.clear();
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++token;
      const timer = setTimeout(() => {
        commands.delete(id);
        reject(new Error("Chrome command timed out: " + method));
      }, 20000);
      commands.set(id, { method, resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  async function context() {
    const { browserContextId } = await send("Target.createBrowserContext");
    const sessions = [];
    return {
      open: async () => {
        const { targetId } = await send("Target.createTarget", { url: "about:blank", browserContextId });
        const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
        sessions.push(sessionId);
        const sendPage = (method, params) => send(method, params, sessionId);
        const errors = [];
        listeners.set(sessionId, (method, info) => {
          if (method === "Runtime.exceptionThrown") errors.push(info.exceptionDetails.exception?.description || info.exceptionDetails.text);
          if (method === "Log.entryAdded" && info.entry.level === "error") {
            errors.push([info.entry.text, info.entry.url].filter(Boolean).join(" "));
          }
        });
        await Promise.all(["Page.enable", "Runtime.enable", "Log.enable"].map((method) => sendPage(method)));
        return page(sendPage, errors);
      },
      close: async () => {
        await send("Target.disposeBrowserContext", { browserContextId });
        for (const id of sessions) listeners.delete(id);
      }
    };
  }

  return { context, close, version: async () => (await send("Browser.getVersion")).product };
}

function page(send, errors) {
  async function run(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  const value = JSON.stringify;
  const element = (selector) => "document.querySelector(" + value(selector) + ")";
  const wait = (expression) => until(() => run(expression), expression);
  let mobile = false;
  return {
    send, errors, run, wait,
    async viewport(width, height) {
      mobile = width <= 900;
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
    },
    async navigate(url) {
      const result = await send("Page.navigate", { url });
      if (result.errorText) throw new Error("Navigation failed: " + result.errorText);
    },
    click: (selector) => run(element(selector) + ".click()"),
    focus: (selector) => run(element(selector) + ".focus()"),
    focused: (selector) => run("document.activeElement.matches(" + value(selector) + ")"),
    fill: (selector, text) => run("(() => {const input=" + element(selector) +
      "; input.value=" + value(text) + ";input.dispatchEvent(new Event('input',{bubbles:true}));})()"),
    async tap(selector) {
      const [x, y] = await run("(() => {const e=" + element(selector) +
        ";e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];})()");
      if (mobile) {
        await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
        await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      } else {
        for (const type of ["mousePressed", "mouseReleased"]) {
          await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
        }
      }
    },
    async key(key, windowsVirtualKeyCode) {
      const event = { key, code: key, windowsVirtualKeyCode };
      const press = key === "Enter" ? { type: "keyDown", text: "\r" } : { type: "rawKeyDown" };
      await send("Input.dispatchKeyEvent", { ...event, ...press });
      await send("Input.dispatchKeyEvent", { ...event, type: "keyUp" });
    }
  };
}

module.exports = { launchChrome };
