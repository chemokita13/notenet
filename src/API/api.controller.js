const Note = require('../models/note')
const User = require('../models/user')
const passport = require('passport')
const { v4: uuidv4 } = require('uuid');
const { getToken } = require('../config/jwt.config');
const { getTemplateConfirm, sendEmailConfirm } = require('../config/mail.config');

const apiCtrl = {}

async function login(userLog) { //* returns false if user not found and true + userid if login is correct
    var userid
    if (userLog) {
        var name = userLog.name
        var password = userLog.password
    }
    if (name && password) {
        const user = await User.findOne({ email: name })
        var match, error;
        if (!user) {
            const user = await User.findOne({ name: name })
            if (!user) {
                match = false
                errorCode = '001'
                error = "User or email not found"
            } else {
                userid = user.id
                match = await user.matchPassword(password, user.password)
                if (!match) {
                    errorCode = '002'
                    error = "Paswords do not match"
                }
            }
        } else {
            userid = user.id
            match = await user.matchPassword(password, user.password)
            if (!match) {
                errorCode = '002'
                error = "Paswords do not match"
            }
        }
        if (error) {
            newtemplate = { "login": match, "error": [errorCode, error] }
        } else {
            const user = await User.findById(userid)
            if (user.status == "UNVERIFIED") {
                newtemplate = { "login": false, "error": ["100", "Please confirm your email"] }
            } else {
                newtemplate = { "login": match }
            }
        }
    } else {
        newtemplate = { "login": false, "error": ['000', "Name or Password are null."] }
    }
    const returner = [userid, newtemplate]
    return returner
}

apiCtrl.api = (req, res) => { //* API status
    console.log(req.body)
    res.json({ 'staus': 'working (alpha)' })
}

apiCtrl.GetAllDestinations = async (req, res) => { //* Returns an array of all users except admin accounts
    const users = await User.find().lean()
    var names = [];
    users.forEach(z => {
        var name = z.name
        names.push(name)
        names = names.filter((item) => item != 'admin');
        names = names.filter((item) => item != 'admin1');
    })
    var template = { status: ['Succesfully done', names] }
    res.json(template)
}

//* Users controllers

apiCtrl.Log = async (req, res) => { // returns true or false in function of the login
    const { user } = req.body
    const info = await login(user)
    res.json(info[1])
}

// create user
apiCtrl.CreateUser = async (req, res) => {
    const { user } = req.body
    var template;
    if (user.name && user.email && user.password) {
        const matchUser = await User.findOne({ name: user.name })
        const matchEmail = await User.findOne({ email: user.email })
        if (matchUser || matchEmail) {
            // if user already exists
            if (matchUser) {
                template = { status: [false, "Name already exists", "01n"] }
            }
            if (matchEmail) {
                template = { "status": [false, "Email already exists", "01n"] }
            }
        } else {
            // if user doesn't exist

            // if name is valid
            if (user.name.length > 3 && user.name != '' && user.name != 'none' && user.name != 'administrator' && user.name != 'any' && !user.name.startsWith('admin')) {
                // if email is valid
                if (user.email.includes('@') && user.email.includes('.') && user.email.length > 4) {
                    // if password is valid
                    if (user.password.length > 5) {
                        // if all is ok
                        const userToCreate = new User({
                            name: user.name,
                            email: user.email,
                            code: uuidv4()
                        })
                        // get token and email template
                        const token = getToken({ email: user.email, code: userToCreate.code });
                        const templateEmail = getTemplateConfirm(user.name, token);
                        // send email
                        await sendEmailConfirm(user.email, 'Confirm your e-mail.', templateEmail);
                        // encrypt password
                        userToCreate.password = await userToCreate.encryptPassword(user.password)
                        userToCreate.status = "UNVERIFIED"
                        // save user
                        await userToCreate.save()
                        // welcome message
                        const CrtUser = await User.findOne({ email: user.email }).lean()
                        var title = `Hello ${user.name}!`
                        var description = 'For info, go up to: home. The cards with *Admin* title are not editables.'
                        const newNote = await new Note({ title, description, user: CrtUser._id, editable: true })
                        await newNote.save()
                        // update template
                        template = { "status": [true, "An email was sent to confirm your account"] }
                    } else {
                        // if password is not valid
                        template = { "status": [false, "Password must be at least 6 characters long", "02n"] }
                    }
                } else {
                    // if email is not valid
                    template = { "status": [false, "Email is not valid", "03n"] }
                }
            } else {
                // if name is not valid
                template = { "status": [false, "Name is not valid", "04n"] }
            }

        }
    } else {
        // if name or email or password are null
        template = { "status": [false, "Name, email or password are null", "05n"] }
    }
    // return json template
    res.json(template)
}
// change password
apiCtrl.Changes = async (req, res) => {
    const { user, newUser } = req.body
    var template = {}
    // confirm that user is correct
    const info = await login(user)
    if (!info[1].login) {
        // if user is not correct
        res.json(info[1])
    } else {
        // if user is correct
        const userToChange = await User.findById(info[0])
        // if want to change password
        if (newUser.password) {
            // if password is valid
            if (newUser.password.length > 5) {
                userToChange.password = await userToChange.encryptPassword(newUser.password)
                // get template
                template.statusPassword = [true, "Password changed"]
            } else {
                // if password is not valid
                template.statusPassword = [false, "Password must be at least 6 characters long", "01c"]
            }
        }
        // if want to change email
        if (newUser.email) {
            // if email is in use
            const matchEmail = await User.findOne({ email: newUser.email })
            if (matchEmail) {
                // if email is already used
                template.statusEmail = [false, "Email already used", "02c"]
            } else {
                // if email is valid
                if (newUser.email.includes('@') && newUser.email.includes('.') && newUser.email.length > 4) {
                    userToChange.email = newUser.email
                    // get code 
                    const code = uuidv4()
                    // get token and email template
                    const token = getToken({ email: newUser.email, code });
                    const templateEmail = getTemplateConfirm(userToChange.name, token);
                    // send email
                    await sendEmailConfirm(newUser.email, 'Confirm your e-mail.', templateEmail);
                    // get template
                    template.statusEmail = [true, "An email was sent to confirm your account"]
                } else {
                    // if email is not valid
                    template.statusEmail = [false, "Email is not valid", "02c"]
                }
            }
        }
        // save user
        await userToChange.save()
        // return json template
        res.json(template)
    }

}

