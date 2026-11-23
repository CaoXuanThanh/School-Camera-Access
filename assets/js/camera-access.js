"use strict";

const cameraAccess = (() => {
  const storageKey = "camera-access-demo-v1";
  const accountKey = "camera-access-accounts-v1";
  const dataKey = "camera-access-data-v1";
  let accounts = readAccounts();
  let state = readSession();
  let observedRevision = readStoredRevision();

  function readAccounts() {
    try {
      const saved = JSON.parse(localStorage.getItem(accountKey));
      if (Array.isArray(saved) && saved.length && saved.every((parent) =>
        typeof parent?.id === "string" && typeof parent.name === "string" &&
        typeof parent.email === "string" && Array.isArray(parent.studentIds)
      )) return saved;
    } catch {
      // Seeded accounts also work in browsers that restrict storage for file URLs.
    }
    return structuredClone(mockData.parents);
  }

  function readSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(dataKey) || sessionStorage.getItem(storageKey));
      const collections = ["classes", "students", "parents", "cameras", "activity"];
      if (collections.every((key) => Array.isArray(saved?.data?.[key]))) {
        saved.data.parents = structuredClone(accounts);
        return saved;
      }
    } catch {
      // A browser can restrict storage for local files. Navigation still uses memory.
    }
    const data = structuredClone(mockData);
    data.parents = structuredClone(accounts);
    return { data };
  }

  function saveSession() {
    state.revision = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const serialized = JSON.stringify(state);
    try {
      sessionStorage.setItem(storageKey, serialized);
    } catch {
      // The in-memory session is sufficient while the tab stays open.
    }
    try {
      localStorage.setItem(dataKey, serialized);
      observedRevision = state.revision;
    } catch {
      // The session copy remains available when persistent storage is blocked.
    }
  }

  function readStoredRevision() {
    try {
      return JSON.parse(localStorage.getItem(dataKey))?.revision ?? null;
    } catch {
      return undefined;
    }
  }

  function refreshRosterData() {
    const persisted = readStoredRevision();
    if (persisted === undefined || persisted === observedRevision) return;
    accounts = readAccounts();
    state = readSession();
    observedRevision = persisted;
  }

  function getData() {
    return structuredClone(state.data);
  }

  function linkedStudents(parent, data) {
    return data.students.filter((student) => parent?.studentIds.includes(student.id));
  }

  function denied(decision) {
    return { decision, studentsWithAccess: [] };
  }

  function evaluateCameraAccess(parent, students, camera) {
    if (parent?.accessEnabled === false) return denied("ACCOUNT_LOCKED");
    if (!students.length) return denied("NO_LINKED_STUDENTS");

    const activeStudents = students.filter((student) => student.active);
    if (!activeStudents.length) return denied("NO_ACTIVE_STUDENTS");
    if (!camera.classIds.length) return denied("CAMERA_UNASSIGNED");

    const studentsWithAccess = activeStudents.filter((student) => camera.classIds.includes(student.classId));
    if (!studentsWithAccess.length) return denied("NO_MATCHING_CLASS");
    return { decision: "GRANTED", studentsWithAccess };
  }

  function getParentView(parentId, data = state.data) {
    const parent = data.parents.find((item) => item.id === parentId);
    const students = linkedStudents(parent, data);
    const cameras = data.cameras.flatMap((camera) => {
      const { decision, studentsWithAccess } = evaluateCameraAccess(parent, students, camera);
      return decision === "GRANTED" ? [{ ...camera, studentsWithAccess }] : [];
    });
    return structuredClone({ parent, students, cameras });
  }

  function getCameraAccessReview(parentId, cameraId) {
    const { parents, cameras, classes } = state.data;
    const parent = parents.find((item) => item.id === parentId);
    const camera = cameras.find((item) => item.id === cameraId);
    if (!parent || !camera) return null;

    const students = linkedStudents(parent, state.data);
    const { decision, studentsWithAccess } = evaluateCameraAccess(parent, students, camera);
    const matchedIds = new Set(studentsWithAccess.map((student) => student.id));
    const studentEvidence = students.map((student) => ({
      id: student.id,
      name: student.name,
      classId: student.classId,
      className: classes.find((item) => item.id === student.classId)?.name ?? "",
      status: student.active ? "active" : "inactive",
      counts: matchedIds.has(student.id)
    }));
    return {
      parent: { id: parent.id, displayName: parent.name, accessEnabled: parent.accessEnabled !== false },
      camera: {
        id: camera.id,
        name: camera.name,
        classes: classes.filter((item) => camera.classIds.includes(item.id)).map(({ id, name }) => ({ id, name })),
        connectionStatus: camera.online ? "online" : "offline",
        enabled: camera.enabled !== false
      },
      decision,
      studentEvidence
    };
  }

  function describeImpact(before, after) {
    return after.parents.flatMap((parent) => {
      const previous = getParentView(parent.id, before).cameras;
      const updated = getParentView(parent.id, after).cameras;
      const granted = updated.filter((camera) => !previous.some((item) => item.id === camera.id));
      const revoked = previous.filter((camera) => !updated.some((item) => item.id === camera.id));
      return granted.length || revoked.length ? [{ parent, granted, revoked }] : [];
    });
  }

  function validEnrollment(data, classId, active) {
    return typeof active === "boolean" &&
      ((!active && classId === null) || data.classes.some((item) => item.id === classId));
  }

  function changeEnrollment(studentId, classId, active, { preview = false } = {}) {
    const next = getData();
    const student = next.students.find((item) => item.id === studentId);
    if (!student || !validEnrollment(next, classId, active)) return null;
    const previousClass = student.classId;
    const previousActive = student.active;
    student.classId = classId;
    student.active = active;

    const impact = describeImpact(state.data, next);
    if (!preview && (previousClass !== classId || previousActive !== active)) {
      const before = `${previousActive ? "Đang học" : "Đã nghỉ"} · ${previousClass || "Chưa xếp lớp"}`;
      const after = `${active ? "Đang học" : "Đã nghỉ"} · ${classId || "Chưa xếp lớp"}`;
      recordChange(next, { type: "Học sinh", subject: student.name, before, after, impact });
    }
    return impact;
  }

  function prepareSchoolSync(roster) {
    refreshRosterData();
    const next = getData();
    const changes = [];
    const seen = new Set();

    for (const { studentId, classId, status } of roster) {
      const student = next.students.find((item) => item.id === studentId);
      const active = status === "active";
      if (seen.has(studentId) || !student || !["active", "inactive"].includes(status) ||
          !validEnrollment(next, classId, active)) return null;
      seen.add(studentId);
      if (student.classId === classId && student.active === active) continue;

      changes.push({
        studentId,
        name: student.name,
        before: { classId: student.classId, status: student.active ? "active" : "inactive" },
        after: { classId, status }
      });
      student.classId = classId;
      student.active = active;
    }

    const result = {
      revision: state.revision ?? null,
      changes,
      impact: describeImpact(state.data, next)
    };
    return { next, result };
  }

  function previewSchoolSync(roster) {
    return prepareSchoolSync(roster)?.result ?? null;
  }

  function applySchoolSync(roster, reviewedRevision) {
    const plan = prepareSchoolSync(roster);
    if (!plan) return { status: "invalid" };
    if (plan.result.revision !== reviewedRevision) return { status: "stale" };

    const { changes, impact } = plan.result;
    if (changes.length) {
      recordChange(plan.next, {
        type: "Đồng bộ",
        subject: "Hồ sơ học sinh",
        before: `${changes.length} hồ sơ chờ đối soát`,
        after: `${changes.length} hồ sơ đã cập nhật`,
        changes,
        impact
      });
    }
    return { status: "applied", changes, impact };
  }

  function changeCamera(cameraId, classIds, online, { preview = false } = {}) {
    const next = getData();
    const camera = next.cameras.find((item) => item.id === cameraId);
    if (!camera || typeof online !== "boolean" || !classIds.every((id) => next.classes.some((item) => item.id === id))) return null;
    const previousClasses = camera.classIds;
    const previousOnline = camera.online;
    camera.classIds = [...new Set(classIds)].sort();
    camera.online = online;

    const impact = describeImpact(state.data, next);
    if (!preview && (previousOnline !== online || [...previousClasses].sort().join(",") !== camera.classIds.join(","))) {
      const describe = (ids, status) => `${ids.join(", ") || "Chưa gán lớp"} · ${status ? "Hoạt động" : "Ngoại tuyến"}`;
      recordChange(next, {
        type: "Camera", subject: camera.name,
        before: describe(previousClasses, previousOnline),
        after: describe(camera.classIds, online),
        impact
      });
    }
    return impact;
  }

  function recordChange(next, entry) {
    next.activity.unshift({ ...entry, at: new Date().toISOString(), actor: "Quản trị demo" });
    state.data = next;
    saveSession();
    window.dispatchEvent(new Event("camera-data-change"));
  }

  function saveParentAccount({ id, name, email, studentIds }) {
    const next = getData();
    const current = next.parents.find((parent) => parent.id === id);
    name = name.trim();
    email = email.trim().toLowerCase();
    studentIds = [...new Set(studentIds)].sort();
    if (id && !current) return { error: "Không tìm thấy tài khoản này." };
    if (!name || name.length > 80) return { error: "Nhập tên tài khoản từ 1 đến 80 ký tự." };
    if (!/^[^@\s]+@[^@\s]+\.test$/i.test(email) || email.length > 120) {
      return { error: "Dùng email mẫu kết thúc bằng .test, ví dụ phuhuynh@example.test." };
    }
    if (next.parents.some((parent) =>
      parent.id !== id && [parent.email, parent.username].some((value) => value?.toLowerCase() === email)
    )) {
      return { error: "Email mẫu đã được dùng cho tài khoản khác." };
    }
    if (!studentIds.length || !studentIds.every((studentId) => next.students.some((student) => student.id === studentId))) {
      return { error: "Chọn ít nhất một học sinh mẫu." };
    }

    const nextNumber = Math.max(0, ...next.parents.map((parent) => Number(parent.id.slice(2)) || 0)) + 1;
    const parent = {
      ...current, id: id || "PH" + String(nextNumber).padStart(3, "0"),
      username: current?.username || current?.email || email, name, email, studentIds
    };
    if (current) Object.assign(current, parent);
    else next.parents.push(parent);

    accounts = structuredClone(next.parents);
    const impact = describeImpact(state.data, next);
    const previous = state.data.parents.find((item) => item.id === id);
    const describe = (item) => `${item.email} · ${item.studentIds.join(", ")}`;
    recordChange(next, { type: "Tài khoản", subject: parent.name, before: previous ? describe(previous) : "Chưa có tài khoản", after: describe(parent), impact });

    let persisted = false;
    try {
      localStorage.setItem(accountKey, JSON.stringify(accounts));
      persisted = true;
    } catch {
      // The updated accounts remain usable in this tab.
    }
    return { persisted, id: parent.id };
  }

  function updateAccount(id, properties, { requirePersistence = false } = {}) {
    const next = getData();
    const parent = next.parents.find((item) => item.id === id);
    if (!parent) return null;
    Object.assign(parent, properties);
    try { localStorage.setItem(accountKey, JSON.stringify(next.parents)); } catch {
      if (requirePersistence) throw Object.assign(new Error("Trình duyệt đang chặn lưu hồ sơ."), { code: "STORAGE_ERROR" });
    }
    accounts = structuredClone(next.parents);
    if (typeof properties.accessEnabled === "boolean") {
      recordChange(next, {
        type: "Quyền tài khoản", subject: parent.name,
        before: state.data.parents.find((item) => item.id === id).accessEnabled === false ? "Đã khóa" : "Đang mở",
        after: properties.accessEnabled ? "Đang mở" : "Đã khóa",
        impact: describeImpact(state.data, next)
      });
    } else {
      state.data = next;
      saveSession();
    }
    return structuredClone(parent);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== dataKey && event.key !== accountKey) return;
    accounts = readAccounts();
    state = readSession();
    observedRevision = readStoredRevision();
    window.dispatchEvent(new Event("camera-data-change"));
  });

  function reset() {
    state.data = structuredClone(mockData);
    state.data.parents = structuredClone(accounts);
    saveSession();
    window.dispatchEvent(new Event("camera-data-change"));
  }

  return {
    getData, getParentView, getCameraAccessReview, changeEnrollment, previewSchoolSync, applySchoolSync,
    changeCamera, saveParentAccount, updateAccount, reset
  };
})();
