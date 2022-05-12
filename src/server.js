const express = require('express');
const path = require('path')
const exphbs = require('express-handlebars')
const morgan = require('morgan')
const method = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const {Router} = require('express');
const { redirect } = require('express/lib/response');
const router = Router();
//inits
const app = express();
require('./config/passport')
// sets
app.set('port', process.env.PORT || 5000)
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    pactialsDir: path.join(app.get('views'), 'parcials'),
    extname: '.hbs'
}));
app.set('view engine','.hbs');
app.set('json spaces', 2)
//middlewares
app.use(express.urlencoded({extend: false}))
app.use(morgan('dev'))
app.use(method('_method'))
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true 
}))
app.use(flash(passport.initialize()))
app.use(passport.session())
app.use(flash())
app.use(express.json())

// global vars
app.use((req, res, next)=>{
    res.locals.added_msg = req.flash('added_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.errorrd_msg = req.flash('errorrd_msg')
    res.locals.errors = req.flash('error')
    res.locals.user = req.user || null
    next();
})

// urls
app.use(require('./routes/index.routes'));
app.use(require('./routes/support.routes'));
app.use(require('./routes/notes.routes'));
app.use(require('./routes/users.routes'));
app.use(require('./routes/api.routes'));

//app.use(router.get(/^(.*)$/, (req,res)=>{res.redirect('/')}))

// static files
app.use(express.static(path.join(__dirname, 'public')))

// not found error
//app.use((req,res)=>{
//    req.flash('errorrd_msg', "This route does not exists.")
//    res.redirect('/')
//})

app.use(router.get(/^(.*)$/, (req,res)=>{
    res.redirect('/')
}))

module.exports = app
