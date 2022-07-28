const express = require("express");
const mongoose = require("mongoose");
const { Article } = require("../models/article");
const { Comment, validateComment } = require("../models/comment");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

// INFO: Get all Comments
router.get("/", [auth, admin], async (req, res) => {
  const comments = await Comment.find().populate("userId", "-password");

  res.status(200).json(comments);
});

// INFO: Create new comment
router.post("/", auth, async (req, res) => {
  const article = await Article.findById({
    _id: req.body.articleId,
  });

  if (!article)
    return res.status(404).send("The Article with given ID was not found.");

  const { error } = validateComment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // NOTE: create new comment and add it to article comments array
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newComment = new Comment(
      {
        articleId: req.body.articleId,
        userId: req.user._id,
        message: req.body.message,
      },
      { session }
    );

    article.comments.push({ commentId: newComment._id });
    await article.save(session);
    await newComment.save(session);

    await session.commitTransaction();
    return res.send(newComment);
  } catch (error) {
    console.log("error occur while adding new comments", error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

// INFO: Delete comment
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const comment = await Comment.findById({
    _id: req.params.id,
  });

  if (!comment)
    return res.status(404).send("The Comment with given ID was not found.");

  const article = await Article.findById({
    _id: comment.articleId,
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Comment.findByIdAndRemove(
      {
        _id: req.params.id,
      },
      { session }
    );
    // INFO: remove the deleted comment from the comment array
    const updatedComment = article.comments.filter(
      (c) => c.commentId.toString() != req.params.id.toString()
    );
    article.comments = updatedComment;
    await article.save(session);

    await session.commitTransaction();
    return res.send({ comment, message: "comment was delete succ.." });
  } catch (error) {
    console.log("error occur while adding new comments", error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

module.exports = router;
