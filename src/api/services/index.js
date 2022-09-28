const {
  loginSkillsUser,
  signUpSkillsUser,
  upDateSkillsUser,
} = require("./skillsAuth.services");
const {
  createDomains,
  updateDomain,
  readDomainData,
} = require("./skillsDomain.service");
const {
  getSkillsUser,
  onboardingSkillUser,
  updateSkillsUser,
  studentSubmitAssignment,
  mentorSubmitAssignment,
  getMentorDashboardData,
  getStudentDashboardData,
} = require("./skillsUser.services");

const {
  registerDomain,
  getDomainRegistrationDetails,
} = require("./skillsDomainReg.services");

module.exports = {
  SkillAuthService: {
    loginSkillsUser,
    signUpSkillsUser,
    upDateSkillsUser,
  },
  domainService: {
    createDomains,
    updateDomain,
    readDomainData,
  },
  SkillUserService: {
    getSkillsUser,
    onboardingSkillUser,
    updateSkillsUser,
    studentSubmitAssignment,
    mentorSubmitAssignment,
    getMentorDashboardData,
    getStudentDashboardData,
  },
  SkillsDomainReg: {
    registerDomain,
    getDomainRegistrationDetails,
  },
};
