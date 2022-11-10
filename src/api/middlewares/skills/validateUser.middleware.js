const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const catchAsync = require("../../helpers/catchAsync");
const SkillsUser = require("../../models/skills/skills.user.model");
const admin = require("../../helpers/firebase");
const domainRegistrationModel = require("../../models/skills/domainRegistration.model");

// 1st call get auth token , then getFirebaseUid then call checkIfAuthenticated

const getAuthToken = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
    next();
  } else
    next(
      new ApiError(httpStatus.UNAUTHORIZED, "Authorization token not found")
    );
});

const getFirebaseUid = catchAsync(async (req, res, next) => {
  const { authToken } = req;
  const user = await admin.auth().verifyIdToken(authToken);

  req.firebaseUser = user;
  next();
});

const checkIfAuthenticated = catchAsync(async (req, res, next) => {
  // search using the firebaseUid
  const { firebaseUser } = req;
  const { uid: firebaseUid } = firebaseUser;

  const existingUserInDb = await SkillsUser.findOne({
    firebaseUid,
  });

  if (!existingUserInDb)
    next(new ApiError(httpStatus.UNAUTHORIZED, "User not authorized"));

  req.user = existingUserInDb;
  next();
});

const checkIfAdmin = catchAsync(async (req, res, next) => {
  const { firebaseUser } = req;
  const { uid: firebaseUid } = firebaseUser;

  const existingAdminInDb = await SkillsUser.findOne({
    firebaseUid,
    role: "admin",
  });

  if (!existingAdminInDb)
    next(new ApiError(httpStatus.UNAUTHORIZED, "User not authorized"));

  req.admin = existingAdminInDb;
  next();
});

const checkIfMentor = catchAsync(async (req, res, next) => {
  const { user } = req;

  if (user.role !== "mentor")
    next(
      new ApiError(
        httpStatus.UNAUTHORIZED,
        "User not authorized! You are not a mentor"
      )
    );

  next();
});

const checkIfMentee = catchAsync(async (req, res, next) => {
  const { user } = req;

  if (user.role !== "member")
    next(
      new ApiError(
        httpStatus.UNAUTHORIZED,
        "User not authorized! You are not a mentee"
      )
    );

  const registerDomain = await domainRegistrationModel.findOne({
    user: user._id,
  });

  if (!registerDomain)
    next(
      new ApiError(
        httpStatus.UNAUTHORIZED,
        "User not authorized! You have not registered for any domain"
      )
    );

  next();
});

module.exports = {
  getAuthToken,
  getFirebaseUid,
  checkIfAuthenticated,
  checkIfAdmin,
  checkIfMentor,
  checkIfMentee,
};
