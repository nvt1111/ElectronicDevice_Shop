const User = require('../models/user');
const bcrypt = require('bcrypt');
const session = require('express-session')

const check_Admin =  (req,res,next)=>{
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user && user.isAdmin && bcrypt.compareSync(req.body.password,user.passwordHash)){
            req.session.isLoggedIn = true;
            req.session.user = { name: user.name, id: user._id };
            res.redirect('/admins/dashboard')  
        }
        else {
            req.user = user;
            next()
        }
    }).catch(error=>{
        next(error)
    })
    
}

module.exports = {
    check_Admin
}