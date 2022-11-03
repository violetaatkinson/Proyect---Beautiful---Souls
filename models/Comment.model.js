const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    author: {
        type: String,
        required: true
    },
    adoption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Adoption',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: [500, 'To long'],
    } 
},{timestamps: true })

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;