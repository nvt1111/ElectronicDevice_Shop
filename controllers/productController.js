const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const Review = require("../models/review");
const mongoose = require("mongoose");
const pagination = require("../helpers/panigation");

const search_page = (req, res, next) => {
  res.render("search");
};

const get_product_id = async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");
  const user_id = req.session.user.id;
  const user = await User.findById(user_id);
  const review = await Review.find({ product: product._id }).populate("user");
  const Array = review.map((r) => r.rating);
  let rating_avg = (
    Array.reduce((sum, rating) => sum + rating, 0) / review.length
  ).toFixed(1);
 
  if(isNaN(rating_avg)) {rating_avg = 0}
  const ratingStar = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  Array.forEach((a) => {
    ratingStar[a]++;
  });
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  const currentPage = parseInt(req.query.page) || 1;
  const isLoggedIn = req.session.isLoggedIn;
  const { start, end, totalPage } = pagination(review, currentPage);

  res.render("product_detail", {
    isLoggedIn,
    product: product,
    user: user,
    review: review.slice(start, end),
    rating_avg,
    ratingStar,
    totalPage,
    currentPage,
  });
};

const get_product_category = async (req, res, next) => {
  try {
    let filter = {}; // lấy query trên request
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    const products = await Product.find({ category: filter.category });
    const category = await Category.findById({ _id: filter.category });
    if (!products) {
      res.status(500).json({ success: false });
    }
    const isLoggedIn = req.session.isLoggedIn;
    const user = req.session.user;

    res.render("category", {
      products,
      category,
      isLoggedIn: isLoggedIn,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

const create_product = async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Danh mục không khả dụng !");

  const file = req.file;
  if (!file) return res.status(400).send("Không có ảnh được yêu cầu !");
  const fileName = file.path;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    image: `${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
  });
  await product.save();

  res.send(product);
};

const search_product_key = async (req, res, next) => {
  try {
    const key = req.body.keyword;
    const filteredProducts = await Product.find({
      name: { $regex: key, $options: "i" },
    });
    const isLoggedIn = req.session.isLoggedIn;
    const user = req.session.user;

    res.render("search", { products: filteredProducts, isLoggedIn, user, key }); 
  } catch (error) {
    next(error);
  }
};

const review = async (req, res, next) => {
  const rating = req.body.rating;
  const review = req.body.review;
  const reviewNew = await Review.create({
    user: req.session.user.id,
    product: req.params.id,
    rating,
    review,
  });
  await reviewNew.populate("user");
  
  res.redirect(`/api/v1/products/${req.params.id}`);
};

module.exports = {
  get_product_category,
  search_page,
  create_product,
  get_product_id,
  search_product_key,
  review,
};
