// backend/controllers/users.controller.js
const createError = require('http-errors');
const User = require('../models/User.model');
const Like = require('../models/Like.model.js');
const Adoption = require('../models/Adoption.model');

// shelterVerified queda afuera a propósito: solo un futuro panel de
// administración debería poder cambiarlo.
const REGISTER_WRITABLE_FIELDS = [
  'userName', 'email', 'password', 'firstName', 'lastName',
  'age', 'gender', 'phoneNumber', 'accountType', 'shelterName',
  'city', 'province',
];

const PROFILE_WRITABLE_FIELDS = [
  'userName', 'firstName', 'lastName', 'age', 'gender',
  'phoneNumber', 'accountType', 'shelterName', 'city', 'province',
];

const pickFields = (body, allowedFields) =>
  allowedFields.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

module.exports.list = (req, res, next) => {
  User.find({ _id: { $ne: req.currentUser } })
    .then((users) => res.json(users))
    .catch(next);
};

module.exports.listWithLikes = (req, res, next) => {
  Adoption.find({ owner: req.currentUser })
    .populate({ path: 'like', populate: { path: 'user' } })
    .then((adoptions) => {
      const result = adoptions.reduce((acc, adoption) => {
        const users = adoption.like.map((like) => like.user);
        return [...acc, ...users];
      }, []);

      const uniqueUsers = Array.from(new Set(result));
      res.json(uniqueUsers);
    })
    .catch(next);
};

module.exports.create = (req, res, next) => {
  const user = pickFields(req.body, REGISTER_WRITABLE_FIELDS);

  if (req.file) {
    user.image = req.file.path;
  }

  User.create(user)
    .then((createdUser) => res.status(201).json(createdUser))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.currentUser)
    .then((user) => {
      if (!user) return next(createError(404, 'User not found'));
      res.json(user);
    })
    .catch(next);
};

module.exports.edit = (req, res, next) => {
  // Un usuario solo puede editar su propia cuenta, sin importar
  // qué :id venga en la URL.
  const updates = pickFields(req.body, PROFILE_WRITABLE_FIELDS);

  if (req.file) {
    updates.image = req.file.path;
  }

  User.findByIdAndUpdate(req.currentUser, updates, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.status(200).json(user))
    .catch(next);
};

module.exports.delete = (req, res, next) => {
  // Idem: solo podés borrar tu propia cuenta.
  User.findByIdAndDelete(req.currentUser)
    .then((user) => res.status(200).json(user))
    .catch(next);
};

module.exports.profile = (req, res, next) => {
  Like.find({ user: req.currentUser })
    .populate('adoption')
    .then((likedAdoption) => res.status(200).json(likedAdoption))
    .catch(next);
};