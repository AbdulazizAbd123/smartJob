import { Container, Row } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import About from "./Components/About";
import AdminPage from "./Components/AdminPage";
import ApplicantPage from "./Components/ApplicantPage";
import CompanyPage from "./Components/CompanyPage";
import Header from "./Components/Header";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Footer from "./Components/Footer";
import Profile from "./Components/Profile";
import Register from "./Components/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Container fluid className="appContainer">
      <Router>
        <Row>
          <Header />
        </Row>
        <Row className="main">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/applicant" element={<ApplicantPage />}></Route>
            <Route path="/company" element={<CompanyPage />}></Route>
            <Route path="/admin" element={<AdminPage />}></Route>
            <Route path="/about" element={<About />}></Route>
          </Routes>
        </Row>
        <Row>
          <Footer />
        </Row>
      </Router>
    </Container>
  );
};

export default App;
