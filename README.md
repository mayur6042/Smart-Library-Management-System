# Open Stacks — Smart Library Management & Recommendation System

A small library system: a Flask + MongoDB REST API, and a plain HTML/CSS/JS
frontend. Members can browse the catalog, borrow and return books, and rate
what they've read; the API turns that activity into personalized "you might
also like" recommendations. Admins get a dashboard for managing the catalog,
tracking loans (including overdue ones), and seeing library-wide stats.

## What's inside

```
backend/
  app.py             Flask app factory + entry point
  config.py           Settings, read from environment variables
  db.py                MongoDB connection + index setup
  auth_utils.py     Password hashing, JWT issue/verify, route decorators
  serializers.py    Mongo document -> JSON-safe dict
  recommender.py  Content-based + item-based collaborative filtering
  seed_data.py       Demo catalog, demo users, sample ratings/loans
  routes/                One blueprint per resource (auth, books, borrow, reviews, users, recommendations)
frontend/
  index.html            Catalog: search, filter, browse, book detail, borrow, rate
  login.html             Log in / create an account
  dashboard.html    A member's active loans, history, and recommendations
  admin.html          Stats, catalog management (add/edit/delete), loan oversight, member list
  css/style.css        Shared styling
  js/                       One file per page, plus shared api.js and book-modal.js
```

## How recommendations work

`recommender.py` blends three signals, computed fresh from the current
database contents (fine for a library-sized catalog; a much bigger one would
precompute these on a schedule instead):

- **Content-based** — books are turned into TF-IDF vectors over their
  genres, tags and author, and compared by cosine similarity. A user's
  "taste profile" is the (rating-weighted) average of the books they've
  rated or borrowed.
- **Collaborative filtering** — an item-based, adjusted-cosine model over
  the user x book rating matrix: books that readers with similar rating
  patterns to you also rated highly.
- **Popularity** — average rating weighted by number of ratings, used to
  fill in when a user is new and has little history (cold start), or when
  the personalized signals don't produce enough results.

`GET /api/recommendations` returns the blended top-N, each with a short
`reason` string explaining why it was picked.

## Setup

### 1. MongoDB

You need a MongoDB instance reachable from the backend — either installed
locally, run via Docker (`docker run -d -p 27017:27017 mongo`), or a free
[Atlas](https://www.mongodb.com/atlas) cluster. Put its connection string in
`backend/.env` (copy `backend/.env.example` to get started).

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env                                                # edit MONGO_URI etc. if needed
python seed_data.py                                                # populates demo data
python app.py                                                            # starts the API on http://localhost:5000
```

Demo accounts created by `seed_data.py`:
| Role   | Email                 | Password   |
|--------|-----------------------|------------|
| Admin  | admin@library.demo    | admin123   |
| Member | member@library.demo   | member123  |

### 3. Frontend

The frontend is static files — no build step. From the `frontend/` folder:

```bash
cd frontend
python -m http.server 8080
```

Then open `http://localhost:8080`. It talks to the API at
`http://localhost:5000/api` by default; to point it elsewhere, set
`window.LIBRARY_API_BASE` before `api.js` loads (e.g. add a small
`<script>window.LIBRARY_API_BASE = "https://your-api.example.com/api";</script>`
tag above the `<script src="js/api.js">` tag in each HTML file).

## Core features

- **Auth** — JWT-based registration/login; passwords hashed with Werkzeug's
  `generate_password_hash`.
- **Catalog** — full-text search (title/author/genre/tag), genre filter,
  availability filter, pagination.
- **Borrowing** — configurable loan period and per-member borrow limit
  (`LOAN_PERIOD_DAYS`, `MAX_BOOKS_PER_USER` in `.env`); atomic copy-count
  decrements so two members can't grab the last copy at once; automatic
  overdue detection and per-day fines on return.
- **Reviews** — 1–5 star ratings with an optional comment; a book's average
  rating and count are recomputed whenever a review is added, changed, or
  removed.
- **Recommendations** — see above.
- **Admin dashboard** — catalog CRUD, library-wide stats, loan oversight
  (including an "overdue" filter), member list.

## Notes on scope

This is built to be a clear, working reference implementation, not a
production deployment: the JWT secret and Mongo URI should be replaced for
real use, `CORS_ORIGINS` should be narrowed from `*`, and at real scale
you'd move recommendation-matrix computation to an offline/scheduled job
rather than recomputing it per request. Client and Server are combined in backend.
