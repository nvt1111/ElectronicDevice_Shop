const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {signAccessToken, verifyAccessToken} = require('../helpers/jwt')
// {} nhaajp mot phan cu the tu module

router.get('/',verifyAccessToken ,userController.get_all_user);
router.get('/:id', userController.get_user_id);
router.post('/', userController.create_user);
router.post('/login',userController.login_user);
router.delete('/:id',userController.delete_user);
router.get('/get/count', userController.get_count_user);


module.exports = router