//* Notes controller
apiCtrl.Notes = async (req, res) => { //* returns all notes of the user
    const { user } = req.body
    const info = await login(user)
    if (!info[1].login) {
        res.json(info[1])
    } else {
        var notesP = await Note.find({ user: info[0] });
        var notesP1 = await Note.find({ user: 'adm' });
        var Userprofile = await User.findById(info[0])
        var nameUser = Userprofile.name
        var notesP2 = await Note.find({ dest: nameUser })
        var notes = notesP1.concat(notesP2)
        notes = notes.concat(notesP)
        info[1].status = ["Show notes succesfuly done", notes]
        res.json(info[1])
    }
}

apiCtrl.EditNote = async (req, res) => { //* return the note edited
    const { user, note } = req.body
    const info = await login(user)
    if (!info[1].login) {
        res.json(info[1])
    } else {
        if (note.id) {
            const noteToEdit = await Note.findById(note.id)
            if (!noteToEdit) { info[1].status = [false, "Something went wrong", "01e"] } else {
                if (info[0] == "62606911757dead6a033a7b1" || info[0] == "626068b0757dead6a033a7ad") {
                    if (note.title) { noteToEdit.title = note.title }
                    if (note.description) { noteToEdit.description = note.description }
                    if (note.destinatary && note.destinatary != 'adm') { noteToEdit.dest = note.destinatary }
                    noteToEdit.save()
                    info[1].status = [true, "note succesflly edited", noteToEdit]
                } else {
                    if (noteToEdit.editable == false) { info[1].status = [false, "Note not editable", "02e"] }
                    else {
                        if (note.title) { noteToEdit.title = note.title }
                        if (note.description) { noteToEdit.description = note.description }
                        if (note.destinatary && note.destinatary != 'adm') { noteToEdit.dest = note.destinatary }
                        noteToEdit.save()
                        info[1].status = [true, "note succesflly edited", noteToEdit]
                    }
                }
            }
        } else {
            info[1].status = [false, "note id not found", "03e"]
        }
        res.json(info[1])
    }
}

apiCtrl.DeleteNote = async (req, res) => { //* returns the note deleted
    const { user, note } = req.body
    const info = await login(user)
    if (!info[1].login) {
        res.json(info[1])
    } else {
        if (note.id) {
            noteDel = await Note.findById(note.id)
            if (!noteDel) { info[1].status = ["noteid not valid"] }
            else {
                if (info[0] == "62606911757dead6a033a7b1" || info[0] == "626068b0757dead6a033a7ad") {
                    await Note.findByIdAndDelete(note.id)
                    info[1].status = ["Note deleted succesfully", noteDel]
                } else {
                    if (noteDel.editable == false) { info[1].status = ["Note not editable"] }
                    else {
                        await Note.findByIdAndDelete(note.id)
                        info[1].status = ["Note deleted succesfully", noteDel]
                    }
                }
            }
        } else {
            info[1].status = ["missing note.id"]
        }
        res.json(info[1])
    }
}

apiCtrl.CreateNote = async (req, res) => { //* creates a note
    const { user, note } = req.body
    const info = await login(user)
    if (!info[1].login) {
        res.json(info[1])
    } else {
        title = note.title
        description = note.description
        dest = note.destinatary
        if (note.title && note.description) {
            const newNote = new Note({ title, description })
            if (info[0] == "62606911757dead6a033a7b1" || info[0] == "626068b0757dead6a033a7ad") {

                if (title == '//private') {
                    newNote.user = 'adminP';
                    newNote.editable = true;
                } else {
                    newNote.user = 'adm',
                        newNote.editable = false
                }

            } else {

                newNote.user = info[0]
                newNote.editable = true

            }
            if (dest) {
                const posibleUserDestination = await User.findOne({ name: dest })
                if (posibleUserDestination) {
                    newNote.dest = dest
                    await newNote.save()
                    //console.log(newNote)
                    info[1].status = [true, "Note created successfully", newNote]
                } else {
                    info[1].status = [false, "Incorrect destination", "c00"]
                }

            } else {
                await newNote.save()
                //console.log(newNote)
                info[1].status = [true, "Note created successfully", newNote]
            }
            //console.log(newNote)

        } else {
            info[1].status = [false, 'Missing title or description']
        }
    }
    res.json(info[1])
}

module.exports = apiCtrl

/** const { name, password, noteid } = req.body
    const info = await login(name, password)
    if (!info[1].login){
        res.json(info[1])
    }else{
        
    } **/