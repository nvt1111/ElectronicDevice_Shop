const mongoose = require('mongoose'); 

var couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    exprireDate: {
        type: Date,
    },
    discount: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Coupon', couponSchema);