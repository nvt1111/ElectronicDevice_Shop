const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// API new
router.get("/login", userController.get_login_user);
router.get("/register", userController.get_register_user);
router.post("/register", userController.create_user);
router.post("/login", userController.login);
router.get("/logout/:id", userController.logout_user);
router.get("/profile/:id", userController.profile);
router.put("/changepassword/:id", userController.changepassword);
router.delete("/deleteOrder/:id", userController.deleteOrder);

// Forgotpassword
router.get("/forgotpassword", userController.forgotPassword);
router.get("/resetpassword/:resetToken", userController.get_reset);
router.put("/resetpassword", userController.resetPassword);

module.exports = router;

