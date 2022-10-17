const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ROLES_USER =["FosterHome","Adopter","Owner"]
// FosterHome = "casa de refugio" 
//Adopter = "el que va a adoptar"
//Owner = "el que crea el anuncio para adoptar"

const EMAIL_PATTERN = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const PASSWORD_PATTERN = /^.{8,}$/i
const SALT_ROUNDS = 10

const userSchema = new mongoose.Schema(
{
        userName: {
            type: String,
            minLength: [3, 'userName must contain at least 3 characters.'],
            unique: [true, 'userName must be unique'],
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            match: [EMAIL_PATTERN, 'Email must be valid.'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required.'],
            match: [PASSWORD_PATTERN, 'Password must contain at least 8 characters.']
        },
        role: {
            type: String,
            enum: ROLES_USER
        },
        name : {
            type: String,
            
        },
        lastName: {
            type: String,
            
        },
        age: {
            type: Number,
            
        },
        gender: {
            type: String,
            
        },
        image : {
            type: String,
            default:"https://res.cloudinary.com/plasoironhack/image/upload/v1644663323/ironhack/multer-example/icono-de-li%CC%81nea-perfil-usuario-si%CC%81mbolo-empleado-avatar-web-y-disen%CC%83o-ilustracio%CC%81n-signo-aislado-en-fondo-blanco-192379539_jvh06m.jpg"       
        },
        phoneNumber : {
            type: Number,
        }
    },
    {
      toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
          delete ret.__v;
          delete ret._id;
          delete ret.password;
  
          return ret
        }
      }
    }
  );
  

userSchema.pre('save', function(next) {
    const user = this;
    if (user.isModified('password')) {
        bcrypt
            .hash(user.password, SALT_ROUNDS)
            .then(hash => {
                user.password = hash;
                next()
            })
            .catch(err => next(err))
    } else {
        next()
    }
});

userSchema.methods.checkPassword = function(password) {
    const user = this;
    return bcrypt.compare(password, user.password)
};

const User = mongoose.model('User', userSchema);
module.exports = User;