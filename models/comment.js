const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    userId: {
      type: Schema.Types.ObjectId,
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
    articleId: Joi.string().required(),
  });
  return schema.validate(comment);
}

module.exports.Comment = mongoose.model("Comment", commentSchema);
module.exports.validateComment = validateComment;
