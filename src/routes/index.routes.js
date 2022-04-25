const {Router} = require('express');
const { redirect } = require('express/lib/response');
const router = Router();
const { redirectIg, renderAbout, renderIndex, renderDocs} = require('../controllers/index.controller')
router.get('/', renderIndex)

router.get('/about', renderAbout)

router.get('/instagram', redirectIg)

router.get('/docs', renderDocs)

module.exports = router;