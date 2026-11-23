"use strict";

const app = {
  root: document.querySelector("#app"),
  dialog: document.querySelector("#app-dialog"),
  notice: document.querySelector("#app-notice"),

  html(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]
    ));
  },

  initials(name) {
    const words = String(name ?? "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    return words.slice(-2).map((word) => word[0]).join("").toLocaleUpperCase("vi");
  },

  status(online) {
    return online ? "Hoạt động" : "Ngoại tuyến";
  },

  flash(message) {
    clearTimeout(this.flashTimer);
    this.notice.textContent = message;
    this.flashTimer = setTimeout(() => { this.notice.textContent = ""; }, 4300);
  },

  showDialog(title, body) {
    this.dialog.innerHTML = `
      <div class="dialog-heading">
        <h2 id="dialog-title">${this.html(title)}</h2>
        <form method="dialog"><button class="button button-secondary" autofocus>Đóng</button></form>
      </div>
      ${body}
    `;
    if (!this.dialog.open) this.dialog.showModal();
    return this.dialog;
  },

  confirmReset() {
    const dialog = this.showDialog("Khôi phục phiên demo", `
      <p class="muted">Đưa lớp, camera và nhật ký về dữ liệu đầu phiên. Tài khoản mẫu đã lưu vẫn dùng được.</p>
      <div class="dialog-footer"><button class="button" id="confirm-reset">Khôi phục dữ liệu mẫu</button></div>
    `);
    dialog.querySelector("#confirm-reset").addEventListener("click", async () => {
      await service.resetDemo();
      dialog.close();
      await this.render(false);
      this.flash("Đã khôi phục dữ liệu mẫu.");
      const toggle = this.root.querySelector(".menu-toggle");
      const resetControl = toggle?.getClientRects().length ? toggle : this.root.querySelector("#reset-demo");
      resetControl?.focus();
    });
  },

  bindMobileMenu() {
    const side = this.root.querySelector(".portal-side");
    const menu = this.root.querySelector("#portal-menu");
    const toggle = this.root.querySelector(".menu-toggle");
    const body = menu.querySelector(".portal-menu-body");
    const mobile = window.matchMedia("(max-width: 900px)");
    for (const element of side.querySelectorAll(".portal-role, .portal-nav, .portal-side-bottom")) {
      const copy = element.cloneNode(true);
      copy.querySelectorAll("[id]").forEach((control) => control.removeAttribute("id"));
      body.append(copy);
    }

    function closeMenu(restoreFocus = true) {
      if (!menu.open) return;
      menu.close();
      document.documentElement.classList.remove("portal-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }

    function handleResize() {
      if (!mobile.matches) {
        const desktopTarget = side.querySelector('[aria-current="page"]') || side.querySelector(".brand");
        if (menu.open) {
          closeMenu(false);
          desktopTarget.focus({ preventScroll: true });
        }
      }
    }

    toggle.addEventListener("click", () => {
      menu.showModal();
      document.documentElement.classList.add("portal-menu-open");
      toggle.setAttribute("aria-expanded", "true");
    });
    menu.querySelector(".menu-close").addEventListener("click", () => closeMenu());
    menu.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeMenu();
    });
    menu.addEventListener("click", (event) => {
      if (event.target === menu || event.target.closest("a[href]")) closeMenu();
    });
    mobile.addEventListener("change", handleResize);
    this.stopMobileMenu = () => {
      closeMenu(false);
      mobile.removeEventListener("change", handleResize);
    };
    return closeMenu;
  },

  async render(moveFocus = true) {
    this.stopMobileMenu?.();
    this.stopMobileMenu = null;
    this.stopViewer?.();
    this.stopViewer = null;
    this.stopParentDashboard?.();
    this.stopParentDashboard = null;
    if (this.dialog.open) this.dialog.close();
    const [path, queryString] = (location.hash.slice(1) || "/").split("?");
    const [, area, section] = path.split("/");
    const query = new URLSearchParams(queryString);
    const user = await service.getCurrentUser();
    this.root.className = area ? "" : "login-page";

    if (!area) {
      document.title = "Camera Access · Cổng camera học đường";
      await renderLogin();
      if (moveFocus) {
        const title = this.root.querySelector("h1");
        title.tabIndex = -1;
        title.focus();
        window.scrollTo(0, 0);
      }
      return;
    }

    if (!user) {
      this.flash("Đăng nhập để tiếp tục.");
      location.replace("#/");
      return;
    }
    const admin = user.role === "admin";
    if ((area === "quan-tri" && !admin) || (["camera", "phu-huynh"].includes(area) && admin)) {
      this.flash("Tài khoản không có quyền mở trang này.");
      location.replace(admin ? "#/quan-tri" : "#/phu-huynh");
      return;
    }
    const account = user.displayName;
    const links = admin
      ? [
          ["", "Tổng quan", "overview"],
          ["lop-hoc", "Học sinh & lớp", "people"],
          ["dong-bo", "Đối soát quyền", "sync"],
          ["tra-cuu", "Tra cứu quyền", "lookup"],
          ["camera", "Danh mục camera", "camera"],
          ["tai-khoan", "Tài khoản demo", "account"],
          ["lich-su", "Nhật ký thay đổi", "history"]
        ]
      : [["", "Camera trường học", "camera"]];
    const current = links.find(([key]) => key === (section || "")) || links[0];
    const locationTitle = area === "ho-so" ? "Hồ sơ và cài đặt" : area === "camera" ? "Xem camera" : current[1];
    document.title = `${locationTitle} | Camera Access`;
    this.root.replaceChildren(document.querySelector("#portal-template").content.cloneNode(true));
    this.root.querySelector(".brand").href = admin ? "#/quan-tri" : "#/phu-huynh";
    this.root.querySelector(".brand").setAttribute("aria-label", "Camera Access, trang tổng quan");
    this.root.querySelector("[data-role]").textContent = admin ? "Quản trị nhà trường" : "Cổng phụ huynh";
    const locationLabel = this.root.querySelector("[data-location]");
    locationLabel.textContent = locationTitle;
    if (area === "phu-huynh") locationLabel.textContent = "Cổng phụ huynh";
    this.root.querySelector("[data-account]").textContent = account;
    const avatar = this.root.querySelector("#change-role");
    avatar.textContent = this.initials(account);
    avatar.setAttribute("aria-label", `${account} · Mở hồ sơ`);
    avatar.title = "Mở hồ sơ";
    avatar.addEventListener("click", () => { location.hash = "/ho-so"; });
    this.root.querySelector(".portal-nav").innerHTML = links.map(([key, label, icon]) => `
      <a class="portal-link" href="#/${admin ? "quan-tri" : "phu-huynh"}${key ? "/" + key : ""}" ${area !== "ho-so" && key === current[0] ? 'aria-current="page"' : ""}>
        <span class="nav-icon icon-${icon}" aria-hidden="true"></span>${label}
      </a>`).join("");
    this.root.querySelector(".portal-side-bottom").innerHTML = `
      <a class="portal-link" href="#/ho-so" ${area === "ho-so" ? 'aria-current="page"' : ""}>Hồ sơ và cài đặt</a>
      <button class="portal-link role-link" type="button" id="side-role" data-portal-action="logout">Đăng xuất</button>
      ${admin ? '<button class="portal-link role-link" type="button" id="reset-demo" data-portal-action="reset">Khôi phục dữ liệu</button>' : ""}
    `;
    const closeMenu = this.bindMobileMenu();
    for (const button of this.root.querySelectorAll('[data-portal-action="logout"]')) {
      button.addEventListener("click", async () => {
        closeMenu();
        await service.logout();
        clearTimeout(this.flashTimer);
        this.notice.textContent = "";
        location.hash = "/";
      });
    }
    for (const button of this.root.querySelectorAll('[data-portal-action="reset"]')) {
      button.addEventListener("click", () => {
        closeMenu();
        this.confirmReset();
      });
    }

    if (!admin && (area === "camera" || area === "ho-so")) {
      const portal = this.root.querySelector(".portal");
      portal.classList.add("parent-flow");
      const header = portal.querySelector(".portal-top");
      const brand = portal.querySelector(".portal-side .brand");
      const wordmark = document.createElement("span");
      wordmark.textContent = brand.textContent.trim();
      brand.replaceChildren(brand.querySelector(".brand-mark"), wordmark);
      const identity = document.createElement("div");
      identity.className = "parent-identity";
      identity.append(brand, locationLabel);
      header.prepend(identity);
      if (area === "ho-so") avatar.hidden = true;
      else avatar.textContent = "Hồ sơ";
      header.querySelector(".portal-session").append(portal.querySelector("#side-role"));
    }

    const main = this.root.querySelector("#main-content");
    this.root.querySelector("#skip-content").addEventListener("click", () => main.focus());
    try {
      if (area === "ho-so") await renderProfile(main);
      else if (admin) await renderAdmin(main, current[0], query);
      else if (area === "camera") await renderViewer(main, section);
      else await renderParent(main);
    } catch (failure) {
      main.textContent = failure.message || "Không tải được trang.";
    }
    if (moveFocus && main.isConnected) {
      main.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }
};

window.addEventListener("hashchange", () => app.render());
document.addEventListener("DOMContentLoaded", () => app.render(false));
