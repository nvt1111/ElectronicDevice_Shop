const express = require('express');
const route = express.Router();
const couponController = require('../controllers/couponController');

route.post('/', couponController.createCoupon);// isAdmin

module.exports = route;














