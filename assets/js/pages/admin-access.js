"use strict";

async function renderAdmin(main, page, query) {
  if (page === "dong-bo") return renderSchoolSync(main);
  const data = await service.getAdminOverview();
  if (page === "tra-cuu") return renderAccessLookup(main, data, query);
  if (page === "lop-hoc") renderAdminStudents(main, data);
  else if (page === "camera") renderAdminCameras(main, data);
  else if (page === "tai-khoan") renderAdminAccounts(main, data);
  else if (page === "lich-su") renderAdminActivity(main, data);
  else renderAdminOverview(main, data);
}

function adminSearch(value) {
  return value.toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").trim();
}

function metric(label, value, detail) {
  return `<div class="panel metric"><p>${app.html(label)}</p><strong>${value}</strong><p class="small muted">${app.html(detail)}</p></div>`;
}

function renderAdminOverview(main, data) {
  const active = data.students.filter((student) => student.active).length;
  const online = data.cameras.filter((camera) => camera.enabled !== false && camera.online).length;
  main.innerHTML = `
    <div class="screen-heading heading-actions">
      <div><h1>Tổng quan quản trị</h1><p>Quản lý thiết bị và quyền xem camera theo lớp.</p></div>
      <a class="button" href="#/quan-tri/tra-cuu">Tra cứu quyền</a>
    </div>
    <section class="panel overview-metrics" aria-label="Dữ liệu tổng quan">
      <div class="metric-grid">
        ${metric("Lớp học", data.classes.length, "Lớp trong danh mục")}
        ${metric("Học sinh đang học", active, `${data.students.length} hồ sơ học sinh`)}
        ${metric("Tài khoản phụ huynh", data.parents.length, `${data.parents.filter((parent) => parent.accessEnabled === false).length} tài khoản đã khóa quyền`)}
        ${metric("Camera hoạt động", online, `${data.cameras.length} thiết bị trong danh mục`)}
      </div>
    </section>
    <div class="overview-workspace">
      <section class="panel overview-workflow" aria-labelledby="admin-tasks">
        <h2 id="admin-tasks">Quản lý quyền theo lớp</h2>
        <a href="#/quan-tri/dong-bo"><strong>Đối soát quyền</strong><span class="small muted">Xem tác động trước khi áp dụng thay đổi hồ sơ</span></a>
        <a href="#/quan-tri/lop-hoc"><strong>Học sinh & lớp</strong><span class="small muted">Cập nhật lớp và trạng thái học</span></a>
        <a href="#/quan-tri/camera"><strong>Danh mục camera</strong><span class="small muted">Gán camera và kiểm tra tình trạng thiết bị</span></a>
        <a href="#/quan-tri/tai-khoan"><strong>Tài khoản demo</strong><span class="small muted">Quản lý liên kết học sinh và quyền của phụ huynh</span></a>
      </section>
      <section class="overview-activity" aria-labelledby="admin-recent">
        <div class="section-bar"><h2 id="admin-recent">Thay đổi gần đây</h2><a href="#/quan-tri/lich-su">Xem nhật ký</a></div>
        ${activityList(data.activity.slice(0, 2))}
      </section>
    </div>`;
}

