const OrderItem = require('../models/order-item');
const User = require('../models/user');
const mongoose = require('mongoose');

const addToCart = async (req, res, next)=>{
    try{
        const {user_id, product_id, quantity, price} = req.body;
        console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', user_id)
        if (!mongoose.isValidObjectId(user_id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const orderItem = new OrderItem({
            user: user_id,
            product: product_id,
            quantity: quantity,
            price: price
        });
        const savedOrderItem = await orderItem.save();
        res.redirect(`/api/v1/orderItems/view-cart/${user_id}`)
    }catch(error){
        next(error);
    }
}

const viewCartUserid = async (req, res, next)=>{
    try{
        const user_id = req.params.user_id;
        const user = await User.findOne({ user: user_id });
        const orderItem = await OrderItem.find({ user: user_id }).populate('product');
        let totalPrice = 0;
        if (orderItem) {
            orderItem.forEach(item => {
                totalPrice += item.product.price * item.quantity;
            });
        }
        res.render('cart',{orderItem: orderItem, user: user, totalPrice: totalPrice});
    }catch(error){
        next(error);
    }
}

module.exports = {
    addToCart,
    viewCartUserid,

}