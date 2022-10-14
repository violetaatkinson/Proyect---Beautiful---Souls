// const Like = require('../models/Like.model')
// const Comment = require('../models/Comment.model')


// module.exports.commentList = (req, res, next) => {
//     Comment.find()
//      .populate('user')
//      .then(comments => {
//         res.json(comments)
//      })
//      .catch(next)
//   }
  
  
//   module.exports.likesList = (req, res, next) => {
//     Like.find()
//      .then(like => {
//         res.json(like)
//      })
//      .catch(next)
//   }
  
//   module.exports.likes = (req, res, next) => {
//     const adoptionId = req.params.id
//     const user = {
//       ...req.body,
//       user: req.currentUser // buscamos el curent user
//     }
   
//     Like.findByIdAndDelete({ adoption: adoptionId, user: user })
//     .then(like => {
//       if (like) {
//         res.status(200).json({ success : 'Like remove from DDBB'})
//       } else {
//         return Like.create({ adoption: adoptionId, user: user})
//           .then(() => {
//             res.status(201).json({ success : 'Like added to DDBB' })
//           })
//       }
//     })
//     .catch(next)
//   }
  
  
  
  