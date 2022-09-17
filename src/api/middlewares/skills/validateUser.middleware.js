const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const catchAsync = require("../../helpers/catchAsync");
const SkillsUser = require("../../models/skills/skills.user.model");
const admin = require("../../helpers/firebase");

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
  const { uid: firebaseUid } = await admin.auth().verifyIdToken(authToken);

  req.firebaseUid = firebaseUid;
  next();
});

const checkIfAuthenticated = catchAsync(async (req, res, next) => {
  // search using the firebaseUid
  const { firebaseUid } = req;

  const existingUserInDb = await SkillsUser.findOne({
    firebaseUid,
  });

  if (!existingUserInDb)
    next(new ApiError(httpStatus.UNAUTHORIZED, "User not authorized"));

  req.user = existingUserInDb;
  next();
});

const checkIfAdmin = catchAsync(async (req, res, next) => {
  const { firebaseUid } = req;

  const existingAdminInDb = await SkillsUser.findOne({
    firebaseUid,
    role: "admin",
  });

  if (!existingAdminInDb)
    next(new ApiError(httpStatus.UNAUTHORIZED, "User not authorized"));

  req.admin = existingAdminInDb;
  next();
});

module.exports = {
  getAuthToken,
  getFirebaseUid,
  checkIfAuthenticated,
  checkIfAdmin
};
