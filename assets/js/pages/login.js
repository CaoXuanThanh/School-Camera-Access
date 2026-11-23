"use strict";

async function renderLogin() {
  const template = document.querySelector("#login-template");
  app.root.replaceChildren(template.content.cloneNode(true));
  const form = app.root.querySelector("#login-form");
  const account = app.root.querySelector("#demo-account");
  const error = app.root.querySelector("#login-error");
  const button = form.querySelector("button");
  const username = form.elements.username;
  const credentials = [username, form.elements.password];
  function clearError() {
    error.textContent = "";
    credentials.forEach((field) => field.removeAttribute("aria-invalid"));
  }
  form.addEventListener("input", clearError);
  for (const entry of await service.listDemoAccounts()) account.add(new Option(`${entry.name} · ${entry.username}`, entry.username));
  account.addEventListener("change", () => {
    if (account.value) {
      username.value = account.value;
      clearError();
      form.elements.password.focus();
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();
    button.disabled = true;
    try {
      const user = await service.login({ username: username.value, password: form.elements.password.value });
      location.hash = user.role === "admin" ? "/quan-tri" : "/phu-huynh";
    } catch (failure) {
      if (failure.code === "INVALID_CREDENTIALS") credentials.forEach((field) => field.setAttribute("aria-invalid", "true"));
      error.textContent = failure.message;
    } finally {
      button.disabled = false;
    }
  });
}
