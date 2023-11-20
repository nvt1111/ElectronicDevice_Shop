const mongoose = require('mongoose');

var orderItemHistorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        require: true
    }
});

module.exports = mongoose.model('OrderItemHistory', orderItemHistorySchema);