const mongoose = require('mongoose');
// !dmbg
var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
});

module.exports = mongoose.model('Category', categorySchema);


