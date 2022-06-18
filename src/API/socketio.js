//* socket.io routes

// axios
const axios = require('axios');

// database models
const Note = require('../models/note')
const User = require('../models/user')

const sockets = (io) => {

    io.on('connection', async (socket) => {

        const username = socket.handshake.query.username;
        const password = socket.handshake.query.password;
        const user = { name: username, password };
        // verify user
        const { data } = await axios.post('https://notenet.es/api/logs', { user })
        const matchUser = data.login
        console.log(data)
        if (matchUser) {
            // find userid
            const SocketUser = await User.findOne({ name: username }) || await User.findOne({ email: username })
            // asign a room to the user
            socket.join(SocketUser._id)
            console.log(`${username} has joined the room ${SocketUser._id}`)
            // send notes to the user
            //todo: gestionar notas (mostrar solo las del usuario etc)
            const notes = await Note.find({})
            ///console.log(notes)
            io.sockets.in(SocketUser._id).emit('notes', notes)
        } else {
            console.log('user not found', user)
        }


        //* socket notes petitions
        // create note
        socket.on('note:new', async (note) => {
            const roomOfSocket = [...socket.rooms][1]
            //?const userSocket = await User.findById(roomOfSocket)///if(response.status[0])

            const username = socket.handshake.query.username;
            const password = socket.handshake.query.password;
            const user = { name: username, password };

            const { data } = await axios.post('https://notenet.es/api/notes/create', { user, note })
            console.log(data, note)
            if (data.status[0]) {
                if (data.status[2].user == 'adm') {
                    socket.emit('notes:new', data.status[2])
                } else {
                    io.sockets.in(data.status[2].user).emit('notes:new', data.status[2])
                }
                if (data.status[2].dest) {
                    const user = await User.findOne({ name: data.status[2].dest })
                    io.sockets.in(user._id).emit('notes:new', data.status[2])
                }
            } else {
                io.sockets.in(roomOfSocket).emit('notes:error', data.status[1])
            }
        })

        socket.on('note:edit', async (note) => {
            const roomOfSocket = [...socket.rooms][1]
            const userOfSocket = await User.findById(roomOfSocket)
            const { data } = await axios.post('https://notenet.es/api/notes/edit', { user: userOfSocket, note })
            if (data.status[0]) {
                if (data.status[2].user == 'adm') {
                    socket.emit('notes:edit', data.status[2])
                } else {
                    io.sockets.in(data.status[2].user).emit('notes:edit', data.status[2])
                }
                if (data.status[2].dest) {
                    const user = await User.findOne({ name: data.status[2].dest })
                    io.sockets.in(user._id).emit('notes:edit', data.status[2])
                }
            } else {
                io.sockets.in(roomOfSocket).emit('notes:error', data.status[1])
            }
        })

        socket.on('note:delete', async (note) => {
            const roomOfSocket = [...socket.rooms][1]
            const userOfSocket = await User.findById(roomOfSocket)
            const { data } = await axios.post('https://notenet.es/api/notes/delete', { user: userOfSocket, note })
            if (data.status[0]) {
                if (data.status[2].user == 'adm') {
                    socket.emit('notes:delete', data.status[2])
                } else {
                    io.sockets.in(data.status[2].user).emit('notes:delete', data.status[2])
                }
                if (data.status[2].dest) {
                    const user = await User.findOne({ name: data.status[2].dest })
                    io.sockets.in(user._id).emit('notes:delete', data.status[2])
                }
            } else {
                io.sockets.in(roomOfSocket).emit('notes:error', data.status[1])
            }
        })

    })
}

module.exports = sockets;