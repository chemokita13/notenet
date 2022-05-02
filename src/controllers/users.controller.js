const usersCtrl = {};
const User = require('../models/user')
const Note = require('../models/note')
const passport = require('passport')
const { v4: uuidv4 } = require('uuid');
const { getToken, getTokenData } = require('../config/jwt.config');
const { getTemplateConfirm, sendEmailConfirm } = require('../config/mail.config');

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
                const code = uuidv4()
                const newUser = new User({ name, email, password, code }) // create the users schema
                const token = getToken({ email, code });
                const template = getTemplateConfirm(name, token);
                await sendEmailConfirm(email, 'Confirm your e-mail.', template);
                // encrypt password
                newUser.password = await newUser.encryptPassword(password)
                newUser.status = "UNVERIFIED"
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
                req.flash('added_msg', "An e-mail was sent to your adress to confirm your account.")
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

usersCtrl.confirmUser = async (req, res) => {
    try {

        // Obtener el token
        const { token } = req.params;
        
        // Verificar la data
        const data = await getTokenData(token);
 
        if(data === null) {
            req.flash('errorrd_msg', "An error was happened. (V8)")
            res.redirect('/')
        }
 
        console.log(data);
 
        const { email, code } = data.data;
 
        // Verificar existencia del usuario
        const user = await User.findOne({ email }) || null;
 
        if(user === null) {
            req.flash('errorrd_msg', "An error was happened. (V9)")
        }
 
        // Verificar el código
        if(code !== user.code) {
             return res.redirect('/');
        }
 
        // Actualizar usuario
        user.status = 'VERIFIED';
        await user.save();
 
        // Redireccionar a la confirmación
        req.flash('added_msg', 'Your account has been verified.')
        return res.redirect('/');
         
     } catch (error) {
         console.log(error);
         req.flash('errorrd_msg', "An error was happened. (V10)")
     }
}

module.exports = usersCtrl
