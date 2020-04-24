const mongoose = require("mongoose");

const bankrollSchema = new mongoose.Schema({
    bankBalance:{
        type: Number,
        required: true
    },
    playerChips:{
        type: Number,
        required: true
    },
    davesBalance:{
        type: Number,
        required: true
    },
    stevesBalance:{
        type: Number,
        required: true
    },
    davesDividend:{
        type: Number,
        required: true
    },
    stevesDividend:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    timestamp:{
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model("Bankroll", bankrollSchema);