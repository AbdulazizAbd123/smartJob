import {
  Button,
  Col,
  Container,
  Form,
  Row,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { updateUser } from "../Features/UserSlice";
import ProfilePicture from "./ProfilePicture";
import Location from "./Location";

const sameText = (firstValue, secondValue) =>
  (firstValue || "").toString().trim() ===
  (secondValue || "").toString().trim();

const Profile = () => {
  const user = useSelector((state) => state.users.user);

  const [location, setlocation] = useState(user.location || "");
  const [latitude, setlatitude] = useState(user.latitude || "");
  const [longitude, setlongitude] = useState(user.longitude || "");
  const [place, setplace] = useState(user.place || "");
  const [country, setcountry] = useState(user.country || "");
  const [accuracy, setaccuracy] = useState(user.accuracy || "");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) {
      navigate("/login");
    }
    setlocation(user.location || "");
    setlatitude(user.latitude || "");
    setlongitude(user.longitude || "");
    setplace(user.place || "");
    setcountry(user.country || "");
    setaccuracy(user.accuracy || "");
  }, [navigate, user]);

  const handleProfileLocationChange = (locationData) => {
    setlatitude(locationData.latitude);
    setlongitude(locationData.longitude);
    setplace(locationData.place || "");
    setcountry(locationData.country || "");
    setaccuracy(locationData.accuracy || "");
    if (locationData.location) {
      setlocation(locationData.location);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    const profileUnchanged =
      sameText(location, user.location) &&
      sameText(latitude, user.latitude) &&
      sameText(longitude, user.longitude) &&
      sameText(place, user.place) &&
      sameText(country, user.country) &&
      sameText(accuracy, user.accuracy);

    if (profileUnchanged) {
      alert("No changes have been made.");
      return;
    }

    try {
      await dispatch(
        updateUser({
          ...user,
          location,
          latitude,
          longitude,
          place,
          country,
          accuracy,
        })
      ).unwrap();
      alert("Changes have been made.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container className="pageSection">
      <Row className="dashboardHeader">
        <Col className="profileCircleCol">
          <ProfilePicture user={user} />
        </Col>
        <Col>
          <p className="eyebrow">Profile</p>
          <h1>{user.fullName}</h1>
          <p className="mutedText">{user.email}</p>
        </Col>
      </Row>
      <Row className="dashboardTabs">
        <Col>
          <span>Personal Details</span>
          <span>Location</span>
          <span>Account</span>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <section className="contentBlock">
            <h2>Account Details</h2>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            {user.role === "applicant" && (
              <>
                <p>
                  <strong>Age:</strong> {user.age}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phoneNumber}
                </p>
                <p>
                  <strong>Experience:</strong> {user.experience} years
                </p>
              </>
            )}
            {user.role === "company" && (
              <>
                <p>
                  <strong>Company:</strong> {user.companyName}
                </p>
                <p>
                  <strong>Contact:</strong> {user.contactNumber}
                </p>
              </>
            )}
          </section>
        </Col>

        <Col md={6}>
          <section className="contentBlock">
            <h2>User Location</h2>
            <Form onSubmit={handleSaveProfile}>
              <Location
                latitude={latitude}
                longitude={longitude}
                place={place}
                country={country}
                accuracy={accuracy}
                onLocationChange={handleProfileLocationChange}
              />
              <Button color="primary" className="button" type="submit">
                Save Profile
              </Button>
            </Form>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
