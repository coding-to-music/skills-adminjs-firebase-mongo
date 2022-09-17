const express = require("express");
const router = express.Router();

const {
	getFirebaseUid,
	getAuthToken,
} = require("../middlewares/skills/validateUser.middleware");

const { SkillsAuthController } = require("../controllers/index");

router.post(
	"/login",
	[getAuthToken, getFirebaseUid],
	SkillsAuthController.loginSkillsUser
);

router.post(
	"/signup",
	[getAuthToken, getFirebaseUid],
	SkillsAuthController.signUpSkillsUser
);

module.exports = router;
