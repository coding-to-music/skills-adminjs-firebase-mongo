const { Domains } = require("../models/skills");

const createDomain = async () => {
  const allDomains = [
    "Web Development",
    "App Development",
    "Competitive Coding",
    "AI/ML",
    "UI/UX",
    "Cybersecurity",
    "Blockchain",
    "Devops and Cloud Computing",
    "Game Development",
    "Graphics Designing",
    "Embedded System & IOT",
    "ROS",
    "3D and Motion Graphics",
  ];
  await Promise.all(
    allDomains.map(async (domain) => {
      const domainExists = await Domains.findOne({ domainName: domain });
      if (!domainExists) {
        await Domains.create({ domainName: domain });
      }
    })
  );

  return;
};

module.exports = {
  createDomain,
};
