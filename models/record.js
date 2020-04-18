const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    player:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Record", recordSchema);