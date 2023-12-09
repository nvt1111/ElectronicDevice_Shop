const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create-order", orderController.create_order);
router.get("/payment", orderController.get_pages_payment);
router.get("/", orderController.get_order_detail);
router.get("/:id", orderController.get_order_id);
router.put("/:id", orderController.update_order);
router.delete("/:id", orderController.delete_order);
router.get("/get/totalsales", orderController.get_totalSale);
router.get("/get/count", orderController.get_count);
router.get(`/get/userorders/:userid`, orderController.get_user_order);
router.post("/applyCoupon", orderController.applyCoupon);
// router.post("/send-noti", orderController.sendNotify);

module.exports = router;
