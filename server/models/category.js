
const mongoose = require('mongoose'); // Erase if already required
// !dmbg
// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    icon:{
        type:String
    },
    color:{ 
        type:String
    }
});

//Export the model
module.exports = mongoose.model('Category', categorySchema);


