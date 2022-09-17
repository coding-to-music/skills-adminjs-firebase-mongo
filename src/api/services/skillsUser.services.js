const httpStatus = require("http-status");
const SkillsUser = require("../models/skills/skills.user.model");
const ApiError = require("../helpers/ApiError");
const domainRegistrationModel = require("../models/skills/domainRegistration.model");
const domainsModel = require("../models/skills/domains.model");

const getSkillsUser = async (firebaseUid) => {
	const userInDb = await SkillsUser.findOne({ firebaseUid });

	if (!userInDb) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "User doesn't exist");
	}

	return userInDb;
};

const updateSkillsUser = async (firebaseUid, ...otherDetails) => {
	const updateUserInDb = await SkillsUser.findOneAndUpdate(
		{ firebaseUid },
		{ ...otherDetails },
		{
			returnOriginal: false,
		}
	).catch((err) => {
		throw new ApiError(httpStatus.UNAUTHORIZED, err);
	});

	return updateUserInDb;
};

const onboardingSkillUser = async (firebaseUid) => {
	const userInDb = await SkillsUser.findOne({
		firebaseUid,
	});

	if (!userInDb) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
	}

	const { name, email } = userInDb;

	const registeredDomainInDd = await domainRegistrationModel.findOne({
		user: firebaseUid,
	});

	const { domainName } = await domainsModel.findById(registeredDomainInDd._id);

	// get the document

	sendMail({
		name,
		email,
		subject: "Onboarding mail",
		html: `Hi welcome to ${domainName}`,
	});
};

module.exports = {
	getSkillsUser,
	updateSkillsUser,
	onboardingSkillUser,
};
