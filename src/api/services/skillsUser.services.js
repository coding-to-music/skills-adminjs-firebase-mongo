const httpStatus = require("http-status");
const SkillsUser = require("../models/skills/skills.user.model");
const ApiError = require("../helpers/ApiError");
const DomainRegistrations = require("../models/skills/domainRegistration.model");
const config = require("../../config/agenda");
const {
  checkIfMentor,
} = require("../middlewares/skills/validateUser.middleware");
const { sendMail } = require("../helpers/sendMail");
const { Domains } = require("../models/skills");

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

const onboardingSkillUser = async (user,body) => {
  const userInDb = await SkillsUser.findById(user._id);

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
    role,
    zairzaMember,
  } = body;
  try {
  const updatedUser = await SkillsUser.findByIdAndUpdate(
    user._id,
    {
      $set: {
        name,
        phoneNumber,
        registrationNumber,
        ...(wing && { wing }),
        branch,
        zairzaMember,
        role,
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
  
  if (role === "member") {
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
  }catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST,'User already exists');
    }
    else {
      throw new ApiError(httpStatus.BAD_REQUEST,error.message);
    }
    
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

const getMentorDashboardData = async (user) => {
  const mentorData = await DomainRegistrations.aggregate([
    {
      $match: {
        domain: mongoose.Types.ObjectId(req.query.domainId),
      },
    },
    {
      $lookup: {
        from: "domains",
        localField: "domain",
        foreignField: "_id",
        as: "domainObject",
      },
    },
    {
      $unwind: {
        path: "$submissions",
      },
    },
    {
      $match: {
        "submissions.mentor": null,
      },
    },
    {
      $project: {
        _id: 0,
        registrationId: "$_id",
        submission: "$submissions",
        domain: 1,
        domainName: {
          $arrayElemAt: ["$domainObject.name", 0],
        },
      },
    },
  ]).catch((err) => {
    return { status: "fail", message: err };
  });

  if (!mentorData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No submissions found");
  }

  return mentorData;
};

const getStudentDashboardData = async (user) => {
  const now = Date.now();
  let isRegistered = await DomainRegistrations.findOne({
    user: user._id,
  }).exec();
  if (now < config.eventStart.getTime() || !isRegistered) {
    domains = await Domains.find({}, { name: 1 }).exec();
    res.render("pages/dashboard/skills", {
      user: req.user,
      layout: "pages/base",
      domains,
      isRegistered,
    });
  } else {
    const maxWeeks =
      Math.floor((now - config.weekStart.getTime()) / config.weekInterval) + 1;
    const studentData = DomainRegistrations.aggregate([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $lookup: {
          from: "domains",
          localField: "domain",
          foreignField: "_id",
          as: "domain",
        },
      },
      {
        $set: {
          domain: {
            $arrayElemAt: ["$domain", 0],
          },
        },
      },
      {
        $unwind: {
          path: "$domain.tasks",
        },
      },
      {
        $project: {
          user: 1,
          domain: 1,
          task: "$domain.tasks",
          submission: {
            $filter: {
              input: "$submissions",
              as: "submission",
              cond: {
                $eq: ["$$submission.weekNo", "$domain.tasks.weekNo"],
              },
            },
          },
        },
      },
      {
        $set: {
          "task.submission": {
            $arrayElemAt: ["$submission", 0],
          },
        },
      },
      {
        $unset: ["domain.mentors", "domain.tasks", "submission"],
      },
      {
        $addFields: {
          "task.resource": {
            $cond: [
              {
                $gt: ["$task.weekNo", maxWeeks],
              },
              "$$REMOVE",
              "$task.resource",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            user: "$user",
            domain: "$domain",
          },
          tasks: {
            $push: "$task",
          },
        },
      },
      {
        $project: {
          _id: 0,
          registrationId: "$_id._id",
          domain: "$_id.domain",
          tasks: 1,
        },
      },
    ]).catch((err) => {
      return { status: "fail", message: err };
    });

    if (!studentData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Bad request");
    } else if (studentData.length === 0) {
      return { status: "fail", message: "No submissions found" };
    }
  }
};

module.exports = {
  getSkillsUser,
  updateSkillsUser,
  onboardingSkillUser,
  studentSubmitAssignment,
  mentorSubmitAssignment,
  getMentorDashboardData,
  getStudentDashboardData,
};
