const mongoose = require('mongoose');
const { DEFAULT_AVATAR_URL } = require('../constants/defaults');

const SPECIES = ['Dog', 'Cat', 'Reptile', 'Bird'];
const SIZES = ['Small', 'Medium', 'Large'];
const GENDER = ['Female', 'Male'];

const adoptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required.'],
      minLength: [3, 'name must contain at least 3 characters.'],
    },
    years: {
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
      enum: GENDER,
    },
    image: {
      type: String,
      default: DEFAULT_AVATAR_URL,
    },
    size: {
      type: String,
      required: [true, 'size is required.'],
      enum: SIZES,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adopted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

adoptionSchema.virtual('like', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'adoption',
  justOne: false,
});

const Adoption = mongoose.model('Adoption', adoptionSchema);

module.exports = Adoption;
module.exports.SPECIES = SPECIES;
module.exports.SIZES = SIZES;
module.exports.GENDER = GENDER;