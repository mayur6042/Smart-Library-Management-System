const express = require("express");
const router = express.Router();
const { getDb } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { logActivity } = require("../data/activity");

router.get("/", async (req, res, next) => {
  try {
    const { q = "", genre = "", available, sort = "title", page = 1, pageSize = 100 } = req.query;
    const filter = {};
    if (q.trim()) filter.$or = [{ title: { $regex: q.trim(), $options: "i" } }, { author: { $regex: q.trim(), $options: "i" } }];
    if (genre) filter.genre = genre;
    if (available === "true") filter.available = true;
    const sortBy = sort === "author" ? { author: 1 } : sort === "newest" ? { year: -1 } : { title: 1 };
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.max(1, parseInt(pageSize, 10) || 100);
    const collection = getDb().collection("books");
    const [books, total, genres] = await Promise.all([
      collection.find(filter, { projection: { _id: 0 } }).sort(sortBy).skip((pageNum - 1) * size).limit(size).toArray(),
      collection.countDocuments(filter),
      collection.distinct("genre"),
    ]);
    res.json({ books, total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) || 1, genres: genres.sort() });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const book = await getDb().collection("books").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (error) { next(error); }
});

router.patch("/:id/availability", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (typeof req.body.available !== "boolean") return res.status(400).json({ error: "available must be true or false" });
    const collection = getDb().collection("books");
    const book = await collection.findOne({ id: req.params.id });
    if (!book) return res.status(404).json({ error: "Book not found" });
    await collection.updateOne({ id: book.id }, { $set: { available: req.body.available } });
    book.available = req.body.available;
    await logActivity("availability", `${req.user.name} marked "${book.title}" as ${book.available ? "available" : "checked out"}`, req.user);
    delete book._id;
    res.json(book);
  } catch (error) { next(error); }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, author, genre, year, available = true } = req.body || {};
    if (!title || !author || !genre) return res.status(400).json({ error: "Title, author and genre are required" });
    const book = { id: "b" + Date.now(), title, author, genre, year: year ? Number(year) : undefined, available: Boolean(available) };
    await getDb().collection("books").insertOne(book);
    await logActivity("book_created", `${req.user.name} added "${book.title}"`, req.user);
    res.status(201).json(book);
  } catch (error) { next(error); }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, author, genre, year, available } = req.body || {};
    if (!title || !author || !genre) return res.status(400).json({ error: "Title, author and genre are required" });
    const collection = getDb().collection("books");
    const book = await collection.findOne({ id: req.params.id });
    if (!book) return res.status(404).json({ error: "Book not found" });
    const changes = { title, author, genre, year: year ? Number(year) : book.year, available: typeof available === "boolean" ? available : book.available };
    await collection.updateOne({ id: book.id }, { $set: changes });
    Object.assign(book, changes);
    await logActivity("book_updated", `${req.user.name} edited "${book.title}"`, req.user);
    delete book._id;
    res.json(book);
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const collection = getDb().collection("books");
    const book = await collection.findOne({ id: req.params.id });
    if (!book) return res.status(404).json({ error: "Book not found" });
    await collection.deleteOne({ id: book.id });
    await logActivity("book_deleted", `${req.user.name} removed "${book.title}"`, req.user);
    res.json({ ok: true });
  } catch (error) { next(error); }
});

module.exports = router;
