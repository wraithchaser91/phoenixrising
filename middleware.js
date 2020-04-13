checkAuthentication = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect(`/login${findRoute(req)}`);
    }
}

checkUnAuthenticated = (req, res, next) => {
    if(!req.isAuthenticated()){
        return next();
    }else{
        res.redirect(`/login${findRoute(req)}`);
    }
}

checkAdmin = (req, res, next) =>{
    if(typeof req.user == "undefined"){
        res.redirect(`/`);
    }else{
        if(req.user.permissionLevel != 0){
            return next();
        }else{
            res.redirect(`/`);
        }
    }
}

checkVerification = (req, res, next) =>{
    if(typeof req.user == "undefined"){
        res.redirect(`/`);
    }else{
        if(req.user.isVerified){
            return next();
        }else{
            res.redirect(`/verification${findRoute(req)}`);
        }
    }
}

checkTempPassword = (req, res, next) =>{
    if(typeof req.user == "undefined"){
        res.redirect(`/`);
    }else{
        if(!req.user.isTempPassword){
            return next();
        }else{
            res.redirect(`/tempPassword/${req.user._id}${findRoute(req)}`);
        }
    }
}

findRoute = req =>{
    if(typeof req.route == "undefined")return "/admin";
    else return req.route.path;
}

module.exports = {
    checkAuthentication,
    checkUnAuthenticated,
    checkAdmin,
    checkVerification,
    checkTempPassword
}