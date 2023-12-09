const OrderItem = require("../models/order-item");
const User = require("../models/user");
const mongoose = require("mongoose");
const Token = require("../models/tokenDevice");

const addToCart = async (req, res, next) => {
  try {
    const { user_id, product_id, quantity, price } = req.body;
    if (!mongoose.isValidObjectId(user_id)) {
      return res.status(400).json({ error: "User ID không khả dụng !" });
    }
    const productOrderItem = await OrderItem.findOne({
      user: user_id,
      product: product_id,
    });
    if (productOrderItem) {
      const quantities = Number(quantity) + productOrderItem.quantity;
      await OrderItem.findByIdAndUpdate(
        productOrderItem._id,
        {
          quantity: quantities,
          price: price,
        },
        { new: true }
      );
    } else {
      let orderItem = new OrderItem({
        user: user_id,
        product: product_id,
        quantity: quantity,
        price: price,
      });
      await orderItem.save();
    }

    res.redirect(`/api/v1/orderItems/view-cart/${user_id}`);
  } catch (error) {
    next(error);
  }
};

const viewCartUserid = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const user = await User.findById({ _id: user_id });
    const orderItem = await OrderItem.find({ user: user_id }).populate(
      "product"
    );
    let totalPrice = 0;
    if (orderItem) {
      orderItem.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
      });
    }
    const isLoggedIn = req.session.isLoggedIn;

    res.render("cart", {
      orderItem: orderItem,
      user: user,
      totalPrice: totalPrice,
      isLoggedIn,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCartUserid = async (req, res, next) => {
  try {
    const item_id = req.params.item_id;
    const deletedItem = await OrderItem.findByIdAndRemove(item_id);
    const user = await User.findById({ _id: deletedItem.user.toString() });

    if (!deletedItem)
      return res.status(404).json({ message: "Mặt hàng không tồn tại." });

    res.json({
      success: true,
      redirect: `/api/v1/orderItems/view-cart/${user._id}`,
    });
  } catch (error) {
    next(error);
  }
};

const getCheckout = async (req, res, next) => {
  //==> create order hoac apply Coupon
  try {
    const totalPrice = req.body.totalPrice;
    const totalPriceCheck = req.body.totalPrice;
    const check = req.body.check;
    const user_id = req.body.user_id;
    const userName = req.body.userName;
    const productNames = req.body.productNames;
    const quantities = req.body.quantities;
    const prices = req.body.prices;
    const isLoggedIn = req.session.isLoggedIn;
    const user = req.session.user;
    const registrationToken = await Token.findOne({ user: user_id });
    const token = registrationToken.tokenDevice;

    res.render("checkout", {
      totalPriceCheck,
      check,
      totalPrice,
      userName,
      productNames,
      quantities,
      prices,
      user_id,
      isLoggedIn,
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  viewCartUserid,
  deleteCartUserid,
  getCheckout,
};
