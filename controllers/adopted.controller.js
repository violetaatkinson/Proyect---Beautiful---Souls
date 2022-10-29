
const Adopted = require('../models/Adopted.model');

module.exports.createAdopted  = (req, res, next) => {
    const adopted = {
        ...req.body,
        
      };

      
      if (req.file) {
        adopted.image = req.file.path;
      }

  
     
    Adopted.create(adopted) // creamos una adopcion con el curent user
        .then(adopted => { // se crea la adopcion 
            res.status(201).json(adopted) // la devolvemos
        })  
        .catch(next)
  }
    

module.exports.adoptedList = (req, res, next) => {
    Adopted.find()
    .then( adoptionList => {
       res.json( adoptionList )
    })
    .catch(next)   
}

