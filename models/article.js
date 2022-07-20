const Joi = require("joi");
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
    },
    body: { type: String, required: true, minlength: 100, maxlength: 5000 },
    isPublish: { type: Boolean, default: false },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    imageUrl: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      { commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" } },
    ],
  },
  { timestamps: true }
);

function validateArticle(article) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    body: Joi.string().min(100).max(5000).required(),
    categoryId: Joi.objectId().required(),
    imageUrl: Joi.string().required(),
  });

  return schema.validate(article);
}

module.exports.Article = mongoose.model("Article", articleSchema);
exports.validateArticle = validateArticle;
exports.articleSchema = articleSchema;
