const user = require("./users");
const product = require("./products");
const category = require("./categories");
const order = require("./orders");
const orderItem = require("./order-items");
const vnpay = require("./vnpays");
const admin = require("./admins");
const coupon = require("./coupon");
const oauth2 = require("./oauth2");

const initRoutes = (app) => {
  // truyền vào server

  app.use("/api/v1/users", user);
  app.use("/api/v1/products", product);
  app.use("/api/v1/categories", category);
  app.use("/api/v1/orders", order);
  app.use("/api/v1/orderItems", orderItem);
  app.use("/api/v1/vnpays", vnpay);
  app.use("/admins", admin);
  app.use("/coupons", coupon);
  app.use("/auth", oauth2);
};

module.exports = initRoutes;
