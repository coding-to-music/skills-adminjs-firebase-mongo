const httpStatus = require("http-status");
const SkillsUser = require("../models/skills/skills.user.model");
const ApiError = require("../helpers/ApiError");
const domainRegistrationModel = require("../models/skills/domainRegistration.model");
const domainsModel = require("../models/skills/domains.model");
const { assign } = require("nodemailer/lib/shared");

const getSkillsUser = async (firebaseUid) => {
  const userInDb = await SkillsUser.findOne({ firebaseUid });

  if (!userInDb) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User doesn't exist");
  }

  return userInDb;
};

const updateSkillsUser = async (firebaseUid, ...otherDetails) => {
  const updateUserInDb = await SkillsUser.findOneAndUpdate(
    { firebaseUid },
    { ...otherDetails },
    {
      returnOriginal: false,
    }
  ).catch((err) => {
    throw new ApiError(httpStatus.UNAUTHORIZED, err);
  });

  return updateUserInDb;
};

const onboardingSkillUser = async (firebaseUid) => {
  const userInDb = await SkillUser.findById(user._id);

  if (!userInDb) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exists");
  }

  const {
    name,
    phoneNumber,
    registrationNumber,
    wing,
    branch,
    domain,
    zairzaMember,
  } = body;

  const updatedUser = await SkillUser.findByIdAndUpdate(
    user._id,
    {
      $set: {
        name,
        phoneNumber,
        registrationNumber,
        ...(wing && { wing }),
        branch,
        zairzaMember,
        isRegisteredComplete: true,
      },
    },
    {
      new: true,
    }
  );

  const domainFetched = await Domains.findOne({ domainName: domain });

  if (!domainFetched) {
    throw new ApiError(httpStatus.NOT_FOUND, "Domain not found");
  }

  if (user.role === "member") {
    const registerDomain = await DomainRegistrations.create({
      domain: domainFetched._id,
      user: updatedUser._id,
    });

    domainFetched.domainRegistrations.push(registerDomain._id);

    await domainFetched.save();

    sendMail({
      email: updatedUser.email,
      subject: "Skills++ | Registration Successful",
      data: {
        name: updatedUser.name,
        domain: domainFetched.domainName,
        forumLink:
          `href='${domainFetched.discussionLink}'` ?? 'target="_blank"',
      },
    });

    return {
      ...updatedUser.toObject(),
      domain: domainFetched,
      registerId: registerDomain._id,
    };
  } else {
    domainFetched.mentors.push(updatedUser._id);
    await domainFetched.save();
    return {
      ...updatedUser.toObject(),
      domain: domainFetched,
    };
  }
};

module.exports = {
  getSkillsUser,
  updateSkillsUser,
  onboardingSkillUser,
};
