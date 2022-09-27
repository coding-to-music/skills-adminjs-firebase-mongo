const httpStatus = require("http-status");
const catchAsync = require("../helpers/catchAsync");
const { SkillUser } = require("../models/skills");

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
  const { body, user } = req;

  const signUpUser = await SkillUserService.updateSkillsUser(user, body);

  return res.status(httpStatus.CREATED).json({
    code: httpStatus.ACCEPTED,
    status: httpStatus[httpStatus.ACCEPTED],
    message: "User update succesfully",
    data: signUpUser,
  });
});

const studentSubmitAssignment = catchAsync(async (req, res, next) => {
  const { user, body } = req;

  const submitAssignment = await SkillUserService.studentSubmitAssignment(
    user,
    body
  );

  return res.status(httpStatus.CREATED).json({
    code: httpStatus.ACCEPTED,
    status: httpStatus[httpStatus.ACCEPTED],
    message: "testing submit assignment endpoint",
    data: submitAssignment,
  });
});

module.exports = {
  getSkillUserDetails,
  updateSkillUserDetails,
  onboardingSkillUser,
  studentSubmitAssignment,
};
