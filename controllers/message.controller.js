const Message = require('../models/Message.model')


module.exports.listMessages = (req, res, next) => {
    const user = req.params.userId // este userId viene de /chat/:userId
    
    Message.find({ $or: [
        { sender: user },{ receiver: req.currentUser }, { sender: req.currentUser },{ receiver: user }
    ]})
        .populate('receiver')
        .populate('sender')
            .then((messages) => {
                res.status(201).json(messages) 
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
                res.status(201).json(messageCreated)
            })
            .catch(next)
    }
    


 
        