const createError = require('http-errors');
const Pet = require('../models/Pet.model');
const Dislike = require('../models/Dislike.model');
const Like = require('../models/Like.model');

const OWNER_POPULATE_FIELDS =
  'userName image accountType shelterName shelterVerified city phoneNumber email';

const WRITABLE_FIELDS = [
  'name', 'species', 'breed', 'ageYears', 'ageMonths', 'sex', 'size',
  'description', 'personalityTags', 'energyLevel', 'health',
  'compatibility', 'adoptionRequirements', 'location',
];

const JSON_FIELDS = ['personalityTags', 'health', 'compatibility', 'adoptionRequirements', 'location'];

const parseIfJSON = (field, value) => {
  if (!JSON_FIELDS.includes(field) || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const pickWritableFields = (body) =>
  WRITABLE_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = parseIfJSON(field, body[field]);
    return acc;
  }, {});

const isOwner = (pet, currentUserId) => pet.owner?.toString() === currentUserId?.toString();

module.exports.list = async (req, res, next) => {
  try {
    const { species } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const currentUser = req.currentUser;

    const [likes, dislikes] = await Promise.all([
      Like.find({ user: currentUser }).select('adoption'),
      Dislike.find({ user: currentUser }).select('adoption'),
    ]);

    const excludedIds = [...likes, ...dislikes].map((entry) => entry.adoption);

    const criteria = {
      status: 'available',
      owner: { $ne: currentUser },
      _id: { $nin: excludedIds },
    };

    if (species) criteria.species = species;

    const pets = await Pet.find(criteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(pets);
  } catch (error) {
    next(error);
  }
};

module.exports.createPet = async (req, res, next) => {
  try {
    const pet = {
      ...pickWritableFields(req.body),
      owner: req.currentUser,
    };

    if (req.files?.length) {
      pet.images = req.files.map((file) => file.path);
    }

    const created = await Pet.create(pet);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', OWNER_POPULATE_FIELDS);
    if (!pet) return next(createError(404, 'pet not found'));
    res.json(pet);
  } catch (error) {
    next(error);
  }
};

module.exports.edit = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return next(createError(404, 'pet not found'));

    if (!isOwner(pet, req.currentUser)) {
      return next(createError(403, 'You are not allowed to edit this pet'));
    }

    const updates = pickWritableFields(req.body);

    // Si llegan fotos nuevas, reemplazan a todas las anteriores (no las mezcla).
    if (req.files?.length) {
      updates.images = req.files.map((file) => file.path);
    }

    Object.assign(pet, updates);
    await pet.save();

    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return next(createError(404, 'pet not found'));

    if (!isOwner(pet, req.currentUser)) {
      return next(createError(403, 'You are not allowed to delete this pet'));
    }

    await pet.deleteOne();
    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};

module.exports.getMyPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.currentUser });
    res.status(200).json(pets);
  } catch (error) {
    next(error);
  }
};