require('dotenv').config()

const app = require('./server')
require('./db');
console.log(process.env.TESTING)
app.listen(app.get('port'), ()=>{
    console.log("server on port " + app.get('port'))
})