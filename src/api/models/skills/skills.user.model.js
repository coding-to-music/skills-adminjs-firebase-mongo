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
		phoneNumber: {
			type: String,
		},
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
		role: {
			type: String,
			enum: ["admin", "member", "mentor"],
			default: "member",
		},
		zairzaMember: {
			type: String,
			enum: ["member", "notMember"],
		},
	},
	{
		strict: true,
		versionKey: false,
		timestamps: true,
	}
);

module.exports = mongoose.model("skillusers", UserSchema);
