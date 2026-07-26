const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dislikeSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adoption: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true }
}, { timestamps: true });

const Dislike = mongoose.model('Dislike', dislikeSchema); // antes 'dislike' en minúscula, sin motivo
module.exports = Dislike;