async function renderSchoolSync(main) {
  main.innerHTML = `
    <div class="screen-heading">
      <h1>Đối soát quyền</h1>
      <p>Xem thay đổi hồ sơ và quyền xem camera trước khi đồng bộ.</p>
    </div>
    <section class="panel sync-source" aria-labelledby="sync-source-heading">
      <div>
        <div class="sync-source-title"><h2 id="sync-source-heading">Hệ thống hồ sơ học sinh</h2><span class="badge">Nguồn mẫu</span></div>
        <p class="small muted" id="sync-status" role="status" data-state="loading" tabindex="-1">Đang đối chiếu dữ liệu…</p>
      </div>
      <button id="sync-review" class="button button-secondary" type="button" disabled>Đối soát lại</button>
    </section>
    <div id="sync-details" hidden>
      <section id="sync-summary" class="sync-summary" aria-label="Tổng hợp tác động"></section>
      <div class="sync-review-panels">
        <section class="panel records-panel" aria-labelledby="sync-records-heading">
          <h2 id="sync-records-heading">Hồ sơ thay đổi</h2>
          <div id="sync-changes" class="sync-panel-body"></div>
        </section>
        <section class="panel records-panel" aria-labelledby="sync-parents-heading">
          <h2 id="sync-parents-heading">Quyền xem của phụ huynh</h2>
          <div id="sync-impact" class="sync-panel-body"></div>
        </section>
      </div>
    </div>
    <div class="sync-actions">
      <button id="sync-apply" class="button" type="button" disabled>Áp dụng cập nhật</button>
      <a class="button button-secondary" href="#/quan-tri/lich-su">Xem nhật ký</a>
    </div>`;

  const status = main.querySelector("#sync-status");
  const reviewButton = main.querySelector("#sync-review");
  const applyButton = main.querySelector("#sync-apply");
  const details = main.querySelector("#sync-details");
  const summary = main.querySelector("#sync-summary");
  const changes = main.querySelector("#sync-changes");
  const impact = main.querySelector("#sync-impact");
  let review = null;

  function setStatus(state, message) {
    status.dataset.state = state;
    status.textContent = message;
  }

  function showResult(result, lookupLinks = false) {
    const counts = result.impact.reduce((total, entry) => ({
      grants: total.grants + entry.granted.length,
      revokes: total.revokes + entry.revoked.length
    }), { grants: 0, revokes: 0 });
    summary.innerHTML = `
      ${metric("Hồ sơ", result.changes.length, "Thay đổi lớp hoặc tình trạng học")}
      ${metric("Lượt cấp quyền", counts.grants, "Theo cặp phụ huynh và camera")}
      ${metric("Lượt thu hồi", counts.revokes, "Theo cặp phụ huynh và camera")}`;
    changes.innerHTML = renderSchoolSyncChanges(result.changes);
    impact.innerHTML = renderImpact(result.impact, lookupLinks);
    details.hidden = false;
  }

  async function reviewChanges() {
    review = null;
    reviewButton.disabled = true;
    applyButton.disabled = true;
    details.hidden = true;
    setStatus("loading", "Đang đối chiếu dữ liệu…");
    try {
      review = await service.previewSchoolSync();
      if (!main.isConnected) return;
      showResult(review);
      applyButton.disabled = !review.changes.length;
      if (review.changes.length) setStatus("ready", "Đã đối chiếu. Kiểm tra tác động trước khi áp dụng.");
      else setStatus("empty", "Dữ liệu hiện tại đã khớp với nguồn mẫu.");
    } catch (error) {
      setStatus("error", error.message || "Không thể đối soát dữ liệu.");
    } finally {
      reviewButton.disabled = false;
    }
  }

  reviewButton.addEventListener("click", reviewChanges);
  applyButton.addEventListener("click", async () => {
    if (applyButton.disabled || !review?.changes.length) return;
    applyButton.disabled = true;
    reviewButton.disabled = true;
    setStatus("applying", "Đang áp dụng cập nhật…");
    try {
      const applied = await service.applySchoolSync(review.revision);
      if (!main.isConnected) return;
      review = null;
      showResult(applied, true);
      setStatus("applied", `Đã áp dụng ${applied.changes.length} thay đổi hồ sơ và cập nhật quyền xem.`);
    } catch (error) {
      review = null;
      if (error.code === "STALE_DATA") {
        setStatus("stale", "Dữ liệu đã đổi sau khi xem trước. Chọn Đối soát lại để kiểm tra bản cập nhật mới.");
      } else {
        setStatus("error", error.message || "Không thể áp dụng cập nhật. Hãy đối soát lại.");
      }
    } finally {
      reviewButton.disabled = false;
      if (main.isConnected) status.focus();
    }
  });
  await reviewChanges();
}

function renderSchoolSyncChanges(changes) {
  if (!changes.length) return '<p class="small muted">Không có hồ sơ cần cập nhật.</p>';
  const h = app.html;
  const describe = ({ classId, status }) => (
    `${status === "active" ? "Đang học" : "Đã nghỉ học"} · ${classId ? "Lớp " + classId : "Chưa xếp lớp"}`
  );
  return `<ul class="sync-changes">${changes.map((change) => `
    <li>
      <strong>${h(change.name)}</strong>
      <span class="small muted">${h(change.studentId)}</span>
      <dl class="sync-change-detail">
        <div><dt>Trước</dt><dd>${h(describe(change.before))}</dd></div>
        <div><dt>Sau</dt><dd>${h(describe(change.after))}</dd></div>
      </dl>
    </li>`).join("")}</ul>`;
}

function lookupHref(parentId, cameraId) {
  const query = new URLSearchParams();
  if (parentId) query.set("parentId", parentId);
  if (cameraId) query.set("cameraId", cameraId);
  const search = query.toString();
  return search ? `#/quan-tri/tra-cuu?${search}` : "#/quan-tri/tra-cuu";
}

function pickerMarkup(id, label, placeholder) {
  return `
    <div class="record-picker" id="${app.html(id)}-picker">
      <label for="${app.html(id)}">${app.html(label)}</label>
      <input class="field" id="${app.html(id)}" type="search" placeholder="${app.html(placeholder)}" autocomplete="off" aria-controls="${app.html(id)}-results">
      <p class="picker-current small" hidden></p>
      <div class="picker-results" id="${app.html(id)}-results" hidden>
        <p class="small muted picker-feedback" role="status"></p>
        <ul class="picker-options"></ul>
      </div>
    </div>`;
}

function bindPicker(picker, records, onSelect, include = () => true) {
  const input = picker.querySelector("input");
  const form = picker.closest("form");
  const results = picker.querySelector(".picker-results");
  const feedback = picker.querySelector(".picker-feedback");
  const options = picker.querySelector(".picker-options");
  const h = app.html;
  const index = records.map((record) => ({
    record,
    keywords: adminSearch([record.title, record.detail, record.keywords].join(" "))
  }));
  const byId = new Map(records.map((record) => [record.id, record]));
  const limit = 6;

  function search() {
    const terms = adminSearch(input.value).split(/\s+/);
    const matches = index.filter(({ record, keywords }) =>
      include(record) && terms.every((term) => keywords.includes(term))
    );
    for (const panel of form.querySelectorAll(".picker-results")) panel.hidden = panel !== results;
    feedback.textContent = matches.length > limit
      ? `${matches.length} kết quả. Hiện ${limit} mục, nhập thêm để thu hẹp.`
      : matches.length ? `${matches.length} kết quả` : "Không tìm thấy kết quả.";
    options.innerHTML = matches.slice(0, limit).map(({ record }) => `
      <li><button type="button" data-picker-option="${h(record.id)}">
        <strong>${h(record.title)}</strong><span class="small muted">${h(record.detail)}</span>
      </button></li>`).join("");
  }

  input.addEventListener("focus", search);
  input.addEventListener("input", search);
  input.addEventListener("click", () => { if (results.hidden) search(); });
  form.addEventListener("click", (event) => {
    if (!picker.contains(event.target)) results.hidden = true;
  });
  picker.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !results.hidden) {
      event.preventDefault();
      event.stopPropagation();
      input.value = "";
      input.focus();
      results.hidden = true;
    }
    if (event.target !== input) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.hidden) search();
      options.querySelector("button")?.focus();
    }
    if (event.key === "Enter" && !results.hidden) {
      event.preventDefault();
      options.querySelector("button")?.click();
    }
  });
  options.addEventListener("click", (event) => {
    const button = event.target.closest("[data-picker-option]");
    if (!button) return;
    onSelect(byId.get(button.dataset.pickerOption));
    input.value = "";
    input.focus();
    results.hidden = true;
  });

  return input;
}

