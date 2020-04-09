const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    realName:{
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        required: true
    },
    isTempPassword:{
        type: Boolean,
        required: true
    },
    permissionLevel:{
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("User", userSchema);