const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

function validateComment(comment) {
  const schema = Joi.object({
    text: Joi.string().max(255).min(1).required(),
  });
  return schema.validate(comment);
}

module.exports.Comment = mongoose.model("Comment", commentSchema);
module.exports.validateComment = validateComment;
