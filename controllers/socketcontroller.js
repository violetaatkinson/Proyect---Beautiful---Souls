// const Message = require('../models/Message.model')
// const Notification = require('../models/Notification.model')
// const User = require('../models/User.model')
// const moment = require('moment');


// module.exports.selectUser = (req, res, next) => {
//     const currentUser = req.user
   
//     Message.find({$or: [{ sender: currentUser.id }, { receiver: currentUser.id }]})
       
//     .populate('receiver', {
//             userName: 1,
//             image: 1,
//             id: 1
//         })
//         .populate('sender', {
//             userName: 1,
//             image: 1,
//             id: 1
//         })

//         .then(message => { 
//             res.status(201).json(message) 
//         })  
//         .catch(next)

//  }

//  module.exports.messages = (req, res, next) => {
   
//     const { username } = req.params
//     const currentUser = req.user

//     User.findOne({username})
//         .then((userFound)=> {
//             return Message.find({$or: [{$and: [{sender: currentUser.id}, {receiver: userFound.id}]}, {$and: [{receiver: currentUser.id}, {sender: userFound.id}]}]})
//             .populate('sender')
//             .populate('receiver')
//     })

//     .then((messages) => {
//         messages.forEach((message) => {
//             message.hour = moment(message.createdAt).format('DD/MM/YY - hh:mm')
//         })
//         messages.sort((a, b) => b.createdAt - a.createdAt)
//             .then(msg => {
//                 res.status(201).json(username, messages)
//             })
//             .catch(next)
//  }

//  module.exports.createMessage = (req, res, next) => {
    
//     const currentUser = req.user
//     const { username } = req.params
//     const { msg } = req.body

//     let msgToSave = {}

//     msgToSave.sender = currentUser.id
//     msgToSave.msg = msg

//     User.findOne({ username })
//         .then((userFound) => {
//             const userID = userFound.id;
//             msgToSave.receiver = userFound.id;
            
//             Message.create(msgToSave)
//                 .then((msgSaved) => {
//                     res.status(201).json(msgSaved)
//                         return Notification.create({
//                             type: "Message",
//                             sender: currentUser.id,
//                             receiver: userID,
//                         })
                    
//                 })
//         }) 
//         .catch(next)
//  }


//  module.exports.notifications = (req, res, next) => {
   
//     const currentUser = req.user
    
//     Notification.find({ receiver: currentUser.id })
//         .populate('sender')
//             .then((notifications) => {
//                 notifications.forEach((notification) => {
//                     if (notification.typeOf === 'Like') {
//                         notification.newLike = 'liked your pet'
//                     } else if (notification.typeOf === 'Comment') {
//                         notification.newComment = "commented on your post."
//                     } else {
//                         notification.newMessage = "messaged you."
//                     }
//                     notification.hour = moment(not.createdAt).format('DD/MM/YY - hh:mm')
//                 })
//                 res.status(201).json("notifications", { notifications })
//             }) .catch(next)
//  }

 

