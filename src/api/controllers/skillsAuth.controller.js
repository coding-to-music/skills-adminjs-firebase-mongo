const httpStatus = require("http-status");
const catchAsync = require("../helpers/catchAsync");

const { SkillAuthService } = require("../services/index");

const loginSkillsUser = catchAsync(async (req, res, next) => {
	const { firebaseUid } = req;
	const loginUser = await SkillAuthService.loginSkillsUser(firebaseUid);

	return res.status(httpStatus.FOUND).json({
		code: httpStatus.FOUND,
		status: httpStatus[httpStatus.OK],
		message: "User found and logged in",
		data: loginUser,
	});
});

const signUpSkillsUser = catchAsync(async (req, res, next) => {
	const { firebaseUid } = req;

	const signUpUser = await SkillAuthService.signUpSkillsUser(firebaseUid);

	return res.status(httpStatus.CREATED).json({
		code: httpStatus.CREATED,
		status: httpStatus[httpStatus.CREATED],
		message: "User created succesfully",
		data: signUpUser,
	});
});

module.exports = {
	loginSkillsUser,
	signUpSkillsUser,
};
