import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["applicant", "company", "admin"],
      default: "applicant",
    },
    age: {
      type: Number,
    },
    phoneNumber: {
      type: String,
    },
    experience: {
      type: Number,
    },
    companyName: {
      type: String,
    },
    location: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    place: {
      type: String,
    },
    country: {
      type: String,
    },
    accuracy: {
      type: Number,
    },
    profileImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", UserSchema);
export default UserModel;
