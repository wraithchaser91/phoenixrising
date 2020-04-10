const express = require("express");
const router = express.Router();
const {errorLog} = require("../utils.js");
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const {checkUnAuthenticated, checkAuthentication, checkVerification} = require("../middleware");

//method override
const methodOverride = require("method-override");
router.use(methodOverride("_method"));

router.get("/", (req, res)=>{
    res.render("index",{css:["home","responsive/home"], user:req.user});
});

router.get("/playerdatabase", checkAuthentication, checkVerification, async(req, res)=>{
    let players;
    try{
        players = await User.find({}).collation({locale: "en"}).sort({username: 1}).exec();
    }catch(e){
        errorLog(e);
    }
    res.render("playerdatabase", {css:["playerpool", "responsive/playerpool"], user:req.user, players});
});

router.get("/login", checkUnAuthenticated, (req, res)=>{
    res.render("login", {destination:"home"});
});

router.get("/login/:destination", checkUnAuthenticated, (req, res)=>{
    let error = (req.session.error=="ERROR"?"ERROR":"");
    delete req.session.error;
    res.render("login", {destination:req.params.destination, message:error});
});

router.post("/loginCheck/:destination", (req,res,next)=>{
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { req.session.error = "ERROR"; return res.redirect(`/login/${req.params.destination}`); }
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
    res.render("verification", {user:req.user, destination:req.params.destination});
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
    }catch(e){
        errorLog(e);
    }
    console.log(req.params.destination);
    res.redirect(`/${req.params.destination}`);
});

//logout route
router.delete("/logout", (req, res)=>{
    req.logOut();
    res.redirect("/");
});

module.exports = router;