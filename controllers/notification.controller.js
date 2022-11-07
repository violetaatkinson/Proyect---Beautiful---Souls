const Notification = require('../models/Notification.model')


module.exports.notificationList = (req, res, next) => {
    const currentUser = req.currentUser
        Notification.find({ receiver:req.currentUser })
            .populate('user')
            .then(notifications => {
                console.log('aqui entro para ver notificaciones', notifications)
                res.json(notifications)
            })
    }

