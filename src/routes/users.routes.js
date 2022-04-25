const {Router} = require('express');
const router = Router()
const {renderLogIn, renderSignUp, logOut, logIn, signUp, dlt, renderEditUser, updateUser} = require('../controllers/users.controller')

router.get('/users/signUp', renderSignUp )

router.post('/users/signup', signUp)

router.get('/users/login', renderLogIn)

router.post('/users/login', logIn)

router.get('/users/logout', logOut)

router.delete('/users/dlt/:id', dlt)

router.get('/users/edit/:id', renderEditUser)
router.put('/users/edit/:id', updateUser)

module.exports = router; 