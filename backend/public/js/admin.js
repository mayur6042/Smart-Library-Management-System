const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");
const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

const ACTIVITY_LABEL = {
  login: "Login", register: "New account", book_created: "Book added", book_updated: "Book edited",
  book_deleted: "Book removed", availability: "Availability changed", role_changed: "Role changed", user_deleted: "Account removed",
  borrow: "Book borrowed", return: "Book returned", review: "Review added",
};

async function loadStats() {
  const s = await adminFetch("/admin/stats");
  const cards = [
    ["Total books", s.totalBooks], ["Available", s.availableBooks], ["Checked out", s.checkedOutBooks],
    ["Genres", s.totalGenres], ["Total users", s.totalUsers], ["Admins", s.admins],
    ["Members", s.members], ["New this week", s.recentSignups],
  ];
  document.getElementById("stat-grid").innerHTML = cards.map(([label, num]) => `
    <div class="stat-card"><div class="num">${num}</div><div class="label">${label}</div></div>
  `).join("");
}

async function loadActivity() {
  const { activity } = await adminFetch("/admin/activity?limit=40");
  const list = document.getElementById("activity-list");
  if (!activity.length) { list.innerHTML = `<li class="empty-note">No activity yet.</li>`; return; }
  list.innerHTML = activity.map((a) => `
    <li>${esc(a.message)}<span class="a-time">${ACTIVITY_LABEL[a.type] || a.type} · ${fmtDateTime(a.timestamp)}</span></li>
  `).join("");
}

// --- Books ---
async function loadBooks() {
  const { books } = await Api.getBooks({ pageSize: 500 });
  const tbody = document.getElementById("books-tbody");
  if (!books.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-note">No books yet.</td></tr>`; return; }
  tbody.innerHTML = books.map((b) => `
    <tr data-id="${esc(b.id)}">
      <td>${esc(b.title)}</td><td>${esc(b.author)}</td><td>${esc(b.genre)}</td><td>${b.year || "—"}</td>
      <td><span class="badge ${b.available ? "" : "unavailable"}">${b.available ? "Available" : "Checked out"}</span></td>
      <td class="actions">
        <button data-action="toggle-avail">${b.available ? "Mark out" : "Mark returned"}</button>
        <button data-action="edit-book">Edit</button>
        <button class="danger" data-action="delete-book">Delete</button>
      </td>
    </tr>`).join("");
}

document.getElementById("toggle-add-book").addEventListener("click", () => {
  document.getElementById("add-book-form").classList.toggle("open");
});

document.getElementById("add-book-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("book-error");
  errEl.style.display = "none";
  try {
    await adminFetch("/books", { method: "POST", body: JSON.stringify({
      title: document.getElementById("nb-title").value,
      author: document.getElementById("nb-author").value,
      genre: document.getElementById("nb-genre").value,
      year: document.getElementById("nb-year").value,
      available: document.getElementById("nb-available").checked,
    })});
    e.target.reset();
    e.target.classList.remove("open");
    loadBooks(); loadStats(); loadActivity();
  } catch (err) {
    errEl.textContent = err.message; errEl.style.display = "block";
  }
});

document.getElementById("books-tbody").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const row = btn.closest("tr");
  const id = row.dataset.id;
  const errEl = document.getElementById("book-error");
  errEl.style.display = "none";

  if (btn.dataset.action === "toggle-avail") {
    const isAvailable = row.querySelector(".badge").textContent.trim() === "Available";
    try { await adminFetch(`/books/${id}/availability`, { method: "PATCH", body: JSON.stringify({ available: !isAvailable }) }); }
    catch (err) { errEl.textContent = err.message; errEl.style.display = "block"; }
    loadBooks(); loadStats(); loadActivity();
  }

  if (btn.dataset.action === "delete-book") {
    if (!confirm("Remove this book from the catalog?")) return;
    try { await adminFetch(`/books/${id}`, { method: "DELETE" }); }
    catch (err) { errEl.textContent = err.message; errEl.style.display = "block"; }
    loadBooks(); loadStats(); loadActivity();
  }

  if (btn.dataset.action === "edit-book") {
    const cells = row.querySelectorAll("td");
    const [title, author, genre, year] = [cells[0].textContent, cells[1].textContent, cells[2].textContent, cells[3].textContent];
    row.classList.add("edit-row");
    cells[0].innerHTML = `<input class="e-title" value="${esc(title)}" />`;
    cells[1].innerHTML = `<input class="e-author" value="${esc(author)}" />`;
    cells[2].innerHTML = `<input class="e-genre" value="${esc(genre)}" />`;
    cells[3].innerHTML = `<input class="e-year" type="number" value="${year === "—" ? "" : esc(year)}" />`;
    cells[5].innerHTML = `<button data-action="save-book">Save</button><button data-action="cancel-edit">Cancel</button>`;
  }

  if (btn.dataset.action === "cancel-edit") { loadBooks(); }

  if (btn.dataset.action === "save-book") {
    const available = row.querySelector(".badge")?.textContent.trim() === "Available" ?? true;
    try {
      await adminFetch(`/books/${id}`, { method: "PUT", body: JSON.stringify({
        title: row.querySelector(".e-title").value,
        author: row.querySelector(".e-author").value,
        genre: row.querySelector(".e-genre").value,
        year: row.querySelector(".e-year").value,
        available,
      })});
      loadBooks(); loadStats(); loadActivity();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = "block"; }
  }
});

// --- Users ---
async function loadUsers() {
  const { users } = await adminFetch("/admin/users");
  const tbody = document.getElementById("users-tbody");
  const { user: me } = await Api.me();
  tbody.innerHTML = users.map((u) => `
    <tr data-id="${esc(u.id)}">
      <td>${esc(u.name)}</td><td>${esc(u.email)}</td>
      <td><span class="badge ${u.role === "admin" ? "" : "member"}">${u.role}</span></td>
      <td>${fmtDate(u.createdAt)}</td><td>${fmtDateTime(u.lastLoginAt)}</td>
      <td class="actions">
        ${u.id === me.id ? "" : `
          <button data-action="toggle-role">${u.role === "admin" ? "Demote" : "Promote"}</button>
          <button class="danger" data-action="delete-user">Delete</button>
        `}
      </td>
    </tr>`).join("");
}

document.getElementById("users-tbody").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const row = btn.closest("tr");
  const id = row.dataset.id;
  const errEl = document.getElementById("user-error");
  errEl.style.display = "none";

  if (btn.dataset.action === "toggle-role") {
    const isAdmin = row.querySelector(".badge").textContent.trim() === "admin";
    try {
      await adminFetch(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role: isAdmin ? "member" : "admin" }) });
      loadUsers(); loadStats(); loadActivity();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = "block"; }
  }

  if (btn.dataset.action === "delete-user") {
    if (!confirm("Remove this account? This can't be undone.")) return;
    try {
      await adminFetch(`/admin/users/${id}`, { method: "DELETE" });
      loadUsers(); loadStats(); loadActivity();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = "block"; }
  }
});

// Small helper for admin-only endpoints not covered by js/api.js's Api object
async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

loadStats(); loadActivity(); loadBooks(); loadUsers();
