const httpStatus = require("http-status");
const ApiError = require("../helpers/ApiError");
const domainRegistrationModel = require("../models/skills/domainRegistration.model");
const domainsModel = require("../models/skills/domains.model");
const skillsUserModel = require("../models/skills/skills.user.model");

const registerDomain = async (firebaseUid, domainId) => {
	const userInDb = await skillsUserModel.findOne({ firebaseUid });
	const domainRegistered = await domainsModel.findById(domainId);

	if (!userInDb || !domainRegistered) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized to register for skills++"
		);
	}

	const registerNewDomain = await domainRegistrationModel.create({
		user: userInDb._id,
		domain: domainRegistered._id,
	});

	return;
};

module.exports = {
	registerDomain,
};
