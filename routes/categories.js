const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const { Category, validateCategory } = require("../models/category");
const router = express.Router();

// INFO: Get all categories
router.get("/", async (req, res) => {
  const categories = await Category.find().select("-__v -userId").sort("title");
  res.send(categories);
});

// INFO: Create new category
router.post("/", [auth, admin], async (req, res) => {
  // NOTE: validate data send by user
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let category = new Category({ title: req.body.title, userId: req.user._id });
  category = await category.save();

  res.status(201).send({ message: "New catrgory Created", category });
});

// INFO: Update category
router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  // NOTE: validate data send by user
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title },
    {
      new: true,
    }
  );

  if (!category)
    return res
      .status(404)
      .send("The Category with the given ID was not found.");

  res.send(category);
});

// INFO: Delete category
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);

  if (!category)
    return res
      .status(404)
      .send("The Category with the given ID was not found.");

  res.send(category);
});

// INFO: Get one category
router.get("/:id", [auth, admin], async (req, res) => {
  const category = await Category.findById(req.params.id).select("-__v");

  if (!category)
    return res
      .status(404)
      .send("The Category with the given ID was not found.");

  res.send(category);
});

module.exports = router;
