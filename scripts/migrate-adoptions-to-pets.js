

require('dotenv').config();
const mongoose = require('mongoose');
require('../config/db.config'); 

const SPECIE_TO_SPECIES = {
  Dog: 'Dog',
  Cat: 'Cat',
  Reptile: 'Reptile',
  Bird: 'Bird',
};

const mapOldPetToNew = (old) => ({
  _id: old._id,
  name: old.name,
  species: SPECIE_TO_SPECIES[old.specie] || 'Other',
  sex: old.gender,
  size: old.size,
  ageYears: old.years ?? undefined,
  images: old.image ? [old.image] : [],
  description: old.description,
  owner: old.owner,
  status: old.adopted ? 'adopted' : 'available',
  personalityTags: [],
  adoptionRequirements: [],
  health: {
    vaccinated: false,
    sterilized: false,
    dewormed: false,
    hasKnownConditions: false,
  },
  compatibility: {
    withKids: 'unknown',
    withDogs: 'unknown',
    withCats: 'unknown',
  },
  location: { country: 'Argentina' },
  createdAt: old.createdAt || new Date(),
  updatedAt: old.updatedAt || new Date(),
});

async function migrate() {
  const db = mongoose.connection.db;
  const oldCollection = db.collection('adoptions');
  const newCollection = db.collection('pets');

  const oldDocs = await oldCollection.find({}).toArray();

  if (oldDocs.length === 0) {
    console.log('No hay documentos en `adoptions` para migrar.');
    return process.exit(0);
  }

  const newDocs = oldDocs.map(mapOldPetToNew);

  let insertedCount = newDocs.length;

  try {
    const result = await newCollection.insertMany(newDocs, { ordered: false });
    insertedCount = result.insertedCount;
  } catch (err) {
    // ordered:false + _id duplicado (E11000) => sigue insertando el resto
    // y el error trae cuántos entraron igual.
    if (err.code === 11000 || err.writeErrors) {
      insertedCount = err.result?.insertedCount ?? insertedCount - (err.writeErrors?.length || 0);
      console.warn('Algunos documentos ya existían en `pets` y se saltearon (esperable si corriste el script antes).');
    } else {
      throw err;
    }
  }

  console.log(`Migración terminada. Documentos migrados: ${insertedCount} de ${oldDocs.length}.`);
  console.log('Revisá la colección `pets` en Mongo antes de borrar `adoptions` a mano.');
  process.exit(0);
}

mongoose.connection.once('open', () => {
  migrate().catch((err) => {
    console.error('Error migrando:', err);
    process.exit(1);
  });
});