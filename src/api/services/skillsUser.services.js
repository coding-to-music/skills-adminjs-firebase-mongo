const httpStatus = require("http-status");
const SkillsUser = require("../models/skills/skills.user.model");
const ApiError = require("../helpers/ApiError");
const DomainRegistrations = require("../models/skills/domainRegistration.model");
const config = require("../../config/agenda");
const {
  checkIfMentor,
} = require("../middlewares/skills/validateUser.middleware");
const mongoose = require("mongoose");
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

const onboardingSkillUser = async (user, body) => {
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

    if (role === "member") {
      const domainFetched = await Domains.findOne({ domainName: domain });

      if (!domainFetched) {
        throw new ApiError(httpStatus.NOT_FOUND, "Domain not found");
      }
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
          resourceLink: domainFetched.tasks[0]?.resourceLink,
          forumLink:
            "https://zairzaskills2k22.slack.com/archives/C0465PUJ8V6",
        },
      });

      return {
        ...updatedUser.toObject(),
        domain: domainFetched.domainName,
        registerId: registerDomain._id,
      };
    } else {
      await Promise.all(
        domain.map(async (domainItem) => {
          const domainFetched = await Domains.findOne({
            domainName: domainItem,
          });
          if (!domainFetched) {
            throw new ApiError(httpStatus.NOT_FOUND, "Domain not found");
          }
          domainFetched.mentors.push(updatedUser._id);
          await domainFetched.save();
        })
      );

      return {
        ...updatedUser.toObject(),
        domain: domain,
      };
    }
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }
};

const studentSubmitAssignment = async (user, submissionDetails) => {
  console.log(submissionDetails)
  const today = Date.now();
  const diff = today - config.weekStart + 1;
  const weekNo = submissionDetails.weekNo;
  console.log(weekNo)
  if (1 > weekNo || weekNo > config.maxWeekNos)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Invalid week Number");

  const weekStartTime = (weekNo - 1) * config.weekInterval;
  const weekEndTime = weekNo * config.weekInterval + config.extraTime;
  console.log(diff,weekStartTime,weekEndTime);
  if (diff >= weekEndTime) {
   throw new ApiError(httpStatus.BAD_REQUEST,"Assignment submission time is over");
  }
  else if(diff < weekStartTime){
    throw new ApiError(httpStatus.BAD_REQUEST,"Assignment submission time is not started yet");
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
    return { status: "fail", message: err }; // must be converted to ApiError
  });

  const registration2 = await DomainRegistrations.findOneAndUpdate(
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
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
  });
 
  if (!registration2) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"User not registered for this domain");
  }

  try {
    return registration2;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};

const mentorSubmitAssignment = async (user, submissionDetails) => {
  const weekNo = parseInt(submissionDetails.weekNo);

  if (1 > weekNo || weekNo > config.maxWeekNos)
    return { status: "fail", message: "Invalid week number" };

  if (!submissionDetails.comment) {
    throw new ApiError(401,"Comment is required");
  }

  // if (
  //   Date.now() - config.weekStart <
  //   weekNo * config.weekInterval + config.extraTime
  // ) {
  //   throw new ApiError(401,"Cannot Approve before week ends");
  // }
  let registration;
  registration = await DomainRegistrations.findOneAndUpdate(
    {
      _id:submissionDetails.registrationId,
      domain: submissionDetails.domainId
    },
    {
      $set: {
        "submissions.$[elem].approved": submissionDetails.approved,
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
      if (submissionDetails.approved) {
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

const getMentorDashboardData = async (user,domainId) => {
  const mentorData = await DomainRegistrations.aggregate([
    {
      $match: {
        domain: mongoose.Types.ObjectId(domainId),
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
    }
    ,
    {
      $project: {
        _id: 0,
        registrationId: "$_id",
        submission: "$submissions",
        domain: 1,
        domainName: {
          $arrayElemAt: ["$domainObject.domainName", 0],
        },
      },
    },
  ]).catch((err) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,err.message);
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
    const domains = await Domains.find({}, { name: 1 }).exec();
    console.log({
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
      // {
      //   $project: {
      //     task:"$domain.tasks"
      //   }
      // },
      // {
      //   $unwind: {
      //     path: "$domain.tasks",
      //   },
      // },
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
      // {
      //   $set: {
      //     "task.submission": {
      //       $arrayElemAt: ["$submission", 0],
      //     },
      //   },
      // },
      // {
      //   $unset: ["domain.mentors", "domain.tasks", "submission"],
      // },
      // {
      //   $addFields: {
      //     "task.resource": {
      //       $cond: [
      //         {
      //           $gt: ["$task.weekNo", maxWeeks],
      //         },
      //         "$$REMOVE",
      //         "$task.resource",
      //       ],
      //     },
      //   },
      // },
      // {
      //   $group: {
      //     _id: {
      //       _id: "$_id",
      //       user: "$user",
      //       domain: "$domain",
      //     },
      //     tasks: {
      //       $push: "$task",
      //     },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     registrationId: "$_id._id",
      //     domain: "$_id.domain",
      //     tasks: 1,
      //   },
      // },
    ]).catch((err) => {
      return { status: "fail", message: err };
    });

    if (!studentData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Bad request");
    } else if (studentData.length === 0) {
      return { status: "fail", message: "No submissions found" };
    }else{
      return studentData;
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
