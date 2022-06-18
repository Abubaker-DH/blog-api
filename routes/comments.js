const express = require("express");
const { Article } = require("../models/article");
const auth = require("../middleware/auth");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Comment, validateComment } = require("../models/comment");
const router = express.Router();

// INFO: Get all Comment that belong to article
router.get("/:articleId", [auth, admin, validateObjectId], async (req, res) => {
  const article = await Article.findById({
    _id: req.params.articleId,
  });

  if (!article)
    return res.status(404).send("The Article with given ID was not found.");

  const comments = await Comment.find({
    articleId: req.params.articleId,
  }).populate("userId", "-password -email -role");

  res.status(200).json(comments);
});

// INFO: Create new comment
router.post("/", auth, async (req, res) => {
  const { error } = validateComment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const article = await Article.findById({
    _id: req.body.articleId,
  });

  if (!article)
    return res.status(404).send("The Aticle with given ID was not found.");

  const newComment = new Comment({
    articleId: req.body.articleId,
    text: req.body.text,
  });

  await newComment.save();

  res.status(201).json(newComment);
});

// INFO: Delete comment
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const comment = await Comment.findById({
    _id: req.params.id,
  });

  if (!comment)
    return res.status(404).send("The Comment with given ID was not found.");

  await Comment.findByIdAndRemove({
    _id: req.params.id,
  });

  res.status(200).json(comment);
});

module.exports = router;
