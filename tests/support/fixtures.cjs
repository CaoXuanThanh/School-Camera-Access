"use strict";

const user = {
  parent: "trang@example.test",
  offline: "nam@example.test",
  admin: "admin",
  password: "CameraDemo26"
};

function permissionFixture() {
  return {
    classes: [
      { id: "A", name: "A" }, { id: "B", name: "B" }, { id: "C", name: "C" }
    ],
    students: [
      { id: "s1", name: "Học sinh 1", classId: "A", active: true },
      { id: "s2", name: "Học sinh 2", classId: "B", active: true }
    ],
    parents: [
      { id: "p1", name: "Phụ huynh 1", email: "parent@test.example", studentIds: ["s1", "s2"] },
      { id: "p2", name: "Phụ huynh 2", email: "offline@test.example", studentIds: ["s2"] }
    ],
    cameras: [
      { id: "a", name: "A", classIds: ["A"], online: true },
      { id: "b", name: "B", classIds: ["B"], online: false },
      { id: "shared", name: "Dùng chung", classIds: ["A", "B"], online: true },
      { id: "other", name: "C", classIds: ["C"], online: true }
    ],
    activity: []
  };
}

// Serialized into a disposable browser context after the login page has loaded.
function seedManyRecords(size) {
  const data = cameraAccess.getData();
  data.classes.push({ id: "QA", name: "QA", location: "Khu kiểm thử" });
  for (let i = 1; i <= size; i++) {
    const id = String(i).padStart(4, "0");
    data.students.push({ id: "QA-HS-" + id, name: i >= size - 1 ? "Học sinh Trùng Tên" : "Học sinh thử " + id, classId: "QA", active: i !== size });
    data.parents.push({ id: "QA-PH-" + id, name: "Phụ huynh thử " + id, email: "qa-" + id + "@example.test", studentIds: [] });
    data.cameras.push({ id: "qa-cam-" + id, name: "Camera thử " + id, location: "Khu QA · Phòng " + id, online: true, classIds: ["QA"], image: "classroom.jpg" });
  }
  localStorage.setItem("camera-access-accounts-v1", JSON.stringify(data.parents));
  localStorage.setItem("camera-access-data-v1", JSON.stringify({ data, revision: "test-fixture" }));
}

module.exports = { user, permissionFixture, seedManyRecords };
