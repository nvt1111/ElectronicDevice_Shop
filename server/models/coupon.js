const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
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

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);