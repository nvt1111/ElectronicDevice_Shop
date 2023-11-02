const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// API new
router.get("/login", userController.get_login_user);
router.get("/register", userController.get_register_user);
router.post("/register", userController.create_user);
router.post("/login", userController.login);
router.get("/logout", userController.logout_user);
router.get("/profile/:id", userController.profile);
router.put("/changepassword/:id", userController.changepassword);
router.delete("/deleteOrder/:id", userController.deleteOrder);

// forgotpassword
router.get("/forgotpassword", userController.forgotPassword);
router.get("/resetpassword/:resetToken", userController.get_reset);
router.put("/resetpassword", userController.resetPassword);

module.exports = router;

//////
// router.get('/' ,userController.get_all_user);
// router.get('/:id', userController.get_user_id);
// router.post('/', userController.create_user);
// router.post('/login',userController.login_user);
// router.delete('/:id',userController.delete_user);
// router.get('/get/count', userController.get_count_user);
