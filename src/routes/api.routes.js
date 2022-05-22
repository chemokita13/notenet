const { Router } = require('express');
const router = Router();
const { api, Log, Notes, EditNote, DeleteNote, CreateNote, GetAllDestinations } = require('../controllers/api.controller')

router.get('/api', api)

router.post('/api/logs', Log)

router.post('/api/notes', Notes)

router.post('/api/notes/edit', EditNote)

router.post('/api/notes/delete', DeleteNote)

router.post('/api/notes/create', CreateNote)

router.post('/api/notes/getDestinations', GetAllDestinations) 

// TODO: Poner rutas para los usuarios:
//* cambiar contraseña
//* cambiar correo (VERIFICADO)
//* crear usuario

module.exports = router