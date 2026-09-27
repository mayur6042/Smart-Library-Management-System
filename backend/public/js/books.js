const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const els = {
  search: document.getElementById("search-input"),
  suggest: document.getElementById("search-suggestions"),
  genreTiles: document.getElementById("genre-tiles"),
  genreFilter: document.getElementById("genre-filter"),
  featured: document.getElementById("featured-strip"),
  count: document.getElementById("result-count"),
  sort: document.getElementById("sort-select"),
  available: document.getElementById("available-only"),
  grid: document.getElementById("book-grid"),
  empty: document.getElementById("empty"),
  pagination: document.getElementById("pagination"),
  recommendations: document.getElementById("recommendation-strip"),
  recommendationTitle: document.getElementById("recommendation-title"),
  recommendationNote: document.getElementById("recommendation-note"),
};

const state = { q: "", genre: "", availableOnly: false, sort: "title", page: 1 };
let activeIndex = -1;
let searchDebounce;

async function renderGrid() {
  let data;
  try {
    data = await Api.getBooks({
      q: state.q, genre: state.genre, available: state.availableOnly ? "true" : "",
      sort: state.sort, page: state.page, pageSize: 12,
    });
  } catch {
    els.count.textContent = "Couldn't load the catalog — is the backend running?";
    els.grid.innerHTML = "";
    els.empty.style.display = "block";
    return;
  }

  els.count.textContent = `${data.total} book${data.total === 1 ? "" : "s"} found`;
  els.empty.style.display = data.books.length ? "none" : "block";
  els.grid.innerHTML = data.books.map((b) => `
    <div class="book-card" data-id="${esc(b.id)}">
      <div class="cover"><span class="tag ${b.available ? "" : "unavailable"}">${b.available ? "Available" : "Checked out"}</span></div>
      <div class="title">${esc(b.title)}</div>
      <div class="author">${esc(b.author)}</div>
      <div class="genre">${esc(b.genre)}</div>
    </div>`).join("");

  buildGenreOptions(data.genres);
  renderPagination(data.page, data.totalPages);
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) { els.pagination.innerHTML = ""; return; }
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button data-page="${i}" class="${i === page ? "active" : ""}">${i}</button>`;
  }
  els.pagination.innerHTML = html;
}

let genresBuilt = false;
function buildGenreOptions(genres) {
  if (genresBuilt) return; // genre list is stable across requests; build once
  genresBuilt = true;
  els.genreTiles.innerHTML = `<button type="button" class="genre-tile active" data-genre="">All</button>` +
    genres.map((g) => `<button type="button" class="genre-tile" data-genre="${esc(g)}">${esc(g)}</button>`).join("");
  genres.forEach((g) => {
    const o = document.createElement("option");
    o.value = g; o.textContent = g;
    els.genreFilter.appendChild(o);
  });
}

async function renderSuggestions() {
  const q = state.q.trim();
  activeIndex = -1;
  if (!q) { els.suggest.classList.remove("open"); els.suggest.innerHTML = ""; return; }

  let data;
  try { data = await Api.getBooks({ q, pageSize: 8 }); } catch { return; }

  els.suggest.innerHTML = data.books.length
    ? data.books.map((b) => `<div class="suggestion" data-id="${esc(b.id)}" data-title="${esc(b.title)}"><span>${esc(b.title)}</span><span class="s-meta">${esc(b.author)}</span></div>`).join("")
    : `<div class="suggestion-empty">No matches for "${esc(q)}"</div>`;
  els.suggest.classList.add("open");
}

function selectSuggestion(id, title) {
  state.q = title; els.search.value = title; state.page = 1;
  els.suggest.classList.remove("open");
  renderGrid();
}

els.search.addEventListener("input", (e) => {
  state.q = e.target.value; state.page = 1;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => { renderSuggestions(); renderGrid(); }, 250);
});
els.search.addEventListener("focus", renderSuggestions);
els.search.addEventListener("keydown", (e) => {
  const items = els.suggest.querySelectorAll(".suggestion[data-id]");
  if (!items.length) return;
  if (e.key === "ArrowDown") { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); items.forEach((el, i) => el.classList.toggle("active", i === activeIndex)); }
  else if (e.key === "ArrowUp") { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); items.forEach((el, i) => el.classList.toggle("active", i === activeIndex)); }
  else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); const it = items[activeIndex]; selectSuggestion(it.dataset.id, it.dataset.title); }
  else if (e.key === "Escape") { els.suggest.classList.remove("open"); }
});
els.suggest.addEventListener("mousedown", (e) => {
  const item = e.target.closest(".suggestion[data-id]");
  if (item) selectSuggestion(item.dataset.id, item.dataset.title);
});
document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) els.suggest.classList.remove("open"); });

els.genreFilter.addEventListener("change", (e) => {
  state.genre = e.target.value; state.page = 1;
  els.genreTiles.querySelectorAll(".genre-tile").forEach((t) => t.classList.toggle("active", t.dataset.genre === state.genre));
  renderGrid();
});
els.available.addEventListener("change", (e) => { state.availableOnly = e.target.checked; state.page = 1; renderGrid(); });
els.sort.addEventListener("change", (e) => { state.sort = e.target.value; state.page = 1; renderGrid(); });
els.grid.addEventListener("click", (e) => {
  const card = e.target.closest(".book-card");
  if (card) window.openBookModal(card.dataset.id);
});
els.pagination.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (!btn) return;
  state.page = parseInt(btn.dataset.page, 10);
  renderGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
els.genreTiles.addEventListener("click", (e) => {
  const tile = e.target.closest(".genre-tile");
  if (!tile) return;
  state.genre = tile.dataset.genre; state.page = 1;
  els.genreFilter.value = state.genre;
  els.genreTiles.querySelectorAll(".genre-tile").forEach((t) => t.classList.remove("active"));
  tile.classList.add("active");
  renderGrid();
});

// Refresh the grid if the modal changes a book's availability
document.addEventListener("book:updated", renderGrid);

async function buildFeatured() {
  let data;
  try { data = await Api.getBooks({ sort: "newest", pageSize: 8 }); } catch { return; }
  els.featured.innerHTML = data.books.map((b) => `
    <div class="featured-card" data-id="${esc(b.id)}" data-title="${esc(b.title)}">
      <div class="cover"></div><div class="title">${esc(b.title)}</div><div class="author">${esc(b.author)}</div>
    </div>`).join("");
  els.featured.addEventListener("click", (e) => {
    const c = e.target.closest(".featured-card");
    if (c) window.openBookModal(c.dataset.id);
  });
}

async function buildRecommendations() {
  if (!els.recommendations) return;
  let data;
  try {
    data = localStorage.getItem("token") ? await Api.getRecommendations() : await Api.getPopular();
  } catch { return; }
  els.recommendationTitle.textContent = data.personalized ? "Recommended for you" : "Popular starting points";
  els.recommendationNote.textContent = data.personalized ? "Based on your library activity" : "Borrow or review a book to personalize this shelf";
  els.recommendations.innerHTML = data.books.map((b) => `
    <div class="featured-card" data-id="${esc(b.id)}"><div class="cover"></div><div class="title">${esc(b.title)}</div><div class="author">${esc(b.author)}</div></div>`).join("");
  els.recommendations.addEventListener("click", (e) => { const card = e.target.closest(".featured-card"); if (card) window.openBookModal(card.dataset.id); });
}

buildFeatured();
buildRecommendations();
renderGrid();
