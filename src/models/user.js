const {Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs')

const UserEsquema = new Schema({
    name:{type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    code: { type: String, required: true },
    status: { type: String, required: true, default: 'NonCreated' }
}, {timestamps: true
});

UserEsquema.methods.encryptPassword =  async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt)
};

UserEsquema.methods.matchPassword = async (password, passkey) =>{
    return await bcrypt.compare(password, passkey)
}

module.exports = model('user', UserEsquema)