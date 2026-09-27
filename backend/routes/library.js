const express = require("express");
const router = express.Router();
const { getDb } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { logActivity } = require("../data/activity");

router.use(requireAuth);

function publicBook(book) {
  if (!book) return null;
  const { _id, ...result } = book;
  return result;
}

async function getBook(id) { return getDb().collection("books").findOne({ id }); }

router.get("/loans", async (req, res, next) => {
  try {
    const loans = await getDb().collection("loans").find({ userId: req.user.id }, { projection: { _id: 0 } }).sort({ borrowedAt: -1 }).toArray();
    const books = await getDb().collection("books").find({ id: { $in: loans.map((loan) => loan.bookId) } }, { projection: { _id: 0 } }).toArray();
    const byId = new Map(books.map((book) => [book.id, book]));
    res.json({ loans: loans.map((loan) => ({ ...loan, book: publicBook(byId.get(loan.bookId)) })) });
  } catch (error) { next(error); }
});

router.post("/loans/:bookId", async (req, res, next) => {
  try {
    const book = await getBook(req.params.bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (!book.available) return res.status(409).json({ error: "This book is currently checked out" });
    const loans = getDb().collection("loans");
    if (await loans.findOne({ userId: req.user.id, bookId: book.id, returnedAt: null })) return res.status(409).json({ error: "You already borrowed this book" });
    const loan = { id: `l${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, userId: req.user.id, bookId: book.id, borrowedAt: new Date().toISOString(), returnedAt: null };
    const result = await getDb().collection("books").updateOne({ id: book.id, available: true }, { $set: { available: false } });
    if (!result.modifiedCount) return res.status(409).json({ error: "This book was just checked out" });
    await loans.insertOne(loan);
    await logActivity("borrow", `${req.user.name} borrowed "${book.title}"`, req.user);
    res.status(201).json({ loan, book: publicBook({ ...book, available: false }) });
  } catch (error) { next(error); }
});

router.post("/loans/:bookId/return", async (req, res, next) => {
  try {
    const loans = getDb().collection("loans");
    const loan = await loans.findOne({ userId: req.user.id, bookId: req.params.bookId, returnedAt: null });
    if (!loan) return res.status(404).json({ error: "You do not have this book on loan" });
    const book = await getBook(req.params.bookId);
    await loans.updateOne({ id: loan.id }, { $set: { returnedAt: new Date().toISOString() } });
    await getDb().collection("books").updateOne({ id: req.params.bookId }, { $set: { available: true } });
    await logActivity("return", `${req.user.name} returned "${book?.title || "a book"}"`, req.user);
    res.json({ ok: true });
  } catch (error) { next(error); }
});

router.get("/reviews/:bookId", async (req, res, next) => {
  try { res.json({ reviews: await getDb().collection("reviews").find({ bookId: req.params.bookId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() }); } catch (error) { next(error); }
});

router.post("/reviews/:bookId", async (req, res, next) => {
  try {
    const { rating, text = "" } = req.body || {};
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ error: "Rating must be an integer from 1 to 5" });
    if (String(text).trim().length > 500) return res.status(400).json({ error: "Review must be 500 characters or fewer" });
    if (!await getBook(req.params.bookId)) return res.status(404).json({ error: "Book not found" });
    const review = { id: `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, bookId: req.params.bookId, userId: req.user.id, userName: req.user.name, rating: numericRating, text: String(text).trim(), createdAt: new Date().toISOString() };
    await getDb().collection("reviews").updateOne({ bookId: review.bookId, userId: review.userId }, { $set: review }, { upsert: true });
    await logActivity("review", `${req.user.name} reviewed a book`, req.user);
    res.status(201).json({ review });
  } catch (error) { next(error); }
});

async function recommendationsFor(userId) {
  const db = getDb();
  const [loans, reviews, books] = await Promise.all([db.collection("loans").find({ userId }).toArray(), db.collection("reviews").find({ userId }).toArray(), db.collection("books").find({}, { projection: { _id: 0 } }).toArray()]);
  const seen = new Set([...loans.map((item) => item.bookId), ...reviews.map((item) => item.bookId)]);
  const signals = [...loans, ...reviews].reduce((counts, item) => { const book = books.find((candidate) => candidate.id === item.bookId); if (book) counts[book.genre] = (counts[book.genre] || 0) + (item.rating >= 4 ? 2 : 1); return counts; }, {});
  const ranked = books.filter((book) => !seen.has(book.id)).map((book) => ({ ...book, score: (signals[book.genre] || 0) * 3 + (book.available ? 1 : 0) })).sort((a, b) => b.score - a.score || b.year - a.year).slice(0, 6).map(publicBook);
  return { books: ranked, personalized: Object.keys(signals).length > 0 };
}

router.get("/recommendations", async (req, res, next) => { try { res.json(await recommendationsFor(req.user.id)); } catch (error) { next(error); } });

router.get("/recommendations/popular", async (req, res, next) => {
  try {
    const [books, reviews] = await Promise.all([getDb().collection("books").find({}, { projection: { _id: 0 } }).toArray(), getDb().collection("reviews").find({}).toArray()]);
    const scores = reviews.reduce((map, review) => { map[review.bookId] = (map[review.bookId] || 0) + review.rating; return map; }, {});
    res.json({ books: books.sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0) || b.year - a.year).slice(0, 6) });
  } catch (error) { next(error); }
});

module.exports = router;