async function renderAccessLookup(main, data, query) {
  const parents = data.parents.map((parent) => ({
    id: parent.id, title: parent.name, detail: `${parent.id} · ${parent.username || parent.email}`
  }));
  const cameras = data.cameras.map((camera) => ({
    id: camera.id, title: camera.name, detail: `${camera.id} · ${camera.location}`,
    keywords: camera.classIds.join(" ")
  }));
  main.innerHTML = `
    <div class="screen-heading">
      <h1>Tra cứu quyền</h1>
      <p>Kiểm tra căn cứ cấp quyền và khả năng phát video cho một phụ huynh.</p>
    </div>
    <section class="panel lookup-panel" aria-labelledby="lookup-form-heading">
      <h2 id="lookup-form-heading">Phụ huynh và camera</h2>
      <form id="lookup-form" class="lookup-form">
        ${pickerMarkup("lookup-parent", "Phụ huynh", "Tên, mã hoặc email")}
        ${pickerMarkup("lookup-camera", "Camera", "Tên, mã hoặc vị trí")}
        <button id="lookup-submit" class="button" type="submit" disabled>Tra cứu</button>
      </form>
      <p id="lookup-status" class="small muted" role="status" data-state="idle"></p>
    </section>
    <section id="lookup-result" class="panel lookup-panel lookup-result" aria-labelledby="lookup-result-heading" hidden></section>`;

  const form = main.querySelector("#lookup-form");
  const parentPicker = main.querySelector("#lookup-parent-picker");
  const cameraPicker = main.querySelector("#lookup-camera-picker");
  const submit = main.querySelector("#lookup-submit");
  const status = main.querySelector("#lookup-status");
  const result = main.querySelector("#lookup-result");
  let parent = parents.find((record) => record.id === query.get("parentId"));
  let camera = cameras.find((record) => record.id === query.get("cameraId"));

  function setStatus(state, message) {
    status.dataset.state = state;
    status.textContent = message;
  }

  function showSelection() {
    for (const [picker, choice] of [[parentPicker, parent], [cameraPicker, camera]]) {
      const current = picker.querySelector(".picker-current");
      current.textContent = choice ? `${choice.title} · ${choice.id}` : "Chưa chọn";
      current.hidden = false;
    }
    result.hidden = true;
    submit.disabled = !parent || !camera;
    setStatus("idle", submit.disabled ? "Chọn một phụ huynh và một camera để bắt đầu." : "Chọn Tra cứu để xem kết quả.");
  }

  const parentInput = bindPicker(parentPicker, parents, (record) => {
    parent = record;
    showSelection();
  });
  const cameraInput = bindPicker(cameraPicker, cameras, (record) => {
    camera = record;
    showSelection();
  });

  async function inspectSelection() {
    result.hidden = true;
    parentInput.disabled = true;
    cameraInput.disabled = true;
    submit.disabled = true;
    setStatus("loading", "Đang kiểm tra quyền xem…");
    try {
      const report = await service.inspectCameraAccess(parent.id, camera.id);
      if (!main.isConnected) return;
      result.innerHTML = renderAccessReport(report);
      result.hidden = false;
      setStatus("ready", "Đã tra cứu theo dữ liệu hiện tại.");
    } catch (error) {
      setStatus("error", error.message || "Tra cứu gặp lỗi. Hãy thử lại.");
    } finally {
      parentInput.disabled = false;
      cameraInput.disabled = false;
      submit.disabled = false;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const target = lookupHref(parent.id, camera.id);
    if (location.hash !== target) history.replaceState(history.state, "", target);
    inspectSelection();
  });

  showSelection();
  if ((query.has("parentId") && !parent) || (query.has("cameraId") && !camera)) {
    setStatus("error", "Liên kết chứa mã phụ huynh hoặc camera không hợp lệ. Chọn lại để tra cứu.");
  } else if (parent && camera) {
    await inspectSelection();
  }
}

