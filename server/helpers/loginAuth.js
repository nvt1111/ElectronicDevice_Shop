const User = require('../models/user');

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
                res.locals.message = 'Bạn không phải Admin!!!'; // Lưu thông báo vào biến toàn cục res.locals
                res.redirect('/success');
            }
        })
        .catch(error => {
            next(error);
        });
};

module.exports = {
    check_Admin
}