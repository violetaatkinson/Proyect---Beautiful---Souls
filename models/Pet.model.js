
const mongoose = require('mongoose');

const SPECIES = ['Dog', 'Cat', 'Reptile', 'Bird', 'Other'];
const SIZES = ['Small', 'Medium', 'Large', 'ExtraLarge'];
const SEX = ['Female', 'Male'];
const ENERGY_LEVELS = ['Low', 'Medium', 'High'];
const COMPATIBILITY = ['yes', 'no', 'unknown'];
const STATUS = ['available', 'pending', 'adopted'];
const PERSONALITY_TAGS = [
  'Playful', 'Calm', 'Affectionate', 'Independent',
  'Shy', 'Protective', 'Curious', 'Sociable'
];

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required.'],
      minLength: [2, 'name must contain at least 2 characters.'],
    },
    species: { type: String, required: true, enum: SPECIES },
    breed: { type: String, trim: true }, 
    ageYears: { type: Number, min: 0 },
    ageMonths: { type: Number, min: 0, max: 11 },
    sex: { type: String, required: true, enum: SEX },
    size: { type: String, required: true, enum: SIZES },

    images: {
      type: [String],
      default: [
        'https://res.cloudinary.com/.../default-pet.jpg',
      ],
      validate: [(arr) => arr.length <= 8, 'máximo 8 fotos'],
    },

    description: { type: String, required: true, minLength: 10 },
    personalityTags: { type: [String], enum: PERSONALITY_TAGS, default: [] },
    energyLevel: { type: String, enum: ENERGY_LEVELS },

    health: {
      vaccinated: { type: Boolean, default: false },
      vaccinationDetails: { type: String },
      sterilized: { type: Boolean, default: false },
      dewormed: { type: Boolean, default: false },
      hasKnownConditions: { type: Boolean, default: false },
      conditionsDetails: { type: String },
    },

    compatibility: {
      withKids: { type: String, enum: COMPATIBILITY, default: 'unknown' },
      withDogs: { type: String, enum: COMPATIBILITY, default: 'unknown' },
      withCats: { type: String, enum: COMPATIBILITY, default: 'unknown' },
    },

    adoptionRequirements: { type: [String], default: [] }, 

    location: {
      city: { type: String },
      province: { type: String },
      country: { type: String, default: 'Argentina' },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: { type: String, enum: STATUS, default: 'available' },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

petSchema.virtual('like', {
  ref: 'Like', localField: '_id', foreignField: 'adoption', justOne: false,
});

petSchema.virtual('image').get(function () {
  return this.images?.[0];
});

module.exports = mongoose.model('Pet', petSchema);
module.exports.SPECIES = SPECIES;
module.exports.SIZES = SIZES;
module.exports.PERSONALITY_TAGS = PERSONALITY_TAGS;