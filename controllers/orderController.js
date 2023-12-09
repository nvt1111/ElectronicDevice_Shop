const Order = require("../models/order");
const Token = require("../models/tokenDevice");
const mongoose = require("mongoose");
const OrderItem = require("../models/order-item");
const Coupon = require("../models/coupon");
const OrderItemsHistory = require("../models/orderItemHistory");

// FCM node

var FCM = require('fcm-node');
var serviceAccount = require("../config/creds.json");
var admin = require("firebase-admin");
fcm = new FCM("AAAAiYXlfnM:APA91bFtgDywRbvPAzqrCcea35GpDE1kiQ6Zmz7CVPkl_BFN_QJpZi5dFLqkTKEMM_BXVfFEdD9ZpfvEogh1EUqZJUWe2OouwwFFwgJ889bJ-HMwlRmPJme0tq4Ca_pHheGG1dxrAXB_");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const certPath = admin.credential.cert(serviceAccount);

// FCM node

const create_order = async (req, res, next) => {
  try {
    const { district, city, zip, country, phone, totalPrice, user_id } =
      req.body;
    // Tìm các OrderITems để ghi vào lịch sử đã nhé tìm theo User_ID
    const OrderItems = await OrderItem.find({ user: user_id }).populate(
      "product"
    );
    const orderItemIDs = OrderItems.map((item) => item._id); // để xoá nhiều id trong OrderItem của cart
    // Tạo Order mới
    const newOrder = new Order({
      district,
      city,
      zip,
      country,
      phone,
      totalPrice,
      user: user_id,
    });
    // Lưu Order mới và thông tin đơn hàng cũ vào CSDL
    const SavedOrder = await newOrder.save();
    let arrayOrderItemHistory = [];

    for (const orderItem of OrderItems) {
      const orderItemsHistory = new OrderItemsHistory({
        product: orderItem.product,
        quantity: orderItem.quantity,
        price: orderItem.price,
        order: SavedOrder._id,
      });
      arrayOrderItemHistory.push(orderItemsHistory);
      await orderItemsHistory.save();
    }
    await OrderItem.deleteMany({ _id: { $in: orderItemIDs } });
    const isLoggedIn = req.session.isLoggedIn;
    const user = req.session.user;

    res.render("payment", {
      isLoggedIn,
      user,
      SavedOrder,
      arrayOrderItemHistory,
      newOrder,
    });
  } catch (error) {
    next(error);
  }
};

const sendNotify = (req, res) => {
  try {
    let message = {
        to: 'eI_NuFtvEbeud_e_6VHl-8:APA91bHc9r3qaVMBBLxFGWx9okZuuQ83z4qxhIq3dmkLpwFzEpwVu6c5tkFKHCvw3RbHNCftZ0dDxDJQCumuhLdwdxnVQKyRlM_4_bo7KW9n2JbPCpk43FYgiggLY2zr-FkiRqMFVtVc',
        notification: {
            title: req.body.title,
            body: req.body.content
        },
    }
    fcm.send(message, function(err, resp) {
        if (err) {
            return res.status(500).send({
                message: err
            })
        } else {
            return res.status(200).send({
                message: resp
            })
        }
    })
} catch (err) {
    console.log(err)
}
};

const applyCoupon = async (req, res, next) => {
  const totalPrice = req.body.totalPrice;
  const totalPriceCheck = req.body.totalPriceCheck;
  const user_id = req.body.user_id;
  const userName = req.body.userName[0].split(",").map((item) => item.trim());
  const productNames = req.body.productNames[0]
    .split(",")
    .map((item) => item.trim());
  const quantities = req.body.quantities[0]
    .split(",")
    .map((item) => item.trim());
  const prices = req.body.prices[0].split(",").map((item) => item.trim());
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;
  let currentTotalPrice = totalPrice;
  let check = req.body.check;
  const coupon = await Coupon.findOne({ name: req.body.nameCoupon }).populate(
    "user"
  );
  if (!coupon) {
    check = 1; // ko tim thấy coupon hoặc hết hạn
  } else {
    if (totalPriceCheck === totalPrice) {
      if (coupon.exprireDate > new Date()) {
        currentTotalPrice = totalPrice - (totalPrice * coupon.discount) / 100;
        check = 2; // chúc mừng đã áp dụng thành công
      } else {
        check = 1;
      }
    } else {
      currentTotalPrice = totalPrice;
      check = 3; // đã áp dụng coupon
    }
  }

  res.render("checkout", {
    totalPriceCheck,
    check,
    totalPrice: Math.ceil(currentTotalPrice),
    userName,
    productNames,
    quantities,
    prices,
    user_id,
    isLoggedIn,
    user,
  });
};

const get_order_detail = async (req, res, next) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: -1 }); // hien thi chi tiet user
  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(orderList);
};

const get_order_id = async (req, res, next) => {
  const orderItemHistory = await OrderItemsHistory.find({
    order: req.params.id,
  }).populate("product");
  const order = await Order.findById(req.params.id);
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;
  if (!order) {
    res.status(500).json({
      success: false,
    });
  }
  res.render("order_detail", { order, isLoggedIn, user, orderItemHistory });
};

const update_order = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    res.status(200).send(order);
  } catch (error) {
    next(error);
  }
};

const delete_order = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.id);
    const orderItemsHistory = await OrderItemsHistory.find({
      order: order._id,
    });
    orderItemsHistory.forEach(async (order) => {
      await OrderItemsHistory.findByIdAndDelete(order._id);
    });

    res.redirect("/admins/dashboard");
  } catch (error) {
    next(error);
  }
};

const get_totalSale = async (req, res, next) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).json({
      message: "The order sales cannot be aggregate",
    });
  }
  res.send({ totalsales: totalSales.pop().totalsales });
};

const get_count = async (req, res, next) => {
  try {
    const orderCount = await Order.countDocuments({});
    if (!orderCount) {
      res.status(500).json({
        success: false,
      });
    }
    res.send({
      count: orderCount,
    });
  } catch (error) {
    next(error);
  }
};

const get_user_order = async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ createdAt: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
};

const get_pages_payment = (req, res) => {
  const isLoggedIn = req.session.isLoggedIn;
  const user = req.session.user;

  res.render("payment", { isLoggedIn, user });
};

module.exports = {
  create_order,
  get_order_detail,
  get_order_id,
  update_order,
  delete_order,
  get_totalSale,
  get_count,
  get_user_order,
  get_pages_payment,
  applyCoupon,
  sendNotify,
};

