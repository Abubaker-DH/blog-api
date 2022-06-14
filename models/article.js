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
    body: { type: String, required: true, minlength: 100, maxlength: 1000 },
    isPublish: { type: Boolean, default: false },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    images: [
      {
        imageUrl: { type: String, required: true },
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

function validateArticle(article) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    body: Joi.string().min(100).max(1000).required(),
    category: Joi.objectId().required(),
    images: Joi.array()
      .items(Joi.object({ imageUrl: Joi.string().required() }))
      .min(1),
  });

  return schema.validate(article);
}

module.exports.Article = mongoose.model("Article", articleSchema);
exports.validateArticle = validateArticle;
exports.articleSchema = articleSchema;
