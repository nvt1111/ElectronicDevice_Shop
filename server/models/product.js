
const mongoose = require('mongoose'); // Erase if already required
// !dmbg
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    richDescription:{ // mo ta chi tiet
        type:String,
        default: ''
    },
    image:{
        type:String,
        default: ''
    },
    images:[{
        type:String
    }],
    brand:{
        type:String,
        default: ''
    },
    price:{
        type:Number,
        default: 0
    },
    category:{ // Lk
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock:{
        type:Number,
        required: true,
        min: 0,
        max: 255
    },
    rating:{
        type:Number,
        default: 0
    },
    numReviews:{
        type:Number,
        default: 0
    },
    isFeatured:{
        type:Boolean,
        default: false
    },
    dateCreated:{
        type:Date,
        default: Date.now
    },
});

//Export the model
module.exports = mongoose.model('Product', productSchema);


