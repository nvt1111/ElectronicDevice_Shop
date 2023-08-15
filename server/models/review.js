
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var reviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref: 'User'
    },
    product:{
        type:mongoose.Types.ObjectId,
        ref: 'Product'
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    review:{
        type:String
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

//Export the model
module.exports = mongoose.model('Review', reviewSchema);