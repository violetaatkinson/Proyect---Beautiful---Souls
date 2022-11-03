const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dislikeSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adoption:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Adoption',
        required: true
    }
}, {timestamps: true });

const Dislike = mongoose.model('dislike', dislikeSchema);
module.exports = Dislike;