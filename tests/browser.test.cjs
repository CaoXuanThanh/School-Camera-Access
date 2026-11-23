"use strict";

const assert = require("node:assert/strict");
const { test, before, after } = require("node:test");
const { mkdtemp, mkdir, rm, writeFile, readdir } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { launchChrome } = require("./support/chrome.cjs");
const { user, seedManyRecords } = require("./support/fixtures.cjs");
const { startPreview } = require("../tools/preview.cjs");
const { buildPages } = require("../tools/build-pages.cjs");

const viewports = [[375, 812], [390, 844], [768, 1024], [1366, 768]];
const granted = ["cam-3a1", "cam-3a2", "cam-hanh-lang"];
const routes = [
  ["/quan-tri/lop-hoc", "Học sinh & lớp"],
  ["/quan-tri/dong-bo", "Đối soát quyền"],
  ["/quan-tri/tra-cuu", "Tra cứu quyền"],
  ["/quan-tri/camera", "Danh mục camera"],
  ["/quan-tri/tai-khoan", "Tài khoản demo"],
  ["/quan-tri/lich-su", "Nhật ký thay đổi"],
  ["/ho-so", "Hồ sơ và cài đặt"]
];

const value = JSON.stringify;
let chrome, site, temporary, published;

before(async () => {
  temporary = await mkdtemp(join(tmpdir(), "camera-pages-qa-"));
  published = join(temporary, "dist");
  await buildPages(published);
  site = await startPreview({ root: published, basePath: "/Camera/" });
  chrome = await launchChrome();
  console.log("Browser:", await chrome.version());
});
after(async () => {
  try { await chrome?.close(); }
  finally {
    await site?.close();
    if (temporary) await rm(temporary, { recursive: true, force: true, maxRetries: 4 });
  }
});

async function isolation(t, width = 390, height = 844) {
  const context = await chrome.context();
  t.after(() => context.close());
  const page = await context.open();
  await page.viewport(width, height);
  await page.navigate(site.url);
  await page.wait('Boolean(document.querySelector("#login-form"))');
  return { context, page, mobile: width <= 900 };
}

async function route(page, path, heading) {
  await page.wait("location.hash===" + value("#" + path) +
    " && document.querySelector('main h1')?.textContent===" + value(heading));
}

async function go(page, path, heading) {
  await page.run("location.hash=" + value(path));
  await route(page, path, heading);
}

async function login(page, account, password = user.password) {
  await page.fill("#username", account);
  await page.fill("#password", password);
  await page.tap(".login-submit");
}

async function signIn(page, account) {
  await login(page, account);
  const admin = account === user.admin;
  await route(page, admin ? "/quan-tri" : "/phu-huynh", admin ? "Tổng quan quản trị" : "Camera được phép xem");
}

async function drawer(page) {
  await page.tap(".menu-toggle");
  await page.wait('document.querySelector("#portal-menu").open');
}

async function logout(page, mobile) {
  if (await page.run('Boolean(document.querySelector(".portal-top #side-role"))')) {
    await page.tap(".portal-top #side-role");
  } else if (mobile) {
    await drawer(page);
    await page.tap('#portal-menu [data-portal-action="logout"]');
  } else await page.tap("#side-role");
  await route(page, "/", "Đăng nhập");
}

async function navigateAdmin(page, mobile, path, heading) {
  if (mobile) await drawer(page);
  await page.tap((mobile ? "#portal-menu" : ".portal-side") + " a[href=" + value("#" + path) + "]");
  await route(page, path, heading);
}

function cameraIds(page, visible = false) {
  const selector = visible ? ".feed-card:not([hidden]) a" : ".feed-card a";
  return page.run("Array.from(document.querySelectorAll(" + value(selector) + "), a=>a.hash.split('/').pop())");
}

async function playing(page) {
  await page.wait('document.querySelector("#viewer-playback")?.dataset.state === "playing" && document.querySelector("#camera-player")?.videoWidth > 0');
}

async function layout(page, width) {
  const dimensions = await page.run("[innerWidth, document.documentElement.scrollWidth]");
  assert.equal(dimensions[0], width);
  assert.ok(dimensions[1] <= width, "Horizontal overflow: " + dimensions);
  assert.equal(await page.run('document.querySelectorAll("img:not([alt])").length'), 0);
}

