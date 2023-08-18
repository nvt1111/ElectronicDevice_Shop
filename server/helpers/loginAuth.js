const User = require('../models/user');
const jwt = require('jsonwebtoken');

const check_Admin = (req, res, next) => {
    const userId = req.payload.userId;
    User.findById({ _id: userId })
        .then(user => {
            if (!user) {
                return res.status(400).json({
                    message: 'Không tồn tại User'
                });
            }
            if (user.isAdmin) {
                req.user = user; 
                next(); // Người dùng là admin, chuyển tiếp middleware
            } else {
                // res.redirect('/success?message='+ encodeURIComponent('Bạn không phải Admin!!!'));
                // // thêm message trên query
                res.locals.message = 'Bạn không phải Admin!!!'; // Lưu thông báo vào biến toàn cục res.locals
                res.redirect('/success');
            }
        })
        .catch(error => {
            next(error); // Xử lý lỗi và chuyển tiếp cho middleware xử lý lỗi
        });
};

module.exports = {
    check_Admin
}