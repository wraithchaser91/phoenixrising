errorLog = e => console.log(`ERROR: ${e}`);

addMessage = (req,type,message) =>{
    req.flash(type,message);
}

render = (req, res, target, json={}) =>{
    res.render(target, Object.assign({
        user:req.user,
        message:req.flash()
    },json));
}

module.exports = {
    errorLog,
    render
}