function renderAccessReport({ parent, camera, decision, studentEvidence, canPlay }) {
  const h = app.html;
  const reasons = {
    GRANTED: "Ít nhất một học sinh đang học tại lớp được gán camera.",
    ACCOUNT_LOCKED: "Quyền xem của tài khoản đang bị khóa.",
    NO_LINKED_STUDENTS: "Tài khoản chưa liên kết với học sinh.",
    NO_ACTIVE_STUDENTS: "Tài khoản hiện không có học sinh đang học.",
    CAMERA_UNASSIGNED: "Camera chưa được gán cho lớp nào.",
    NO_MATCHING_CLASS: "Các lớp đang học nằm ngoài phạm vi camera này."
  };
  const granted = decision === "GRANTED";
  const deviceStatus = camera.enabled ? app.status(camera.connectionStatus === "online") : "Đã tắt";
  const linkedClasses = camera.classes.map(({ name }) => h(name)).join(", ");
  const playbackNote = camera.enabled && camera.connectionStatus === "online" && !canPlay
    ? (granted ? "Nguồn video diễn tập hiện chưa sẵn sàng." : "Phiên phát cần quyền xem của tài khoản đã chọn.")
    : "";
  return `
    <div class="lookup-result-heading">
      <h2 id="lookup-result-heading">Kết quả tra cứu</h2>
      <p class="small muted">${h(parent.displayName)} · ${h(camera.name)}</p>
    </div>
    <div class="lookup-decisions">
      <div class="lookup-decision" id="lookup-decision" data-decision="${h(decision)}">
        <h3>Quyền xem</h3>
        <span class="badge badge-${granted ? "online" : "offline"}">${granted ? "Được cấp quyền" : "Từ chối"}</span>
        <p class="small">${h(reasons[decision])}</p>
      </div>
      <div class="lookup-decision" id="lookup-playback" data-can-play="${canPlay}">
        <h3>Khả năng phát video</h3>
        <span class="badge badge-${canPlay ? "online" : "offline"}">${canPlay ? "Có thể phát" : "Chưa thể phát"}</span>
        <p class="small">Thiết bị · ${h(deviceStatus)}</p>
        ${playbackNote ? `<p class="small muted">${h(playbackNote)}</p>` : ""}
      </div>
    </div>
    <p class="small lookup-camera-classes"><strong>Lớp được gán camera</strong> · ${linkedClasses || "Chưa gán lớp"}</p>
    <div class="lookup-students">
      <h3>Học sinh liên kết</h3>
      <div id="lookup-evidence">${studentEvidence.length ? `
        <ul class="lookup-evidence-list">${studentEvidence.map((student) => `
          <li data-student-id="${h(student.id)}" data-counts="${student.counts}">
            <div>
              <strong>${h(student.name)}</strong>
              <p class="small muted">${h(student.id)} · ${h(student.className || student.classId || "Chưa xếp lớp")} · ${student.status === "active" ? "Đang học" : "Đã nghỉ học"}</p>
            </div>
            ${student.counts ? '<span class="badge badge-online">Căn cứ cấp quyền</span>' : ""}
          </li>`).join("")}</ul>` : '<p class="small muted">Tài khoản chưa liên kết với học sinh.</p>'}</div>
    </div>`;
}

function pagerMarkup(id, label) {
  return `<nav class="list-pages" id="${id}-pages" aria-label="${label}" hidden>
    <button class="button button-secondary" type="button" id="${id}-prev">Trang trước</button>
    <span class="small muted" id="${id}-page" role="status"></span>
    <button class="button button-secondary" type="button" id="${id}-next">Trang sau</button>
  </nav>`;
}

function bindPager(main, id, redraw, pageSize = 16) {
  const nav = main.querySelector("#" + id + "-pages");
  const previous = nav.querySelector("#" + id + "-prev");
  const next = nav.querySelector("#" + id + "-next");
  const status = nav.querySelector("#" + id + "-page");
  let page = 0;
  for (const [button, alternate, offset] of [[previous, next, -1], [next, previous, 1]]) {
    button.addEventListener("click", () => {
      page += offset;
      redraw();
      if (button.disabled) alternate.focus();
    });
  }
  return {
    get page() { return page; },
    select(index = 0) { page = index; },
    rows(items) {
      const total = Math.ceil(items.length / pageSize);
      page = Math.max(0, Math.min(page, total - 1));
      nav.hidden = total < 2;
      previous.disabled = page === 0;
      next.disabled = page >= total - 1;
      status.textContent = total ? `${page + 1} / ${total}` : "";
      return items.slice(page * pageSize, (page + 1) * pageSize);
    }
  };
}

