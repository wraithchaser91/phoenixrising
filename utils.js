const Log = require("./models/log");

errorLog = (e,req,res,message,redirect="none") => {
    console.log(`ERROR: ${e}`);
    req.flash("error",message);
    if(redirect != "none"){
        res.redirect(redirect);
        return true;
    }
}

checkLog = async(req) =>{
    let messages = req.flash("log");
    if(messages.length > 0){
        try{
            for(let i = 0; i < messages.length; i++){
                const log = new Log({
                    message:messages[i]
                });
                await log.save();
            }
        }catch(e){
            errorLog(e);
        }
    }
}

render = async(req, res, target, json={}) =>{
    try{
        await checkLog(req);
        res.render(target, Object.assign({
            user:req.user,
            message:req.flash()
        },json));
    }catch(e){
        errorLog(e);
        res.render(target, Object.assign({
            user:req.user,
            message:req.flash()
        },json));
    }
}

module.exports = {
    errorLog,
    render
}