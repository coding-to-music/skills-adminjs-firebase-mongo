const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		firebaseUid: {
			type: String,
			unique: true,
			index: true,
		},
		name: {
			type: String,
		},
		profileImage: {
			type: String,
		},
		phoneNumber: {
			type: String,
		},
		skills: [String],
		email: {
			type: String,
			unique: true,
			sparse: true,
		},
		registrationNumber: {
			type: String,
			index: true,
			unique: true,
			sparse: true,
		},
		wing: [
			{
				type: String,
				enum: ["Software", "Robotics", "Design"],
			},
		],
		branch: {
			type: String,
			enum: [
				"Computer Science & Engineering",
				"Information Technology",
				"Electrical Engineering",
				"Mechanical Engineering",
				"Electronics & Instrumentation Engineering",
				"Biotechnology",
				"Civil Engineering",
				"Textile Engineering",
				"Fashion & Apparel Technology",
				"Architecture",
				"Computer Science & Application",
				"Planning",
				"Mathematics & Humanities",
				"Physics",
				"Chemistry",
			],
		},
		newsletterSubscription: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: ["admin", "member", "nonMember"],
			required: true,
			default: "nonMember",
		},
	},
	{
		strict: true,
		versionKey: false,
		timestamps: true,
	}
);

module.exports = mongoose.model("users", UserSchema);
