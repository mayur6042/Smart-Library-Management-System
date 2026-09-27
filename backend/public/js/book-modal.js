// Simple modal for book details. Exposes window.openBookModal(id).
(function () {
  const mount = document.getElementById("book-modal-mount");
  if (!mount) return;

  mount.innerHTML = `
    <style>
      .modal-backdrop{position:fixed;inset:0;background:rgba(35,33,29,.45);
        display:none;align-items:center;justify-content:center;z-index:100;padding:1.2em;}
      .modal-backdrop.open{display:flex;}
      .modal-card{background:var(--paper,#FAF7F0);border-radius:6px;max-width:380px;width:100%;
        padding:1.6em;font-family:'IBM Plex Sans',sans-serif;color:var(--ink,#23211D);position:relative;}
      .modal-card h2{font-family:'Lora',serif;font-size:1.2rem;margin:0 0 .2em;}
      .modal-card .m-author{color:var(--charcoal-soft,#726C5E);font-size:.88rem;margin-bottom:.9em;}
      .modal-card .m-row{font-size:.85rem;margin:.4em 0;}
      .modal-card .m-close{position:absolute;top:.8em;right:.9em;background:none;border:none;
        font-size:1.1rem;cursor:pointer;color:var(--charcoal-soft,#726C5E);}
      .modal-card .m-tag{display:inline-block;font-size:.75rem;padding:.15em .55em;border-radius:3px;
        background:var(--stack-gold,#B08D57);color:var(--paper,#FAF7F0);margin-top:.6em;}
      .modal-card .m-tag.unavailable{background:var(--charcoal-soft,#726C5E);}
      .modal-card .m-admin{margin-top:1.1em;}
      .modal-card button.m-toggle{font:inherit;font-size:.82rem;padding:.5em .9em;border-radius:4px;
        border:1px solid var(--rule,#DEDBCC);background:var(--wash,#F1EDE0);cursor:pointer;}
      .modal-card .m-error{color:#A3442E;font-size:.8rem;margin-top:.6em;display:none;}
      .modal-card .m-action{margin-top:1em;display:flex;gap:.5em;flex-wrap:wrap;}
      .modal-card .m-review{border-top:1px solid var(--rule,#DEDBCC);margin-top:1.2em;padding-top:1em;}
      .modal-card .m-review textarea{width:100%;min-height:60px;margin:.5em 0;font:inherit;padding:.5em;border:1px solid var(--rule,#DEDBCC);background:var(--paper,#FAF7F0);color:inherit;}
      .modal-card .m-stars{color:var(--stack-gold,#B08D57);letter-spacing:.1em;}
      .modal-card .m-review-item{font-size:.8rem;border-top:1px solid var(--rule,#DEDBCC);padding:.6em 0;}
    </style>
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card" role="dialog" aria-modal="true">
        <button class="m-close" id="modal-close" aria-label="Close">✕</button>
        <div id="modal-body">Loading…</div>
      </div>
    </div>
  `;

  const backdrop = document.getElementById("modal-backdrop");
  const body = document.getElementById("modal-body");

  function close() { backdrop.classList.remove("open"); }
  document.getElementById("modal-close").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  async function render(book) {
    let isAdmin = false;
    let activeLoan = false;
    let reviews = [];
    if (localStorage.getItem("token")) {
      try {
        isAdmin = (await Api.me()).user.role === "admin";
        const loans = await Api.getLoans();
        activeLoan = loans.loans.some((loan) => loan.bookId === book.id && !loan.returnedAt);
        reviews = (await Api.getReviews(book.id)).reviews;
      } catch {}
    }

    body.innerHTML = `
      <h2>${escapeHtml(book.title)}</h2>
      <div class="m-author">${escapeHtml(book.author)}</div>
      <div class="m-row">Genre: ${escapeHtml(book.genre)}</div>
      <div class="m-row">Published: ${book.year || "—"}</div>
      <span class="m-tag ${book.available ? "" : "unavailable"}">${book.available ? "Available" : "Checked out"}</span>
      ${!isAdmin ? `<div class="m-action"><button class="m-toggle" id="modal-loan" ${!book.available && !activeLoan ? "disabled" : ""}>${activeLoan ? "Return book" : "Borrow book"}</button></div>` : ""}
      ${isAdmin ? `
        <div class="m-admin">
          <button class="m-toggle" id="modal-toggle">${book.available ? "Mark checked out" : "Mark returned"}</button>
          <div class="m-error" id="modal-error">Couldn't update — try again.</div>
        </div>` : ""}
      <div class="m-review"><strong>Ratings & reviews</strong>
        ${reviews.length ? reviews.map((review) => `<div class="m-review-item"><span class="m-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span> ${escapeHtml(review.userName)}<br>${escapeHtml(review.text || "No written review")}</div>`).join("") : `<div class="m-row">No reviews yet.</div>`}
        ${!isAdmin ? `<form id="review-form"><div class="m-action"><select id="review-rating" aria-label="Rating"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><button class="m-toggle" type="submit">Save review</button></div><textarea id="review-text" maxlength="500" placeholder="Share a short review (optional)"></textarea></form>` : ""}
        <div class="m-error" id="modal-error"></div>
      </div>
    `;

    if (!isAdmin) {
      document.getElementById("modal-loan").addEventListener("click", async () => {
        try { activeLoan ? await Api.returnBook(book.id) : await Api.borrow(book.id); document.dispatchEvent(new CustomEvent("book:updated")); window.openBookModal(book.id); }
        catch (error) { const errorEl = document.getElementById("modal-error"); errorEl.textContent = error.message; errorEl.style.display = "block"; }
      });
      document.getElementById("review-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        try { await Api.saveReview(book.id, document.getElementById("review-rating").value, document.getElementById("review-text").value); window.openBookModal(book.id); }
        catch (error) { const errorEl = document.getElementById("modal-error"); errorEl.textContent = error.message; errorEl.style.display = "block"; }
      });
    }

    if (isAdmin) {
      document.getElementById("modal-toggle").addEventListener("click", async () => {
        try {
          const updated = await Api.setAvailability(book.id, !book.available);
          document.dispatchEvent(new CustomEvent("book:updated", { detail: updated }));
          render(updated);
        } catch {
          document.getElementById("modal-error").style.display = "block";
        }
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  window.openBookModal = async function (id) {
    backdrop.classList.add("open");
    body.innerHTML = "Loading…";
    try {
      const book = await Api.getBook(id);
      render(book);
    } catch {
      body.innerHTML = `<h2>Couldn't load that book</h2><div class="m-row">Try again in a moment.</div>`;
    }
  };
})();
