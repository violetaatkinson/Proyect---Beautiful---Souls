const Message = require('../models/Message.model')
const { notificacionTitles } = require('../models/Notification.model')
const { sendNotification } = require('../services/notificationService')
const moment = require('moment');

module.exports.listMessages = (req, res, next) => {
    const user = req.params.userId // este userId viene de /chat/:userId
    
    Message.find({ $or: [
        { sender: user, receiver: req.currentUser }, 
        { sender: req.currentUser, receiver: user }
    ]})
        .populate('receiver')
        .populate('sender')
            .then((messages) => {
                res.status(201).json(messages) 
            }) 
            .catch(next)
    }

module.exports.listChats = (req, res, next) => {
        console.log("entro", req.currentUser)
        Message.find({ $or: [
            { receiver: req.currentUser }, 
            { sender: req.currentUser }
        ]})
            .populate('receiver')
            .populate('sender')
                .then((messages) => {

                    const result = messages.reduce((acc, message) => {
                        
                        acc = [...acc, message.sender, message.receiver]
                        return acc
                    }, [])
                    const filteredResult = result.filter(user => user.id !== req.currentUser)
                    const monoSet = filteredResult.filter((v,i,a) => a.findIndex(v2 => (v2.id===v.id))===i)
                    res.json(monoSet)// los devolvemos
                }) 
                .catch(next)
}
    
    module.exports.createMessages = (req, res, next) => {
        const currentUser = req.currentUser 
        const { msg, receiver } = req.body

        let msgToSave = {}
        
        msgToSave.sender = currentUser
        msgToSave.msg = msg
        msgToSave.receiver = receiver
                
        Message.create(msgToSave)
            .then((messageCreated) => {
                const { sender, receiver } = messageCreated
                sendNotification({ user: sender, receiver:receiver,  type: 'Message', title: "message you", description: msg })
                    .then(result => {
                        console.log("resultado", result)
                        res.status(201).json(messageCreated)
                    })
                
            })
            .catch(next)
    }
    
  

 