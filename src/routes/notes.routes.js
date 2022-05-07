const {Router} = require('express');
const router = Router();
const  {addNote, createNote, showNotes, renderEditNote, updateNote, deleteNote, renderAnonMsg, putAnonMsg} = require('../controllers/notes.controller')
const {isAuthenticated} = require('../helpers/auth')
//new note
router.get('/notes/add', isAuthenticated, addNote )
router.post('/notes/new', isAuthenticated, createNote)

//get all
router.get('/notes',isAuthenticated, showNotes)

//edit note
router.get('/notes/edit/:id', isAuthenticated, renderEditNote)
router.put('/notes/edit/:id', isAuthenticated, updateNote)

// delete
router.delete('/notes/delete/:id', isAuthenticated, deleteNote)

//anon
router.get('/anonimus-msg/:user', renderAnonMsg)
router.post('/anonimus-msg/:user', putAnonMsg)

module.exports = router;