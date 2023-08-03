const express = require('express');
const route = express.Router();
const adminController = require('../controllers/adminController')

route.get('/dashboard', adminController.get_dashboard);
route.get('/product', adminController.get_page_product);
route.get('/category', adminController.get_page_category);
route.get('/user', adminController.get_page_user);

module.exports = route;