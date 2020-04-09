const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    buyIn:{
        type: Number,
        required: true
    },
    stackSize:{
        type: Number,
        required: true
    },
    isRebuy:{
        type: Boolean,
        required: true
    },
    rebuyAmount:{
        type: Number,
        required: true
    },
    rebuyCost:{
        type: Number,
        required: true
    },
    rebuyChips:{
        type: Number,
        required: true
    },
    isAddon:{
        type: Boolean,
        required: true
    },
    addonCost:{
        type: Number,
        required: true
    },
    addonChips:{
        type: Number,
        required: true
    },
    blindDuration:{
        type: Number,
        required: true
    },
    startTime:{
        type: Date,
        required: true
    },
    maxPlayers:{
        type: Number,
        required: true
    },
    gameType:{
        type: String,
        required: true
    },
    lateReg:{
        type:Number,
        required: true
    }
});

module.exports = mongoose.model("Tournament", tournamentSchema);