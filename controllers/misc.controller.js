 const Like = require('../models/Like.model')
 const Dislike = require('../models/Dislike.model')
const { sendNotification } = require('../services/notificationService')
const Adoption = require('../models/Adoption.model')



 module.exports.likesList = (req, res, next) => {
     Like.find({ user: req.currentUser })
        .populate('adoption')
     .then(likes => {
        console.log(likes)
        res.json(likes.map(like => like.adoption))
    })
    .catch(next)
}

module.exports.likes = (req, res, next) => {
    const adoptionId = req.params.id

    Like.findOneAndDelete({ adoption: adoptionId, user: req.currentUser })
        .then(like => {
            if (like) {
                res.status(200).json({ success : 'Like remove from DDBB'})
            }  else {
                return Like.create({ adoption: adoptionId, user: req.currentUser })
                    .then((like) => {
                        Adoption.findById(like.adoption)
                            .then(adoption => {
                                sendNotification({ receiver: adoption.owner, user: req.currentUser, type: 'Like', title: 'liked your pet' })
                                Dislike.findOneAndDelete({ adoption: adoptionId, user: req.currentUser })
                                    .then(() => res.status(201).json({ success : 'Like added to DDBB' }))
                            })
                       
                })
            }
        })
    .catch((err) => {
        console.log(err)
        next(err)
    })

}

module.exports.dislikes = (req, res, next) => {
   const adoptionId = req.params.id

   Dislike.create({ adoption: adoptionId, user: req.currentUser })
    .then(() => res.status(201).json({ success : 'Dislike successfully created'}))
    .catch((e) => next(e))
}






