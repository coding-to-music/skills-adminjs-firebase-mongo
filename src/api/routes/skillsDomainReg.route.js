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

router.get(
  "/getRegisteredDomain",
  [getAuthToken, getFirebaseUid, checkIfAuthenticated],
  SkillsDomainReg.getDomainRegistration
);

module.exports = router;
