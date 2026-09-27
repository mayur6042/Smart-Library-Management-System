// Populates #app-nav on every page. Shows "Log in" when signed out, or the
// user's name + a sign-out link when signed in.
(async function () {
  const mount = document.getElementById("app-nav");
  if (!mount) return;

  mount.innerHTML = `
    <style>
      .nav-bar{display:flex;justify-content:space-between;align-items:center;
        padding:1em 1.5em;border-bottom:1px solid var(--rule,#DEDBCC);
        font-family:'IBM Plex Sans',sans-serif;background:var(--paper,#FAF7F0);}
      .nav-bar a{color:var(--ink,#23211D);text-decoration:none;}
      .nav-brand{font-family:'Lora',serif;font-weight:600;font-size:1.05rem;}
      .nav-right{display:flex;align-items:center;gap:1em;font-size:.85rem;color:var(--charcoal-soft,#726C5E);}
      .nav-right button{font:inherit;background:none;border:none;cursor:pointer;color:inherit;text-decoration:underline;}
    </style>
    <nav class="nav-bar">
      <a class="nav-brand" href="index.html">Open Stacks Library</a>
      <div class="nav-right" id="nav-right"></div>
    </nav>
  `;

  const right = document.getElementById("nav-right");
  const token = localStorage.getItem("token");

  if (!token) {
    right.innerHTML = `<a href="login.html">Log in</a>`;
    return;
  }

  try {
    const { user } = await Api.me();
    const adminLink = user.role === "admin" ? `<a href="admin.html">Admin</a>` : "";
    right.innerHTML = `${adminLink}<span>Hi, ${user.name}${user.role === "admin" ? " (admin)" : ""}</span> <button id="nav-logout">Log out</button>`;
    document.getElementById("nav-logout").addEventListener("click", async () => {
      await Api.logout();
      window.location.href = "login.html";
    });
  } catch {
    // token expired or invalid
    localStorage.removeItem("token");
    right.innerHTML = `<a href="login.html">Log in</a>`;
  }
})();
