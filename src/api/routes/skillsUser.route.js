const express = require("express");
const router = express.Router();

const {
	checkIfAuthenticated,
	getAuthToken,
	getFirebaseUid,
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

module.exports = router;
