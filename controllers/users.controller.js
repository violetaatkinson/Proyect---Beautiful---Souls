const createError = require('http-errors');
const User = require('../models/User.model');

module.exports.list = (req, res, next) => {
    User.find() // buscamos los usuarios
      .then(users => { // promesa los encontramos
        res.json(users)// los devolvemos
      })
      .catch(next)
  }

  module.exports.create = (req, res, next) => {
    User.create(req.body) // creamos los usuarios con el body del modelo 
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