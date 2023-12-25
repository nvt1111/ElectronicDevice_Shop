const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // bo 2 cai duoi
    icon: {
        type: String
    },
    color: {
        type: String
    }
});

module.exports = mongoose.model('Category', categorySchema);