async function targetSize(page, selector) {
  const [width, height] = await page.run("(() => { const r=document.querySelector(" + value(selector) + ").getBoundingClientRect(); return [r.width, r.height]; })()");
  assert.ok(width >= 44 && height >= 44, selector + " target: " + width + " × " + height);
}

async function snapshot(page, name) {
  if (!process.env.QA_REVIEW_DIR) return;
  await mkdir(process.env.QA_REVIEW_DIR, { recursive: true });
  const { data } = await page.send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(process.env.QA_REVIEW_DIR, name + ".png"), Buffer.from(data, "base64"));
}

function cleanConsole(...pages) {
  assert.deepEqual(pages.flatMap((page) => page.errors), []);
}

test("Pages output is static, uses the /Camera/ base path and supports a video byte-range", async () => {
  assert.deepEqual((await readdir(published)).sort(), [".nojekyll", "assets", "index.html", "pages"]);
  const media = await fetch(site.url + "assets/media/classroom-3a1.mp4", { headers: { Range: "bytes=0-31" } });
  assert.equal(media.status, 206);
  assert.equal((await media.arrayBuffer()).byteLength, 32);
  const outside = await fetch(new URL("/assets/js/app.js", site.url));
  assert.equal(outside.status, 404);
  const icon = await fetch(site.url + "assets/images/favicon.svg");
  assert.equal(icon.status, 200);
  assert.equal(icon.headers.get("content-type"), "image/svg+xml");
});

for (const [width, height] of viewports) {
  test("login, role routes, dashboard, search, playback, offline and layout " + width + "×" + height, async (t) => {
    const { page, mobile } = await isolation(t, width, height);
    for (const field of ["#username", "#password"]) {
      assert.equal(await page.run("document.querySelector(" + value(field) + ").labels.length"), 1);
      await targetSize(page, field);
    }
    await targetSize(page, ".login-submit");
    await login(page, user.parent, "incorrect");
    await page.wait('document.querySelector("#password").getAttribute("aria-invalid")==="true"');
    assert.match(await page.run('document.querySelector("#login-error").textContent'), /chưa đúng/);
    await signIn(page, user.parent);
    await page.wait('document.querySelectorAll(".feed-card").length === 3');
    assert.deepEqual(await cameraIds(page), granted);
    assert.equal(await page.run('document.querySelectorAll(".parent-student").length'), 2);
    await layout(page, width);
    await targetSize(page, ".feed-card a");
    await targetSize(page, ".parent-student-panel summary");
    await page.wait('Array.from(document.querySelectorAll(".feed-preview img")).every(i=>i.complete && i.naturalWidth)');
    await snapshot(page, "parent-" + width);
    for (const term of ["Hành lang", "hanh lang"]) {
      await page.fill("#camera-search", term);
      assert.deepEqual(await cameraIds(page, true), ["cam-hanh-lang"]);
    }
    await page.fill("#camera-search", "phong 202");
    assert.deepEqual(await cameraIds(page, true), ["cam-3a2"]);
    await page.fill("#camera-search", "sân sinh hoạt");
    assert.deepEqual(await cameraIds(page, true), []);
    await page.fill("#camera-search", "");
    await page.tap('.feed-card a[href="#/camera/cam-3a1"]');
    await route(page, "/camera/cam-3a1", "Camera lớp 3A1");
    await playing(page);
    assert.equal(await page.run('document.querySelector("#media-label").textContent'), "Video mẫu");
    await layout(page, width);
    await targetSize(page, ".back-route");
    await page.tap(".back-route");
    await route(page, "/phu-huynh", "Camera được phép xem");
    await go(page, "/camera/cam-san-truong", "Camera chưa được cấp quyền");
    assert.equal(await page.run('Boolean(document.querySelector("video"))'), false);
    await logout(page, mobile);

    await signIn(page, user.offline);
    await page.wait('Boolean(document.querySelector(".feed-card-unavailable"))');
    assert.deepEqual(await cameraIds(page), ["cam-san-truong"]);
    await page.tap(".feed-card a");
    await route(page, "/camera/cam-san-truong", "Sân sinh hoạt khu B");
    await page.wait('document.querySelector("#viewer-playback").dataset.state==="unavailable"');
    assert.equal(await page.run('document.querySelector("#camera-player").getAttribute("src")'), null);
    await layout(page, width);
    await logout(page, mobile);

    await login(page, user.admin, "incorrect");
    await page.wait('document.querySelector("#username").getAttribute("aria-invalid")==="true"');
    await signIn(page, user.admin);
    await layout(page, width);
    await snapshot(page, "admin-" + width);
    if (mobile) {
      await targetSize(page, ".menu-toggle");
      await page.focus("#skip-content");
      await page.key("Tab", 9);
      assert.ok(await page.focused(".menu-toggle"));
      await page.key("Enter", 13);
      await page.wait('document.querySelector("#portal-menu").open');
      assert.ok(await page.focused(".menu-close"));
      assert.equal(await page.run('getComputedStyle(document.documentElement).overflowY'), "hidden");
      for (let i = 0; i < 12; i++) {
        await page.key("Tab", 9);
        assert.ok(await page.run('document.activeElement === document.body || Boolean(document.activeElement.closest("#portal-menu"))'));
      }
      await page.key("Escape", 27);
      await page.wait('!document.querySelector("#portal-menu").open');
      assert.ok(await page.focused(".menu-toggle"));
    }
    for (const [path, heading] of routes) {
      await navigateAdmin(page, mobile, path, heading);
      await layout(page, width);
    }
    await page.run('location.hash="/phu-huynh"');
    await route(page, "/quan-tri", "Tổng quan quản trị");
    await logout(page, mobile);
    cleanConsole(page);
  });
}

