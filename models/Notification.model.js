const mongoose = require("mongoose");

BELL = [ 'Like', 'Comment', 'Message']


const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: BELL
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;