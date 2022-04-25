const {Router} = require('express');
const router = Router();
const  {addNote, createNote, showNotes, renderEditNote, updateNote, deleteNote} = require('../controllers/notes.controller')
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

module.exports = router;