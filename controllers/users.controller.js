const createError = require('http-errors');
const User = require('../models/User.model');
const Like = require('../models/Like.model.js')

module.exports.list = (req, res, next) => {
    User.find({ _id: { $ne: req.currentUser } }) // buscamos los usuarios
      .then(users => { // promesa los encontramos
        res.json(users)// los devolvemos
      })
      .catch(next)
  }

  module.exports.create = (req, res, next) => {
    const user = {
      ...req.body,
    };

    if (req.file) {
      user.image = req.file.path;
    }
    
    User.create(req.body) // del front del formulario
      .then(user => // se crea el usuario
         res.status(201).json(user)) // devolvemos el usuario creado
      .catch(next)
  }



  module.exports.getCurrentUser = (req, res, next) => {
    User.findById(req.currentUser) // encontramos al user x el id
      .then(user => { // una vez encontrado
        if (!user) { // si no hay user
          next(createError(404, 'User not found')); // devolvemos un error
        } else { // si existe
          res.json(user); // devolvemos al usuario encontrado
        }
      })
      .catch(next)
  }

 
module.exports.edit = (req, res, next) => {
  const userToUpdate = req.body
  if (req.file) {
    userToUpdate.image = req.file.path;
  }
  User.findByIdAndUpdate(req.params.id, userToUpdate, { new: true })
    .then(user => {
      console.log(user, userToUpdate)
      res.status(200).json(user)
    })
    .catch(next)
}

module.exports.delete = (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => res.status(200).json(user))
    .catch(next);
}

module.exports.profile = (req, res, next) => {
  console.log(req.currentUser)
  Like.find({ user: req.currentUser })
    .populate("adoption")
    .then(likedAdoption => {
      res.status(200).json(likedAdoption)})
      .catch(next)
}







