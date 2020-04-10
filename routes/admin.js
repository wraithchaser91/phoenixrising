const express = require("express");
const router = express.Router();
const {errorLog} = require("../utils.js");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const {checkAuthentication, checkAdmin} = require("../middleware");
let defaultPassword = "PhoenixRising";

router.use(checkAuthentication);
router.use(checkAdmin);

router.get("/", async(req, res)=>{
    res.render("admin", {user:req.user});
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
    }catch(e){
        errorLog(e);
    }
    res.redirect("/admin");
});

module.exports = router;