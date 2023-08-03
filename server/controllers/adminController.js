const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {signAccessToken, verifyAccessToken} = require('../helpers/jwt');
const session = require('express-session');

const get_dashboard = (req,res,next)=>{
    res.render('admin/index')
}
const get_page_user = (req,res,next)=>{
    res.render('admin/user')
}
const get_page_category = (req,res,next)=>{
    res.render('admin/category')
}
const get_page_product = (req,res,next)=>{
    res.render('admin/product')
}


module.exports = {
    get_dashboard,
    get_page_user,
    get_page_category,
    get_page_product
}