test("student linking distinguishes records, supports cancellation and applies only saved changes", async (t) => {
  const { page } = await isolation(t);
  await signIn(page, user.admin);
  await go(page, "/quan-tri/tai-khoan", "Tài khoản demo");
  await page.fill("#account-search", "tran hoang nam");
  const edit = '[data-edit-account="PH002"]';
  await page.tap(edit);
  await page.wait('document.querySelector("#app-dialog").open');
  await targetSize(page, '[data-remove-student="HS003"]');
  async function add() {
    await page.focus("#student-picker");
    await page.fill("#student-picker", "nguyen minh anh");
    await page.key("ArrowDown", 40);
    assert.ok(await page.focused('[data-picker-option="HS001"]'));
    await page.key("Enter", 13);
    assert.equal(await page.run('document.querySelectorAll(".selected-students li").length'), 2);
  }
  await add();
  await page.tap("#app-dialog .dialog-heading button");
  await page.wait('!document.querySelector("#app-dialog").open');
  assert.ok(await page.focused(edit));
  await page.tap(edit);
  assert.equal(await page.run('document.querySelectorAll(".selected-students li").length'), 1);
  await add();
  await snapshot(page, "account-dialog-390");
  await page.tap('#account-edit button[type="submit"]');
  await page.wait('!document.querySelector("#app-dialog").open && document.querySelector(".accounts-list").textContent.includes("Nguyễn Minh Anh")');
  await go(page, "/quan-tri/tra-cuu?parentId=PH002&cameraId=cam-3a1", "Tra cứu quyền");
  await page.wait('document.querySelector("#lookup-decision")?.dataset.decision==="GRANTED"');
  await go(page, "/quan-tri/tai-khoan", "Tài khoản demo");
  await page.tap(edit);
  await page.tap('[data-remove-student="HS001"]');
  await page.tap('#account-edit button[type="submit"]');
  await page.wait('!document.querySelector("#app-dialog").open');
  await go(page, "/quan-tri/tra-cuu?parentId=PH002&cameraId=cam-3a1", "Tra cứu quyền");
  await page.wait('document.querySelector("#lookup-decision")?.dataset.decision==="NO_MATCHING_CLASS"');
  cleanConsole(page);
});

test("zoom, primary control contrast and Viewer recovery from an invalid media source", async (t) => {
  const { page } = await isolation(t);
  await page.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  await page.wait("visualViewport.scale >= 2");
  await page.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  const contrast = await page.run(`(() => {
    const style = getComputedStyle(document.querySelector(".login-submit"));
    const luminance = (color) => {
      const channels = color.match(/[0-9]+/g).slice(0,3).map(n => Number(n)/255);
      const linear = channels.map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
      return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    };
    const [dark, light] = [luminance(style.color), luminance(style.backgroundColor)].sort((a,b)=>a-b);
    return (light + .05) / (dark + .05);
  })()`);
  assert.ok(contrast >= 4.5, "Primary button text contrast: " + contrast);
  await signIn(page, user.parent);
  await page.tap('.feed-card a[href="#/camera/cam-3a1"]');
  await playing(page);
  await page.run('document.querySelector("#camera-player").src="assets/images/classroom.jpg"');
  await page.wait('document.querySelector("#viewer-playback").dataset.state === "error"');
  await targetSize(page, "#retry-video");
  await page.tap("#retry-video");
  await playing(page);
  cleanConsole(page);
});

