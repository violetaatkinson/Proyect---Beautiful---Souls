const createError = require('http-errors');
const Adoption = require('../models/Adoption.model');
const Dislike = require('../models/Dislike.model');
const Like = require('../models/Like.model');

const OWNER_POPULATE_FIELDS =
  'userName image accountType shelterName shelterVerified city phoneNumber email';

const WRITABLE_FIELDS = ['name', 'years', 'specie', 'description', 'gender', 'size'];

const pickWritableFields = (body) =>
  WRITABLE_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

const isOwner = (adoption, currentUserId) =>
  adoption.owner?.toString() === currentUserId?.toString();

module.exports.list = async (req, res, next) => {
  try {
    const { specie } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const currentUser = req.currentUser;

    const [likes, dislikes] = await Promise.all([
      Like.find({ user: currentUser }).select('adoption'),
      Dislike.find({ user: currentUser }).select('adoption'),
    ]);

    const excludedIds = [...likes, ...dislikes].map((entry) => entry.adoption);

    const criteria = {
      adopted: false,
      owner: { $ne: currentUser }, // no me muestro mis propias publicaciones en el swipe
      _id: { $nin: excludedIds },
    };

    if (specie) criteria.specie = specie;

    const adoptions = await Adoption.find(criteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(adoptions);
  } catch (error) {
    next(error);
  }
};

module.exports.createAdoption = async (req, res, next) => {
  try {
    const adoption = {
      ...pickWritableFields(req.body),
      owner: req.currentUser,
    };

    if (req.file) adoption.image = req.file.path;

    const created = await Adoption.create(adoption);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

module.exports.detail = async (req, res, next) => {
  try {
    const adoption = await Adoption.findById(req.params.id).populate(
      'owner',
      OWNER_POPULATE_FIELDS
    );

    if (!adoption) return next(createError(404, 'adoption not found'));

    res.json(adoption);
  } catch (error) {
    next(error);
  }
};

module.exports.edit = async (req, res, next) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return next(createError(404, 'adoption not found'));

    if (!isOwner(adoption, req.currentUser)) {
      return next(createError(403, 'You are not allowed to edit this pet'));
    }

    const updates = pickWritableFields(req.body);
    if (req.file) updates.image = req.file.path;

    Object.assign(adoption, updates);
    await adoption.save(); // corre las validaciones del schema (enum, minLength, etc.)

    res.status(200).json(adoption);
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return next(createError(404, 'adoption not found'));

    if (!isOwner(adoption, req.currentUser)) {
      return next(createError(403, 'You are not allowed to delete this pet'));
    }

    await adoption.deleteOne();
    res.status(200).json(adoption);
  } catch (error) {
    next(error);
  }
};

module.exports.getMyAdoptions = async (req, res, next) => {
  try {
    const adoptions = await Adoption.find({ owner: req.currentUser });
    res.status(200).json(adoptions);
  } catch (error) {
    next(error);
  }
};