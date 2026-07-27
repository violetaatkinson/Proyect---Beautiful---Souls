const createError = require("http-errors");
const User = require("../models/User.model");
const Like = require("../models/Like.model");
const Pet = require("../models/Pet.model");

const REGISTER_WRITABLE_FIELDS = [
	"userName",
	"email",
	"password",
	"phoneNumber",
	"accountType",
	"shelterName",
	"city",
	"province",
];

const PROFILE_WRITABLE_FIELDS = [
	"userName",
	"phoneNumber",
	"accountType",
	"shelterName",
	"city",
	"province",
];

const pickFields = (body, allowedFields) =>
	allowedFields.reduce((acc, field) => {
		if (body[field] !== undefined) acc[field] = body[field];
		return acc;
	}, {});

// El registro solo pide email + password. Como userName es obligatorio en el
// modelo, si no vino en el body le generamos uno provisorio a partir del
// email (ej: "pepita" de pepita@gmail.com + 4 dígitos para que sea único).
// El usuario lo puede cambiar después desde "Complete Your Profile".
const generateUsername = (email) => {
	const base =
		(email || "user")
			.split("@")[0]
			.replace(/[^a-zA-Z0-9]/g, "")
			.slice(0, 20) || "user";
	const suffix = Math.floor(1000 + Math.random() * 9000);
	return `${base}${suffix}`;
};

module.exports.list = (req, res, next) => {
	User.find({ _id: { $ne: req.currentUser } })
		.then((users) => res.json(users))
		.catch(next);
};

// Gente que likeó alguna de mis mascotas. Antes devolvía una lista plana
// de usuarios (y el dedupe con Set no funcionaba porque son documentos de
// Mongoose, no primitivos). Ahora devuelve un par (user, pet) por cada
// like, así cada fila deja clarísimo de qué mascota se trata y no hay
// ambigüedad al abrir la conversación.
module.exports.listWithLikes = (req, res, next) => {
	Pet.find({ owner: req.currentUser })
		.populate({ path: "like", populate: { path: "user" } })
		.then((pets) => {
			const result = pets.reduce((acc, pet) => {
				const rows = pet.like
					.filter((like) => like.user)
					.map((like) => ({ user: like.user, pet }));
				return [...acc, ...rows];
			}, []);

			const deduped = result.filter(
				(row, i, arr) =>
					arr.findIndex(
						(r) => r.user.id === row.user.id && r.pet.id === row.pet.id,
					) === i,
			);

			res.json(deduped);
		})
		.catch(next);
};

module.exports.create = (req, res, next) => {
	const user = pickFields(req.body, REGISTER_WRITABLE_FIELDS);

	if (req.file) user.image = req.file.path;
	if (!user.userName) user.userName = generateUsername(user.email);

	User.create(user)
		.then((createdUser) => res.status(201).json(createdUser))
		.catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
	User.findById(req.currentUser)
		.then((user) => {
			if (!user) return next(createError(404, "User not found"));
			res.json(user);
		})
		.catch(next);
};

module.exports.edit = (req, res, next) => {
	// Un usuario solo puede editar su propia cuenta, sin importar
	// qué :id venga en la URL.
	const updates = pickFields(req.body, PROFILE_WRITABLE_FIELDS);
	if (req.file) updates.image = req.file.path;

	User.findByIdAndUpdate(req.currentUser, updates, {
		new: true,
		runValidators: true,
	})
		.then((user) => res.status(200).json(user))
		.catch(next);
};

module.exports.delete = (req, res, next) => {
	User.findByIdAndDelete(req.currentUser)
		.then((user) => res.status(200).json(user))
		.catch(next);
};

module.exports.profile = (req, res, next) => {
	Like.find({ user: req.currentUser })
		.populate("adoption")
		.then((likedPets) => res.status(200).json(likedPets))
		.catch(next);
};
