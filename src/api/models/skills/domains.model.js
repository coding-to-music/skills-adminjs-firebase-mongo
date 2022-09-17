const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema(
	{
		adminName: {
			type: String,
			required: true,
		},
		domainName: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		tasks: [
			{
				weekNo: Number,
				resourceLink: String,
				taskLink: String,
			},
		],
		mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "skillusers" }],
		discussionLink: String,
	},
	{ strict: true, versionKey: false }
);

module.exports = Domains = mongoose.model("domains", DomainSchema);
