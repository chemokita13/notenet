const {Router} = require('express');
const router = Router()
const {renderLogIn, renderSignUp, logOut, logIn, signUp} = require('../controllers/users.controller')

router.get('/users/signUp', renderSignUp )

router.post('/users/signup', signUp)

router.get('/users/login', renderLogIn)

router.post('/users/login', logIn)

router.get('/users/logout', logOut)

module.exports = router; 