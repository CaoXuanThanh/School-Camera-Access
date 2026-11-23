"use strict";

async function renderParent(main) {
  const h = app.html;
  main.classList.add("concept-c");
  document.title = "Camera được phép xem | Camera Access";
  const portal = main.closest(".portal");
  const header = portal.querySelector(".portal-top");
  const brand = portal.querySelector(".portal-side .brand");
  const wordmark = document.createElement("span");
  wordmark.textContent = brand.textContent.trim();
  brand.replaceChildren(brand.querySelector(".brand-mark"), wordmark);
  const identity = document.createElement("div");
  identity.className = "parent-identity";
  identity.append(brand, header.querySelector(".portal-location"));
  header.prepend(identity);
  header.querySelector("#change-role").textContent = "Hồ sơ";
  header.querySelector(".portal-session").append(portal.querySelector("#side-role"));

  main.innerHTML = `
    <div class="screen-heading parent-heading">
      <h1 id="school-cameras">Camera được phép xem</h1>
    </div>
    <div class="parent-gallery">
      <details class="parent-student-panel" open>
        <summary><span>Học sinh liên kết</span> <span id="student-count" class="small muted"></span></summary>
        <ul class="parent-students" hidden></ul>
        <p id="no-linked-students" class="small muted" hidden>Chưa có học sinh liên kết với tài khoản này.</p>
      </details>
      <section class="parent-camera-panel" aria-labelledby="school-cameras">
        <div class="section-bar camera-section-bar">
          <p class="small muted" id="camera-count">Đang tải camera…</p>
          <label class="camera-search">
            <span class="sr-only">Tìm camera theo tên, lớp hoặc vị trí</span>
            <input class="field" type="search" id="camera-search" placeholder="Tìm camera">
          </label>
        </div>
        <p class="small muted" id="parent-access-update" role="status"></p>
        <span id="camera-search-status" class="sr-only" role="status"></span>
        <div class="camera-grid" hidden></div>
        <p id="no-camera-results" class="panel empty-panel muted" hidden>Không có camera khớp từ khóa.</p>
        <div id="parent-empty" class="panel empty-panel" hidden>
          <h2>Chưa có camera được cấp quyền</h2><p class="muted"></p>
        </div>
        <p id="parent-dashboard-error" class="panel empty-panel error" role="alert" hidden></p>
      </section>
    </div>`;

  const search = main.querySelector("#camera-search");
  const grid = main.querySelector(".camera-grid");
  const noResults = main.querySelector("#no-camera-results");
  const count = main.querySelector("#camera-count");
  const searchStatus = main.querySelector("#camera-search-status");
  const accessUpdate = main.querySelector("#parent-access-update");
  const empty = main.querySelector("#parent-empty");
  const dashboardError = main.querySelector("#parent-dashboard-error");
  const studentPanel = main.querySelector(".parent-student-panel");
  const studentCount = main.querySelector("#student-count");
  const studentList = main.querySelector(".parent-students");
  const noStudents = main.querySelector("#no-linked-students");
  let currentCameras = null;
  let lastCameraMarkup = "";
  let lastStudentMarkup = "";
  let receivedUpdate = false;
  let active = true;

  function normalizeText(value) {
    return String(value ?? "").toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").trim();
  }

  function applySearch(announce = false) {
    const query = normalizeText(search.value);
    const cards = [...grid.querySelectorAll(".feed-card")];
    cards.forEach((card) => {
      const fields = [...card.querySelector(".feed-details").children];
      card.hidden = !fields.some((field) => normalizeText(field.textContent).includes(query));
    });
    const visible = cards.filter((card) => !card.hidden).length;
    const message = query ? `${visible} kết quả / ${cards.length} camera` : `${cards.length} camera`;
    if (count.textContent !== message) count.textContent = message;
    if (announce && searchStatus.textContent !== message) searchStatus.textContent = message;
    noResults.hidden = !cards.length || visible > 0;
  }

  function renderCard(camera, available) {
    const status = camera.enabled ? app.status(available) : "Đã tắt";
    const action = available ? "Xem camera" : "Xem trạng thái";
    const hasImage = /^[\w-]+\.(?:jpe?g|png|webp)$/i.test(camera.image ?? "");
    const classLabel = camera.className ? `Lớp ${camera.className}` : "";
    const access = camera.classIds.length > 1 ? `Dùng chung · ${classLabel}` : classLabel;
    return `<article class="panel feed-card${available ? "" : " feed-card-unavailable"}">
        <div class="feed-preview">
          <span class="camera-icon" aria-hidden="true"></span>
          ${hasImage ? `<img src="assets/images/${h(camera.image)}" alt="" loading="lazy">
          <span class="feed-preview-label">Ảnh minh họa</span>` : ""}
        </div>
        <div class="feed-details">
          <h2>${h(camera.name)}</h2>
          <p class="small muted">${h(camera.location)}</p>
          ${access ? `<p class="feed-access small">${h(access)}</p>` : ""}
        </div>
        <div class="feed-actions">
          <span class="badge badge-status badge-${available ? "online" : "offline"}">${status}</span>
          <a class="button${available ? "" : " button-secondary"}" href="#/camera/${encodeURIComponent(camera.id)}" aria-label="${action} · ${h(camera.name)}">
            ${action}
          </a>
        </div>
      </article>`;
  }

  function showDashboard({ parent, children, cameras }) {
    const focusedLink = grid.contains(document.activeElement)
      ? document.activeElement.closest("a")
      : null;
    const cameraMarkup = cameras.map((camera) =>
      renderCard(camera, camera.enabled && camera.connectionStatus === "online")
    ).join("");
    const changed = cameraMarkup !== lastCameraMarkup;
    if (changed) {
      grid.innerHTML = cameraMarkup;
      lastCameraMarkup = cameraMarkup;
    }
    grid.hidden = !cameras.length;
    empty.hidden = Boolean(cameras.length);
    dashboardError.hidden = true;
    if (!cameras.length) {
      let reason = "Tài khoản hiện chưa liên kết với học sinh đang học.";
      if (!parent.accessEnabled) reason = "Nhà trường đang tạm khóa quyền xem của tài khoản này.";
      else if (children.some((child) => child.status === "active")) reason = "Các lớp hiện tại chưa được nhà trường gán camera.";
      empty.querySelector("p").textContent = reason;
    }
    applySearch();
    if (changed && focusedLink) {
      const href = focusedLink.getAttribute("href");
      const retained = [...grid.querySelectorAll(".feed-card:not([hidden]) a")]
        .find((link) => link.getAttribute("href") === href);
      (retained || search).focus({ preventScroll: true });
    }

    const studentMarkup = children.map((child) => {
      const className = child.className || child.classId;
      const status = child.status === "active" ? "Đang học" : "Đã nghỉ học";
      return `<li class="parent-student">
        <strong>${h(child.fullName)}</strong>
        <p>${className ? `<span>Lớp ${h(className)}</span><span aria-hidden="true"> · </span>` : ""}<span>${status}</span></p>
      </li>`;
    }).join("");
    if (!currentCameras && children.length > 2 && matchMedia("(max-width: 620px)").matches) {
      studentPanel.open = false;
    }
    if (studentMarkup !== lastStudentMarkup) {
      studentList.innerHTML = studentMarkup;
      lastStudentMarkup = studentMarkup;
    }
    studentList.hidden = !children.length;
    noStudents.hidden = Boolean(children.length);
    studentCount.textContent = children.length ? `(${children.length})` : "";

    const nextCameras = new Map(cameras.map((camera) => [camera.id, camera.name]));
    if (currentCameras) {
      const granted = cameras.filter((camera) => !currentCameras.has(camera.id)).map((camera) => camera.name);
      const revoked = [...currentCameras].filter(([id]) => !nextCameras.has(id)).map(([, name]) => name);
      const changes = [];
      if (granted.length) changes.push(`Đã cấp quyền xem ${granted.join(", ")}`);
      if (revoked.length) changes.push(`Đã thu hồi quyền xem ${revoked.join(", ")}`);
      if (changes.length) {
        const message = changes.join(" · ");
        if (accessUpdate.textContent !== message) accessUpdate.textContent = message;
      }
    }
    currentCameras = nextCameras;
  }

  function showError(error) {
    const restoreFocus = grid.contains(document.activeElement);
    grid.replaceChildren();
    studentList.replaceChildren();
    lastCameraMarkup = "";
    lastStudentMarkup = "";
    currentCameras = null;
    for (const element of [grid, noResults, empty, studentList, noStudents]) element.hidden = true;
    for (const element of [count, accessUpdate, searchStatus, studentCount]) element.textContent = "";
    dashboardError.textContent = error.message || "Không thể tải danh sách camera.";
    dashboardError.hidden = false;
    if (restoreFocus) search.focus({ preventScroll: true });
  }

  search.addEventListener("input", () => {
    if (!dashboardError.hidden || !currentCameras) return;
    applySearch(true);
  });

  const unsubscribe = service.watchParentDashboard((next, error) => {
    if (!active || !main.isConnected) return;
    receivedUpdate = true;
    if (error) showError(error);
    else showDashboard(next);
  });
  app.stopParentDashboard = () => {
    active = false;
    unsubscribe();
  };

  try {
    const dashboard = await service.getParentDashboard();
    if (active && main.isConnected && !receivedUpdate) showDashboard(dashboard);
  } catch (error) {
    if (active && main.isConnected && !receivedUpdate) showError(error);
  }
}
