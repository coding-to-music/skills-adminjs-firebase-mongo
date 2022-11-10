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

  const registeredUser = await SkillUserService.onboardingSkillUser(user, body);

  return res.status(httpStatus.CREATED).json({
    code: httpStatus.ACCEPTED,
    status: httpStatus[httpStatus.ACCEPTED],
    message: "User update succesfully",
    data: registeredUser,
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
    message: "Assignment submitted succesfully",
    data: submitAssignment,
  });
});

const mentorSubmitAssignment = catchAsync(async (req, res, next) => {
  const { user, body } = req;

  const submitAssignment = await SkillUserService.mentorSubmitAssignment(
    user,
    body
  );

  return res.status(httpStatus.CREATED).json({
    code: httpStatus.ACCEPTED,
    status: httpStatus[httpStatus.ACCEPTED],
    message: "Assignment reviewed succesfully",
    data: submitAssignment,
  });
});

const getMentorDashboardData = catchAsync(async (req, res, next) => {
  const { user } = req;
  const {domainId} = req.query;
  const mentorDashboardData = await SkillUserService.getMentorDashboardData(
    user,domainId
  );

  return res.status(httpStatus.ACCEPTED).json({
    code: httpStatus.FOUND,
    status: httpStatus[httpStatus.FOUND],
    message: "Mentor dashboard data fetched succesfully",
    data: mentorDashboardData,
  });
});

const getStudentDashboardData = catchAsync(async (req, res, next) => {
  const { user } = req;
  const studentDashboardData = await SkillUserService.getStudentDashboardData(
    user
  );
  
  return res.status(httpStatus.ACCEPTED).json({
    code: httpStatus.FOUND,
    status: httpStatus[httpStatus.FOUND],
    message: "Student dashboard data fetched succesfully",
    data: studentDashboardData,
  });
});

module.exports = {
  getSkillUserDetails,
  updateSkillUserDetails,
  onboardingSkillUser,
  studentSubmitAssignment,
  mentorSubmitAssignment,
  getMentorDashboardData,
  getStudentDashboardData,
};
