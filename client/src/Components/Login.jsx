import {
  Button,
  Container,
  Form,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

import { Link } from "react-router-dom";

import { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { login } from "../Features/UserSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users.user);
  const isSuccess = useSelector((state) => state.users.isSuccess);

  const routeByRole = (role) => {
    if (role === "admin") return "/admin";
    if (role === "company") return "/company";
    return "/applicant";
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const userData = {
      email,
      password,
    };
    dispatch(login(userData));
  };

  useEffect(() => {
    if (isSuccess && user?._id) {
      navigate(routeByRole(user.role));
    }
  }, [user, isSuccess, navigate]);

  return (
    <div className="pageSection authScreen">
      <Container>
        <Row className="loginRow">
          <Col>
            <Form className="authPanel" onSubmit={handleLogin}>
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue</p>

              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  type="email"
                  onChange={(e) => setemail(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  type="password"
                  onChange={(e) => setpassword(e.target.value)}
                />
              </FormGroup>

              <Button color="primary" className="figmaSubmit" type="submit">
                Sign In
              </Button>
              <p className="authLinkText">
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
