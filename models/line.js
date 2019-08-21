const mongoose = require('mongoose');



const lineSchema = new mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    charName : String,
    audio : Buffer,
    fileName : String

})




module.exports = mongoose.model('line',lineSchema);