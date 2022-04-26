const usersCtrl = {};
const User = require('../models/user')
const Note = require('../models/note')
const passport = require('passport')

// render signUp form (src/views/usersignup.hbs)
usersCtrl.renderSignUp = (req, res) => {
    res.render('user/signup')
}
// takes info's form and compare
usersCtrl.signUp = async (req, res) => {
    const errors = [];   //pasword errors
    const errorscp = []; //repeat pasword errors
    const errorsnm = []; //name errors
    const errorsem = []; //email errors
    const { name, email, password, password2 } = req.body // form data
    var exporter = {}; // the object with errors that will export to the page

    // colect the type errors
    if (password != password2) { errorscp.push({ text: 'Passwords do not match' }) } 
    if (password.length < 5) { errors.push({ text: "Pasword is too short" }) }
    if (name == '') { errorsnm.push({ text: "Username is necessary" }) }
    if (email == '') { errorsem.push({ text: "E-mail is necessary" }) }

    // check what will send to the hbs page 
    if (errors.length == 0) { Object.assign(exporter, { password }) } else { Object.assign(exporter, { errors }) }
    if (errorscp.length == 0) { Object.assign(exporter, { password2 }) } else { Object.assign(exporter, { errorscp }) }
    if (errorsnm.length == 0) { Object.assign(exporter, { name }) } else { Object.assign(exporter, { errorsnm }) }
    if (errorsem.length == 0) { Object.assign(exporter, { email }) } else { Object.assign(exporter, { errorsem }) }
    if (errors.length != 0 || errorscp.length != 0 || errorsnm.length != 0 || errorsem != 0) { res.render('user/signup', exporter) }
    else { // if it are not type errors
        // check if there is an user with the same mail or name
        const emailUser = await User.findOne({ email: email })
        const userName = await User.findOne({ name: name })
        if (emailUser) {
            req.flash('error_msg', "This e-mail is alredy in use.")
            res.render('user/signup', {name, email, password, password2})
        } else {
            if (userName) { 
                req.flash('error_msg', "This username is alredy in use.")
                res.redirect('/users/signup')
            } else { // if there are not any errors
                const newUser = new User({ name, email, password }) // create the users schema
                // encrypt password
                newUser.password = await newUser.encryptPassword(password)
                // save user
                await newUser.save();
                //welcome note
                const CrtUser = await User.findOne({ email: email }).lean()
                console.log(CrtUser._id)
                var title = `Hello ${name}!`
                var description = 'For info, go up to: home. The cards with *Admin* title are not editables.'
                const newNote = await new Note({ title, description, user: CrtUser._id, editable: true })
                await newNote.save()
                // alert and redirect
                req.flash('added_msg', "Account created successfully")
                res.redirect('/users/login')
            }
        }
    }
}

usersCtrl.renderLogIn = (req, res) => {
    res.render('user/login')
}

usersCtrl.logIn = passport.authenticate('local', {
    failureRedirect: '/users/login',
    successRedirect: '/notes',
    failureFlash: true
})
usersCtrl.logOut = (req, res) => {
    req.logout();
    req.flash('added_msg', 'You Log Out successfully')
    res.redirect('/users/login')
}

usersCtrl.dlt = async (req, res)=>{
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/notes')
}

usersCtrl.renderEditUser = async (req, res)=>{
    const user = await User.findById(req.params.id).lean()
    res.render('user/editUser', {user})
    console.log(user)
}

usersCtrl.updateUser = async (req, res)=> {
    console.log(req.body)
    const { name, email } = req.body
    await User.findByIdAndUpdate(req.params.id, { name:name, email: email })
    res.redirect('/notes')
}

module.exports = usersCtrl
