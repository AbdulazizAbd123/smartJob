import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";

import UserModel from "./Models/UserModel.js";
import JobModel from "./Models/JobModel.js";
import ApplicationModel from "./Models/ApplicationModel.js";

import * as ENV from "./config.js";

const app = express();

//Middleware
const corsOptions = {
  origin: ENV.CLIENT_URL || "http://localhost:3000", //client URL local
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));
app.use(express.json());

//Database connection
const connectString =
  ENV.MONGO_URL ||
  `mongodb+srv://${ENV.DB_USER}:${ENV.DB_PASSWORD}@${ENV.DB_CLUSTER}/${ENV.DB_NAME}?appName=Cluster0`;

const removePassword = (user) => {
  const safeUser = user.toObject ? user.toObject() : user;
  delete safeUser.password;
  return safeUser;
};

const isEmpty = (value) => !value || value.toString().trim() === "";

const validateUserData = (data, isUpdate = false) => {
  const errors = [];
  const role = data.role || "applicant";

  if (!isUpdate || data.fullName !== undefined) {
    if (isEmpty(data.fullName)) errors.push("Full name is required.");
  }
  if (!isUpdate || data.email !== undefined) {
    if (isEmpty(data.email)) errors.push("Email is required.");
  }
  if (!isUpdate || data.password !== undefined) {
    if (!isUpdate && isEmpty(data.password)) errors.push("Password is required.");
    if (data.password && data.password.length < 4) {
      errors.push("Password must be at least 4 characters.");
    }
  }

  if (!["applicant", "company", "admin"].includes(role)) {
    errors.push("Invalid user role.");
  }

  if (role === "applicant") {
    const age = Number(data.age);
    const experience = Number(data.experience);
    if (!isUpdate || data.age !== undefined) {
      if (!Number.isInteger(age) || age < 18 || age > 70) {
        errors.push("Applicant age must be between 18 and 70.");
      }
    }
    if (!isUpdate || data.phoneNumber !== undefined) {
      if (isEmpty(data.phoneNumber)) errors.push("Phone number is required.");
    }
    if (!isUpdate || data.experience !== undefined) {
      if (!Number.isFinite(experience) || experience < 0) {
        errors.push("Experience must be zero or more.");
      }
    }
  }

  if (role === "company") {
    if (!isUpdate || data.companyName !== undefined) {
      if (isEmpty(data.companyName)) errors.push("Company name is required.");
    }
    if (!isUpdate || data.location !== undefined) {
      if (isEmpty(data.location)) errors.push("Location is required.");
    }
    if (!isUpdate || data.contactNumber !== undefined) {
      if (isEmpty(data.contactNumber)) errors.push("Contact number is required.");
    }
  }

  return errors;
};

const validateJobData = (data) => {
  const errors = [];
  if (isEmpty(data.title)) errors.push("Job title is required.");
  if (isEmpty(data.description)) errors.push("Job description is required.");
  if (isEmpty(data.companyId)) errors.push("Company is required.");
  if (isEmpty(data.location)) errors.push("Job location is required.");
  if (data.salary !== undefined && data.salary !== "" && Number(data.salary) < 0) {
    errors.push("Salary must be zero or more.");
  }
  const applicantsNeeded = Number(data.applicantsNeeded || 1);
  if (!Number.isInteger(applicantsNeeded) || applicantsNeeded < 1) {
    errors.push("Applicants needed must be at least 1.");
  }
  return errors;
};

const validateInterview = (interviewDate) => {
  if (!interviewDate) return "";
  const dateValue = new Date(interviewDate);
  if (Number.isNaN(dateValue.getTime())) return "Interview date is invalid.";
  return "";
};

const addJobApplicationCounts = async (jobs) => {
  return Promise.all(
    jobs.map(async (job) => {
      const jobData = job.toObject ? job.toObject() : job;
      const applicationsCount = await ApplicationModel.countDocuments({
        jobId: jobData._id,
      });
      const applicantsNeeded = Number(jobData.applicantsNeeded || 1);
      return {
        ...jobData,
        applicantsNeeded,
        applicationsCount,
        isFull: applicationsCount >= applicantsNeeded,
      };
    })
  );
};

