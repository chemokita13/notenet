const { template } = require('handlebars');
const Note = require('../models/note')
const User = require('../models/user')

const apiCtrl = {}

async function login(userLog) {
    var userid
    if (userLog){
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
                error = "User or email not found"
            } else {
                userid = user.id
                match = await user.matchPassword(password, user.password)
                if (!match) {
                    error = "Paswords do not match"
                }
            }
        } else {
            userid = user.id
            match = await user.matchPassword(password, user.password)
            if (!match) {
                error = "Paswords do not match"
            }
        }
        if (error) {
            newtemplate = { "login": match, "error": error }
        } else {
            newtemplate = { "login": match }
        }
    } else {
        newtemplate = { "login": false, "error": "Name or Password are null." }
    }
    const returner = [userid, newtemplate]
    return returner
}

apiCtrl.api = (req, res) => {
    console.log(req.body)
    res.json({ 'staus': 'working (BETA)' })
}

apiCtrl.Log = async (req, res) => {
    const { user } = req.body
    const info = await login(user)
    res.json(info[1])
}

apiCtrl.Notes = async (req, res) => {
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

apiCtrl.EditNote = async (req, res) => {
    const { user, note} = req.body
    const info = await login(user)
    if (!info[1].login) {
        res.json(info[1])
    } else {
        if (note.id) {
            const noteToEdit = await Note.findById(note.id)
            if (!noteToEdit) { info[1].status = ["Something went wrong"] } else {
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
        res.json(info[1])
    }
}

apiCtrl.DeleteNote = async (req, res) => {
    const { user, note } = req.body
    const info = await login(user)
    if (!info[1].login){
        res.json(info[1])
    }else{
        if(note.id){
            noteDel = await Note.findById(note.id)
            if (!noteDel) {info[1].status = ["noteid not valid"]}
            else{
                if (noteDel.editable == false){ info[1].status = ["Note not editable"]}
                else {
                    await Note.findByIdAndDelete(note.id)
                    info[1].status = ["Note deleted succesfully", noteDel]
                }
            }
        } else{
            info[1].status = ["missing note.id"]
        }
        res.json(info[1])
    }
}

apiCtrl.CreateNote = async (req, res) => {
    const {user, note} = req.body
    const info = await login(user)
    if (!info[1].login){
        res.json(info[1])
    }else{
        title = note.title
        description = note.description
        dest = note.dest
        if (note.title && note.description){ 
            const newNote = new Note({ title, description })
            if(info[0] == "62606911757dead6a033a7b1" || info[0] == "626068b0757dead6a033a7ad"){
                newNote.user = 'adm'
                newNote.editable = false
            }else{
                newNote.user = info[0]
                newNote.editable = true
            }
            if (dest) { newNote.dest = dest}
            console.log(newNote)
            await newNote.save()
            console.log(newNote)
            info[1].status = ["Note created successfully", newNote]
        }else {
            info[1].status = ['Missing title or description']
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