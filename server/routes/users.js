const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {signAccessToken, verifyAccessToken} = require('../helpers/jwt');
const {check_Admin} = require('../helpers/loginAuth')
// {} nhaajp mot phan cu the tu module

////// API new
router.get('/login', userController.get_login_user);
router.get('/register', userController.get_register_user);
router.post('/register', userController.create_user);
router.post('/login',check_Admin, userController.login_user);
router.get('/logout',userController.logout_user);
router.get('/profile/:id',userController.profile);
router.put('/changepassword/:id',userController.changepassword);
router.delete('/deleteOrder/:id',userController.deleteOrder);
//////
// router.get('/' ,userController.get_all_user);
// router.get('/:id', userController.get_user_id);
// router.post('/', userController.create_user);
// router.post('/login',userController.login_user);
// router.delete('/:id',userController.delete_user);
// router.get('/get/count', userController.get_count_user);


module.exports = router