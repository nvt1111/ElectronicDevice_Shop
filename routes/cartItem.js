const express = require("express");
const router = express.Router();
const cartItemController = require("../controllers/cartItemController");

router.post("/add-to-cart", cartItemController.addToCart);
router.get("/view-cart/:user_id", cartItemController.viewCartUserid);
router.delete("/delete/:item_id", cartItemController.deleteCartUserid);
router.post("/checkout", cartItemController.getCheckout);

module.exports = router;
