const httpStatus = require("http-status");
const SkillsUser = require("../models/skills/skills.user.model");
const ApiError = require("../helpers/ApiError");

const loginSkillsUser = async (firebaseUid) => {
	const userInDb = await SkillsUser.findOne({ firebaseUid });

	if (!userInDb) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "User doesn't exists");
	}

	return userInDb;
};

const signUpSkillsUser = async (firebaseUid) => {
	const userInDb = await SkillsUser.findOne({ firebaseUid });

	if (userInDb) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "User already exists");
	}

	const createNewUser = await SkillsUser.create({ firebaseUid });

	return createNewUser;
};

module.exports = {
	loginSkillsUser,
	signUpSkillsUser,
};
