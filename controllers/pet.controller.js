module.exports.delete = async (req, res, next) => {
	try {
		const pet = await Pet.findById(req.params.id);
		if (!pet) return next(createError(404, "pet not found"));

		if (!isOwner(pet, req.currentUser)) {
			return next(createError(403, "You are not allowed to delete this pet"));
		}

		await pet.deleteOne();

		await Promise.all([
			Like.deleteMany({ adoption: pet._id }),
			Dislike.deleteMany({ adoption: pet._id }),
		]);

		res.status(200).json(pet);
	} catch (error) {
		next(error);
	}
};
