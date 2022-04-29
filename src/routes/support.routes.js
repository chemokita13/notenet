const {Router} = require('express');
const { redirect } = require('express/lib/response');
const router = Router();

const {renderForm, sendMail} = require('../controllers/support.controller')

router.get('/support', renderForm)

router.post('/support/send-email', sendMail)

module.exports = router;