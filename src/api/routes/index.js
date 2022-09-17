// Skill++ routes
const SkillsAuthRoute = require("./skillsAuth.route");
const SkillsDomainRoute = require("./skillsDomain.route");
const SkillsUserRoute = require("./skillsUser.route");
const SkillsDomainRegRoute = require("./skillsDomainReg.route");

module.exports = (app) => {
	// skill++
	app.use("/api/zairza/skill-plus-plus", SkillsAuthRoute);
	app.use("/api/zairza/skill-plus-plus/domain", SkillsDomainRoute);
	app.use("/api/zairza/skill-plus-plus/user", SkillsUserRoute);
	app.use("/api/zairza/skill-plus-plus/domainReg", SkillsDomainRegRoute);
};
