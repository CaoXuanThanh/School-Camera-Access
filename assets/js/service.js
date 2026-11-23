"use strict";

const service = (() => {
  const sessionKey = "camera-access-user-v1";
  const adminKey = "camera-access-admin-profile-v1";
  const samplePassword = "CameraDemo26";
  const demoVideos = new Map([
    ["cam-3a1", "assets/media/classroom-3a1.mp4"],
    ["cam-3a2", "assets/media/classroom-3a2.mp4"],
    ["cam-hanh-lang", "assets/media/school-hallway.mp4"],
    ["cam-san-truong", "assets/media/playground.mp4"]
  ]);
  let currentId;
  let adminProfile = { id: "AD001", username: "admin", name: "Quản trị nhà trường", email: "admin@example.test", phone: "0900000000" };
  try {
    currentId = sessionStorage.getItem(sessionKey);
    const saved = JSON.parse(localStorage.getItem(adminKey));
    if (saved?.id === adminProfile.id) adminProfile = { ...adminProfile, ...saved };
  } catch {
    // The seeded profile and in-memory session are available when storage is blocked.
  }

  function failure(code, message) {
    throw Object.assign(new Error(message), { code });
  }

  function publicUser(user, role) {
    return {
      id: user.id, username: user.username || user.email, displayName: user.name,
      role, email: user.email, phone: user.phone || "0900000000", accessEnabled: user.accessEnabled !== false
    };
  }

  function currentUser() {
    if (!currentId) return null;
    if (currentId === adminProfile.id) return publicUser(adminProfile, "admin");
    const parent = cameraAccess.getData().parents.find((item) => item.id === currentId);
    return parent ? publicUser(parent, "parent") : null;
  }

  function requireUser(role) {
    const user = currentUser();
    if (!user) failure("UNAUTHENTICATED", "Đăng nhập để tiếp tục.");
    if (role && user.role !== role) failure("FORBIDDEN", "Tài khoản không có quyền mở chức năng này.");
    return user;
  }

  function setSession(id) {
    currentId = id;
    try {
      if (id) sessionStorage.setItem(sessionKey, id);
      else sessionStorage.removeItem(sessionKey);
    } catch {
      // In-memory identity still works during the demo.
    }
    window.dispatchEvent(new Event("camera-data-change"));
  }

  async function login({ username, password }) {
    const signIn = [adminProfile, ...cameraAccess.getData().parents].find((user) =>
      (user.username || user.email).toLowerCase() === String(username).trim().toLowerCase()
    );
    if (!signIn || password !== samplePassword) failure("INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu demo chưa đúng.");
    setSession(signIn.id);
    return currentUser();
  }

  function toCamera(camera, data) {
    const classIds = [...new Set(camera.studentsWithAccess.map((student) => student.classId))];
    const names = data.classes.filter((entry) => classIds.includes(entry.id)).map((entry) => entry.name);
    return {
      ...camera, classIds, classId: classIds[0] || null, className: names.join(", "),
      enabled: camera.enabled !== false, connectionStatus: camera.online ? "online" : "offline"
    };
  }

  async function getParentDashboard() {
    const parent = requireUser("parent");
    const data = cameraAccess.getData();
    const view = cameraAccess.getParentView(parent.id);
    return {
      parent,
      children: view.students.map((student) => ({
        id: student.id, fullName: student.name, classId: student.classId,
        className: data.classes.find((entry) => entry.id === student.classId)?.name ?? "",
        status: student.active ? "active" : "inactive"
      })),
      cameras: view.cameras.map((camera) => toCamera(camera, data))
    };
  }

  async function getCameraView(cameraId) {
    const profile = requireUser("parent");
    const data = cameraAccess.getData();
    const known = data.cameras.find((camera) => camera.id === cameraId);
    if (!known) failure("NOT_FOUND", "Không tìm thấy camera");
    const assigned = cameraAccess.getParentView(profile.id).cameras.find((camera) => camera.id === cameraId);
    if (!assigned) failure("FORBIDDEN", "Camera chưa được cấp quyền");
    const camera = toCamera(assigned, data);
    const canPlay = camera.enabled && camera.connectionStatus === "online";
    const demoSource = canPlay ? demoVideos.get(camera.id) ?? null : null;
    return {
      camera, canPlay, demoSource,
      message: !camera.enabled ? "Camera đã tắt phát." : !canPlay ? "Camera đang ngoại tuyến." : ""
    };
  }

  async function inspectCameraAccess(parentId, cameraId) {
    requireUser("admin");
    const review = cameraAccess.getCameraAccessReview(parentId, cameraId);
    if (!review) failure("NOT_FOUND", "Không tìm thấy phụ huynh hoặc camera.");

    const { camera, decision } = review;
    const canPlay = decision === "GRANTED" && camera.enabled &&
      camera.connectionStatus === "online" && demoVideos.has(camera.id);
    return { ...review, canPlay };
  }

  function watchData(read, callback) {
    let watching = true;
    let revision = 0;

    async function refresh() {
      const request = ++revision;
      let value = null;
      let failure = null;
      try { value = await read(); }
      catch (error) { failure = error; }
      if (watching && request === revision) callback(value, failure);
    }
    window.addEventListener("camera-data-change", refresh);
    return () => {
      watching = false;
      window.removeEventListener("camera-data-change", refresh);
    };
  }

  function watchCameraView(cameraId, callback) {
    return watchData(() => getCameraView(cameraId), callback);
  }

  function watchParentDashboard(callback) {
    return watchData(getParentDashboard, callback);
  }

  async function updateMyProfile(properties) {
    const user = requireUser();
    const fields = ["displayName", "email", "phone"];
    if (Object.keys(properties).some((key) => !fields.includes(key))) failure("VALIDATION_ERROR", "Chỉ được thay đổi tên, email và số điện thoại.");
    const displayName = String(properties.displayName ?? "").trim();
    const email = String(properties.email ?? "").trim();
    const phone = String(properties.phone ?? "").trim();
    if (displayName.length < 2 || displayName.length > 60) failure("VALIDATION_ERROR", "Tên cần từ 2 đến 60 ký tự.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) failure("VALIDATION_ERROR", "Email chưa đúng định dạng.");
    if (!/^0\d{9}$/.test(phone)) failure("VALIDATION_ERROR", "Số điện thoại cần 10 chữ số và bắt đầu bằng 0.");
    const update = { name: displayName, email, phone, username: user.username };
    if (user.role === "admin") {
      const next = { ...adminProfile, ...update };
      try { localStorage.setItem(adminKey, JSON.stringify(next)); }
      catch { failure("STORAGE_ERROR", "Trình duyệt đang chặn lưu hồ sơ."); }
      adminProfile = next;
    } else cameraAccess.updateAccount(user.id, update, { requirePersistence: true });
    return currentUser();
  }

  async function getAdminOverview() {
    requireUser("admin");
    const data = cameraAccess.getData();
    return { ...data, parentSummaries: data.parents.map(({ id }) => cameraAccess.getParentView(id)) };
  }

  async function enrollment(studentId, { classId, status }, preview = false) {
    requireUser("admin");
    if (!["active", "inactive"].includes(status)) failure("VALIDATION_ERROR", "Trạng thái học không hợp lệ.");
    const result = cameraAccess.changeEnrollment(studentId, classId, status === "active", { preview });
    if (!result) failure("VALIDATION_ERROR", "Học sinh hoặc lớp không hợp lệ.");
    if (preview) return result;
    const student = cameraAccess.getData().students.find((item) => item.id === studentId);
    return { id: student.id, fullName: student.name, classId: student.classId, status };
  }

  async function previewSchoolSync() {
    requireUser("admin");
    const plan = cameraAccess.previewSchoolSync(mockSchoolRoster);
    if (!plan) failure("VALIDATION_ERROR", "Lô hồ sơ mẫu chứa mã học sinh hoặc lớp không hợp lệ.");
    return plan;
  }

  async function applySchoolSync(revision) {
    requireUser("admin");
    const { status, changes, impact } = cameraAccess.applySchoolSync(mockSchoolRoster, revision);
    if (status === "invalid") failure("VALIDATION_ERROR", "Lô hồ sơ mẫu chứa mã học sinh hoặc lớp không hợp lệ.");
    if (status === "stale") failure("STALE_DATA", "Dữ liệu đã thay đổi. Hãy đối soát lại trước khi áp dụng.");
    return { changes, impact };
  }

  async function setParentAccess(id, enabled) {
    requireUser("admin");
    if (typeof enabled !== "boolean") failure("VALIDATION_ERROR", "Trạng thái quyền không hợp lệ.");
    const parent = cameraAccess.updateAccount(id, { accessEnabled: enabled });
    if (!parent) failure("NOT_FOUND", "Không tìm thấy tài khoản.");
    return publicUser(parent, "parent");
  }

  async function saveParentAccount(properties) {
    requireUser("admin");
    const result = cameraAccess.saveParentAccount(properties);
    if (result.error) failure("VALIDATION_ERROR", result.error);
    return result;
  }

  async function listDemoAccounts() {
    return [
      { username: adminProfile.username, name: adminProfile.name, role: "admin" },
      ...cameraAccess.getData().parents.map((parent) => ({ username: parent.username || parent.email, name: parent.name, role: "parent" }))
    ];
  }

  return {
    login, getCurrentUser: async () => currentUser(), logout: async () => { setSession(null); return null; },
    getParentDashboard, watchParentDashboard, getCameraView, watchCameraView, inspectCameraAccess,
    getMyProfile: async () => requireUser(), updateMyProfile,
    getAdminOverview, setStudentEnrollment: enrollment, previewSchoolSync, applySchoolSync,
    setParentAccess, listDemoAccounts, saveParentAccount,
    async configureCamera(id, classes, online, preview = false) {
      requireUser("admin");
      return cameraAccess.changeCamera(id, classes, online, { preview });
    },
    async resetDemo() { requireUser("admin"); cameraAccess.reset(); }
  };
})();
