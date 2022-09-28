const express = require("express");
const router = express.Router();

const {
  checkIfAuthenticated,
  getAuthToken,
  getFirebaseUid,
  checkIfMentor,
  checkIfMentee,
} = require("../middlewares/skills/validateUser.middleware");

const { SkillsUserController } = require("../controllers/index");

router.get(
  "/getUserDetails",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated],
  SkillsUserController.getSkillUserDetails
);

router.post(
  "/updateUserDetails",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated],
  SkillsUserController.updateSkillUserDetails
);

router.post(
  "/onboardingUser",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated],
  SkillsUserController.onboardingSkillUser
);

router.post(
  "/student/submit",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated, checkIfMentee],
  SkillsUserController.studentSubmitAssignment
);

router.post(
  "/mentor/submit",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated, checkIfMentor],
  SkillsUserController.mentorSubmitAssignment
);

router.get(
  "/student/dashboard",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated, checkIfMentee],
  SkillsUserController.getStudentDashboardData
);

router.get(
  "/mentor/dashboard",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated, checkIfMentor],
  SkillsUserController.getMentorDashboardData
);

module.exports = router;
