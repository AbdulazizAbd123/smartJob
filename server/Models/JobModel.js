import mongoose from "mongoose";

const JobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      default: "Full Time",
    },
    salary: {
      type: Number,
      default: 0,
    },
    applicantsNeeded: {
      type: Number,
      default: 1,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobModel = mongoose.model("jobs", JobSchema);
export default JobModel;
