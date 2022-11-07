const Notification = require("../models/Notification.model")

module.exports.sendNotification = ({ receiver, user, title, type, description }) => {
    if (!user || !title || !type || !receiver) {
        return null;
    }
    // Crear la notificacion
    return Notification.create({receiver,  user, title, type, description })
}