const mongoose = require('mongoose');
// cart
const orderItemSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: { // LK collection Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('OrderItem', orderItemSchema);
