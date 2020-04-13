const express = require("express");
const router = express.Router();
const {errorLog, render} = require("../utils.js");
const User = require("../models/user");
const Log = require("../models/log");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const {checkUnAuthenticated, checkAuthentication, checkVerification, checkTempPassword} = require("../middleware");

//method override
const methodOverride = require("method-override");
router.use(methodOverride("_method"));

router.get("/", (req, res)=>{
    render(req,res,"index",{css:["home","responsive/home"]});
});

router.get("/playerdatabase", checkAuthentication, checkVerification, checkTempPassword, async(req, res)=>{
    let players;
    try{
        players = await User.find({}).collation({locale: "en"}).sort({username: 1}).exec();
    }catch(e){
        errorLog(e);
    }
    render(req,res,"playerdatabase", {css:["playerpool", "responsive/playerpool"], players});
});

router.get("/login", checkUnAuthenticated, (req, res)=>{
    render(req,res,"login", {destination:"home"});
});

router.get("/login/:destination", checkUnAuthenticated, (req, res)=>{
    render(req,res,"login", {destination:req.params.destination});
});

router.post("/loginCheck/:destination", async(req,res,next)=>{
    try{
        const log = new Log({
          username:req.body.username,
          message:"Log in attempt"
        });
        await log.save();
    }catch(e){
        errorLog(e);
    }
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { req.flash("error", "login failed"); return res.redirect(`/login/${req.params.destination}`); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect(`/${(req.params.destination=="home"?"":req.params.destination)}`);
        });
      })(req, res, next);
});

router.get("/verification", checkAuthentication, (req, res)=>{
    res.redirect("/")
});

router.get("/verification/:destination", checkAuthentication, (req, res)=>{
    render(req,res,"verification", {destination:req.params.destination});
});

router.post("/verification/:destination", async(req,res)=>{
    try{
        let user = req.user;
        user.username = req.body.screenName;
        user.realName = req.body.realName;
        user.isVerified = true;
        user.isTempPassword = false;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
        await user.save();
        const log = new Log({
            username:user.username,
            message:"User Verification"
        });
        await log.save();
    }catch(e){
        errorLog(e);
    }
    res.redirect(`/${req.params.destination}`);
});

router.get("/tempPassword", (req,res)=>{res.redirect("/")});

router.get("/tempPassword/:id/:destination", async(req,res)=>{
    render(req,res,"tempPassword",{id:req.params.id, destination:req.params.destination});
});

router.post("/tempPassword/:id/:destination", async(req,res)=>{
    try{
        let user = await User.findById(req.params.id);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
        user.isTempPassword = false;
        await user.save();
    }catch(e){
        errorLog(e);
    }
    res.redirect(`/${req.params.destination}`);
})

//logout route
router.delete("/logout", (req, res)=>{
    req.logOut();
    res.redirect("/");
});

module.exports = router;