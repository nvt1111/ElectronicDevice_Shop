const User = require('../models/user');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {signAccessToken, verifyAccessToken} = require('../helpers/jwt');
const session = require('express-session');
////////////////////////// API

const get_login_user = (req,res,next) =>{
    res.render('login')
}

const get_register_user = (req,res,next) =>{
    res.render('register')
}

const get_all_user = async (req,res,next)=>{
    try{
        const userList = await User.find().select("-passwordHash");
    if(!userList){
        res.status(500).json({
            success: false
        })
    }
    res.status(200).send(userList);
    }catch(error){
        next(error)
    }  
}

const get_user_id = async (req,res,next)=>{
    try{
        const user = await User.findById(req.params.id).select("name email phone");
    if(!user){
        res.status(500).json({
            success: false
        })
    }
    res.status(200).send(user);
    }catch(error){
        next(error)
    }  
}

const create_user = async(req,res,next)=>{
    try{
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password,10),
            phone: req.body.phone,
            // isAdmin: req.body.isAdmin,
            // apartment: req.body.apartment, 
            // zip: req.body.zip,
            // city: req.body.city,
            // country: req.body.country,  
        })
        
        const savedUser = await user.save()
        if(!savedUser ) res.status(404).send('the user cannot be created')
        res.redirect('/api/v1/users/login')
        // res.render('index', {user: savedUser})
    }catch(error){
        next(error)
    }
}

const login_user  = async(req,res,next)=>{
    // const user = await User.findOne({email: req.body.email});
    const user = req.user
    if(!user){
        return res.status(400).send('The user not found')
    }
    const isLoggedIn = false;
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        // const accessToken = await signAccessToken(user._id);
        // res.status(200).send({user: user.email, accessToken: accessToken});
        // Đặt isLoggedIn thành true
        req.session.isLoggedIn = true;
        req.session.user = { name: user.name, id: user._id }; // Thay thế bằng thông tin người dùng thực tế
        // req.session.user = { name: user.name }; 
        // res.send({ isLoggedIn: req.session.isLoggedIn, user: user })
        console.log(req.session.user.id)
        res.redirect('/')
    }else{
        res.status(400).send('password is wrong')
    }

}

const delete_user = (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
}

const get_count_user = async(req, res, next)=>{
    try{
        const userCount = await User.countDocuments({});
        if(!userCount){
            res.status(500).json({
                success: false
            })
        }
        res.send({
            count: userCount
        });
    }catch(error){
        next(error)
    }
}

const logout_user = (req, res, next) => {
    // Xóa session và đánh dấu người dùng đã đăng xuất
    req.session.destroy();
    res.redirect('/'); // Chuyển hướng về trang chủ hoặc trang đăng nhập
}

const profile = async (req,res,next)=>{
    try{
    const userId = req.params.id;
    const user =  await User.findById(userId);// không cần new
    if(user){
        const isLoggedIn = req.session.isLoggedIn;
        const order = await Order.find({user: userId});
        res.render('profile', {user,order,isLoggedIn})
    }
    else{
        res.status(400).send('User khôn tồn tại ')
    }
    } catch (error) {
        console.error('Error:', error);
        next(error);
} 
}

const changepassword = async (req,res,next)=>{
    try{
        const id = req.params.id;
        const user = await User.findById(id);
        if(user && bcrypt.compareSync(req.body.oldpassword, user.passwordHash)){
            if(req.body.newpassword === req.body.confirmpassword){
                await User.findByIdAndUpdate(
                    id, {
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        passwordHash: bcrypt.hashSync(req.body.newpassword, 10),
                    }
                )
            }else{
                res.status(400).send('không xác nhận mật khẩu thành công')
            }
        }
        const message = 'Cập nhật thông tin cá nhân thành công';
        res.render('success', {message})
    }catch(error){
        next(error)
    }
    
}

const deleteOrder =  (req,res,next)=>{ //delete nên trả về promise
    const id = req.params.id;
    Order.findByIdAndDelete(id)
        .then((result)=>{
            res.json({redirect: `/api/v1/users/profile/${req.session.user.id}`}) 
        })
        .catch((err)=>{
            console.log(err)
        })
}



module.exports = {
    get_all_user,
    get_user_id,
    create_user,
    login_user,
    delete_user,
    get_count_user,
    get_login_user,
    get_register_user,
    logout_user,
    profile,
    changepassword,
    deleteOrder
}