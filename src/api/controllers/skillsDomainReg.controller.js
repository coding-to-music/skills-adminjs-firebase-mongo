const httpStatus = require("http-status");
const catchAsync = require("../helpers/catchAsync");

const { SkillsDomainReg } = require("../services/index");

const registerDomain = catchAsync(async (req, res, next) => {
	const { firebaseUid } = req;
	const { domainId } = req.body;

	const newDomainRegistration = await SkillsDomainReg.registerDomain(
		firebaseUid,
		domainId
	);

	return res.status(httpStatus.OK).json({
		code: httpStatus.OK,
		status: httpStatus[httpStatus.OK],
		message: "Registered for domain successfully",
		data: newDomainRegistration,
	});
});

module.exports = {
	registerDomain,
};
