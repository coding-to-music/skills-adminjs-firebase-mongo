const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema(
  {
    domainName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tasks: [
      {
        weekNo: Number,
        resourceLink: String,
        taskLink: String,
      },
    ],
    mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "skillusers" }],
    domainRegistrations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "domainRegistrations" },
    ],
    discussionLink: String,
  },
  { strict: true, versionKey: false }
);

module.exports = Domains = mongoose.model("domains", DomainSchema);
