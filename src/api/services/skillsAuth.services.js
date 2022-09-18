const httpStatus = require("http-status");
const { SkillUser, Domains, DomainRegistrations } = require("../models/skills");
const ApiError = require("../helpers/ApiError");
const { sendMail } = require("../helpers/sendMail");
const { default: mongoose } = require("mongoose");

const loginSkillsUser = async (firebaseUid) => {
  const userInDb = await SkillUser.findOne({ firebaseUid });

  if (!userInDb) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User doesn't exists");
  }

  if (userInDb.role === "member") {
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
  } else {
    const domain = Domains.aggregate([
      {
        $unwind: "$mentors",
      },
      {
        $match: {
          "mentors.user": mongoose.Types.ObjectId(userInDb._id),
        },
      },
      {
        $unwind: "$domainRegistrations",
      },
    ]);
    return {
      user: userInDb.toObject(),
      domain: domain,
    };
  }
};

const signUpSkillsUser = async (firebaseUser) => {
  const userInDb = await SkillUser.findOne({ firebaseUid: firebaseUser.uid });

  if (userInDb) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User already exists");
  }

  const { name, email, uid: firebaseUid } = firebaseUser;

  const createNewUser = await SkillUser.create({
    firebaseUid,
    ...(name && { name }),
    email,
  });

  return {
    ...createNewUser.toObject(),
  };
};

const upDateSkillsUser = async (user, body) => {
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
    return {
      ...updatedUser.toObject(),
      domain: domainFetched,
    };
  }
};

module.exports = {
  loginSkillsUser,
  signUpSkillsUser,
  upDateSkillsUser,
};
