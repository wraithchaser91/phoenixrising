const express = require("express");
const router = express.Router();
const {errorLog, render} = require("../utils.js");
const User = require("../models/user");
const Log = require("../models/log");
const bcrypt = require("bcryptjs");
const {checkAuthentication, checkAdmin} = require("../middleware");
let defaultPassword = "PhoenixRising";
let css = ["admin","responsive/admin"];

router.use(checkAuthentication);
router.use(checkAdmin);

router.get("/", async(req, res)=>{
    let players = [];
    try{
        players = await User.find({}).sort({realName:1}).exec();
    }catch(e){
        req.flash("error", "Error finding players");
        errorLog(e);
    }
    render(req,res,"admin",{css,players});
});

router.get("/player/:id", async(req,res)=>{
    try{
        const player = await User.findById(req.params.id);
        render(req,res,"admin/player", {css,player});
        return;
    }catch(e){
        errorLog(e);
    }
    req.flash("error", "Error finding player");
    res.redirect("/admin");
});

router.post("/player/:id", async(req,res)=>{
    try{
        let player = await User.findById(req.params.id);
        if(player && typeof player != "undefined"){
            player.username = req.body.username;
            player.realName = req.body.realName;
            await player.save();
            req.flash("info", "Player Updated");
        }
    }catch(e){
        req.flash("error", "Error when updating player");
        errorLog(e);
    }
    res.redirect("/admin");
});

router.post("/newplayer", async(req,res)=>{
    try{
        let usercheck = await User.findOne({realName:req.body.realname});
        if(usercheck && !usercheck.realName == "??"){
            res.redirect("/admin");
            return;
        }
        let user = new User({
            username: req.body.username,
            realName: req.body.realname,
            isVerified: false,
            isTempPassword: true,
            permissionLevel: 0
        })
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        user.password = hashedPassword;
        await user.save();
        req.flash("info", "Player Added");
    }catch(e){
        req.flash("error", "Error adding new player");
        errorLog(e);
    }
    res.redirect("/admin");
});

router.post("/resetPassword/:id", async(req, res)=>{
    try{
        let player = await User.findById(req.params.id);
        if(player && typeof player != "undefined"){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);
            player.password = hashedPassword;
            player.isTempPassword = true;
            await player.save();
            req.flash("info", "Password reset");
        }
    }catch(e){
        req.flash("error", "Error resetting password");
        errorLog(e);
    }
    res.redirect("/admin");
})

router.get("/logs", async(req,res)=>{
    let logs = [];
    try{
        logs = await Log.find({}).sort({timestamp:-1}).exec();
    }catch(e){
        errorLog(e);
    }
    render(req,res,"admin/logs", {css,logs});
});

module.exports = router;