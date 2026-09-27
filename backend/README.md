# Open Stacks Library — backend

A minimal Express API for the catalog and login pages, with MongoDB persistence
and JWT authentication.

## Run it

```
npm install
copy .env.example .env    # then edit JWT_SECRET and MONGODB_URI
npm start                 # or: npm run dev (auto-restart)
```

Server runs at `http://localhost:4000`.

## Endpoints

**Books**
- `GET /api/books?q=&genre=&available=true&sort=title&page=1&pageSize=12`
  → `{ books, total, page, pageSize, totalPages, genres }`
- `GET /api/books/:id` → single book
- `PATCH /api/books/:id/availability` (admin, auth required) `{ available: boolean }`

- `POST /api/books` (admin) `{ title, author, genre, year?, available? }` → new book
- `PUT /api/books/:id` (admin) `{ title, author, genre, year?, available? }` → updated book
- `DELETE /api/books/:id` (admin) → `{ ok: true }`

**Auth**
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `POST /api/auth/register` `{ name, email, password }` → `{ token, user }`
- `GET /api/auth/me` (auth required) → `{ user }`
- `POST /api/auth/logout` → `{ ok: true }`

**Member library** (all require auth)
- `GET /api/library/loans` → the signed-in member's current and past loans
- `POST /api/library/loans/:bookId` → borrow an available book
- `POST /api/library/loans/:bookId/return` → return the signed-in member's loan
- `GET /api/library/reviews/:bookId` → ratings and reviews for a book
- `POST /api/library/reviews/:bookId` `{ rating: 1..5, text? }` → create or update the member's review
- `GET /api/library/recommendations` → personalized recommendations based on loans and reviews
- `GET /api/library/recommendations/popular` → popular/new fallback recommendations

**Admin** (all require auth + admin role)
- `GET /api/admin/stats` → book/user counts for the dashboard
- `GET /api/admin/activity?limit=50` → recent logins, registrations, and catalog/user changes
- `GET /api/admin/users` → every account, with `createdAt` / `lastLoginAt`
- `PATCH /api/admin/users/:id/role` `{ role: "admin" | "member" }` → can't demote yourself
- `DELETE /api/admin/users/:id` → can't delete your own account

Demo accounts: `admin@library.demo` / `admin123` (role: admin),
`member@library.demo` / `member123` (role: member). They are inserted only
when the `users` collection is empty.

## Routing

`GET /` redirects to `/login.html` — the app always lands on login first.
`index.html` and `admin.html` check for a valid session client-side
(`js/guard.js`) and bounce to `login.html` if there isn't one; `admin.html`
additionally bounces non-admins to `index.html`.

Every login, registration, book change, and user-management action is stored
in the MongoDB `activity` collection and surfaced in the admin dashboard's
activity feed. The `books`, `users`, and `activity` collections are created
automatically, with indexes for IDs, user email, and activity timestamps.

## Wiring up the frontend

`public/js/api.js` is a fetch wrapper both pages can use — it stores the
JWT in `localStorage` and attaches it as `Authorization: Bearer <token>`
automatically. `public/js/auth.js` is already wired to `login.html`'s forms.

For `catalog.html`, replace the synchronous `CATALOG_SOURCE()` demo data
with an async load on page start:

```js
let cachedBooks = [];
async function loadBooks() {
  const { books, genres } = await Api.getBooks({
    q: state.q, genre: state.genre, available: state.availableOnly, sort: state.sort
  });
  cachedBooks = books;
  renderGrid();
}
```

Drop `catalog.html`, `login.html`, and this `public/` folder's `js/api.js` /
`js/auth.js` into the same static folder so the relative `js/api.js` script
tags in both pages resolve correctly — or update `API_BASE` in `api.js` if
you're hosting the API elsewhere.

## MongoDB setup

Install MongoDB locally or create a MongoDB Atlas cluster. Copy `.env.example`
to `.env` and set:

```
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=smart_library_assignment
JWT_SECRET=use-a-long-random-value
```

This project intentionally uses the separate `smart_library_assignment`
database so it cannot mix collections with another project using the same
MongoDB cluster. On first startup, the API seeds the eight sample books and the two demo users.
It does not overwrite existing documents, so catalog edits and new accounts
remain persistent across restarts. For Atlas, replace `MONGODB_URI` with the
connection string from Atlas and allow the server IP in Atlas network access.
