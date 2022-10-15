const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
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

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;