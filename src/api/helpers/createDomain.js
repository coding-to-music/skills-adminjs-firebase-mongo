const { Domains } = require("../models/skills");

const createDomain = async () => {
  const allDomains = [
    "Web Development",
    "App Development",
    "UI/UX",
    "Graphics Designing",
    "Competitive Coding",
    "AI/ML",
    "Game Development",
    "Embedded System & IOT",
    "ROS",
    "3D and Motion Graphics",
    "Cybersecurity",
    "Blockchain",
    "Devops",
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
