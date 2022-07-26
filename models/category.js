const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 10,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

function validateCategory(category) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(10).required(),
  });

  return schema.validate(category);
}

module.exports.Category = mongoose.model("Category", categorySchema);
exports.validateCategory = validateCategory;
