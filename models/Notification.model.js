const mongoose = require("mongoose");

const notificationsTypes = ['Like', 'Message'];

module.exports.notificacionTitles = {
  newMessage: 'New message',
  newLike: 'New Like'
}

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: notificationsTypes
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;