test("profile validation retains a draft, cancel resets it and save survives reload", async (t) => {
  const { page } = await isolation(t);
  await signIn(page, user.parent);
  await page.tap("#change-role");
  await route(page, "/ho-so", "Hồ sơ và cài đặt");
  await page.fill("#profile-name", "Tên kiểm thử");
  await page.fill("#profile-email", "invalid-email");
  await page.fill("#profile-phone", "1");
  await page.tap('#profile-form button[type="submit"]');
  assert.ok(await page.focused("#profile-email"));
  assert.equal(await page.run('document.querySelector("#profile-phone").getAttribute("aria-invalid")'), "true");
  assert.equal(await page.run('document.querySelector("#profile-name").value'), "Tên kiểm thử");
  await page.tap('#profile-form button[type="reset"]');
  assert.equal(await page.run('document.querySelector("#profile-email").value'), user.parent);
  assert.equal(await page.run('document.querySelectorAll("#profile-form [aria-invalid]").length'), 0);
  await page.fill("#profile-phone", "0900000001");
  await page.tap('#profile-form button[type="submit"]');
  await page.wait('document.querySelector("#app-notice").textContent.includes("Đã lưu")');
  await page.send("Page.reload");
  await page.wait('document.querySelector("#profile-phone")?.value==="0900000001"');
  cleanConsole(page);
});

test("a class and enrollment update revokes active playback and updates the open dashboard across tabs", async (t) => {
  const { page, context } = await isolation(t);
  await signIn(page, user.parent);
  await page.tap('.feed-card a[href="#/camera/cam-3a1"]');
  await playing(page);
  await page.run('window.previousVideo=document.querySelector("#camera-player")');
  const admin = await context.open();
  await admin.navigate(site.url);
  await admin.wait('Boolean(document.querySelector("#login-form"))');
  await signIn(admin, user.admin);
  await go(admin, "/quan-tri/dong-bo", "Đối soát quyền");
  await admin.wait('document.querySelector("#sync-status").dataset.state==="ready"');
  await admin.click("#sync-apply");
  await route(page, "/camera/cam-3a1", "Quyền xem đã bị thu hồi");
  assert.equal(await page.run('previousVideo.hasAttribute("src")'), false);
  await page.click(".back-route");
  await route(page, "/phu-huynh", "Camera được phép xem");
  assert.deepEqual(await cameraIds(page), ["cam-3a2", "cam-hanh-lang"]);
  await admin.click("#reset-demo");
  await admin.click("#confirm-reset");
  await page.wait('document.querySelectorAll(".feed-card").length === 3');
  await admin.wait('document.querySelector("#sync-status").dataset.state==="ready"');
  await admin.click("#sync-apply");
  await page.wait('document.querySelector("#parent-access-update").textContent.includes("Đã thu hồi")');
  assert.deepEqual(await cameraIds(page), ["cam-3a2", "cam-hanh-lang"]);
  cleanConsole(page, admin);
});

