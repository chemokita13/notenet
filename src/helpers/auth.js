const helpers = {};
helpers.isAuthenticated = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('errorrd_msg', 'You are not able to redirect there, please login before.')
    res.redirect('/')
}

module.exports = helpers;