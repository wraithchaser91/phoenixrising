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

findRoute = req =>{
    if(typeof req.route == "undefined")return "/admin";
    else return req.route.path;
}

module.exports = {
    checkAuthentication: checkAuthentication,
    checkUnAuthenticated: checkUnAuthenticated,
    checkAdmin: checkAdmin
}