const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExprires: {
        type: String,
    }
    // thời gian còn hạn của token 
});

module.exports = mongoose.model('User', userSchema);





