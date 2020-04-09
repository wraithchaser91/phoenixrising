const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema({
    ppBalance:{
        type: Number,
        required: true
    },
    bigTournament:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament"
    }
});

module.exports = mongoose.model("Prefs", preferencesSchema);