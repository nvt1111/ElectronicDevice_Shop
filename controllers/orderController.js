const Order = require("../models/order");
const mongoose = require("mongoose");
const OrderItem = require("../models/order-item");
const Coupon = require("../models/coupon");
const OrderItemsHistory = require("../models/orderItemHistory");

const create_order = async (req, res, next) => {
  try {
    const {
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      totalPrice,
      user_id,
    } = req.body;
    // Tìm các OrderITems để ghi vào lịch sử đã nhé tìm theo User_ID
    const OrderItems = await OrderItem.find({ user: user_id }).populate(
      "product"
    );
    const orderItemIDs = OrderItems.map((item) => item._id); // để xoá nhiều id trong OrderItem của cart

    // Tạo Order mới
    const newOrder = new Order({
      shippingAddress1,
      shippingAddress2,
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

    OrderItems.forEach(async (orderItem) => {
      const orderItemsHistory = new OrderItemsHistory({
        product: orderItem.product,
        quantity: orderItem.quantity,
        price: orderItem.price,
        order: SavedOrder._id,
      });
      arrayOrderItemHistory.push(orderItemsHistory);
      await orderItemsHistory.save();
    });
    await OrderItem.deleteMany({ _id: { $in: orderItemIDs } });
    // populate() không được áp dụng trực tiếp cho phương thức save() trong Mongoose.
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
    totalPrice: currentTotalPrice,
    userName,
    productNames,
    quantities,
    prices,
    user_id,
    isLoggedIn,
    user,
  });
};

//get order detail and populate products in OrderItem and USerData
const get_order_detail = async (req, res, next) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 }); // hien thi chi tiet user
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
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
};

const get_pages_payment = (req, res, next) => {
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
};

// const  create_order = async (req,res,next)=>{
//     try{
//        // truoc tien tao orderITem luu truoc
//        // dung Promise all de xu li 2 bdb
//         const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
//             let newOrderItem = new OrderItem({
//                 quantity: orderItem.quantity,
//                 product: orderItem.product
//             })
//             newOrderItem = await newOrderItem.save();
//             return newOrderItem._id;// chi can mag ID neu muon biet orderitem chi tiet thi truy cap theo ID
//         }))
//         // giai quyet 2 promise nhu sau
//         const orderItemsIdsResolved = await orderItemsIds;
//         console.log(orderItemsIdsResolved)
// // cal price Order
//         // muon colsole.log Promise thi phai await promise
//         const totalPrices =await Promise.all(orderItemsIdsResolved.map(async orderItemId =>{
//             const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
//             const totalPrice = orderItem.product.price * orderItem.quantity;
//             return totalPrice;

//         }
//             ))
//         const totalPrice = totalPrices.reduce((a,b)=> a+b, 0)
//         console.log(totalPrices)
//         const order = new Order({
//             orderItems: orderItemsIdsResolved,
//             shippingAddress1: req.body.shippingAddress1,
//             shippingAddress2: req.body.shippingAddress2,
//             city: req.body.city,
//             zip: req.body.zip,
//             country: req.body.country,
//             phone: req.body.phone,
//             status: req.body.status,
//             totalPrice: totalPrice,
//             user: req.body.user,
//         })
//         const savedOrder = await order.save();
//         if(!savedOrder) return res.status(500).send('The order cannot be created')
//         res.send(savedOrder);
//     }catch(error){
//         next(error)
//     }

// }
