const User = require('../models/user.js');

module.exports.renderRegister = (req, res) => {
    res.render('user/register');
}

module.exports.register = async(req,res)=>{
    try{
    const {username,password,email} = req.body;
    const user = new User({email,username});
    const registerUser = await User.register(user,password);
    req.login(registerUser,err=>{
        if (err) return next(err);
        req.flash('success','welcome to yelp camp');
        res.redirect('/campgrounds');
    })
    
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('user/register');
    }
}

module.exports.renderLogin  = (req,res)=>{
    if(req.query.returnTo){
        req.session.returnTo = req.query.returnTo;
    }
    res.render('user/login')
}

module.exports.login =(req,res)=>{
    req.flash('success','welcome back');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    console.log(redirectUrl)
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}