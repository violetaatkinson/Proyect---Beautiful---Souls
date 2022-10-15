 const Like = require('../models/Like.model')
 const Comment = require('../models/Comment.model')


 module.exports.likesList = (req, res, next) => {
     Like.find()
     .then(like => {
        res.json(like)
    })
    .catch(next)
}

module.exports.likes = (req, res, next) => {
    const adoptionId = req.params.id

    Like.findOneAndDelete({ adoption: adoptionId, user: req.currentUser })
    .then(like => {
        if (like) {
            res.status(200).json({ success : 'Like remove from DDBB'})
        } else {
            return Like.create({ adoption: adoptionId, user: req.currentUser})
            .then(() => {
                res.status(201).json({ success : 'Like added to DDBB' })
            })
        }
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
}




module.exports.commentList = (req, res, next) => {
    Comment.find()
     .populate('user')
     .then(comments => {
        res.json(comments)
     })
     .catch(next)
  }