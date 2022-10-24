const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

SPECIES = ['Dog','Cat','Reptile','Bird']
SIZES = ['Small','Medium','Large']
GENDER = ['Female','Male']



const adoptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required.'],
        minLength: [3, 'name must contain at least 3 characters.']
    },
    years : {
        type: Number,
    },
    specie: {
        type: String,
        required: [true, 'specie is required.'],
        enum: SPECIES,
    },
    description: {
        type: String,
        required: [true, 'description is required.'],
        minLength: [3, 'description must contain at least 3 characters.'],
    },
    gender: {
        type: String,
        required: [true, 'gender is required.'],
        enum: GENDER
    },
    image : {
        type: String,
        default:"https://res.cloudinary.com/plasoironhack/image/upload/v1644663323/ironhack/multer-example/icono-de-li%CC%81nea-perfil-usuario-si%CC%81mbolo-empleado-avatar-web-y-disen%CC%83o-ilustracio%CC%81n-signo-aislado-en-fondo-blanco-192379539_jvh06m.jpg"       
    },
    size:{
        type: String,  
        required: [true, 'size is required.'],
        enum: SIZES,
    },
    hobbies:{
        type:[String]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    adopted: {
        type: Boolean,
        default: false
    }
},
{ toObject: { virtuals: true }

})

adoptionSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "adoption",
    justOne: false,
})

adoptionSchema.virtual("like", {
    ref: "Like",
    localField: "_id",
    foreignField: "adoption",
    justOne: false,
})


const Adoption = mongoose.model('Adoption', adoptionSchema);
module.exports = Adoption;