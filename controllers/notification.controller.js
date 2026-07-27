const Notification = require('../models/Notification.model')

module.exports.notificationList = (req, res, next) => {
    Notification.find({ receiver: req.currentUser })
        .sort('-createdAt')
        .populate('user')
        .then(notifications => {
            // Si el usuario que originó la notificación (el que dio like, el
            // que mandó el mensaje) ya no existe, populate('user') devuelve
            // null. Antes eso llegaba tal cual al front y explotaba en
            // notification.user.image, tumbando TODA la app (sin error
            // boundary, un solo notification.user null rompía la pantalla
            // entera). Estas ya no las mandamos.
            res.json(notifications.filter((n) => n.user))
        })
        .catch(next)
}

module.exports.clearAll = (req, res, next) => {
    Notification.deleteMany({ receiver: req.currentUser })
        .then(() => res.status(200).json({ success: true }))
        .catch(next)
}
