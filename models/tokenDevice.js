const mongoose = require('mongoose'); 

var tokenSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tokenDevice:{
        type:String,
    }
});

module.exports = mongoose.model('Token', tokenSchema);
