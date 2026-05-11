import { Col, Container, Row } from "reactstrap"; //import the Reactstrap Components

import { Link } from "react-router-dom";
import homeImage from "../Images/figma-home-main.png";
import meetingImage from "../Images/figma-home-meeting.png";

const Home = () => {
  const jobCards = ["Software Engineering", "Software Engineering", "Software Engineering", "Software Engineering"];

  return (
    <Container fluid className="homePage">
      <Row className="landingIntro">
        <Col md={5} className="landingText">
          <h2>Land Your Dream Job Faster</h2>
          <p>
            Track every application, manage interviews, and stay organized
            throughout your job search. Stop losing opportunities in messy
            spreadsheets.
          </p>
        </Col>
        <Col md={7} className="landingImageCol">
          <img
            className="landingTopImage"
            src={homeImage}
            alt="Job tracking workspace"
          />
        </Col>
      </Row>

      <Row className="featuresTitle">
        <Col>
          <h2>Everything You Need to Succeed</h2>
          <p>
            Powerful features designed to streamline your job search and keep
            you organized every step of the way.
          </p>
        </Col>
      </Row>

      <Row className="figmaCardRow">
        {jobCards.map((title, index) => (
          <Col md={3} key={index}>
            <div className="figmaJobCard">
              <div className="figmaJobTitle">{title}</div>
              <Link to="/login" className="figmaCardButton">
                Apply
              </Link>
            </div>
          </Col>
        ))}
      </Row>

      <Row
        className="landingBottomImage"
        style={{ backgroundImage: `url(${meetingImage})` }}
      >
        <Col>
          <h2>Ready to Transform Your Job Search?</h2>
          <p>
            Join thousands of job seekers who have streamlined their application
            process and landed their dream jobs.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
