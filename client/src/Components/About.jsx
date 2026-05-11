import React from "react";
import userImage from "../Images/user.png";

//for test case
export const add = (a, b) => {
  return a + b;
};

//for test case
export const greet = (name) => {
  return `Hello, ${name}!`;
};

const About = () => {
  return (
    <div className="pageSection aboutPage">
      <div className="formLogo">Logo</div>
      <h1>About This Project</h1>
      <p>
        Smart Job Application Tracking is a MERN stack academic project for
        managing applicants, companies, jobs, applications, interviews, and
        status updates.
      </p>
      <div className="projectInfo">
        <h2>Project Overview</h2>
        <p>
          This system helps job seekers apply for available jobs and follow
          their application progress in one place. Companies can publish job
          posts, review applicants, and schedule interview date and time. The
          admin can manage applicants and companies to keep the system organized.
        </p>
      </div>
      <div className="developerList">
        <img src={userImage} alt="devimage" className="userImage" />
        <div>
          <p>
            <strong>Developed by</strong>
          </p>
          <p>
            <strong>Abdulaziz Abdullah Alshehhi</strong>
          </p>
          <p>University ID: 66S2142</p>
          <p>Email: 66S2142@utas.edu.om</p>
          <p>Phone: 92874721</p>
          <p>
            <strong>Yousef Albarami</strong>
          </p>
          <p>University ID: 66J214</p>
          <p>Email: 66J214@utas.edu.om</p>
          <p>Phone: 92874722</p>
        </div>
      </div>
    </div>
  );
};
export default About;
