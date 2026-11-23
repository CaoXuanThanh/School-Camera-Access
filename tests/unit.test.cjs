"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const { permissionFixture } = require("./support/fixtures.cjs");

const accessSource = readFileSync(resolve(__dirname, "../assets/js/camera-access.js"), "utf8");

function model(fixture = permissionFixture()) {
  function storage() {
    const values = new Map();
    return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  }
  return runInNewContext(accessSource + "\ncameraAccess;", {
    mockData: fixture,
    structuredClone,
    crypto,
    Event,
    localStorage: storage(),
    sessionStorage: storage(),
    window: new EventTarget()
  });
}
const visible = (access, parent = "p1") => access.getParentView(parent).cameras.map(({ id }) => id);

test("class membership grants each camera once and omits cameras outside the linked classes", () => {
  const access = model();
  assert.deepEqual(visible(access), ["a", "b", "shared"]);
  const shared = access.getParentView("p1").cameras.find(({ id }) => id === "shared");
  assert.deepEqual(shared.studentsWithAccess.map(({ id }) => id), ["s1", "s2"]);
  assert.equal(access.getCameraAccessReview("p1", "other").decision, "NO_MATCHING_CLASS");
});

test("offline is independent of permission and the review lists the student evidence", () => {
  const access = model();
  const review = access.getCameraAccessReview("p2", "b");
  assert.equal(review.decision, "GRANTED");
  assert.equal(review.camera.connectionStatus, "offline");
  assert.equal(review.studentEvidence[0].counts, true);
});

test("class changes and inactive enrollment revoke only the applicable grants", () => {
  const access = model();
  const impact = access.changeEnrollment("s1", "C", true, { preview: true });
  assert.deepEqual(impact[0].revoked.map(({ id }) => id), ["a"]);
  assert.deepEqual(visible(access), ["a", "b", "shared"]);
  access.changeEnrollment("s1", "C", true);
  assert.deepEqual(visible(access), ["b", "shared", "other"]);
  access.changeEnrollment("s2", null, false);
  assert.deepEqual(visible(access), ["other"]);
  assert.equal(access.getCameraAccessReview("p2", "b").decision, "NO_ACTIVE_STUDENTS");
});

test("account lock overrides class matches and reset preserves saved links", () => {
  const access = model();
  access.saveParentAccount({ id: "p1", name: "Phụ huynh 1", email: "parent@example.test", studentIds: ["s1"] });
  access.reset();
  assert.deepEqual(visible(access), ["a", "shared"]);
  access.updateAccount("p1", { accessEnabled: false });
  assert.deepEqual(visible(access), []);
  assert.equal(access.getCameraAccessReview("p1", "a").decision, "ACCOUNT_LOCKED");
});

test("a stale school sync is rejected before applying any changes", () => {
  const access = model();
  const roster = [{ studentId: "s1", classId: "C", status: "active" }];
  const first = access.previewSchoolSync(roster);
  access.changeCamera("b", ["B"], true);
  assert.equal(access.applySchoolSync(roster, first.revision).status, "stale");
  assert.deepEqual(visible(access), ["a", "b", "shared"]);
  const revised = access.previewSchoolSync(roster);
  assert.equal(access.applySchoolSync(roster, revised.revision).status, "applied");
  assert.deepEqual(visible(access), ["b", "shared", "other"]);
});