const seedDatabase = async () => {
  const password = await bcrypt.hash("12345", 10);
  const demoUsers = [
    {
      fullName: "System Admin",
      email: "admin@smartjobs.com",
      password,
      role: "admin",
      isActive: true,
    },
    {
      fullName: "Oman Tech HR",
      companyName: "Oman Tech",
      email: "company1@smartjobs.com",
      password,
      role: "company",
      location: "Muscat",
      contactNumber: "91110001",
      latitude: 23.588,
      longitude: 58.3829,
      isActive: true,
    },
    {
      fullName: "Future Systems HR",
      companyName: "Future Systems",
      email: "company2@smartjobs.com",
      password,
      role: "company",
      location: "Sohar",
      contactNumber: "91110002",
      latitude: 24.342,
      longitude: 56.7299,
      isActive: true,
    },
    {
      fullName: "Abdulaziz Abdullah Alshehhi",
      email: "abdulaziz@applicant.com",
      password,
      role: "applicant",
      age: 22,
      phoneNumber: "92220001",
      experience: 1,
      isActive: true,
    },
    {
      fullName: "Yousef Albarami",
      email: "yousef@applicant.com",
      password,
      role: "applicant",
      age: 23,
      phoneNumber: "92220002",
      experience: 2,
      isActive: true,
    },
    {
      fullName: "Mariam Al Raisi",
      email: "mariam@applicant.com",
      password,
      role: "applicant",
      age: 24,
      phoneNumber: "92220003",
      experience: 3,
      isActive: true,
    },
  ];

  for (const demoUser of demoUsers) {
    await UserModel.findOneAndUpdate(
      { email: demoUser.email },
      demoUser,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const jobsCount = await JobModel.countDocuments({});
  if (jobsCount === 0) {
    const companies = await UserModel.find({ role: "company" });
    const companyOne = companies[0];
    const companyTwo = companies[1] || companies[0];
    await JobModel.insertMany([
      {
        title: "Frontend Developer",
        description: "Build React interfaces for company dashboards.",
        requirements: "React, Bootstrap, basic API knowledge",
        companyId: companyOne._id,
        companyName: companyOne.companyName,
        location: companyOne.location,
        jobType: "Full Time",
        salary: 650,
        applicantsNeeded: 3,
        isOpen: true,
      },
      {
        title: "Backend Developer",
        description: "Develop Express and MongoDB services.",
        requirements: "Node.js, Express, MongoDB",
        companyId: companyOne._id,
        companyName: companyOne.companyName,
        location: companyOne.location,
        jobType: "Full Time",
        salary: 750,
        applicantsNeeded: 2,
        isOpen: true,
      },
      {
        title: "UI Designer",
        description: "Prepare clear screens for job tracking features.",
        requirements: "Figma, usability, Bootstrap knowledge",
        companyId: companyTwo._id,
        companyName: companyTwo.companyName,
        location: companyTwo.location,
        jobType: "Part Time",
        salary: 400,
        applicantsNeeded: 2,
        isOpen: true,
      },
      {
        title: "QA Tester",
        description: "Test user registration, login, jobs, and applications.",
        requirements: "Testing basics and documentation",
        companyId: companyTwo._id,
        companyName: companyTwo.companyName,
        location: companyTwo.location,
        jobType: "Internship",
        salary: 250,
        applicantsNeeded: 4,
        isOpen: true,
      },
      {
        title: "IT Support Officer",
        description: "Support company staff and troubleshoot systems.",
        requirements: "Networking basics and communication skills",
        companyId: companyOne._id,
        companyName: companyOne.companyName,
        location: companyOne.location,
        jobType: "Full Time",
        salary: 500,
        applicantsNeeded: 1,
        isOpen: false,
      },
    ]);
  }

  const applicationsCount = await ApplicationModel.countDocuments({});
  if (applicationsCount === 0) {
    const applicants = await UserModel.find({ role: "applicant" });
    const jobs = await JobModel.find({});
    const applications = jobs.slice(0, 5).map((job, index) => ({
      applicantId: applicants[index % applicants.length]._id,
      applicantName: applicants[index % applicants.length].fullName,
      companyId: job.companyId,
      jobId: job._id,
      jobTitle: job.title,
      status: index === 1 ? "Interview" : "Applied",
      interviewDate:
        index === 1 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
      interviewTime: index === 1 ? "10:00" : "",
      notes: "Seed application for demonstration.",
    }));
    await ApplicationModel.insertMany(applications);
  }
};

mongoose
  .connect(connectString)
  .then(async () => {
    console.log("✅ MongoDB connected successfully!");
    await seedDatabase();
    console.log("✅ Demo data checked successfully!");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

//api for saving data from register component to the users collection
app.post("/registerUser", async (req, res) => {
  try {
    const role = req.body.role || "applicant";
    if (role === "admin") {
      return res.status(403).json({ error: "Admin account is created by seed data." });
    }

    const errors = validateUserData({ ...req.body, role });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const user = new UserModel({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedpassword,
      role,
      age: req.body.age,
      phoneNumber: req.body.phoneNumber,
      experience: req.body.experience,
      companyName: req.body.companyName,
      location: req.body.location,
      contactNumber: req.body.contactNumber,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });
    await user.save();
    res.send({ user: removePassword(user), msg: "Added." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//api for login
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(500).json({ error: "User not found." });
    }
    if (user.isActive === false) {
      return res.status(401).json({ error: "User account is inactive." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    res.status(200).json({ user: removePassword(user), message: "Success." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//api for logout
app.post("/logout", async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

//GET API - getUsers for Admin
app.get("/getUsers", async (req, res) => {
  try {
    const users = await UserModel.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.send({ users: users });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//PUT API - update user
app.put("/updateUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const nextData = {
      ...existingUser.toObject(),
      ...req.body,
      role: req.body.role || existingUser.role,
    };
    const errors = validateUserData(nextData, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");
    res.json({ user: updatedUser, msg: "Updated." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//DELETE API - delete user
app.delete("/deleteUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    await UserModel.findByIdAndDelete(userId);
    await ApplicationModel.deleteMany({
      $or: [{ applicantId: userId }, { companyId: userId }],
    });
    await JobModel.deleteMany({ companyId: userId });
    res.json({ msg: "Deleted." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//POST API - saveJob
app.post("/saveJob", async (req, res) => {
  try {
    const errors = validateJobData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const company = await UserModel.findById(req.body.companyId);
    if (!company || company.role !== "company") {
      return res.status(400).json({ error: "Company account is required." });
    }

    const job = new JobModel({
      title: req.body.title,
      description: req.body.description,
      requirements: req.body.requirements,
      companyId: company._id,
      companyName: company.companyName || company.fullName || "Company",
      location: req.body.location,
      jobType: req.body.jobType,
      salary: req.body.salary || 0,
      applicantsNeeded: Number(req.body.applicantsNeeded || 1),
      isOpen: req.body.isOpen !== undefined ? req.body.isOpen : true,
    });
    await job.save();
    const jobWithCount = (await addJobApplicationCounts([job]))[0];
    res.send({ job: jobWithCount, msg: "Added." });
  } catch (error) {
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

//GET API - getJobs
app.get("/getJobs", async (req, res) => {
  try {
    const filter = {};
    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }
    const jobs = await JobModel.find(filter).sort({ createdAt: -1 });
    const jobsWithCounts = await addJobApplicationCounts(jobs);
    const countJob = await JobModel.countDocuments(filter);
    res.send({ jobs: jobsWithCounts, count: countJob });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//PUT API - updateJob
app.put("/updateJob/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const existingJob = await JobModel.findById(jobId);
    if (!existingJob) {
      return res.status(404).json({ error: "Job not found." });
    }

    const errors = validateJobData({ ...existingJob.toObject(), ...req.body });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }
    const currentApplicationsCount = await ApplicationModel.countDocuments({
      jobId: jobId,
    });
    const applicantsNeeded = Number(
      req.body.applicantsNeeded || existingJob.applicantsNeeded || 1
    );
    if (applicantsNeeded < currentApplicationsCount) {
      return res.status(400).json({
        error: "Applicants needed cannot be less than current applications.",
      });
    }

    const updatedJob = await JobModel.findByIdAndUpdate(jobId, req.body, {
      new: true,
    });
    const jobWithCount = (await addJobApplicationCounts([updatedJob]))[0];
    res.json({ job: jobWithCount, msg: "Updated." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//DELETE API - deleteJob
app.delete("/deleteJob/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    await JobModel.findByIdAndDelete(jobId);
    await ApplicationModel.deleteMany({ jobId: jobId });
    res.json({ msg: "Deleted." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//POST API - applyJob
app.post("/applyJob", async (req, res) => {
  try {
    const applicant = await UserModel.findById(req.body.applicantId);
    const job = await JobModel.findById(req.body.jobId);

    if (!applicant || applicant.role !== "applicant") {
      return res.status(400).json({ error: "Applicant account is required." });
    }
    if (!job || !job.isOpen) {
      return res.status(400).json({ error: "Open job is required." });
    }

    const existingApplication = await ApplicationModel.findOne({
      applicantId: applicant._id,
      jobId: job._id,
    });
    if (existingApplication) {
      return res.status(400).json({ error: "You already applied for this job." });
    }
    const applicationsCount = await ApplicationModel.countDocuments({
      jobId: job._id,
    });
    const applicantsNeeded = Number(job.applicantsNeeded || 1);
    if (applicationsCount >= applicantsNeeded) {
      return res.status(400).json({
        error: "This job is full. No more applicants can apply.",
      });
    }

    const application = new ApplicationModel({
      applicantId: applicant._id,
      applicantName: applicant.fullName,
      companyId: job.companyId,
      jobId: job._id,
      jobTitle: job.title,
      status: "Applied",
    });
    await application.save();
    res.send({ application: application, msg: "Added." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//GET API - getApplications
app.get("/getApplications", async (req, res) => {
  try {
    const filter = {};
    if (req.query.applicantId) {
      filter.applicantId = req.query.applicantId;
    }
    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }
    const applications = await ApplicationModel.find(filter).sort({
      appliedDate: -1,
    });
    res.send({ applications: applications });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//PUT API - updateApplication
app.put("/updateApplication/:applicationId", async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const interviewError = validateInterview(req.body.interviewDate);
    if (interviewError) {
      return res.status(400).json({ error: interviewError });
    }

    const updatedData = { ...req.body };
    if (updatedData.status !== "Interview") {
      updatedData.interviewDate = null;
      updatedData.interviewTime = "";
    }

    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      updatedData,
      { new: true }
    );
    res.json({ application: updatedApplication, msg: "Updated." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//DELETE API - deleteApplication
app.delete("/deleteApplication/:applicationId", async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    await ApplicationModel.findByIdAndDelete(applicationId);
    res.json({ msg: "Deleted." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = ENV.PORT || 3001;
app.listen(port, () => {
  console.log(`You are connected at port: ${port}`);
});
