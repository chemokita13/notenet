const mongoose = require('mongoose');
const URI = process.env.URI;
mongoose.connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(db =>{console.log("db connected")})
.catch(err=> {console.log(err)})