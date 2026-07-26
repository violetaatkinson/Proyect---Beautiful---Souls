const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { DEFAULT_AVATAR_URL } = require('../constants/defaults');

const EMAIL_PATTERN =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const PASSWORD_PATTERN = /^.{8,}$/i;
const SALT_ROUNDS = 10;

const ACCOUNT_TYPES = ['individual', 'shelter'];

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'userName is required.'],
      minLength: [3, 'userName must contain at least 3 characters.'],
      unique: [true, 'userName must be unique'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      match: [EMAIL_PATTERN, 'Email must be valid.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      match: [PASSWORD_PATTERN, 'Password must contain at least 8 characters.'],
    },

    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: [0, 'age cannot be negative'],
    },
    gender: {
      type: String,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: DEFAULT_AVATAR_URL,
    },

    // --- Beautiful Souls V2: cuentas de refugio/organización ---
    accountType: {
      type: String,
      enum: {
        values: ACCOUNT_TYPES,
        message: 'accountType must be either "individual" or "shelter"',
      },
      default: 'individual',
    },
    shelterName: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.accountType === 'shelter';
        },
        'shelterName is required for shelter accounts.',
      ],
    },
    // Solo debe poder modificarse desde un panel de administración,
    // nunca desde el endpoint de edición de perfil del propio usuario.
    shelterVerified: {
      type: Boolean,
      default: false,
    },

    // --- Ubicación básica, usada en la ficha de contacto (match) ---
    city: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.password;

        return ret;
      },
    },
  }
);

userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt
    .hash(user.password, SALT_ROUNDS)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((err) => next(err));
});

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;