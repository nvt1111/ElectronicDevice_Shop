
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    passwordHash:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    }
    // isAdmin:{
    //     type:Boolean,
    //     default:false,
    // },
    // street:{
    //     type:String,
    //     default:'',
    // },
    // apartment:{
    //     type: String,
    //     default:'',
    // },
    // zip:{
    //     type: String,
    //     default:'',
    // },
    // city:{
    //     type: String,
    //     default:'',
    // },
    // country:{
    //     type: String,
    //     default:'',
    // }
});

//Export the model
module.exports = mongoose.model('User', userSchema);





