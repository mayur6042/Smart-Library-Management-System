// Wires login.html's #login-form and #register-form to Api (js/api.js).
// Dispatches login:error / register:error events that login.html listens
// for to show inline field errors.

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    await Api.login(email, password);
    window.location.href = "index.html";
  } catch (err) {
    document.dispatchEvent(new CustomEvent("login:error", { detail: { message: err.message } }));
  }
});

document.getElementById("register-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  try {
    await Api.register(name, email, password);
    window.location.href = "index.html";
  } catch (err) {
    document.dispatchEvent(new CustomEvent("register:error", { detail: { message: err.message } }));
  }
});