function renderAdminStudents(main, data) {
  const h = app.html;
  main.innerHTML = `
    <div class="screen-heading"><h1>Học sinh & lớp</h1><p>Cập nhật lớp hiện tại và trạng thái học để tính lại quyền xem.</p></div>
    <div class="class-grid">${data.classes.map((item) => {
      const enrolled = data.students.filter((student) => student.active && student.classId === item.id).length;
      const assigned = data.cameras.filter((camera) => camera.classIds.includes(item.id)).length;
      return `<button class="panel class-tile" type="button" data-class="${h(item.id)}" aria-pressed="false">
        <strong>Lớp ${h(item.name)}</strong><span class="small muted">${h(item.location)}</span><span class="small">${enrolled} học sinh · ${assigned} camera</span>
      </button>`;
    }).join("")}</div>
    <section class="panel records-panel screen-section" aria-labelledby="student-heading">
      <div class="section-bar"><h2 id="student-heading">Hồ sơ học sinh</h2><span class="badge" id="record-count" role="status"></span></div>
      <div class="record-tools">
        <label><span>Tìm hồ sơ</span><input class="field" type="search" id="record-search" placeholder="Tên, mã, lớp hoặc phụ huynh"></label>
        <label><span>Lớp</span><select class="field field-select" id="record-filter"><option value="">Tất cả lớp</option>${classOptions(data.classes)}</select></label>
      </div>
      <div id="record-list"></div>
      ${pagerMarkup("record", "Trang học sinh")}
    </section>`;

  const search = main.querySelector("#record-search");
  const filter = main.querySelector("#record-filter");
  const tiles = [...main.querySelectorAll(".class-tile")];
  const list = main.querySelector("#record-list");
  const pager = bindPager(main, "record", update, 24);
  const parentsByStudent = new Map();
  for (const parent of data.parents) {
    for (const id of parent.studentIds) {
      if (!parentsByStudent.has(id)) parentsByStudent.set(id, []);
      parentsByStudent.get(id).push(parent);
    }
  }
  function update() {
    const query = adminSearch(search.value);
    const students = data.students.map((student) => ({
      ...student,
      parents: parentsByStudent.get(student.id) || []
    })).filter((student) =>
      (!filter.value || student.classId === filter.value) &&
      adminSearch([student.name, student.id, student.classId, ...student.parents.map((parent) => parent.name)].join(" ")).includes(query)
    );
    tiles.forEach((tile) => tile.setAttribute("aria-pressed", String(tile.dataset.class === filter.value)));
    main.querySelector("#record-count").textContent = `${students.length} học sinh`;
    const visible = pager.rows(students);
    list.innerHTML = students.length ? `
      <table class="record-table">
        <thead><tr><th scope="col">Học sinh</th><th scope="col">Lớp</th><th scope="col">Phụ huynh</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead>
        <tbody>${visible.map((student) => `
          <tr>
            <th scope="row"><strong>${h(student.name)}</strong><span class="small muted record-meta">${h(student.id)}</span></th>
            <td data-label="Lớp">${h(student.classId || "Chưa xếp lớp")}</td>
            <td data-label="Phụ huynh">${h(student.parents.map((parent) => parent.name).join(", ") || "Chưa liên kết")}</td>
            <td data-label="Trạng thái"><span class="badge badge-${student.active ? "online" : "offline"}">${student.active ? "Đang học" : "Đã nghỉ học"}</span></td>
            <td><button class="button button-secondary record-action" data-edit-student="${h(student.id)}" aria-label="Cập nhật ${h(student.name)}">Cập nhật</button></td>
          </tr>`).join("")}</tbody>
      </table>` : '<p class="empty-panel muted">Không tìm thấy hồ sơ phù hợp.</p>';
  }
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-student]");
    if (button) editStudent(data, button.dataset.editStudent, { search: search.value, filter: filter.value, page: pager.page });
  });
  tiles.forEach((tile) => tile.addEventListener("click", () => {
    filter.value = filter.value === tile.dataset.class ? "" : tile.dataset.class;
    pager.select();
    update();
  }));
  search.addEventListener("input", () => { pager.select(); update(); });
  filter.addEventListener("change", (event) => { pager.select(event.detail); update(); });
  update();
}

function classOptions(classes, selected = "") {
  return classes.map((item) => `<option value="${app.html(item.id)}" ${item.id === selected ? "selected" : ""}>Lớp ${app.html(item.name)}</option>`).join("");
}

function editStudent(data, studentId, filters) {
  const student = data.students.find((item) => item.id === studentId);
  const dialog = app.showDialog(`Cập nhật ${student.name}`, `
    <form id="record-edit">
      <div class="dialog-fields">
        <label><span>Lớp hiện tại</span><select class="field field-select" name="classId"><option value="" ${student.classId ? "" : "selected"}>Chưa xếp lớp</option>${classOptions(data.classes, student.classId)}</select></label>
        <label><span>Trạng thái học</span><select class="field field-select" name="active">
          <option value="active" ${student.active ? "selected" : ""}>Đang học</option>
          <option value="inactive" ${student.active ? "" : "selected"}>Đã nghỉ học</option>
        </select></label>
      </div>
      ${adminSaveControls()}
    </form>`);
  connectAdminEditor(dialog, (values, preview) =>
    service.setStudentEnrollment(studentId, { classId: values.get("classId") || null, status: values.get("active") }, preview),
    "Đã cập nhật hồ sơ và tính lại quyền.", filters, `[data-edit-student="${studentId}"]`);
}

