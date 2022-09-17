const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      required: true,
    },
    registrationNumber: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      required: true,
    },
    wing: [
      {
        type: String,
        enum: ["software", "robotics", "design"],
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
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member", "mentor"],
      default: "member",
    },
    zairzaMember: {
      type: Boolean,
      required: true,
    },
  },
  {
    strict: true,
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("skillusers", UserSchema);
