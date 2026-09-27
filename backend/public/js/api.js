// Shared fetch wrapper used by every page. Change API_BASE if the backend
// isn't running on the same host/port, or leave it relative ("/api") if you
// copy these files into the backend's /public folder and serve everything
// from one origin (see README).
const API_BASE = "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

const Api = {
  // Books
  getBooks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    );
    return apiFetch(`/books?${qs}`);
  },
  getBook: (id) => apiFetch(`/books/${id}`),
  setAvailability: (id, available) =>
    apiFetch(`/books/${id}/availability`, { method: "PATCH", body: JSON.stringify({ available }) }),

  // Member library
  getLoans: () => apiFetch("/library/loans"),
  borrow: (id) => apiFetch(`/library/loans/${id}`, { method: "POST" }),
  returnBook: (id) => apiFetch(`/library/loans/${id}/return`, { method: "POST" }),
  getReviews: (id) => apiFetch(`/library/reviews/${id}`),
  saveReview: (id, rating, text) => apiFetch(`/library/reviews/${id}`, { method: "POST", body: JSON.stringify({ rating, text }) }),
  getRecommendations: () => apiFetch("/library/recommendations"),
  getPopular: () => apiFetch("/library/recommendations/popular"),

  // Auth
  login: async (email, password) => {
    const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("token", data.token);
    return data.user;
  },
  register: async (name, email, password) => {
    const data = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    localStorage.setItem("token", data.token);
    return data.user;
  },
  me: () => apiFetch("/auth/me"),
  logout: async () => {
    localStorage.removeItem("token");
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch {}
  },
};