function renderAdminCameras(main, data) {
  const h = app.html;
  main.innerHTML = `
    <div class="screen-heading"><h1>Danh mục camera</h1><p>Gán camera cho một hoặc nhiều lớp và theo dõi trạng thái thiết bị.</p></div>
    <section class="panel records-panel">
      <div class="section-bar"><h2>Thiết bị</h2><span id="record-count" class="badge" role="status"></span></div>
      <div class="record-tools">
        <label><span>Tìm camera</span><input class="field" type="search" id="record-search" placeholder="Tên, mã hoặc vị trí"></label>
        <label><span>Trạng thái</span><select class="field field-select" id="record-filter">
          <option value="">Tất cả trạng thái</option><option value="online">Hoạt động</option><option value="offline">Ngoại tuyến</option>
        </select></label>
      </div>
      <div id="record-list"></div>
      ${pagerMarkup("record", "Trang camera")}
    </section>`;
  // Khối "Nguồn để thử tích hợp" (links WVCams / NPS / Apple HLS) đã được loại bỏ khỏi giao diện theo yêu cầu dọn dẹp UI.
  // Nếu cần khôi phục cho buổi demo tích hợp, thêm lại section.source-panel vào innerHTML ở trên,
  // ngay sau section.records-panel (tham khảo backup tại ANTI_HANDOFF.md).
  const search = main.querySelector("#record-search");
  const filter = main.querySelector("#record-filter");
  const list = main.querySelector("#record-list");
  const pager = bindPager(main, "record", update, 24);
  function update() {
    const query = adminSearch(search.value);
    const cameras = data.cameras.filter((camera) =>
      (!filter.value || camera.online === (filter.value === "online")) &&
      adminSearch([camera.name, camera.id, camera.location, ...camera.classIds].join(" ")).includes(query)
    );
    main.querySelector("#record-count").textContent = `${cameras.length} camera`;
    const visible = pager.rows(cameras);
    list.innerHTML = cameras.length ? `<div class="device-list">${visible.map((camera) => `
      <article class="device-row">
        <img src="assets/images/${h(camera.image)}" alt="" width="724" height="724" loading="lazy">
        <div><h3>${h(camera.name)}</h3><p class="small muted">${h(camera.location)}</p></div>
        <div class="device-classes">${camera.classIds.length
          ? camera.classIds.map((id) => `<span class="badge">Lớp ${h(id)}</span>`).join("")
          : '<span class="small muted">Chưa gán lớp</span>'}</div>
        <span class="badge badge-status badge-${camera.online ? "online" : "offline"}">${app.status(camera.online)}</span>
        <button class="button button-secondary record-action" data-edit-camera="${h(camera.id)}" aria-label="Cấu hình ${h(camera.name)}">Cấu hình</button>
      </article>`).join("")}</div>` : '<p class="empty-panel muted">Không tìm thấy camera phù hợp.</p>';
  }
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-camera]");
    if (button) editCamera(data, button.dataset.editCamera, { search: search.value, filter: filter.value, page: pager.page });
  });
  search.addEventListener("input", () => { pager.select(); update(); });
  filter.addEventListener("change", (event) => { pager.select(event.detail); update(); });
  update();
}

function editCamera(data, cameraId, filters) {
  const h = app.html;
  const camera = data.cameras.find((item) => item.id === cameraId);
  const dialog = app.showDialog(camera.name, `
    <form id="record-edit">
      <fieldset class="camera-class-options"><legend>Lớp được cấp camera</legend>
        ${data.classes.map((item) => `<label>
          <input type="checkbox" name="classes" value="${h(item.id)}" ${camera.classIds.includes(item.id) ? "checked" : ""}>
          Lớp ${h(item.name)}
        </label>`).join("")}
      </fieldset>
      <label class="dialog-field"><span>Trạng thái camera demo</span><select class="field field-select" name="online">
        <option value="online" ${camera.online ? "selected" : ""}>Hoạt động</option>
        <option value="offline" ${camera.online ? "" : "selected"}>Ngoại tuyến</option>
      </select></label>
      ${adminSaveControls()}
    </form>`);
  connectAdminEditor(dialog, (values, preview) =>
    service.configureCamera(cameraId, values.getAll("classes"), values.get("online") === "online", preview),
    "Đã lưu cấu hình camera.", filters, `[data-edit-camera="${cameraId}"]`);
}

