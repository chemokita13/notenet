const { Router } = require('express');
const router = Router();
const { api, Log, Notes, EditNote, DeleteNote, CreateNote, GetAllDestinations, Changes, CreateUser } = require('./api.controller')

//* api status
router.get('/api', api)

//* users
// confirm user
router.post('/api/logs', Log)
// update user
router.post('/api/users/changes', Changes)
// create user
router.post('/api/users/create', CreateUser)


//* notes
// get all notes
router.post('/api/notes', Notes)
// edit note
router.post('/api/notes/edit', EditNote)
// delete note
router.post('/api/notes/delete', DeleteNote)
// create note
router.post('/api/notes/create', CreateNote)
// get all destinations
router.post('/api/getDestinations', GetAllDestinations) 


//* export
module.exports = router