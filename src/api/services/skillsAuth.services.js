const httpStatus = require("http-status");
const { SkillUser, Domains, DomainRegistrations } = require("../models/skills");
const ApiError = require("../helpers/ApiError");
const { sendMail } = require("../helpers/sendMail");

const loginSkillsUser = async (firebaseUid) => {
  const userInDb = await SkillUser.findOne({ firebaseUid });

  if (!userInDb) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User doesn't exists");
  }

  const domainRegistration = await DomainRegistrations.findOne({
    user: userInDb._id,
  })
    .populate("domain")
    .exec();
  return {
    user: userInDb.toObject(),
    domain: domainRegistration.domain.toObject(),
    registerId: domainRegistration,
  };
};

const signUpSkillsUser = async (firebaseUid, body) => {
  const userInDb = await SkillUser.findOne({ firebaseUid });

  if (userInDb) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User already exists");
  }

  const {
    name,
    phoneNumber,
    email,
    registrationNumber,
    wing,
    branch,
    domain,
    zairzaMember,
  } = body;

  const createNewUser = await SkillUser.create({
    firebaseUid,
    name,
    phoneNumber,
    email,
    registrationNumber,
    ...(wing && { wing }),
    branch,
    zairzaMember,
  });

  const domainFetched = await Domains.findOne({ domainName: domain });

  if (!domainFetched) {
    throw new ApiError(httpStatus.NOT_FOUND, "Domain not found");
  }

  const registerDomain = await DomainRegistrations.create({
    domain: domainFetched._id,
    user: createNewUser._id,
  });

  domainFetched.domainRegistrations.push(registerDomain._id);

  await domainFetched.save();

  sendMail({
    email: createNewUser.email,
    subject: "Skills++ | Registration Successful",
    data: {
      name: createNewUser.name,
      domain: domainFetched.domainName,
      forumLink: `href='${domainFetched.discussionLink}'` ?? 'target="_blank"',
    },
  });

  return {
    ...createNewUser.toObject(),
    domain: domainFetched,
    registerId: registerDomain._id,
  };
};

module.exports = {
  loginSkillsUser,
  signUpSkillsUser,
};
