// Include this right after js/api.js on any page that requires a logged-in
// user. Set window.REQUIRE_ADMIN = true before this script on pages that
// are admin-only (e.g. admin.html) — non-admins get bounced to the catalog.
(async function () {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  try {
    const { user } = await Api.me();
    if (window.REQUIRE_ADMIN && user.role !== "admin") {
      window.location.href = "index.html";
    }
  } catch {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
})();
