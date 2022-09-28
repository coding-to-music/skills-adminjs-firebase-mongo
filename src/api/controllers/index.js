const {
  loginSkillsUser,
  signUpSkillsUser,
  upDateSkillsUser,
} = require("./skillsAuth.controller");

const {
  createDomain,
  updateDomain,
  readDomain,
} = require("./skillsDomain.controller");

const {
  getSkillUserDetails,
  onboardingSkillUser,
  updateSkillUserDetails,
  studentSubmitAssignment,
  mentorSubmitAssignment,
  getMentorDashboardData,
  getStudentDashboardData,
} = require("./skillsUser.controller");

const { registerDomain ,getDomainRegistration } = require("./skillsDomainReg.controller");

module.exports = {
  SkillsAuthController: {
    loginSkillsUser,
    signUpSkillsUser,
  },
  domainController: {
    createDomain,
    updateDomain,
    readDomain,
  },
  SkillsUserController: {
    getSkillUserDetails,
    onboardingSkillUser,
    updateSkillUserDetails,
    studentSubmitAssignment,
    mentorSubmitAssignment,
    getMentorDashboardData,
    getStudentDashboardData,
  },
  SkillsDomainReg: {
    registerDomain,
    getDomainRegistration,
  },
};