function renderAdminAccounts(main, data) {
  const h = app.html;
  main.innerHTML = `
    <div class="screen-heading heading-actions">
      <div><h1>Tài khoản demo</h1><p>Quản lý phụ huynh và học sinh liên kết với từng tài khoản.</p></div>
      <button class="button" type="button" id="add-account">Tạo tài khoản</button>
    </div>
    <section class="panel records-panel" aria-labelledby="accounts-heading">
      <div class="section-bar">
        <div><h2 id="accounts-heading">Phụ huynh</h2><p class="small muted" id="account-count" role="status"></p></div>
        <label class="account-search"><span class="sr-only">Tìm tài khoản</span><input class="field" id="account-search" type="search" placeholder="Tìm theo tên, email hoặc mã"></label>
      </div>
      <div class="accounts-list"></div>
      ${pagerMarkup("account", "Trang tài khoản")}
    </section>`;
  const search = main.querySelector("#account-search");
  const list = main.querySelector(".accounts-list");
  const count = main.querySelector("#account-count");
  const pager = bindPager(main, "account", update);

  function update() {
    const terms = adminSearch(search.value).split(/\s+/);
    const parents = data.parents.filter((parent) => {
      const text = adminSearch([parent.name, parent.id, parent.username, parent.email].join(" "));
      return terms.every((term) => text.includes(term));
    });
    count.textContent = `${parents.length} tài khoản`;
    const visible = pager.rows(parents);
    const summaries = new Map(data.parentSummaries.map((view) => [view.parent.id, view]));
    list.innerHTML = parents.length ? `
      <table class="record-table account-table">
        <thead><tr><th scope="col">Tài khoản</th><th scope="col">Học sinh liên kết</th><th scope="col">Quyền xem</th><th scope="col">Thao tác</th></tr></thead>
        <tbody>${visible.map(row).join("")}</tbody>
      </table>` : '<p class="empty-panel muted">Không tìm thấy tài khoản phù hợp.</p>';

    function row(parent) {
      const view = summaries.get(parent.id);
      const students = view.students.slice(0, 2).map((student) => h(student.name)).join(", ");
      const extra = view.students.length - 2;
      const open = parent.accessEnabled !== false;
      return `<tr class="account-row">
        <th scope="row"><div class="account-identity">
          <span class="account-avatar" aria-hidden="true">${h(app.initials(parent.name))}</span>
          <div><strong>${h(parent.name)}</strong><p class="small muted">${h(parent.username || parent.email)} · ${h(parent.id)}</p></div>
        </div></th>
        <td data-label="Học sinh">${students || "Chưa liên kết"}${extra > 0 ? ` và ${extra} học sinh khác` : ""}</td>
        <td data-label="Quyền xem"><span class="badge badge-status badge-${open ? "online" : "offline"}">${open ? "Đang mở" : "Đã khóa"}</span><p class="small muted">${view.cameras.length} camera</p></td>
        <td><div class="account-actions">
          <a class="button button-secondary record-action" href="${h(lookupHref(parent.id, view.cameras[0]?.id || data.cameras[0]?.id))}" aria-label="Tra cứu quyền của ${h(parent.name)}">Tra cứu</a>
          <button type="button" class="button button-secondary record-action" data-lock-account="${h(parent.id)}">${open ? "Khóa quyền" : "Mở quyền"}</button>
          <button type="button" class="button button-secondary record-action" data-edit-account="${h(parent.id)}" aria-label="Sửa ${h(parent.name)}">Sửa</button>
        </div></td>
      </tr>`;
    }
  }

  async function refresh(selector, id) {
    const updated = await service.getAdminOverview();
    if (!main.isConnected) return;
    data = updated;
    update();
    const control = [...list.querySelectorAll(selector)].find((button) => button.getAttribute(selector.slice(1, -1)) === id);
    (control || search).focus();
  }

  search.addEventListener("input", () => { pager.select(); update(); });
  main.querySelector("#add-account").addEventListener("click", () => editParentAccount(data, null, (id) => refresh("[data-edit-account]", id)));
  list.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-account]");
    const lock = event.target.closest("[data-lock-account]");
    if (edit) editParentAccount(data, data.parents.find((parent) => parent.id === edit.dataset.editAccount), (id) => refresh("[data-edit-account]", id));
    if (lock) confirmParentAccess(data.parents.find((parent) => parent.id === lock.dataset.lockAccount), (id) => refresh("[data-lock-account]", id));
  });
  update();
}

function confirmParentAccess(parent, refresh) {
  const enable = parent.accessEnabled === false;
  const dialog = app.showDialog(enable ? "Mở quyền xem" : "Khóa quyền xem", `
    <p>${app.html(parent.name)} · ${enable ? "Quyền sẽ tính lại từ các lớp đang học." : "Tài khoản này sẽ mất quyền xem camera. Các phụ huynh khác vẫn giữ quyền theo lớp."}</p>
    <p class="error" role="alert"></p>
    <div class="dialog-footer"><button type="button" id="confirm-account-access" class="button">Xác nhận</button></div>`);
  const confirm = dialog.querySelector("#confirm-account-access");
  confirm.addEventListener("click", async () => {
    confirm.disabled = true;
    try {
      await service.setParentAccess(parent.id, enable);
      dialog.close();
      await refresh(parent.id);
      app.flash(enable ? "Đã mở quyền xem." : "Đã khóa quyền xem.");
    } catch (failure) {
      if (dialog.open) dialog.querySelector(".error").textContent = failure.message;
      else app.flash(failure.message);
    } finally {
      confirm.disabled = false;
    }
  });
}

function editParentAccount(data, parent, refresh) {
  const h = app.html;
  const classes = new Map(data.classes.map((item) => [item.id, item.name]));
  const records = data.students.map((student) => ({
    id: student.id,
    title: student.name,
    detail: `${student.id} · ${classes.get(student.classId) || student.classId || "Chưa xếp lớp"} · ${student.active ? "Đang học" : "Đã nghỉ học"}`
  }));
  const byId = new Map(records.map((record) => [record.id, record]));
  const selected = new Set(parent?.studentIds || []);
  const dialog = app.showDialog(parent ? "Chỉnh sửa tài khoản mẫu" : "Tạo tài khoản mẫu", `
    <form id="account-edit">
      <div class="account-fields">
        <label class="dialog-field"><span>Họ và tên</span><input class="field" name="name" required maxlength="80" value="${h(parent?.name)}"></label>
        <label class="dialog-field"><span>Email mẫu</span><input class="field" name="email" type="email" required maxlength="120" placeholder="phuhuynh@example.test" value="${h(parent?.email)}"></label>
      </div>
      <fieldset class="student-link-editor">
        <legend>Học sinh liên kết</legend>
        <p class="small muted">Quyền xem được tính từ lớp của học sinh đang học.</p>
        ${pickerMarkup("student-picker", "Tìm học sinh để liên kết", "Tên, mã hoặc lớp")}
        <p id="linked-count" class="small muted" role="status"></p>
        <ul class="selected-students"></ul>
      </fieldset>
      <p class="error" id="account-error" role="alert"></p>
      <div class="dialog-footer"><button class="button" type="submit">Lưu tài khoản</button></div>
    </form>`);
  dialog.querySelector(".dialog-heading button").textContent = "Hủy";
  const form = dialog.querySelector("#account-edit");
  const save = form.querySelector('[type="submit"]');
  const linked = form.querySelector(".selected-students");
  const error = form.querySelector("#account-error");
  const input = bindPicker(form.querySelector("#student-picker-picker"), records, (record) => {
    selected.add(record.id);
    showLinked();
  }, (record) => !selected.has(record.id));

  function showLinked() {
    form.querySelector("#linked-count").textContent = selected.size ? `${selected.size} học sinh đã liên kết` : "Chưa liên kết học sinh.";
    linked.hidden = !selected.size;
    linked.innerHTML = [...selected].map((id) => {
      const record = byId.get(id);
      return `<li>
        <div><strong>${h(record?.title || id)}</strong><p class="small muted">${h(record?.detail || id)}</p></div>
        <button class="button button-secondary record-action" type="button" data-remove-student="${h(id)}" aria-label="Bỏ liên kết ${h(record?.title || id)}">Bỏ</button>
      </li>`;
    }).join("");
  }

  linked.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-student]");
    if (!button) return;
    selected.delete(button.dataset.removeStudent);
    showLinked();
    input.focus();
  });
  showLinked();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (save.disabled) return;
    save.disabled = true;
    error.textContent = "";
    const values = new FormData(form);
    try {
      const result = await service.saveParentAccount({
        id: parent?.id, name: values.get("name"), email: values.get("email"), studentIds: [...selected]
      });
      dialog.close();
      await refresh(result.id);
      app.flash(result.persisted ? "Đã lưu tài khoản trên trình duyệt này." : "Tài khoản đã lưu tạm trong phiên đang mở.");
    } catch (failure) {
      if (dialog.open) error.textContent = failure.message;
      else app.flash(failure.message);
    } finally {
      save.disabled = false;
    }
  });
}

