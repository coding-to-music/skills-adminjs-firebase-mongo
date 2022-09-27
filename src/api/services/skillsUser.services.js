const httpStatus = require("http-status");
const SkillsUser = require("../models/skills/skills.user.model");
const ApiError = require("../helpers/ApiError");
const domainRegistrationModel = require("../models/skills/domainRegistration.model");
const DomainRegistrations = require("../models/skills/domainRegistration.model");
const domainsModel = require("../models/skills/domains.model");
const { assign } = require("nodemailer/lib/shared");
const config = require("../../config/agenda");
const {
  checkIfMentor,
} = require("../middlewares/skills/validateUser.middleware");

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
      domain: domainFetched.domainName,
      registerId: registerDomain._id,
    };
  } else {
    domainFetched.mentors.push(updatedUser._id);
    await domainFetched.save();
    return {
      ...updatedUser.toObject(),
      domain: domainFetched.domainName,
    };
  }
};

const studentSubmitAssignment = async (user, submissionDetails) => {
  const today = Date.now();
  const diff = today - config.weekStart + 1;
  const weekNo = submissionDetails.weekNo;

  if (1 > weekNo || weekNo > config.maxWeekNos)
    return { status: "fail", message: "Invalid week number" };

  const weekStartTime = (weekNo - 1) * config.weekInterval;
  const weekEndTime = weekNo * config.weekInterval + config.extraTime;
  if (diff < weekStartTime || diff >= weekEndTime) {
    return res
      .status(500)
      .send({ status: "fail", message: "Submission deadline has passed" });
  }

  let registration;
  registration = await DomainRegistrations.findOneAndUpdate(
    {
      user: user._id,
      "submissions.weekNo": { $nin: [weekNo] },
    },
    {
      $push: {
        submissions: {
          weekNo,
          submissionLink: submissionDetails.submissionLink,
          updatedAt: Date.now(),
        },
      },
    },
    { new: true }
  ).catch((err) => {
    return { status: "fail", message: err };
  });

  registration = DomainRegistrations.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        "submissions.$[elem].submissionLink": submissionDetails.submissionLink,
        "submissions.$[elem].updatedAt": today,
      },
    },
    {
      new: true,
      arrayFilters: [{ "elem.weekNo": weekNo }],
    }
  ).catch((err) => {
    return { status: "fail", message: err };
  });

  if (!registration) {
    return {
      status: "fail",
      message: "User not registered for this domain",
    };
  }

  try {
    return registration;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};
const mentorSubmitAssignment = async (user, submissionDetails) => {
  const weekNo = parseInt(submissionDetails.weekNo);
  const approved = submissionDetails.approved;

  if (1 > weekNo || weekNo > config.maxWeekNos)
    return { status: "fail", message: "Invalid week number" };

  if (!submissionDetails.comment) {
    return {
      status: "fail",
      message: "Comment required",
    };
  }

  if (
    Date.now() - config.weekStart <
    weekNo * config.weekInterval + config.extraTime
  ) {
    return { status: "fail", message: "Cannot approve before week ends" };
  }
  let registration;
  registration = await DomainRegistrations.findOneAndUpdate(
    {
      domain: submissionDetails.domainId,
    },
    {
      $set: {
        "submissions.$[elem].approved": approved,
        "submissions.$[elem].comment": submissionDetails.comment,
        "submissions.$[elem].mentor": user._id,
      },
    },
    {
      new: true,
      arrayFilters: [
        {
          "elem.weekNo": weekNo,
          "elem.mentor": null,
        },
      ],
    }
  ).catch((err) => {
    return { status: "fail", message: err };
  });

  if (!registration) {
    return { status: "fail", message: "Not allowed to comment" };
  }

  for (let week of registration.submissions) {
    if (week.weekNo === weekNo) {
      // Marks calculation logic

      let mark = 0;
      if (approved) {
        let diff =
          week.updatedAt -
          config.weekStart -
          (weekNo - 1) * config.weekInterval;
        for (let table of config.marksTable) {
          if (diff < table.time) {
            mark = table.mark;
            break;
          }
        }
      } else {
        mark = config.unapprovedMarks;
      }
      week.mark = mark;
      break;
    }
  }

  try {
    return registration.save();
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};

module.exports = {
  getSkillsUser,
  updateSkillsUser,
  onboardingSkillUser,
  studentSubmitAssignment,
  mentorSubmitAssignment,
};
