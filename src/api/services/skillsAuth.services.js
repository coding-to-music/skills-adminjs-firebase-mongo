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
      domain: domainRegistration?.domain.toObject() ?? {},
      registerId: domainRegistration ?? {},
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

module.exports = {
  loginSkillsUser,
  signUpSkillsUser,
};
