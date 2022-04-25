const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const User = require('../models/user')
passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done)=>{
    // match email
    var user = await User.findOne({email:email})
    if(!user){user = await User.findOne({name:email})}
    //console.log(user)
    if (!user){
        return done(null, false, {message: 'E-mail or user not found.'})
    }else{
        // match passwords
        const match = await user.matchPassword(password, user.password)
        if(match){
            return done(null, user)
        }else{
            return done(null, false, {message: 'Password is not correct.'})
        }
    }
}))

passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        done(err,user)
    })
})