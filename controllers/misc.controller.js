const Like = require("../models/Like.model");
const Dislike = require("../models/Dislike.model");
const { sendNotification } = require("../services/notificationService");
const Pet = require("../models/Pet.model");

module.exports.likesList = (req, res, next) => {
	Like.find({ user: req.currentUser })
		.populate({
			path: "adoption",
			populate: { path: "owner", select: "userName email phoneNumber image" },
		})
		.then((likes) =>
			// .filter(Boolean) saca cualquier like que haya quedado huérfano de
			// ANTES de este fix (mascotas ya borradas). Sin esto, un solo registro
			// viejo roto sigue tirando abajo toda la pantalla.
			res.json(likes.map((like) => like.adoption).filter(Boolean)),
		)
		.catch(next);
};

module.exports.likes = (req, res, next) => {
	const petId = req.params.id;

	Like.findOneAndDelete({ adoption: petId, user: req.currentUser })
		.then((like) => {
			if (like) {
				return res.status(200).json({ success: "Like removed from DB" });
			}

			return Like.create({ adoption: petId, user: req.currentUser }).then(
				(newLike) =>
					Pet.findById(newLike.adoption).then((pet) => {
						sendNotification({
							receiver: pet.owner,
							user: req.currentUser,
							type: "Like",
							title: "liked your pet",
						});

						return Dislike.findOneAndDelete({
							adoption: petId,
							user: req.currentUser,
						}).then(() =>
							res.status(201).json({ success: "Like added to DB" }),
						);
					}),
			);
		})
		.catch(next);
};

module.exports.dislikes = (req, res, next) => {
	const petId = req.params.id;

	Dislike.create({ adoption: petId, user: req.currentUser })
		.then(() =>
			res.status(201).json({ success: "Dislike successfully created" }),
		)
		.catch(next);
};
