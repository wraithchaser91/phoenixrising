const express = require("express");
const router = express.Router();
const {errorLog, render} = require("../utils.js");
const User = require("../models/user");
const Log = require("../models/log");
const Record = require("../models/record");
const Bankroll = require("../models/bankroll");
const bcrypt = require("bcryptjs");
const {checkAuthentication, checkAdmin} = require("../middleware");
let defaultPassword = "PhoenixRising";
let css = ["admin","responsive/admin"];

router.use(checkAuthentication);
router.use(checkAdmin);

router.get("/", async(req, res)=>{
    let players = [];
    let records = [];
    let bankroll;
    let total = 0;
    let logs = [];
    try{
        // let user = await User.findOne({realName:"Dave Holland"});
        // req.user = user;
        players = await User.find({}).sort({realName:1}).exec();
        records = await Record.find({});
        total = findTotal(records);
        records = records.slice(-8);
        let bankrolls = await Bankroll.find({});
        bankroll = bankrolls[bankrolls.length-1];
        console.log(bankrolls); //TODO check records
    }catch(e){
        req.flash("error", "Error finding players or records");
        errorLog(e);
    }
    render(req,res,"admin",{css,players,records,total,bankroll,logs});
});

router.post("/newRecord", async(req,res)=>{
    try{
        let record = new Record({
            player: req.body.playerName,
            type: req.body.type,
            amount: req.body.amount,
            timestamp: req.body.date
        });
        await record.save();
        req.flash("info", "Record added successfully");
    }catch(e){
        req.flash("error", "Error adding new record");
        errorLog(e);
    }
    res.redirect("/admin");
});

router.get("/records", async(req,res)=>{
    let records = [];
    try{
        records = await Record.find({});
    }catch(e){
        errorLog(e);
    }
    render(req,res,"admin/records", {css,records});
})

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
            if(player.realName != req.body.realName){
                let records = await Record.find({player:player.realName});
                for(let record of records){
                    record.player = req.body.realName;
                    await record.save();
                }
            }
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
});

router.post("/bankroll", async(req,res)=>{
    let bankroll = new Bankroll({
        bankBalance:req.body.bankBalance,
        playerChips:req.body.playerChips,
        davesBalance:req.body.davesBalance,
        stevesBalance:req.body.stevesBalance,
        davesDividend:req.body.davesDividend,
        stevesDividend:req.body.stevesDividend
    });
    let total = bankroll.bankBalance - bankroll.playerChips + bankroll.davesBalance + bankroll.stevesBalance + bankroll.davesDividend + bankroll.stevesDividend;
    bankroll.total = total;
    try{
        await bankroll.save();
        req.flash("info", "Banktoll Added")
    }catch(e){
        req.flash("error", "Error adding bankroll");
        errorLog(e);
    }
    res.redirect("/admin");
});

router.get("/logs", async(req,res)=>{
    let logs = [];
    try{
        logs = await Log.find({}).sort({timestamp:-1}).exec();
        logs = filterLogs(logs,["Steven Kitchener", "Dave Holland"]);
    }catch(e){
        errorLog(e);
    }
    render(req,res,"admin/logs", {css,logs});
});

//logout route
router.delete("/deleteRecord/:id", async(req, res)=>{
    try{
        let record = await Record.findById(req.params.id);
        if(record && typeof record != "undefined"){
            await record.remove();
            req.flash("info", "Record deleted successfully");
        }else{
            req.flash("error", "Error deleting record, could not find record");
        }
    }catch(e){
        req.flash("error", "Error deleting record");
        errorLog(e);
    }
    res.redirect("/admin");
});

findTotal = records =>{
    let amount = 0;
    for(let record of records){
        if(record.type=="Deposit"){
            amount+=record.amount;
        }else{
            amount-=record.amount;
        }
    }
    return amount;
}

filterLogs = (logs,toFilter) =>{
    for(let string of toFilter){
        logs = logs.filter(item=>!item.message.includes(string));
    }
    return logs;
}

module.exports = router;