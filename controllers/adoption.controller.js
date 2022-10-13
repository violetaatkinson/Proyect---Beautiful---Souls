const createError = require('http-errors');
const Adoption = require('../models/Adoption.model')
const Like = require('../models/Like.model')
const Comment = require('../models/Comment.model')


module.exports.list = (req, res, next) => {
    Adoption.find() // buscamos las adopciones
      .then(adoptions => { // promesa las encontramos
        res.json(adoptions)// las devolvemos
      })
      .catch(next)
  }


  module.exports.createAdoption = (req, res, next) => {
    const user = {
        ...req.body,
        user: req.currentUser // buscamos el curent user
      };
    
    
      const adoption = {
        ...req.body,
        creator: user
      };


      if (req.file) {
        adoption.image = req.file.path;
      }
     
    Adoption.create(user) // creamos una adopcion con el curent user
        .then(adoption => { // se crea la adopcion 
            res.status(201).json(adoption) // la devolvemos
        })  
        .catch(next)
  }


  module.exports.detail = (req, res, next) => {
    Adoption.findById(req.params.id) // encontramos la adopcion x el id
        .then(adoption => { // si hay adopcion
            if(!adoption) { // si no hay adopcion
              next(createError(404, 'adoption not found')); // devolvemos un error
            } else { // si existe
                res.json(adoption); // devolvemos la adopcion encontrada
            }
        }) .catch(next)
  }

module.exports.commentList = (req, res, next) => {
  Comment.find()
   .populate('user')
   .then(comments => {
      res.json(comments)
   })
   .catch(next)
}


module.exports.likesList = (req, res, next) => {
  Like.find()
   .then(like => {
      res.json(like)
   })
   .catch(next)
}




