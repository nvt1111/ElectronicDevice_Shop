const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var tokenSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tokenDevice:{
        type:String,
    }
});

//Export the model
module.exports = mongoose.model('Token', tokenSchema);
