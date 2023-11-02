const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const OrderItemHistory = require("../models/orderItemHistory");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signAccessToken } = require("../helpers/jwt");
const session = require("express-session");
const { uploadOptions } = require("../helpers/uploadImage");

const get_dashboard = async (req, res, next) => {
  //Panigation
  const order = res.locals.orders;
  const currentPage = parseInt(req.query.page) || 1;
  const slOrder1Page = 5;
  // (n-1)*x
  const start = (currentPage - 1) * slOrder1Page;
  const end = start + slOrder1Page;
  const totalPage = Math.ceil(order.length / slOrder1Page); //lam tron len

  res.render("dist/index", {
    orders: order.slice(start, end),
    totalPage,
    currentPage,
  });
};

const get_page_user = (req, res, next) => {
  //Panigation
  const user = res.locals.users;
  const currentPage = parseInt(req.query.page) || 1;
  const slOrder1Page = 5;
  // (n-1)*x
  const start = (currentPage - 1) * slOrder1Page;
  const end = start + slOrder1Page;
  const totalPage = Math.ceil(user.length / slOrder1Page); //lam tron len

  res.render("dist/users", {
    users: user.slice(start, end),
    totalPage,
    currentPage,
  });
};

const get_page_category = (req, res, next) => {
  res.render("dist/categories");
};

const get_page_product = (req, res, next) => {
  //Panigation
  const product = res.locals.products;
  const currentPage = parseInt(req.query.page) || 1;
  const slOrder1Page = 5;
  // (n-1)*x
  const start = (currentPage - 1) * slOrder1Page;
  const end = start + slOrder1Page;
  const totalPage = Math.ceil(product.length / slOrder1Page); //lam tron leen

  res.render("dist/products", {
    products: product.slice(start, end),
    totalPage,
    currentPage,
  });
};

const addUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(500).json({
        message: "Email đã đăng kí",
      });
    } else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAmin: req.body.isAmin,
      });
      await user.save();
      res.redirect("/admins/users");
    }
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).send("Không có ảnh trong yêu cầu");
    }
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232",
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      countInStock: req.body.countInStock,
    });
    const savedPro = await product.save();
    if (!savedPro) res.send("không thêm được sản phẩm");
    res.redirect("/admins/products");
  } catch (error) {
    next(error);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const cate = new Category(req.body);
    await cate.save();

    res.redirect("/admins/categories");
  } catch (error) {
    next(error);
  }
};

const delProduct = async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admins/products");
};

const delOrder = async (req, res, next) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect("/admins/dashboard");
};

const delUser = async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admins/users");
};

const delCate = async (req, res, next) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect("/admins/categories");
};

const update_product = async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        // image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
      },
      { new: true }
    );
    if (!product) res.send("Không tồn tại product!");

    res.redirect("/admins/products");
  } catch (error) {
    next(error);
  }
};

const update_user = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
      },
      { new: true }
    );
    if (!user) res.send("Không tồn tại user !");

    res.redirect("/admins/users");
  } catch (error) {
    next(error);
  }
};

const update_order = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        totalPrice: req.body.totalPrice,
        shippingAddress1: req.body.shippingAddress1,
        status: req.body.status,
      },
      { new: true }
    );
    if (!order) res.send("Không tồn tại order");

    res.redirect("/admins/dashboard");
  } catch (error) {
    next(error);
  }
};
const detailProduct = async (req, res, next) => {
  const pro = await Product.findById(req.params.id);
  res.render("dist/edit_products", { pro });
};

const detailUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render("dist/edit_users", { user });
};

const detailOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  res.render("dist/edit_orders", { order });
};

const getRevenue = async (req, res, next) => {
  let monthlyRevenue = Array(12).fill(0);
  const orders = await Order.find();
  orders.forEach((order) => {
    const month = new Date(order.dateOrdered).getMonth();
    monthlyRevenue[month] += order.totalPrice;
  });

  res.json({ monthlyRevenue }); // tra ve response
};

const getQuantityEachCategory = async (req, res) => {
  const categories = await Category.find();
  const orderItemHistory = await OrderItemHistory.find().populate({
    path: "product", // sử dụng path
    populate: {
      path: "category",
    },
  });

  let arrayQuantity = {};
  orderItemHistory.forEach((order) => {
    if (!arrayQuantity[order.product.category.name]) {
      arrayQuantity[order.product.category.name] = 0;
    }
    arrayQuantity[order.product.category.name] += parseInt(order.quantity);
  });

  const name = Object.keys(arrayQuantity);
  const quantity = Object.values(arrayQuantity);
  
  res.json({ name, quantity });
};

module.exports = {
  get_dashboard,
  get_page_user,
  get_page_category,
  get_page_product,
  addUser,
  addProduct,
  addCategory,
  delProduct,
  delOrder,
  delUser,
  delCate,
  update_product,
  detailProduct,
  detailUser,
  update_user,
  detailOrder,
  update_order,
  getRevenue,
  getQuantityEachCategory,
};
