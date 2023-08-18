const User = require('../models/user');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const {signAccessToken, verifyAccessToken} = require('../helpers/jwt');
const session = require('express-session');
const sendmail = require('../helpers/sendmail');


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

const login  = async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).send('User không tồn tại!');
    }
    if(bcrypt.compareSync(req.body.password, user.passwordHash)){
        const accessToken = await signAccessToken(user._id);
        req.session.isLoggedIn = true;
        req.session.user = { name: user.name, id: user._id }; // Thay thế bằng thông tin người dùng thực tế
        res.cookie('accessToken',accessToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        } )
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

const forgotPassword = async(req,res,next)=>{
    const email = req.query.email;
    if(!email) {
        res.status(400).json({message: 'Không có email!!!'})
    }
    const user = await User.findOne({email});
    if(!user) {
        res.status(400).json({message: 'Không tim thay user!!!'})
    }
    // check email có tồn tại thì sẽ tạo resettoken
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();
    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_SERVER}/resetpassword/${resetToken}>Click here</a>`
    const rs = await sendmail({email, html});
    const message = 'Hệ thống đã gửi phản hồi reset password qua mail của bạn vui lòng kiểm tra!'
        res.render('success',{message})
}

const get_reset = (req,res,next)=>{
    res.render('reset_password')
}

const resetPassword = async(req,res,next)=>{
    const {password, token} = req.body;
    // token chính là reset token đấy
    if(!password || !token) {
        res.status(400).json({message: 'Không tìm thấy password!!!'})
    }
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } });
    // nếu tìm thấy user có mã băm nhưu tren thì đúng là token thoả mãn 
    if(!passwordResetToken) {
        res.status(400).json({message: 'Token không hợp lệ!!!'})
    }
    user.passwordHash = bcrypt.hashSync(password,10)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    res.redirect('/api/v1/users/login')
}   

module.exports = {
    get_all_user,
    get_user_id,
    create_user,
    login,
    delete_user,
    get_count_user,
    get_login_user,
    get_register_user,
    logout_user,
    profile,
    changepassword,
    deleteOrder,
    forgotPassword,
    resetPassword,
    get_reset
}