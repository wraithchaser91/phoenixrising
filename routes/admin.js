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
    }catch(e){
        if(errorLog(e,req,res,"Error finding players or records"))return;
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
        if(errorLog(e,req,res,"Error adding new record"))return;
    }
    res.redirect("/admin");
});

router.get("/records", async(req,res)=>{
    let records = [];
    try{
        records = await Record.find({});
    }catch(e){
        if(errorLog(e,req,res,"Error finding records","/admin"))return;
    }
    render(req,res,"admin/records", {css,records});
})

router.get("/player/:id", async(req,res)=>{
    let player;
    try{
        player = await User.findById(req.params.id);
    }catch(e){
        if(errorLog(e,req,res,`Error finding player: ${req.params.id}`,"/admin"))return;
    }
    if(!player || typeof player == "undefined"){
        if(errorLog("Error finding player",req,res,`Error finding player: ${req.params.id}`,"/admin"))return;
    }
    render(req,res,"admin/player", {css,player});
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
        if(errorLog(e,req,res,"Error when updating player"))return;
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
        if(errorLog(e,req,res,"Error adding new player"))return;
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
        if(errorLog(e,req,res,"Error resetting password"))return;
    }
    res.redirect("/admin");
});

router.get("/balances", async(req,res)=>{
    let balances = [];
    let totalExpenses;
    let availableBalance;
    try{
        balances = await Bankroll.find({}).sort({timestamp:-1}).exec();
        let records = await Record.find({});
        totalExpenses = findTotalExpenses(records);
        availableBalance = balances[0].bankBalance - balances[0].playerChips + balances[0].stevesBalance + balances[0].davesBalance;
    }catch(e){
        if(errorLog(e,req,res,"Error getting bankrolls", "/admin"))return;
    }
    if(typeof totalExpenses == "undefined"){
        if(errorLog("Error finding total expenses",req,res,"Error finding total expenses", "/admin"))return;
    }
    if(typeof availableBalance == "undefined"){
        if(errorLog("Error finding available balance",req,res,"Error finding available balance", "/admin"))return;
    }
    let newCSS = [...css, "balances", "responsive/balances"]
    render(req,res,"admin/balances",{css:newCSS,balances,totalExpenses,availableBalance});
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
        if(errorLog(e,req,res,"Error adding bankroll"))return;
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
        if(errorLog(e,req,res,"Error getting logs","/admin"))return;
    }
    render(req,res,"admin/logs", {css,logs});
});

router.delete("/deleteRecord/:id", async(req, res)=>{
    try{
        let record = await Record.findById(req.params.id);
        if(record && typeof record != "undefined"){
            await record.remove();
            req.flash("info", "Record deleted successfully");
        }else{
            if(errorLog(e,req,res,"Error deleting record, could not find record"))return;
        }
    }catch(e){
        if(errorLog(e,req,res,"Error deleting record"))return;
    }
    res.redirect("/admin");
});

router.delete("/deleteBalance/:id", async(req, res)=>{
    try{
        let bankroll = await Bankroll.findById(req.params.id);
        if(bankroll && typeof bankroll != "undefined"){
            await bankroll.remove();
            req.flash("info", "Balance deleted successfully");
        }else{
            if(errorLog(e,req,res,"Error deleting balance, could not find balance"))return;
        }
    }catch(e){
        if(errorLog(e,req,res,"Error deleting balance"))return;
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

findTotalExpenses = records =>{
    let totalExpenses = 0;
    for(let rec of records){
        if(rec.type == "Expense")totalExpenses+=rec.amount;
    }

    return totalExpenses;
}

router.get("/expenses", async(req,res)=>{
    let expenses = [];
    try{
        expenses = await Record.find({type:"Expense"});
    }catch(e){
        console.log("Error: ",e);
    }
    res.json((expenses));
});

filterLogs = (logs,toFilter) =>{
    for(let string of toFilter){
        logs = logs.filter(item=>!item.message.includes(string));
    }
    return logs;
}

module.exports = router;