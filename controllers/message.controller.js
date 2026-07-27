const createError = require('http-errors')
const Message = require('../models/Message.model')
const { sendNotification } = require('../services/notificationService')
const moment = require('moment');

module.exports.listMessages = (req, res, next) => {
    const user = req.params.userId // este userId viene de /chat/:userId/:petId
    const pet = req.params.petId

    Message.find({
        pet,
        $or: [
            { sender: user, receiver: req.currentUser },
            { sender: req.currentUser, receiver: user }
        ]
    })
        .sort('createdAt')
        .populate('receiver')
        .populate('sender')
        .populate('pet')
            .then((messages) => {
                res.status(201).json(messages)
            })
            .catch(next)
    }

// Devuelve una fila por cada conversación (otro usuario + mascota puntual),
// no una fila por usuario. Antes se agrupaba solo por usuario, así que si
// hablabas con la misma persona de 2 mascotas distintas quedaba todo
// mezclado en un solo hilo. Ahora cada (usuario, mascota) es su propia
// conversación con su propia vista previa.
module.exports.listChats = (req, res, next) => {
        Message.find({ $or: [
            { receiver: req.currentUser },
            { sender: req.currentUser }
        ]})
            .sort('-createdAt')
            .populate('receiver')
            .populate('sender')
            .populate('pet')
                .then((messages) => {
                    const conversations = messages.reduce((acc, message) => {
                        if (!message.pet) return acc // mensajes viejos sin mascota asociada, no los mostramos en la lista nueva

                        const otherUser = String(message.sender.id) === String(req.currentUser)
                            ? message.receiver
                            : message.sender

                        const key = `${otherUser.id}_${message.pet.id}`

                        if (!acc[key]) {
                            acc[key] = {
                                user: otherUser,
                                pet: message.pet,
                                lastMessage: message.msg,
                                updatedAt: message.createdAt,
                            }
                        }

                        return acc
                    }, {})

                    const result = Object.values(conversations).sort(
                        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                    )

                    res.json(result)
                })
                .catch(next)
}

module.exports.createMessages = (req, res, next) => {
        const currentUser = req.currentUser
        const { msg, receiver, pet } = req.body

        if (!pet) {
            return next(createError(400, 'pet is required'))
        }

        let msgToSave = {}

        msgToSave.sender = currentUser
        msgToSave.msg = msg
        msgToSave.receiver = receiver
        msgToSave.pet = pet

        Message.create(msgToSave)
            .then((messageCreated) =>
                messageCreated.populate(['sender', 'receiver', 'pet']),
            )
            .then((populatedMessage) => {
                const { sender, receiver } = populatedMessage

                sendNotification({ user: sender.id, receiver: receiver.id, type: 'Message', title: 'message you', description: msg })
                    .catch((error) => console.error('sendNotification failed', error))

                const io = req.app.get('io')
                if (io) {
                    // Al que le llega, y de vuelta al que lo mandó (por si tiene
                    // otra pestaña/dispositivo abierto en la misma conversación).
                    io.to(String(receiver.id)).emit('message:new', populatedMessage)
                    io.to(String(sender.id)).emit('message:new', populatedMessage)
                }

                res.status(201).json(populatedMessage)
            })
            .catch(next)
    }
