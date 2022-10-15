const createError = require('http-errors');
const Adoption = require('../models/Adoption.model')


module.exports.list = (req, res, next) => {
    const { specie } = req.query
    const criteria = {}

    if(specie) {
      criteria.specie = specie
    }

    Adoption.find(criteria) // buscamos las adopciones
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


  module.exports.edit = (req, res, next) => {
    Adoption.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(adoption => {
        console.log(adoption, req.body)
        res.status(200).json(adoption)})
        .catch(next)
  }

  
  module.exports.delete = (req, res, next) => {
    Adoption.findByIdAndRemove(req.params.id)
    .then((adoption) => res.status(200).json(adoption))
    .catch(next);
  };
  
  
  
  
