const httpStatus = require("http-status");
const catchAsync = require("../helpers/catchAsync");

const { SkillUserService } = require("../services/index");

const getSkillUserDetails = catchAsync(async (req, res, next) => {
	const { firebaseUid } = req;

	const skillUserData = await SkillUserService.getSkillsUser(firebaseUid);

	return res.status(httpStatus.OK).json({
		code: httpStatus.OK,
		status: httpStatus[httpStatus.OK],
		message: "Fetched user details",
		data: skillUserData,
	});
});

const updateSkillUserDetails = catchAsync(async (req, res, next) => {
	const { firebaseUid } = req;

	const updatedSkillUserData = await SkillUserService.updateSkillsUser(
		firebaseUid,
		...req.body
	);

	return res.status(httpStatus["204_CLASS"]).json({
		code: httpStatus["204_CLASS"],
		status: httpStatus["204_CLASS"],
		message: "Updated user successfully",
		data: updatedSkillUserData,
	});
});

const onboardingSkillUser = catchAsync(async (req, res, next) => {
	const { firebaseUid } = req;

	await SkillUserService.onboardingSkillUser(firebaseUid);

	return res.status(httpStatus.OK).json({
		code: httpStatus.OK,
		status: httpStatus[httpStatus.OK],
		message: "Mail sent successfully",
		data: null,
	});
});

module.exports = {
	getSkillUserDetails,
	updateSkillUserDetails,
	onboardingSkillUser,
};
