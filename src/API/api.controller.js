const Note = require('../models/note')
const User = require('../models/user')

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
            newtemplate = { "login": match }
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
        console.log(name, typeof name)
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
            if (!noteToEdit) { info[1].status = ["Something went wrong"] } else {
                if (info[0] == "62606911757dead6a033a7b1" || info[0] == "626068b0757dead6a033a7ad") {
                    if (note.title) { noteToEdit.title = title }
                    if (note.description) { noteToEdit.description = description }
                    if (note.dest && note.dest != 'adm') { noteToEdit.dest = dest }
                    noteToEdit.save()
                    info[1].status = ["note succesflly edited", noteToEdit]
                } else {
                    if (noteToEdit.editable == false) { info[1].status = ["Note not editable"] }
                    else {
                        if (note.title) { noteToEdit.title = title }
                        if (note.description) { noteToEdit.description = description }
                        if (note.dest && note.dest != 'adm') { noteToEdit.dest = dest }
                        noteToEdit.save()
                        info[1].status = ["note succesflly edited", noteToEdit]
                    }
                }
            }
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
                const posibleUserDestination = await User.find({ name: dest })
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