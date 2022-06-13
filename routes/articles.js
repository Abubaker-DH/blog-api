const mongoose = require("mongoose");
const express = require("express");
const { Article, validateArticle } = require("../models/article");
const { Category } = require("../models/category");
const { Comment } = require("../models/comment");
const router = express.Router();

// NOTE: Get all articles
router.get("/", async (req, res) => {
  // INFO: user will Get all article
  const articles = await Article.find().populate(
    "userId",
    "name _id profileImage"
  );

  res.send(articles);
});

// NOTE: Create new article
router.post("/", async (req, res) => {
  req.body.user = req.user._id;
  if (!req.files) return res.status(422).send("No image provided.");

  // INFO: get the imageUrl from req.files
  let images = [];
  for (i = 0; i < req.files.length; i++) {
    images[i] = { imageUrl: req.files[i].path };
  }

  // INFO: add images becouse we validate the body
  req.body.images = images;

  // INFO: validate data send by user
  const { error } = validateArticle(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // INFO: find category by id
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category.");

  const article = new Article({
    title: req.body.title,
    user: req.user._id,
    category: req.body.category._id,
    body: req.body.body,
    images: req.body.images,
  });
  await article.save();

  res.status(201).send(article);
});

// NOTE: Update article
router.patch("/:id", async (req, res) => {
  let article = await Article.findById(req.params.id);
  if (!article)
    return res.status(404).send(" The article with given ID was not found.");

  // INFO: The owner or admin can Update the article

  // INFO: find category by id
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category.");

  let images = article.images;
  if (req.files) {
    for (i = 0; i < req.files.length; i++) {
      images[i] = { imageUrl: req.files[i].path };
    }
  }
  req.body.images = images;

  article = await article.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      user: req.user._id,
      category: req.body.category._id,
      body: req.body.body,
      images: req.body.images,
    },
    { new: true }
  );

  res.send(article);
});

// NOTE: Delete article
router.delete("/:id", async (req, res) => {
  let article = await Article.findById(req.params.id);
  if (!article)
    return res.status(404).send(" The article with given ID was not found.");

  // INFO: the owner or admin can delete the article

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // INFO: Delete the article with all comments
    article = await Article.findByIdAndRemove(req.params.id, { session });
    const comments = await Comment.findByIdAndRemove(req.params.id, {
      session,
    });

    await session.commitTransaction();
    return res.send({ article, comments });
  } catch (error) {
    console.log("error Deleting article and comments", error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

// NOTE: Get one article route
router.get("/:id", async (req, res) => {
  const article = await Article.findById(req.params.id).populate(
    "userId",
    "name _id profileImage"
  );

  const comments = await Comment.find({ articleId: req.params.id });

  if (!article)
    return res.status(404).send(" The Article with given ID was not found.");

  res.send({ article, comments });
});

module.exports = router;
