const {Schema, model} = require('mongoose');

const noteEsquema = new Schema({
    title: {type: String,
            required: true
    },
    description: {type: String,
                  required: true},
    user: {type: String, required: true},
    editable: {type: Boolean, required: true},
    dest: {type: String, required: false}
    },
    { timestamps : true
})

module.exports = model("note", noteEsquema);