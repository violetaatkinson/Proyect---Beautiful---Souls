const createError = require('http-errors');
const Adoption = require('../models/Adoption.model');
const Dislike = require('../models/Dislike.model');
const Like = require('../models/Like.model');



module.exports.list = (req, res, next) => {
    const { specie } = req.query // url
    const criteria = {
      adopted: false
    }

    if(specie) { // url de specie
      criteria.specie = specie 
    }

    const promises = [
      Adoption.find(criteria),
      Like.find({ user: req.currentUser }),
      Dislike.find({ user: req.currentUser }),
    ]

    Promise.all(promises)
      .then(([ adoptions, likes, dislikes ]) => {
        const filteredAdoptions = adoptions
          .filter(adoption => !likes.some(like => like.adoption.toString() === adoption._id.toString()))
          .filter(adoption => !dislikes.some(dislike => dislike.adoption.toString() === adoption._id.toString()))

          res.json(filteredAdoptions)
      })
      .catch(next)



    // Adoption.find(criteria) // buscamos las adopciones
    //   .then(adoptions => { // promesa las encontramos
    //     res.json(adoptions)// las devolvemos
    //   })
    //   .catch(next)
  }

  module.exports.countAdopted = (req, res, next) => {
    Adoption.count({ adopted: false })
      .then(number => res.json({ count: number }))
  }


  module.exports.alreadyAdopted = (req, res, next) => {
    Adoption.find({ adopted: true })
      .then(adopted => res.json({ adopted: adopted }))
  }


  module.exports.createAdoption = (req, res, next) => {
      const adoption = {
        ...req.body,
        owner: req.currentUser
      };

      if (req.file) {
        adoption.image = req.file.path;
      }

    console.log(req.body, req.file);
     
    Adoption.create(adoption) // creamos una adopcion con el curent user
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
    .then((adoption) => {
      if (!adoption) {
        next(createError(404, 'adoption not found'))
      }
      res.status(200).json(adoption)
      // Aparte habra que buscar los like cuyo adoption sea el adoption._id
    })
    .catch(next);
  };
  
  
  
  module.exports.getMyAdoptions = (req, res, next) => {
  Adoption.find({ 'owner': req.currentUser })
    .then((adoptions) => {
      console.log(adoptions)
      res.status(200).json(adoptions)
      // Aparte habra que buscar los like cuyo adoption sea el adoption._id
    })
    .catch(next)

  };
  
