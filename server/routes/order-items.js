const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");

router.post("/add-to-cart", orderItemController.addToCart);
router.get("/view-cart/:user_id", orderItemController.viewCartUserid);
router.delete("/delete/:item_id", orderItemController.deleteCartUserid);
router.post("/checkout", orderItemController.getCheckout);

module.exports = router;