function adminSaveControls() {
  return `<div class="impact-preview"><h3>Ảnh hưởng đến quyền xem</h3><div id="permission-impact" aria-live="polite"></div></div>
    <div class="dialog-footer"><button class="button" id="save-record" type="submit">Lưu thay đổi</button></div>`;
}

function connectAdminEditor(dialog, change, message, filters, actionSelector) {
  const form = dialog.querySelector("#record-edit");
  const save = form.querySelector("#save-record");
  const original = new URLSearchParams(new FormData(form)).toString();
  async function preview() {
    const values = new FormData(form);
    save.disabled = new URLSearchParams(values).toString() === original;
    const target = form.querySelector("#permission-impact");
    try { target.innerHTML = renderImpact(await change(values, true)); }
    catch (failure) { target.textContent = failure.message; }
  }
  preview();
  form.addEventListener("change", preview);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (save.disabled) return;
    try {
      if (await change(new FormData(form), false) === null) return;
    } catch (failure) {
      form.querySelector("#permission-impact").textContent = failure.message;
      return;
    }
    dialog.close();
    await app.render(false);
    const search = app.root.querySelector("#record-search");
    const filter = app.root.querySelector("#record-filter");
    search.value = filters.search;
    filter.value = filters.filter;
    filter.dispatchEvent(new CustomEvent("change", { detail: filters.page }));
    (app.root.querySelector(actionSelector) || search).focus();
    app.flash(message);
  });
}

function renderImpact(impact, lookupLinks = false) {
  const h = app.html;
  if (!impact?.length) return '<p class="small muted">Quyền xem của phụ huynh giữ nguyên.</p>';
  function camerasFor(parent, cameras) {
    return cameras.map((camera) => lookupLinks
      ? `<a class="impact-lookup" href="${h(lookupHref(parent.id, camera.id))}" aria-label="Tra cứu quyền hiện tại của ${h(parent.name)} với ${h(camera.name)}">${h(camera.name)}</a>`
      : h(camera.name)).join(", ");
  }
  return `<ul class="impact-list">${impact.map(({ parent, granted, revoked }) => `
    <li><strong>${h(parent.name)}</strong>
      ${granted.length ? `<span class="access-granted">Cấp quyền · ${camerasFor(parent, granted)}</span>` : ""}
      ${revoked.length ? `<span class="access-revoked">Thu hồi · ${camerasFor(parent, revoked)}</span>` : ""}
    </li>`).join("")}</ul>`;
}

function activityList(items) {
  const h = app.html;
  const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Bangkok" });
  return items.length ? `<div class="activity-list">${items.map((entry) => `
    <article class="panel activity-card">
      <div class="section-bar"><h3>${h(entry.subject)}</h3><span class="badge">${h(entry.type)}</span></div>
      <p><span class="muted">Từ</span> ${h(entry.before)} <span class="muted">sang</span> ${h(entry.after)}</p>
      ${entry.changes?.length ? renderSchoolSyncChanges(entry.changes) : ""}
      ${renderImpact(entry.impact, true)}
      <p class="activity-meta small muted">${h(entry.actor)} · <time datetime="${h(entry.at)}">${date.format(new Date(entry.at))}</time></p>
    </article>`).join("")}</div>`
    : '<div class="panel empty-panel"><h3>Chưa có thay đổi</h3><p class="muted">Các lượt đồng bộ hồ sơ, cập nhật lớp và cấu hình camera sẽ xuất hiện ở đây.</p></div>';
}

function renderAdminActivity(main, data) {
  main.innerHTML = `
    <div class="screen-heading"><h1>Nhật ký thay đổi</h1><p>Theo dõi các cập nhật và tài khoản phụ huynh bị ảnh hưởng trong phiên demo.</p></div>
    ${activityList(data.activity)}`;
}
