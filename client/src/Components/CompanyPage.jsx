import {
  Button,
  Col,
  Container,
  Form,
  FormGroup,
  Label,
  Row,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { updateUser } from "../Features/UserSlice";
import { deleteJob, getJobs, saveJob, updateJob } from "../Features/JobSlice";
import {
  getApplications,
  updateApplication,
} from "../Features/ApplicationSlice";
import ProfilePicture from "./ProfilePicture";
import Location from "./Location";

const emptyJob = {
  title: "",
  description: "",
  requirements: "",
  location: "",
  jobType: "Full Time",
  salary: "",
  applicantsNeeded: 1,
  isOpen: true,
};

const changesMessage = "Changes have been made.";
const noChangesMessage = "No changes have been made.";
const sameText = (firstValue, secondValue) =>
  (firstValue || "").toString().trim() ===
  (secondValue || "").toString().trim();

const CompanyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users.user);
  const jobs = useSelector((state) => state.jobs.jobs || []);
  const applications = useSelector(
    (state) => state.applications.applications || []
  );

  const [jobData, setjobData] = useState(emptyJob);
  const [editingJob, seteditingJob] = useState(null);
  const [applicationUpdates, setapplicationUpdates] = useState({});
  const [companyView, setcompanyView] = useState("jobs");
  const [companyData, setcompanyData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    location: "",
    contactNumber: "",
    latitude: "",
    longitude: "",
    place: "",
    country: "",
    accuracy: "",
  });

  useEffect(() => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    if (user.role !== "company") {
      navigate("/");
      return;
    }
    dispatch(getJobs(user._id));
    dispatch(getApplications({ companyId: user._id }));
    setcompanyData({
      fullName: user.fullName || "",
      email: user.email || "",
      companyName: user.companyName || "",
      location: user.location || "",
      contactNumber: user.contactNumber || "",
      latitude: user.latitude || "",
      longitude: user.longitude || "",
      place: user.place || "",
      country: user.country || "",
      accuracy: user.accuracy || "",
    });
    setjobData((currentData) => ({
      ...currentData,
      location: currentData.location || user.location || "",
    }));
  }, [dispatch, navigate, user]);

  const handleJobChange = (event) => {
    const { name, value, type, checked } = event.target;
    setjobData({
      ...jobData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setcompanyData({
      ...companyData,
      [name]: value,
    });
  };

  const handleCompanyLocationChange = (locationData) => {
    setcompanyData({
      ...companyData,
      ...locationData,
      location: locationData.location || companyData.location,
    });
  };

  const handleUpdateCompany = async (event) => {
    event.preventDefault();
    const companyUnchanged =
      sameText(companyData.fullName, user.fullName) &&
      sameText(companyData.email, user.email) &&
      sameText(companyData.companyName, user.companyName) &&
      sameText(companyData.location, user.location) &&
      sameText(companyData.contactNumber, user.contactNumber) &&
      sameText(companyData.latitude, user.latitude) &&
      sameText(companyData.longitude, user.longitude) &&
      sameText(companyData.place, user.place) &&
      sameText(companyData.country, user.country) &&
      sameText(companyData.accuracy, user.accuracy);

    if (companyUnchanged) {
      alert(noChangesMessage);
      return;
    }

    try {
      await dispatch(
        updateUser({
          ...user,
          ...companyData,
          latitude: companyData.latitude ? Number(companyData.latitude) : undefined,
          longitude: companyData.longitude
            ? Number(companyData.longitude)
            : undefined,
          accuracy: companyData.accuracy
            ? Number(companyData.accuracy)
            : undefined,
        })
      ).unwrap();
      setjobData({
        ...jobData,
        location: companyData.location,
      });
      alert(changesMessage);
    } catch (error) {
      console.log(error);
    }
  };

  const resetJobForm = () => {
    setjobData({ ...emptyJob, location: user.location || "" });
    seteditingJob(null);
  };

  const handleCancelEdit = () => {
    if (window.confirm("Are you sure you want to cancel?")) {
      resetJobForm();
    }
  };

  const handleSaveJob = async (event) => {
    event.preventDefault();
    if (!jobData.title.trim()) {
      alert("Job title is required.");
      return;
    }
    if (!jobData.description.trim()) {
      alert("Job description is required.");
      return;
    }
    if (!jobData.location.trim()) {
      alert("Job location is required.");
      return;
    }
    if (!Number.isInteger(Number(jobData.applicantsNeeded)) || Number(jobData.applicantsNeeded) < 1) {
      alert("Applicants needed must be at least 1.");
      return;
    }
    const payload = {
      ...jobData,
      companyId: user._id,
      salary: Number(jobData.salary || 0),
      applicantsNeeded: Number(jobData.applicantsNeeded || 1),
    };
    const jobUnchanged =
      editingJob &&
      sameText(jobData.title, editingJob.title) &&
      sameText(jobData.description, editingJob.description) &&
      sameText(jobData.requirements, editingJob.requirements) &&
      sameText(jobData.location, editingJob.location) &&
      sameText(jobData.jobType, editingJob.jobType) &&
      Number(jobData.salary || 0) === Number(editingJob.salary || 0) &&
      Number(jobData.applicantsNeeded || 1) ===
        Number(editingJob.applicantsNeeded || 1) &&
      Boolean(jobData.isOpen) === Boolean(editingJob.isOpen);

    if (jobUnchanged) {
      alert(noChangesMessage);
      return;
    }

    try {
      if (editingJob) {
        await dispatch(updateJob({ ...payload, _id: editingJob._id })).unwrap();
      } else {
        await dispatch(saveJob(payload)).unwrap();
      }
      resetJobForm();
      alert(changesMessage);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditJob = (job) => {
    seteditingJob(job);
    setjobData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || "",
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      applicantsNeeded: job.applicantsNeeded || 1,
      isOpen: job.isOpen,
    });
  };

  const handleToggleJobStatus = async (job) => {
    try {
      await dispatch(
        updateJob({
          ...job,
          isOpen: !job.isOpen,
        })
      ).unwrap();
      alert(changesMessage);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      dispatch(deleteJob(jobId));
    }
  };

  const setApplicationField = (applicationId, field, value) => {
    setapplicationUpdates({
      ...applicationUpdates,
      [applicationId]: {
        ...applicationUpdates[applicationId],
        [field]: value,
      },
    });
  };

  const getApplicationField = (application, field) => {
    if (applicationUpdates[application._id]?.[field] !== undefined) {
      return applicationUpdates[application._id][field];
    }
    if (field === "interviewDate" && application.interviewDate) {
      return moment(application.interviewDate).format("YYYY-MM-DD");
    }
    return application[field] || "";
  };

  const handleUpdateApplication = async (application) => {
    const updatedData = {
      ...application,
      ...applicationUpdates[application._id],
    };
    const nextStatus = updatedData.status || "";
    const nextInterviewDate =
      nextStatus === "Interview" && updatedData.interviewDate
        ? moment(updatedData.interviewDate).format("YYYY-MM-DD")
        : "";
    const nextInterviewTime =
      nextStatus === "Interview" ? updatedData.interviewTime || "" : "";
    const currentInterviewDate = application.interviewDate
      ? moment(application.interviewDate).format("YYYY-MM-DD")
      : "";
    const applicationUnchanged =
      sameText(nextStatus, application.status) &&
      sameText(nextInterviewDate, currentInterviewDate) &&
      sameText(nextInterviewTime, application.interviewTime);

    if (applicationUnchanged) {
      alert(noChangesMessage);
      return;
    }

    if (updatedData.status !== "Interview") {
      updatedData.interviewDate = "";
      updatedData.interviewTime = "";
    }
    try {
      await dispatch(updateApplication(updatedData)).unwrap();
      alert("Submitted to Applicant.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container fluid className="pageSection figmaDashboard">
      <Row className="dashboardHeader">
        <Col className="profileCircleCol">
          <ProfilePicture user={user} />
        </Col>
        <Col className="dashboardWelcome">
          <h1>Welcome, {user.companyName || "Company"}</h1>
          <div className="figmaLine"></div>
        </Col>
        <Col className="addButtonCol">
          <div className="headerActionButtons">
          <Button
            color="primary"
            className="addApplicationButton"
            form={companyView === "jobs" && !editingJob ? "jobForm" : undefined}
            type={companyView === "jobs" && !editingJob ? "submit" : "button"}
            onClick={() => {
              if (companyView !== "jobs") {
                setcompanyView("jobs");
                return;
              }
              if (editingJob) {
                resetJobForm();
              }
            }}
          >
            + Add Application
          </Button>
          </div>
        </Col>
      </Row>

      <Row className="dashboardTabs">
        <Col>
          <button
            type="button"
            className={companyView === "profile" ? "activeTab" : ""}
            onClick={() => setcompanyView("profile")}
          >
            Update Company
          </button>
          <button
            type="button"
            className={companyView === "jobs" ? "activeTab" : ""}
            onClick={() => setcompanyView("jobs")}
          >
            Job Posting
          </button>
          <button
            type="button"
            className={companyView === "applicants" ? "activeTab" : ""}
            onClick={() => setcompanyView("applicants")}
          >
            Applicants
          </button>
        </Col>
      </Row>

      {companyView !== "applicants" && (
        <Row className="companyDesignArea">
          <Col>
          {companyView === "profile" && (
          <Form className="figmaUpdateForm companyUpdateForm" onSubmit={handleUpdateCompany}>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="companyFullName">Contact Name</Label>
                  <input
                    id="companyFullName"
                    name="fullName"
                    className="figmaInput"
                    value={companyData.fullName}
                    onChange={handleCompanyChange}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="companyEmail">Contact Email</Label>
                  <input
                    id="companyEmail"
                    name="email"
                    type="email"
                    className="figmaInput"
                    value={companyData.email}
                    onChange={handleCompanyChange}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="companyName">Company Name</Label>
                  <input
                    id="companyName"
                    name="companyName"
                    className="figmaInput"
                    value={companyData.companyName}
                    onChange={handleCompanyChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Location
                  latitude={companyData.latitude}
                  longitude={companyData.longitude}
                  place={companyData.place}
                  country={companyData.country}
                  accuracy={companyData.accuracy}
                  onLocationChange={handleCompanyLocationChange}
                />
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="companyContactNumber">Contact Information</Label>
                  <input
                    id="companyContactNumber"
                    name="contactNumber"
                    className="figmaInput"
                    value={companyData.contactNumber}
                    onChange={handleCompanyChange}
                  />
                </FormGroup>
              </Col>
              <Col md={4} className="updateButtonCol">
                <Button color="primary" className="figmaSubmit" type="submit">
                  Save Company
                </Button>
              </Col>
            </Row>
          </Form>
          )}

          {companyView === "jobs" && (
          <Form id="jobForm" onSubmit={handleSaveJob}>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Company Name</Label>
                  <div className="figmaLineInput">
                    {companyData.companyName || user.companyName}
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label for="title">Position</Label>
                  <input
                    id="title"
                    name="title"
                    className="figmaInput"
                    value={jobData.title}
                    onChange={handleJobChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="location">Location</Label>
                  <input
                    id="location"
                    name="location"
                    className="figmaInput"
                    value={jobData.location}
                    onChange={handleJobChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="salary">Salary Range</Label>
                  <input
                    id="salary"
                    name="salary"
                    type="number"
                    className="figmaInput"
                    value={jobData.salary}
                    onChange={handleJobChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="applicantsNeeded">Applicants Needed</Label>
                  <input
                    id="applicantsNeeded"
                    name="applicantsNeeded"
                    type="number"
                    min="1"
                    className="figmaInput"
                    value={jobData.applicantsNeeded}
                    onChange={handleJobChange}
                  />
                </FormGroup>
              </Col>

              <Col md={8}>
                <Row>
                  <Col md={5}>
                    <FormGroup>
                      <Label>Application Date</Label>
                      <div className="figmaLineInput">
                        {moment().format("DD/MM/YYYY")}
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md={7}>
                    <FormGroup>
                      <Label>Contact Information</Label>
                      <div className="figmaLineInput">
                        {companyData.contactNumber || "92874721"}
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={5}>
                    <FormGroup>
                      <Label>Contact Name</Label>
                      <div className="figmaLineInput">{companyData.fullName}</div>
                    </FormGroup>
                  </Col>
                  <Col md={7}>
                    <FormGroup>
                      <Label>Contact Email</Label>
                      <div className="figmaLineInput">{companyData.email}</div>
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    className="figmaInput descriptionLine"
                    value={jobData.description}
                    onChange={handleJobChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <div className="hiddenJobFields">
              <FormGroup>
                <textarea
                  id="requirements"
                  name="requirements"
                  className="form-control"
                  value={jobData.requirements}
                  onChange={handleJobChange}
                />
              </FormGroup>
              <select
                id="jobType"
                name="jobType"
                value={jobData.jobType}
                onChange={handleJobChange}
              >
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Internship</option>
              </select>
              <input
                id="isOpen"
                name="isOpen"
                type="checkbox"
                checked={jobData.isOpen}
                onChange={handleJobChange}
              />
            </div>
            {editingJob && (
              <div className="companyFormButtons editCompanyFormButtons">
                <Button
                  color="success"
                  className="saveChangesButton"
                  type="submit"
                >
                  Save Changes
                </Button>
                <Button
                  color="secondary"
                  outline
                  type="button"
                  className="cancelEditButton"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </Button>
              </div>
            )}
          </Form>
          )}
          </Col>
        </Row>
      )}

      {companyView === "jobs" && (
        <>
          <Row className="jobListTitle">
            <Col>Job List</Col>
          </Row>
          <Row className="figmaCardGrid companyJobs">
            {jobs.length === 0 && (
              <Col>
                <p className="emptyListText">
                  No jobs added yet.
                </p>
              </Col>
            )}
            {jobs.map((job) => {
              const applicationsCount = Number(job.applicationsCount || 0);
              const applicantsNeeded = Number(job.applicantsNeeded || 1);
              const jobFull = applicationsCount >= applicantsNeeded;

              return (
                <Col md={3} key={job._id}>
                  <div className="figmaJobCard">
                    <div className="figmaJobTitle">{job.title}</div>
                    <div className="figmaCardButton">
                      {jobFull ? "Full" : job.isOpen ? "Open" : "Closed"}
                    </div>
                    <p className="applicationStatusText">
                      Applicants: {applicationsCount}/{applicantsNeeded}
                    </p>
                    <div className="miniActions">
                      <Button
                        color="secondary"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        color={job.isOpen ? "warning" : "success"}
                        size="sm"
                        onClick={() => handleToggleJobStatus(job)}
                      >
                        {job.isOpen ? "Close" : "Open"}
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      {companyView === "applicants" && (
        <Row className="figmaCardGrid applicantCards">
          {applications.map((application) => (
            <Col md={3} key={application._id}>
              <div className="figmaJobCard userCard">
                <div className="figmaJobTitle">{application.applicantName}</div>
                <p>{application.jobTitle}</p>
                <select
                  className="form-control"
                  value={getApplicationField(application, "status")}
                  onChange={(e) =>
                    setApplicationField(application._id, "status", e.target.value)
                  }
                >
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                </select>
                <input
                  className="form-control"
                  type="date"
                  value={getApplicationField(application, "interviewDate")}
                  onChange={(e) =>
                    setApplicationField(
                      application._id,
                      "interviewDate",
                      e.target.value
                    )
                  }
                />
                <input
                  className="form-control"
                  type="time"
                  value={getApplicationField(application, "interviewTime")}
                  onChange={(e) =>
                    setApplicationField(
                      application._id,
                      "interviewTime",
                      e.target.value
                    )
                  }
                />
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => handleUpdateApplication(application)}
                >
                  Update
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CompanyPage;
