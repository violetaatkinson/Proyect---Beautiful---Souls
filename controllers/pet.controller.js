const createError = require("http-errors");
const Pet = require("../models/Pet.model");
const Dislike = require("../models/Dislike.model");
const Like = require("../models/Like.model");
const { haversineDistanceKm } = require("../utils/geo");

const OWNER_POPULATE_FIELDS =
	"userName image accountType shelterName shelterVerified city phoneNumber email";

const WRITABLE_FIELDS = [
	"name",
	"species",
	"breed",
	"ageYears",
	"ageMonths",
	"sex",
	"size",
	"weight",
	"color",
	"description",
	"backstory",
	"personalityTags",
	"energyLevel",
	"health",
	"medicalNotes",
	"houseTrained",
	"compatibility",
	"adoptionRequirements",
	"adoptionFee",
	"rescueDate",
	"location",
];

const JSON_FIELDS = [
	"personalityTags",
	"health",
	"compatibility",
	"adoptionRequirements",
	"location",
];

const parseIfJSON = (field, value) => {
	if (!JSON_FIELDS.includes(field) || typeof value !== "string") return value;
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

const isOwner = (pet, currentUserId) =>
	pet.owner?.toString() === currentUserId?.toString();

const parseViewerCoords = (req) => {
	const { lat, lng } = req.query;
	if (lat === undefined || lng === undefined) return null;

	const parsedLat = Number(lat);
	const parsedLng = Number(lng);
	if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;

	return [parsedLng, parsedLat]; // [lng, lat], igual que GeoJSON
};

// Si la mascota tiene coordenadas y quien mira mandó las suyas, le suma
// distanceKm a la respuesta. No se persiste en la base, es solo de salida.
const withDistance = (pet, viewerCoords) => {
	const petJSON = pet.toJSON ? pet.toJSON() : pet;
	const petCoords = petJSON.location?.coordinates?.coordinates;

	if (viewerCoords && petCoords?.length === 2) {
		petJSON.distanceKm =
			Math.round(haversineDistanceKm(viewerCoords, petCoords) * 10) / 10;
	}

	return petJSON;
};

module.exports.list = async (req, res, next) => {
	try {
		const { species } = req.query;
		const page = Math.max(Number(req.query.page) || 1, 1);
		const limit = Math.min(Number(req.query.limit) || 20, 50);
		const currentUser = req.currentUser;
		const viewerCoords = parseViewerCoords(req);

		const [likes, dislikes] = await Promise.all([
			Like.find({ user: currentUser }).select("adoption"),
			Dislike.find({ user: currentUser }).select("adoption"),
		]);

		const excludedIds = [...likes, ...dislikes].map((entry) => entry.adoption);

		const criteria = {
			status: "available",
			owner: { $ne: currentUser },
			_id: { $nin: excludedIds },
		};

		if (species) criteria.species = species;

		const pets = await Pet.find(criteria)
			.populate("owner", OWNER_POPULATE_FIELDS)
			.skip((page - 1) * limit)
			.limit(limit);

		const petsWithDistance = pets.map((pet) => withDistance(pet, viewerCoords));

		// Ordena por cercanía dentro de esta página. No es un orden global
		// por distancia (para eso hace falta $geoNear a nivel de Mongo).
		if (viewerCoords) {
			petsWithDistance.sort(
				(a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
			);
		}

		res.json(petsWithDistance);
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
		const pet = await Pet.findById(req.params.id).populate(
			"owner",
			OWNER_POPULATE_FIELDS,
		);
		if (!pet) return next(createError(404, "pet not found"));

		const viewerCoords = parseViewerCoords(req);
		res.json(withDistance(pet, viewerCoords));
	} catch (error) {
		next(error);
	}
};

module.exports.edit = async (req, res, next) => {
	try {
		const pet = await Pet.findById(req.params.id);
		if (!pet) return next(createError(404, "pet not found"));

		if (!isOwner(pet, req.currentUser)) {
			return next(createError(403, "You are not allowed to edit this pet"));
		}

		const updates = pickWritableFields(req.body);
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
		if (!pet) return next(createError(404, "pet not found"));

		if (!isOwner(pet, req.currentUser)) {
			return next(createError(403, "You are not allowed to delete this pet"));
		}

		await pet.deleteOne();

		// Sin esto, cualquier Like/Dislike que apuntaba a esta mascota queda
		// "colgado" (referencia a un _id que ya no existe). Populate() sobre
		// esa referencia devuelve null, y eso rompe la pantalla de Favoritos
		// con un crash real la próxima vez que alguien la abre.
		await Promise.all([
			Like.deleteMany({ adoption: pet._id }),
			Dislike.deleteMany({ adoption: pet._id }),
		]);

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
