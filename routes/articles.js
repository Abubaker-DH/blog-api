const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const admin = require("../middleware/admin");
const { Article, validateArticle } = require("../models/article");
const { Category } = require("../models/category");
const { Comment } = require("../models/comment");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

// NOTE: Search articles
router.get("/", async (req, res) => {
  let q = req.query.title;
  let articles;
  // INFO: user will Get all article
  if (q) {
    articles = await Article.find({
      title: { $regex: q, $options: "i" },
      isPublish: "true",
    }).populate("userId", "name _id profileImage");

    res.send(articles);
  }

  articles = await Article.find({
    isPublish: "true",
  }).populate("userId", "name _id profileImage");

  res.send(articles);
});

// NOTE: Admin to get all articles
router.get("/all", [auth, admin], async (req, res) => {
  // INFO: user will Get all article
  const articles = await Article.find().populate(
    "userId",
    "name _id profileImage"
  );

  res.send(articles);
});

// NOTE: Create new article
router.post("/", [auth, upload.single("imageUrl")], async (req, res) => {
  if (req.user.role === "user") return res.status(403).send("Access denied.");

  if (!req.files) return res.status(422).send("No image provided.");

  // INFO: add images beCouse we validate the body
  if (req.file) {
    req.body.imageUrl = req.file.path;
  }

  // INFO: validate data send by user
  const { error } = validateArticle(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // INFO: find category by id
  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category.");

  const article = new Article({
    title: req.body.title,
    userId: req.user._id,
    categoryId: req.body.categoryId,
    body: req.body.body,
    imageUrl: req.body.imageUrl,
  });
  await article.save();

  res.status(201).send(article);
});

// NOTE: Update article
router.patch(
  "/:id",
  [auth, validateObjectId, upload.single("imageUrl")],
  async (req, res) => {
    let article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).send(" The article with given ID was not found.");

    // INFO: The Owner Can Update the article
    if (req.user._id.toString() !== article.userId.toString())
      return res.status(403).send("Access denied.");

    // INFO: The Admin and Editor can publish
    if (req.body.isPublish) {
      if (req.user.role !== "admin" || req.user.role !== "editor") {
        return res.status(403).send("method not allowed.");
      }
    }

    // INFO: find category by id
    const category = await Category.findById(req.body.categoryId);
    if (!category) return res.status(400).send("Invalid category.");

    if (req.file) {
      clearImage(article.imageUrl);
      req.body.imageUrl = req.file.path;
    }

    article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        userId: req.user._id,
        categoryId: req.body.categoryId,
        body: req.body.body,
        imageUrl: req.body.imageUrl,
        isPublish: req.body.isPublish,
      },
      { new: true }
    );

    res.send(article);
  }
);

// NOTE: Delete article
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  let article = await Article.findById(req.params.id);
  if (!article)
    return res.status(404).send(" The article with given ID was not found.");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // INFO: Delete the article with all comments
    article = await Article.findByIdAndRemove(req.params.id, { session });
    const comments = await Comment.findByIdAndRemove(req.params.id, {
      session,
    });

    await session.commitTransaction();
    clearImage(article.imageUrl);
    return res.send({ article, comments });
  } catch (error) {
    console.log("error Deleting article and comments", error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

// NOTE: Get one article route
router.get("/:id", validateObjectId, async (req, res) => {
  // NOTE: Populate across multiple levels
  const article = await Article.findById(req.params.id)
    .populate("userId", "name _id profileImage")
    .populate({
      path: "comments.commentId",
      populate: { path: "userId", select: "_id name profileImage" },
    });

  if (!article)
    return res.status(404).send(" The Article with given ID was not found.");

  res.send(article);
});

// NOTE: Delete image from image Folder
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    return err;
  });
};

module.exports = router;
