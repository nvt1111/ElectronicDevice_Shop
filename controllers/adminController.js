const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const Order = require("../models/order");
const OrderItemHistory = require("../models/orderItemHistory");
const bcrypt = require("bcrypt");
const { uploadOptions } = require("../helpers/uploadImage");
const pagination = require("../helpers/panigation");

const get_dashboard = async (req, res) => {
  const order = res.locals.orders;
  const currentPage = parseInt(req.query.page) || 1;
  const { start, end, totalPage } = pagination(order, currentPage);
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;

  res.render("dist/index", {
    orders: order.slice(start, end),
    totalPage,
    currentPage,
    user,
    isLoggedIn,
  });
};

const get_page_user =async (req, res) => {
  const userList = await User.find();
  const currentPage = parseInt(req.query.page) || 1;
  const { start, end, totalPage } = pagination(userList, currentPage);
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;

  res.render("dist/users", {
    users: userList.slice(start, end),
    totalPage,
    currentPage,
    isLoggedIn,
    user,
  });
};

const get_page_category = async(req, res) => {
  const categories = await Category.find();
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;

  res.render("dist/categories", { isLoggedIn, user ,categories});
};

const get_page_product = async (req, res) => {
  const product = await Product.find().populate("category").sort({createdAt: 'desc'});

  const currentPage = parseInt(req.query.page) || 1;
  const { start, end, totalPage } = pagination(product, currentPage);
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;

  res.render("dist/products", {
    products: product.slice(start, end),
    totalPage,
    currentPage,
    isLoggedIn,
    user,
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
    if (!file) {
      return res.status(400).send("Không có ảnh trong yêu cầu");
    }
    const fileName = file.path;
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: `${fileName}`, 
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      countInStock: req.body.countInStock,
    });
    await product.save();

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

const delProduct = async (req, res) => {
  const deletedItem = await Product.findByIdAndRemove(req.params.id);

  if (!deletedItem) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại." });
  }
  res.json({
    success: true,
    redirect: "/admins/products",
  });
};

const delOrder = async (req, res) => {
  const deletedItem = await Order.findByIdAndRemove(req.params.id);

  if (!deletedItem) {
    return res.status(404).json({ message: "Đơn hàng không tồn tại." });
  }
  res.json({
    success: true,
    redirect: "/admins/dashboard",
  });
};

const delUser = async (req, res) => {
  const deletedItem = await User.findByIdAndRemove(req.params.id);

  if (!deletedItem) {
    return res.status(404).json({ message: "User không tồn tại." });
  }
  res.json({
    success: true,
    redirect: "/admins/users",
  });
};

const delCate = async (req, res) => {
  const deletedItem = await Category.findByIdAndRemove(req.params.id);

  if (!deletedItem) {
    return res.status(404).json({ message: "Mặt hàng không tồn tại." });
  }
  res.json({
    success: true,
    redirect: "/admins/categories",
  });
};

const update_product = async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Danh mục không tồn tại !");
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
        district: req.body.district,
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
const detailProduct = async (req, res) => {
  const pro = await Product.findById(req.params.id);

  res.render("dist/edit_products", { pro });
};

const detailUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  res.render("dist/edit_users", { user });
};

const detailOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  res.render("dist/edit_orders", { order });
};

const getRevenue = async (req, res) => {
  let monthlyRevenue = Array(12).fill(0);
  const orders = await Order.find();
  orders.forEach((order) => {
    const month = new Date(order.createdAt).getMonth();
    monthlyRevenue[month] += order.totalPrice;
  });

  res.json({ monthlyRevenue }); // tra ve response
};

const getQuantityEachCategory = async (req, res) => {
  const orderItemHistory = await OrderItemHistory.find().populate({
    path: "product",
    populate: {
      path: "category",
    },
  });

  let arrayQuantity = {};
  orderItemHistory.forEach(async (order) => {
    if (
      order.product &&
      order.product.category &&
      order.product.category.name
    ) {
      let categoryName = order.product.category.name;
      if (!arrayQuantity[categoryName]) {
        arrayQuantity[categoryName] = 0;
      }

      arrayQuantity[categoryName] += parseInt(order.quantity);
     
    }
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
  update_user,
  update_order,
  detailProduct,
  detailUser,
  detailOrder,
  getRevenue,
  getQuantityEachCategory,
};