test("large Admin fixture bounds account rows and picker results, with measured render and input timings", async (t) => {
  const { page } = await isolation(t);
  await page.run("(" + seedManyRecords.toString() + ")(1200)");
  await page.send("Page.reload");
  await page.wait('document.querySelectorAll("#demo-account option").length > 1200');
  await signIn(page, user.admin);

  async function measureRoute(path, heading) {
    const start = performance.now();
    await go(page, path, heading);
    return Math.round(performance.now() - start);
  }
  const accountRender = await measureRoute("/quan-tri/tai-khoan", "Tài khoản demo");
  assert.equal(await page.run('document.querySelectorAll(".account-row").length'), 16);
  await page.tap("#account-next");
  assert.match(await page.run('document.querySelector("#account-page").textContent'), /^2 \/ /);
  const accountSearch = await page.run("(() => {\n    const field=document.querySelector(\"#account-search\"), start=performance.now();\n    field.value=\"qa-ph-1200\"; field.dispatchEvent(new Event(\"input\",{bubbles:true}));\n    return Number((performance.now()-start).toFixed(1));\n  })()");
  assert.equal(await page.run('document.querySelectorAll(".account-row").length'), 1);
  await page.tap('[data-edit-account="QA-PH-1200"]');
  await page.wait('document.querySelector("#app-dialog").open');
  await page.focus("#student-picker");
  assert.equal(await page.run('document.querySelectorAll("#student-picker-results button").length'), 6);
  await page.fill("#student-picker", "trung ten");
  assert.equal(await page.run('document.querySelectorAll("#student-picker-results button").length'), 2);
  const details = await page.run('document.querySelector("#student-picker-results").innerText');
  for (const id of ["QA-HS-1199", "QA-HS-1200"]) assert.ok(details.includes(id));
  await page.key("Escape", 27);
  assert.ok(await page.run('document.querySelector("#app-dialog").open && document.querySelector("#student-picker-results").hidden'));
  await page.key("Escape", 27);
  await page.wait('!document.querySelector("#app-dialog").open');
  const lookupRender = await measureRoute("/quan-tri/tra-cuu", "Tra cứu quyền");
  for (const name of ["parent", "camera"]) {
    await page.focus("#lookup-" + name);
    assert.equal(await page.run("document.querySelectorAll('#lookup-" + name + "-results button').length"), 6);
  }
  await layout(page, 390);
  const studentsRender = await measureRoute("/quan-tri/lop-hoc", "Học sinh & lớp");
  const studentsRows = await page.run('document.querySelectorAll("#record-list tbody tr").length');
  assert.equal(studentsRows, 24);
  await page.tap("#record-next");
  assert.match(await page.run('document.querySelector("#record-page").textContent'), /^2 \/ /);
  await page.fill("#record-search", "QA-HS-1200");
  assert.equal(await page.run('document.querySelectorAll("#record-list tbody tr").length'), 1);
  const camerasRender = await measureRoute("/quan-tri/camera", "Danh mục camera");
  const camerasRows = await page.run('document.querySelectorAll("#record-list .device-row").length');
  assert.equal(camerasRows, 24);
  assert.equal(await page.run('document.querySelectorAll("#record-list img[loading=lazy]").length'), camerasRows);
  await page.tap("#record-next");
  assert.match(await page.run('document.querySelector("#record-page").textContent'), /^2 \/ /);
  await page.tap('[data-edit-camera="qa-cam-0021"]');
  await page.wait('document.querySelector("#app-dialog").open');
  await page.run(`(() => {
    const field=document.querySelector('#record-edit [name="online"]');
    field.value="offline";
    field.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await page.click("#save-record");
  await page.wait('!document.querySelector("#app-dialog").open && document.querySelector("#record-page")?.textContent.startsWith("2 /")');
  assert.ok(await page.focused('[data-edit-camera="qa-cam-0021"]'));
  await page.fill("#record-search", "qa-cam-1200");
  assert.equal(await page.run('document.querySelectorAll("#record-list .device-row").length'), 1);
  console.log("Admin fixture timings (ms; route wall time includes test polling):", { accountRender, accountSearch, lookupRender, studentsRender, studentsRows, camerasRender, camerasRows });
  cleanConsole(page);
});

test("legacy relative routes still redirect inside the Pages project path", async (t) => {
  const { page, mobile } = await isolation(t);
  await signIn(page, user.parent);
  for (const [file, hash, heading] of [
    ["profile", "/ho-so", "Hồ sơ và cài đặt"],
    ["camera-viewer", "/camera", "Thiếu mã camera"],
    ["parent-dashboard", "/phu-huynh", "Camera được phép xem"]
  ]) {
    await page.navigate(site.url + "pages/" + file + ".html");
    await route(page, hash, heading);
    assert.ok(await page.run('location.pathname.startsWith("/Camera/")'));
  }
  await logout(page, mobile);
  await signIn(page, user.admin);
  await page.navigate(site.url + "pages/admin-access.html");
  await route(page, "/quan-tri", "Tổng quan quản trị");
  cleanConsole(page);
});
