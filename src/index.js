require('dotenv').config()


const httpServer = require('./server')
require('./db');

httpServer.listen(process.env.PORT || 3000, () => {console.log(`server on port ${process.env.PORT || 3000}`)});
