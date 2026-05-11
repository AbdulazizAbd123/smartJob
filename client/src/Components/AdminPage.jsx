import { Button, Col, Container, Form, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteUser, getUsers, updateUser } from "../Features/UserSlice";
import ProfilePicture from "./ProfilePicture";
import Location from "./Location";

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users.user);
  const users = useSelector((state) => state.users.users || []);
  const [adminView, setadminView] = useState("applicants");
  const [adminLocation, setadminLocation] = useState({
    location: "",
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
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    dispatch(getUsers());
    setadminLocation({
      location: user.location || "",
      latitude: user.latitude || "",
      longitude: user.longitude || "",
      place: user.place || "",
      country: user.country || "",
      accuracy: user.accuracy || "",
    });
  }, [dispatch, navigate, user]);

  const handleToggleActive = async (selectedUser) => {
    try {
      await dispatch(
        updateUser({
          ...selectedUser,
          isActive: selectedUser.isActive === false,
        })
      ).unwrap();
      alert("Changes have been made.");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      dispatch(deleteUser(userId));
    }
  };

  const handleAdminLocationChange = (locationData) => {
    setadminLocation({
      ...adminLocation,
      ...locationData,
      location: locationData.location || adminLocation.location,
    });
  };

  const handleSaveAdminLocation = async (event) => {
    event.preventDefault();
    const locationUnchanged =
      (adminLocation.location || "") === (user.location || "") &&
      (adminLocation.latitude || "").toString() ===
        (user.latitude || "").toString() &&
      (adminLocation.longitude || "").toString() ===
        (user.longitude || "").toString() &&
      (adminLocation.place || "") === (user.place || "") &&
      (adminLocation.country || "") === (user.country || "") &&
      (adminLocation.accuracy || "").toString() ===
        (user.accuracy || "").toString();

    if (locationUnchanged) {
      alert("No changes have been made.");
      return;
    }

    try {
      await dispatch(
        updateUser({
          ...user,
          location: adminLocation.location,
          latitude: adminLocation.latitude
            ? Number(adminLocation.latitude)
            : undefined,
          longitude: adminLocation.longitude
            ? Number(adminLocation.longitude)
            : undefined,
          place: adminLocation.place,
          country: adminLocation.country,
          accuracy: adminLocation.accuracy
            ? Number(adminLocation.accuracy)
            : undefined,
        })
      ).unwrap();
      alert("Changes have been made.");
    } catch (error) {
      console.log(error);
    }
  };

  const visibleUsers = users.filter((selectedUser) =>
    adminView === "companies"
      ? selectedUser.role === "company"
      : selectedUser.role === "applicant"
  );

  return (
    <Container fluid className="pageSection figmaDashboard">
      <Row className="dashboardHeader">
        <Col className="profileCircleCol">
          <ProfilePicture user={user} />
        </Col>
        <Col className="dashboardWelcome">
          <h1>Welcome, Admin</h1>
          <div className="figmaLine"></div>
        </Col>
      </Row>
      <Row className="dashboardTabs">
        <Col>
          <button
            type="button"
            className={adminView === "applicants" ? "activeTab" : ""}
            onClick={() => setadminView("applicants")}
          >
            Applicants
          </button>
          <button
            type="button"
            className={adminView === "companies" ? "activeTab" : ""}
            onClick={() => setadminView("companies")}
          >
            Companies
          </button>
        </Col>
      </Row>

      <Row className="updateProfileArea adminLocationArea">
        <Col>
          <Form className="figmaUpdateForm" onSubmit={handleSaveAdminLocation}>
            <Row>
              <Col md={9}>
                <Location
                  latitude={adminLocation.latitude}
                  longitude={adminLocation.longitude}
                  place={adminLocation.place}
                  country={adminLocation.country}
                  accuracy={adminLocation.accuracy}
                  onLocationChange={handleAdminLocationChange}
                />
              </Col>
              <Col md={3} className="updateButtonCol">
                <Button color="primary" className="figmaSubmit" type="submit">
                  Save Location
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <Row className="figmaCardGrid">
        {visibleUsers.map((selectedUser, index) => {
          const accountActive = selectedUser.isActive !== false;

          return (
            <Col md={3} key={selectedUser._id}>
              <div className="figmaJobCard userCard">
                <div className="figmaJobTitle">
                  {adminView === "companies"
                    ? selectedUser.companyName || selectedUser.fullName
                    : selectedUser.fullName ||
                      `${selectedUser.role} ${index + 1}`}
                </div>
                <div className="figmaCardButton">
                  {accountActive ? "Active" : "Deactivated"}
                </div>
                <p>{selectedUser.email}</p>
                <div className="miniActions">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => handleToggleActive(selectedUser)}
                  >
                    {accountActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(selectedUser._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default AdminPage;
