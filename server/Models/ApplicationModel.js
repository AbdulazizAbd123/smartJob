import mongoose from "mongoose";

const ApplicationSchema = mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "jobs",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Accepted", "Rejected"],
      default: "Applied",
    },
    interviewDate: {
      type: Date,
    },
    interviewTime: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "appliedDate",
      updatedAt: true,
    },
  }
);

const ApplicationModel = mongoose.model("applications", ApplicationSchema);
export default ApplicationModel;
