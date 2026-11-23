"use strict";

const { cp, mkdir, writeFile, copyFile } = require("node:fs/promises");
const { join, resolve } = require("node:path");

const project = resolve(__dirname, "..");

async function buildPages(directory) {
  // Creating the destination without recursive mode prevents reusing stale files.
  await mkdir(directory);
  for (const folder of ["assets", "pages"]) {
    await cp(join(project, folder), join(directory, folder), { recursive: true });
  }
  await copyFile(join(project, "index.html"), join(directory, "index.html"));
  await writeFile(join(directory, ".nojekyll"), "");
}

if (require.main === module) {
  const output = resolve(process.argv[2] || "dist");
  buildPages(output)
    .then(() => console.log(output))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { buildPages };
