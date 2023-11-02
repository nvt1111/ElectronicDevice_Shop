const Category = require("../models/category");

const all_category = async (req, res, next) => {
  try {
    const categoryList = await Category.find();
    if (!categoryList) {
      res.status(500).json({
        success: false,
      });
    }
    res.status(200).send(categoryList);
  } catch (error) {
    next(error);
  }
};

const update_category = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    );
    res.status(200).send(category);
  } catch (error) {
    next(error);
  }
};

const get_category = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(500).json({
        message: "Category not found",
      });
    }

    res.status(200).send(category);
  } catch (error) {
    next(error);
  }
};

const create_category = async (req, res, next) => {
  try {
    const category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    const savedCategory = await category.save();
    if (!savedCategory) res.status(404).send("the category cannot be created");

    res.send(savedCategory);
  } catch (error) {
    next(error);
  }
};

const delete_category = async (req, res, next) => {
  try {
    await Category.findByIdAndRemove(req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  all_category,
  update_category,
  get_category,
  create_category,
  delete_category,
};
