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

const getDomainRegistration = catchAsync(async (req,res,next) => {
	const  { user } = req
	
	const domainRegistrationDetails = await SkillsDomainReg.getDomainRegistrationDetails(user);
	return res.status(httpStatus.OK).json({
		code:httpStatus.OK,
		status:httpStatus[httpStatus.OK],
		message:"Fetched Registered Domain Successfully",
		data:domainRegistrationDetails
	})
})

module.exports = {
	registerDomain,
	getDomainRegistration
};
