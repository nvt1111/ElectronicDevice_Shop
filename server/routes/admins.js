const express = require("express");
const route = express.Router();
const adminController = require("../controllers/adminController");
const { uploadOptions } = require("../helpers/uploadImage");
const { check_Admin } = require("../helpers/loginAuth");
const { verifyAccessToken } = require("../helpers/jwt");

route.get(
  "/dashboard",
  verifyAccessToken,
  check_Admin,
  adminController.get_dashboard
);
route.get("/products", adminController.get_page_product);
route.get("/categories", adminController.get_page_category);
route.get("/users", adminController.get_page_user);
route.get("/revenue", adminController.getRevenue);
// route.get("/quantityCategories", adminController.getQuantityEachCategory);

// USER
route.post("/addUser", adminController.addUser);
route.delete("/delUser/:id", adminController.delUser);
route.get("/users/:id", adminController.detailUser);
route.put("/updateUser/:id", adminController.update_user); // cài npm install method-override

// PRODUCT
route.post(
  "/addProduct",
  uploadOptions.single("image"),
  adminController.addProduct
);
route.delete("/delProduct/:id", adminController.delProduct);
route.put("/updatePro/:id", adminController.update_product);
route.get("/products/:id", adminController.detailProduct);

// CATEGORY
route.post("/addCategory", adminController.addCategory);
route.delete("/delCate/:id", adminController.delCate);

// ORDER
route.delete("/delOrder/:id", adminController.delOrder);
route.get("/orders/:id", adminController.detailOrder);
route.put("/updateOrder/:id", adminController.update_order);

module.exports = route;
