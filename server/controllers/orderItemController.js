const orderItem = require('../models/order-item');
const OrderItem = require('../models/order-item');
const User = require('../models/user');
const mongoose = require('mongoose');

const addToCart = async (req, res, next) => {
    try {
        const { user_id, product_id, quantity, price } = req.body;
        if (!mongoose.isValidObjectId(user_id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const productOrderItem = await OrderItem.findOne({ user: user_id, product: product_id });
        // productOrderItem chứa chính xác user và product trên 
        // nếu trùng  thì tăng số lượng sp
        // nếu không trùng  thì tạo mới
        // productOrderItem.forEach( p=>{ Kàm forEach không hỗ trọ await
        if (productOrderItem) {
            const quantities = Number(quantity) + productOrderItem.quantity;
            await OrderItem.findByIdAndUpdate( // update thì khoogn cần .save()
                productOrderItem._id, {
                quantity: quantities,
                price: price
            }, { new: true } // Tùy chọn new để trả về đối tượng đã được cập nhật
            );
        } else {
            let orderItem = new OrderItem({
                user: user_id,
                product: product_id,
                quantity: quantity,
                price: price
            });
            await orderItem.save();
        }
        res.redirect(`/api/v1/orderItems/view-cart/${user_id}`)

    } catch (error) {
        next(error);
    }
}

const viewCartUserid = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        // UNG VỚI USER THÌ ĐỂ TÌM ĐƯỢC MỘT USER TƯƠNG ỨNG TA PHẢI TRUYỀN ĐÚNG THAM SỐ 
        // ĐỊNH NGHĨA TRONG SCHEMA USER LÀ _ID NHÉ
        const user = await User.findById({ _id: user_id });
        const orderItem = await OrderItem.find({ user: user_id }).populate('product');
        let totalPrice = 0;
        if (orderItem) {
            orderItem.forEach(item => {
                totalPrice += item.product.price * item.quantity;
            });
        }
        const isLoggedIn = req.session.isLoggedIn;
        // const user = req.session.user
        orderItem.forEach(item => {
            console.log(item);
        });
        res.render('cart', { orderItem: orderItem, user: user, totalPrice: totalPrice, isLoggedIn, user });
    } catch (error) {
        next(error);
    }
}

const deleteCartUserid = async (req, res, next) => {
    try {
        const item_id = req.params.item_id;
        const deletedItem = await OrderItem.findByIdAndRemove(item_id);
        const user = await User.findById({ _id: deletedItem.user.toString() });
        // phải truyền dudgs tên thuộc tính định nghĩa trong Schema ở đây User là _id
        if (!deletedItem)
            return res.status(404).json({ message: 'Mặt hàng không tồn tại.' });

        // res.redirect(`/api/v1/orderItems/view-cart/${user._id.toString()}`) nó bị hiểu nhầm trả vê html
        res.json({ success: true, redirect: `/api/v1/orderItems/view-cart/${user._id}` });
        //thực hiện chuyển hướng tại máy khách 
    } catch (error) {
        next(error);
    }
};

const getCheckout = (req, res, next) => { //==> createorder hoac apply Coupon
    try {
        const totalPrice = req.body.totalPrice;
        const totalPriceCheck = req.body.totalPrice;
        const check = req.body.check;
        const user_id = req.body.user_id;
        const userName = req.body.userName;
        const productNames = req.body.productNames;
        const quantities = req.body.quantities;
        const prices = req.body.prices;
        const isLoggedIn = req.session.isLoggedIn;
        const user = req.session.user;

        res.render('checkout', { totalPriceCheck, check, totalPrice, userName, productNames, quantities, prices, user_id, isLoggedIn, user });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    addToCart,
    viewCartUserid,
    deleteCartUserid,
    getCheckout
}