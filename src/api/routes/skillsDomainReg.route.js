const express = require("express");
const router = express.Router();

const {
	checkIfAuthenticated,
	getAuthToken,
	getFirebaseUid,
} = require("../middlewares/skills/validateUser.middleware");

const { SkillsDomainReg } = require("../controllers/index");

router.post(
	"/registerDomain",
	[getAuthToken, getFirebaseUid, checkIfAuthenticated],
	SkillsDomainReg.registerDomain
);

module.exports = router;
