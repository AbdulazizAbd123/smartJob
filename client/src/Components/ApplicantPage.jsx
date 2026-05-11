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
import { getJobs } from "../Features/JobSlice";
import { applyJob, getApplications } from "../Features/ApplicationSlice";
import ProfilePicture from "./ProfilePicture";
import LocationControl from "./LocationControl";

const sameText = (firstValue, secondValue) =>
  (firstValue || "").toString().trim() ===
  (secondValue || "").toString().trim();

const ApplicantPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users.user);
  const jobs = useSelector((state) => state.jobs.jobs || []);
  const applications = useSelector(
    (state) => state.applications.applications || []
  );
  const [profileData, setprofileData] = useState({
    fullName: "",
    email: "",
    age: "",
    phoneNumber: "",
    experience: "",
    location: "",
    latitude: "",
    longitude: "",
  });
  const [applicantView, setapplicantView] = useState("available");

  useEffect(() => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    if (user.role !== "applicant") {
      navigate("/");
      return;
    }
    dispatch(getJobs());
    dispatch(getApplications({ applicantId: user._id }));
    const statusRefresh = setInterval(() => {
      dispatch(getApplications({ applicantId: user._id }));
    }, 15000);
    setprofileData({
      fullName: user.fullName || "",
      email: user.email || "",
      age: user.age || "",
      phoneNumber: user.phoneNumber || "",
      experience: user.experience || "",
      location: user.location || "",
      latitude: user.latitude || "",
      longitude: user.longitude || "",
    });

    return () => clearInterval(statusRefresh);
  }, [dispatch, navigate, user]);

  const appliedJobIds = applications.map((application) => application.jobId);
  const companyUpdates = applications.filter(
    (application) => application.status && application.status !== "Applied"
  );

  const formatInterviewTime = (interviewTime) => {
    if (!interviewTime) return "";
    const timeValue = moment(interviewTime, "HH:mm", true);
    if (timeValue.isValid()) {
      return timeValue.format("hh:mm A");
    }
    const readableTime = moment(interviewTime, "hh:mm A", true);
    if (readableTime.isValid()) {
      return readableTime.format("hh:mm A");
    }
    return interviewTime;
  };

  const getApplicationStatusText = (application) => {
    if (!application.status || application.status === "Applied") {
      return "Applied";
    }
    if (application.status === "Interview" && application.interviewDate) {
      const interviewTime = formatInterviewTime(application.interviewTime);
      return `Interview ${moment(application.interviewDate).format("DD MMM")}${
        interviewTime ? ` ${interviewTime}` : ""
      }`;
    }
    return application.status;
  };

  const getJobApplicationsText = (job) => {
    const applicationsCount = Number(job.applicationsCount || 0);
    const applicantsNeeded = Number(job.applicantsNeeded || 1);
    return `${applicationsCount}/${applicantsNeeded}`;
  };

  const isJobFull = (job) =>
    Number(job.applicationsCount || 0) >= Number(job.applicantsNeeded || 1);

  const handleApply = async (jobId) => {
    const applicationData = {
      applicantId: user._id,
      jobId,
    };
    try {
      await dispatch(applyJob(applicationData)).unwrap();
      alert("Application submitted.");
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setprofileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleProfileLocationChange = ({ latitude, longitude }) => {
    setprofileData({
      ...profileData,
      latitude,
      longitude,
    });
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const profileUnchanged =
      sameText(profileData.fullName, user.fullName) &&
      sameText(profileData.email, user.email) &&
      Number(profileData.age || 0) === Number(user.age || 0) &&
      sameText(profileData.phoneNumber, user.phoneNumber) &&
      Number(profileData.experience || 0) === Number(user.experience || 0) &&
      sameText(profileData.location, user.location) &&
      sameText(profileData.latitude, user.latitude) &&
      sameText(profileData.longitude, user.longitude);

    if (profileUnchanged) {
      alert("No changes have been made.");
      return;
    }

    try {
      await dispatch(
        updateUser({
          ...user,
          ...profileData,
          age: Number(profileData.age),
          experience: Number(profileData.experience),
          latitude: profileData.latitude ? Number(profileData.latitude) : undefined,
          longitude: profileData.longitude
            ? Number(profileData.longitude)
            : undefined,
        })
      ).unwrap();
      alert("Changes have been made.");
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
          <h1>Welcome, {user.fullName || "Applicant"}</h1>
          <div className="figmaLine"></div>
        </Col>
      </Row>
      <Row className="dashboardTabs">
        <Col>
          <button
            type="button"
            className={applicantView === "profile" ? "activeTab" : ""}
            onClick={() => setapplicantView("profile")}
          >
            Update Profile
          </button>
          <button
            type="button"
            className={applicantView === "applied" ? "activeTab" : ""}
            onClick={() => setapplicantView("applied")}
          >
            Job Applied
          </button>
          <button
            type="button"
            className={applicantView === "available" ? "activeTab" : ""}
            onClick={() => setapplicantView("available")}
          >
            Job Available
          </button>
        </Col>
      </Row>

      {companyUpdates.length > 0 && (
        <Row className="applicantStatusNotice">
          <Col>
            <strong>Company Updates:</strong>{" "}
            {companyUpdates
              .map(
                (application) =>
                  `${application.jobTitle} - ${getApplicationStatusText(
                    application
                  )}`
              )
              .join(" | ")}
          </Col>
        </Row>
      )}

      {applicantView === "profile" && (
        <Row className="updateProfileArea">
          <Col>
            <Form className="figmaUpdateForm" onSubmit={handleUpdateProfile}>
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label for="applicantFullName">Full Name</Label>
                    <input
                      id="applicantFullName"
                      name="fullName"
                      className="figmaInput"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="applicantEmail">Email</Label>
                    <input
                      id="applicantEmail"
                      name="email"
                      type="email"
                      className="figmaInput"
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="applicantAge">Age</Label>
                    <input
                      id="applicantAge"
                      name="age"
                      type="number"
                      className="figmaInput"
                      value={profileData.age}
                      onChange={handleProfileChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label for="applicantPhone">Phone Number</Label>
                    <input
                      id="applicantPhone"
                      name="phoneNumber"
                      className="figmaInput"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="applicantExperience">Experience</Label>
                    <input
                      id="applicantExperience"
                      name="experience"
                      type="number"
                      className="figmaInput"
                      value={profileData.experience}
                      onChange={handleProfileChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="applicantLocation">Location</Label>
                    <input
                      id="applicantLocation"
                      name="location"
                      className="figmaInput"
                      value={profileData.location}
                      onChange={handleProfileChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={8}>
                  <LocationControl
                    latitude={profileData.latitude}
                    longitude={profileData.longitude}
                    onLocationChange={handleProfileLocationChange}
                  />
                </Col>
                <Col md={4} className="updateButtonCol">
                  <Button color="primary" className="figmaSubmit" type="submit">
                    Save Applicant
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      )}

      {applicantView === "available" && (
        <Row className="figmaCardGrid">
          {jobs
            .filter((job) => job.isOpen)
            .map((job) => {
              const jobFull = isJobFull(job);
              const alreadyApplied = appliedJobIds.includes(job._id);

              return (
                <Col md={3} key={job._id}>
                  <div className="figmaJobCard">
                    <div className="figmaJobTitle">{job.title}</div>
                    <Button
                      color="primary"
                      className="figmaCardButton"
                      disabled={alreadyApplied || jobFull}
                      onClick={() => handleApply(job._id)}
                    >
                      {alreadyApplied ? "Applied" : jobFull ? "Full" : "Apply"}
                    </Button>
                    <p className="applicationStatusText">
                      Applicants: {getJobApplicationsText(job)}
                    </p>
                  </div>
                </Col>
              );
            })}
        </Row>
      )}

      {applicantView === "applied" && (
        <Row className="figmaCardGrid appliedGrid">
          {applications.map((application) => (
            <Col md={3} key={application._id}>
              <div className="figmaJobCard">
                <div className="figmaJobTitle">{application.jobTitle}</div>
                <div className="figmaCardButton">
                  {getApplicationStatusText(application)}
                </div>
                {(!application.status || application.status === "Applied") && (
                  <p className="applicationStatusText">
                    Waiting for company response
                  </p>
                )}
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ApplicantPage;
