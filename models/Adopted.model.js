const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adoptedSchema = new Schema ({
   
    image : {
        type: String,
        default:"https://res.cloudinary.com/plasoironhack/image/upload/v1644663323/ironhack/multer-example/icono-de-li%CC%81nea-perfil-usuario-si%CC%81mbolo-empleado-avatar-web-y-disen%CC%83o-ilustracio%CC%81n-signo-aislado-en-fondo-blanco-192379539_jvh06m.jpg"       
    },
    content: {
        type: String,
        required: true,
    } 

},{timestamps: true })

const Adopted = mongoose.model('Adopted', adoptedSchema);
module.exports = Adopted;