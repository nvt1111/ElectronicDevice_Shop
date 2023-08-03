const User = require('../models/user');

const check_Admin = async (req,res,next)=>{
    const user = await User.findOne({email: req.body.email});
    console.log('lllllllllllllllllllll', user.isAdmin)
    if(user && user.isAdmin){ res.redirect('/admins/dashboard')}
    else {next()}
}

module.exports = {
    check_Admin
}