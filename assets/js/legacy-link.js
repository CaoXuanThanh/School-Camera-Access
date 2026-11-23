"use strict";

const route = document.body.dataset.route;
const target = new URL("../index.html", location.href);
const cameraId = new URLSearchParams(location.search).get("id");

target.hash = route === "/camera" && cameraId ? `${route}/${encodeURIComponent(cameraId)}` : route;
location.replace(target.href);
