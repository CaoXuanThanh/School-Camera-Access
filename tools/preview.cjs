"use strict";

const { createServer } = require("node:http");
const { createReadStream } = require("node:fs");
const { stat } = require("node:fs/promises");
const { resolve, join, extname } = require("node:path");
const { once } = require("node:events");

const project = resolve(__dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4"
};

async function sendFile(request, response, root, basePath) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (!pathname.startsWith(basePath)) {
    response.writeHead(404).end();
    return;
  }
  const path = pathname.slice(basePath.length) || "index.html";
  const segments = path.split("/");
  const type = types[extname(path)];
  if (!type || !/^(?:index\.html$|assets\/|pages\/)/.test(path) ||
      !segments.every((segment) => /^[\w-][\w.-]*$/.test(segment))) {
    response.writeHead(404).end();
    return;
  }
  const file = join(root, ...segments);
  const { size } = await stat(file);
  let start = 0;
  let end = size - 1;
  const headers = { "Content-Type": type, "Cache-Control": "no-store", "Accept-Ranges": "bytes" };
  const range = request.headers.range;
  if (range) {
    const parts = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!parts || (!parts[1] && !parts[2])) start = size;
    else if (parts[1]) {
      start = Number(parts[1]);
      if (parts[2]) end = Math.min(end, Number(parts[2]));
    } else {
      start = Math.max(0, size - Number(parts[2]));
    }
    if (start > end) {
      response.writeHead(416, { "Content-Range": "bytes */" + size }).end();
      return;
    }
    headers["Content-Range"] = "bytes " + start + "-" + end + "/" + size;
  }
  headers["Content-Length"] = end - start + 1;
  response.writeHead(range ? 206 : 200, headers);
  if (request.method === "HEAD" || !size) {
    response.end();
    return;
  }
  const stream = createReadStream(file, { start, end });
  stream.on("error", () => response.destroy());
  response.on("close", () => stream.destroy());
  stream.pipe(response);
}

async function startPreview({ root = project, basePath = "/", port = 0 } = {}) {
  if (!/^\/(?:[\w-]+\/)*$/.test(basePath)) throw new Error("Base path must start and end with /");
  const server = createServer((request, response) => {
    sendFile(request, response, root, basePath).catch((error) => {
      if (response.headersSent) response.destroy();
      else response.writeHead(error instanceof URIError ? 400 : error.code === "ENOENT" ? 404 : 500).end();
    });
  });
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  return {
    url: "http://127.0.0.1:" + server.address().port + basePath,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

if (require.main === module) {
  const [port = "5500", basePath = "/", root = project] = process.argv.slice(2);
  startPreview({ port: Number(port), basePath, root: resolve(root) })
    .then(({ url }) => console.log(url))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { startPreview };
