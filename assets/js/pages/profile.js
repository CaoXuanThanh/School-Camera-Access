"use strict";

async function renderProfile(main) {
  const h = app.html;
  const user = await service.getMyProfile();
  if (!main.isConnected) return;
  main.innerHTML = `
    <div class="screen-heading"><h1>Hồ sơ và cài đặt</h1><p>Quản lý thông tin liên hệ của tài khoản.</p></div>
    <div class="profile-layout">
      <section class="panel profile-panel profile-account" aria-labelledby="account-heading">
        <div class="profile-identity"><span class="account-avatar" aria-hidden="true">${h(app.initials(user.displayName))}</span><h2 id="account-heading">Tài khoản</h2></div>
        <dl>
          <dt>Tên đăng nhập</dt><dd>${h(user.username)}</dd>
          <dt>Vai trò</dt><dd>${user.role === "admin" ? "Quản trị" : "Phụ huynh"}</dd>
        </dl>
      </section>
      <section class="panel profile-panel" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Thông tin liên hệ</h2>
        <form id="profile-form" class="profile-form" novalidate>
          <div class="dialog-field">
            <label for="profile-name"><span>Tên hiển thị</span></label>
            <input class="field" id="profile-name" name="displayName" autocomplete="name" required minlength="2" maxlength="60" aria-describedby="profile-name-error" value="${h(user.displayName)}">
            <p id="profile-name-error" class="error"></p>
          </div>
          <div class="dialog-field">
            <label for="profile-email"><span>Email liên hệ</span></label>
            <input class="field" id="profile-email" name="email" type="email" autocomplete="email" required aria-describedby="profile-email-error" value="${h(user.email)}">
            <p id="profile-email-error" class="error"></p>
          </div>
          <div class="dialog-field">
            <label for="profile-phone"><span>Số điện thoại</span></label>
            <input class="field" id="profile-phone" name="phone" type="tel" autocomplete="tel" inputmode="numeric" required pattern="0[0-9]{9}" aria-describedby="profile-phone-error" value="${h(user.phone)}">
            <p id="profile-phone-error" class="error"></p>
          </div>
          <p id="profile-error" class="error" role="alert"></p>
          <div class="role-actions">
            <button class="button" type="submit">Lưu hồ sơ</button>
            <button class="button button-secondary" type="reset">Hủy thay đổi</button>
          </div>
        </form>
      </section>
    </div>`;
  const form = main.querySelector("#profile-form");
  const save = form.querySelector('[type="submit"]');
  const error = main.querySelector("#profile-error");
  const [name, email, phone] = [form.elements.displayName, form.elements.email, form.elements.phone];

  function fieldError(field, message) {
    main.querySelector("#" + field.id + "-error").textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  for (const field of [name, email, phone]) {
    field.addEventListener("input", () => {
      fieldError(field, "");
      error.textContent = "";
    });
  }
  form.addEventListener("reset", () => {
    for (const field of [name, email, phone]) fieldError(field, "");
    error.textContent = "";
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (save.disabled) return;
    error.textContent = "";
    const length = name.value.trim().length;
    fieldError(name, length < 2 || length > 60 ? "Tên cần từ 2 đến 60 ký tự." : "");
    fieldError(email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim()) ? "" : "Email chưa đúng định dạng.");
    fieldError(phone, /^0\d{9}$/.test(phone.value.trim()) ? "" : "Số điện thoại cần 10 chữ số và bắt đầu bằng 0.");
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    save.disabled = true;
    try {
      await service.updateMyProfile(Object.fromEntries(new FormData(form)));
    } catch (failure) {
      error.textContent = failure.message;
      return;
    } finally {
      save.disabled = false;
    }
    if (!main.isConnected) return;
    await app.render(false);
    app.root.querySelector('#profile-form button[type="submit"]')?.focus();
    app.flash("Đã lưu thông tin hồ sơ.");
  });
}
