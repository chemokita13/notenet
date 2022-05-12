const notesCtrl = {};
const Note = require('../models/note')
const User = require('../models/user')

notesCtrl.addNote = (req, res) => {
    res.render('notes/newNote')
}

notesCtrl.createNote = async (req, res) => {
    const { title, description } = req.body;
    if (title == '' || description == '') { console.log(10); req.flash('errorrd_msg', 'Can not create a note whithout title or description.'); res.redirect('/notes') }
    else {
        const newNote = new Note({ title, description })
        console.log(req.user.id)
        if (req.user.id == '62606911757dead6a033a7b1' || req.user.id == "626068b0757dead6a033a7ad") {
            if (title == '//private') {
                newNote.user = 'adminP';
                newNote.editable = true;
            } else {
                newNote.user = 'adm',
                newNote.editable = false
            }
        } else {
            newNote.user = req.user.id,
            newNote.editable = true
        }
        await newNote.save()
        req.flash('added_msg', 'New note created successfully')
        res.redirect('/notes')
    }
}

notesCtrl.showNotes = async (req, res) => {
    var notes;
    var users;
    var notesA;
    if (req.user.id == "62606911757dead6a033a7b1" || req.user.id == "626068b0757dead6a033a7ad") {
        notesA = await Note.find().lean();
        notesA = notesA.filter((note)=>note.user != 'adm')
        notesA.forEach(async (note) => {
            const userNote = await User.findById(note.user)
            if (userNote){
                note.username = userNote.name
                note.useremail = userNote.email
            }else{
                note.username = "can not find"
            note.useremail = "can not find"
            }
            
        })
        var notes = await Note.find({ user: 'adm' }).lean();
        users = await User.find().lean();
    } else {
        var notesP = await Note.find({ user: req.user.id }).lean();
        var notesP1 = await Note.find({ user: 'adm' }).lean();
        var Userprofile = await User.findById(req.user.id)
        var nameUser = Userprofile.name
        var notesP2 = await Note.find({ dest: nameUser }).lean()
        console.log(notesP2)
        notes = notesP1.concat(notesP2)
        notes = notes.concat(notesP)
    }
    const user = await User.findById(req.user.id)
    const name = user.name
    res.render('notes/allNotes', { notes, users, notesA, name })
}

notesCtrl.renderEditNote = async (req, res) => {
    const note = await Note.findById(req.params.id).lean()
    const users = await User.find().lean()
    var names = [];
    users.forEach(z => {
        var name = z.name
        names.push(name)
        console.log(name, typeof name)
        names = names.filter((item) => item != 'admin');
        names = names.filter((item) => item != 'admin1');
    })
    console.log(req.user.id)
    if (req.user.id != "62606911757dead6a033a7b1" && req.user.id != "626068b0757dead6a033a7ad") {
        if (note.editable == true) {
            res.render('notes/editnote.hbs', { note, names })
        } else {
            req.flash('errorrd_msg', 'You are not allowed to edit an admin note')
            res.redirect('/notes')
        }
    } else {
        res.render('notes/editnote.hbs', { note, names })
    }
}

notesCtrl.updateNote = async (req, res) => {
    const { Title, Description } = req.body
    var { dest } = req.body
    if (dest == 'admin' || dest == 'admin1') { dest = '' }
    await Note.findByIdAndUpdate(req.params.id, { title: Title, description: Description, dest: dest })
    req.flash('added_msg', 'Note updated successfully')
    res.redirect('/notes')
}

notesCtrl.deleteNote = async (req, res) => {
    console.log(req.params.id)
    const note = await Note.findById(req.params.id).lean()
    if (req.user.id != "62606911757dead6a033a7b1" && req.user.id != "626068b0757dead6a033a7ad") {
        if (note.editable == true) {
            await Note.findByIdAndDelete(req.params.id)
            req.flash('added_msg', 'Note deleted successfully')
            res.redirect('/notes')
        } else {
            req.flash('errorrd_msg', 'You are not allowed to edit an admin note')
            res.redirect('/notes')
        }
    } else {
        await Note.findByIdAndDelete(req.params.id)
        req.flash('added_msg', 'Note deleted successfully')
        res.redirect('/notes')
    }
}

notesCtrl.renderAnonMsg = async (req, res) =>{
    let user = req.params.user
    res.render('notes/anonMsg', {user} )
}

notesCtrl.putAnonMsg =async (req, res)=>{
    const {title, description} = req.body
    const newNote = new Note({ title, description })
    const user = await User.findOne({name: req.params.user})
    newNote.dest = user.name
    newNote.editable = true
    newNote.anon = '(Anonimus)'
    newNote.save()
    req.flash('added_msg', 'Note sent succesfully!')
    res.redirect('/')
}

module.exports = notesCtrl;