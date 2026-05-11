import {
  Button,
  Form,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
} from "reactstrap";

import { userSchemaValidation } from "../Validations/UserValidations";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useDispatch } from "react-redux";
import { useState } from "react";

import { registerUser } from "../Features/UserSlice";

import { useNavigate } from "react-router-dom";

const Register = () => {
  const [role, setrole] = useState("applicant");

  const {
    register,
    handleSubmit, // Submit the form when this is called
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "applicant",
    },
    mode: "onChange",
    resolver: yupResolver(userSchemaValidation), //Associate your Yup validation schema using the resolver
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setrole(selectedRole);
    setValue("role", selectedRole);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const userData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        age: data.age,
        phoneNumber: data.phoneNumber,
        experience: data.experience,
        companyName: data.companyName,
        location:
          data.location || (data.role === "company" ? "Not provided" : ""),
        contactNumber:
          data.role === "company" ? "92874721" : data.contactNumber,
      };

      await dispatch(registerUser(userData)).unwrap();
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.log("Error.");
    }
  };

  return (
    <div className="pageSection registerScreen">
      <Container>
        <Row className="formrow">
          <Col>
            <Form className="registerPanel" onSubmit={handleSubmit(onSubmit)}>
              <h1>Create Account</h1>
              <p>Join Job Tracker to manage your applications</p>

              <input type="hidden" {...register("role")} />

              <div className="roleSwitch">
                <button
                  type="button"
                  className={role === "applicant" ? "active" : ""}
                  onClick={() => handleRoleChange("applicant")}
                >
                  Applicant
                </button>
                <button
                  type="button"
                  className={role === "company" ? "active" : ""}
                  onClick={() => handleRoleChange("company")}
                >
                  Company
                </button>
              </div>

              <FormGroup>
                <Label for="fullName">Full Name</Label>
                <input
                  type="text"
                  id="fullName"
                  className="form-control"
                  placeholder="Enter full name"
                  {...register("fullName")}
                />
                <p className="error">{errors.fullName?.message}</p>
              </FormGroup>

              {role === "applicant" && (
                <>
                  <FormGroup>
                    <Label for="age">Age</Label>
                    <input
                      type="number"
                      id="age"
                      className="form-control"
                      {...register("age")}
                    />
                    <p className="error">{errors.age?.message}</p>
                  </FormGroup>
                </>
              )}

              {role === "company" && (
                <FormGroup>
                  <Label for="companyName">Company Name</Label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-control"
                    {...register("companyName")}
                  />
                  <p className="error">{errors.companyName?.message}</p>
                </FormGroup>
              )}

              <FormGroup>
                <Label for="email">Email</Label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  {...register("email")}
                />
                <p className="error">{errors.email?.message}</p>
              </FormGroup>

              <FormGroup>
                <Label for="password">Password</Label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  {...register("password")}
                />
                <p className="error">{errors.password?.message}</p>
              </FormGroup>

              {role === "applicant" && (
                <>
                  <FormGroup>
                    <Label for="phoneNumber">Phone Number</Label>
                    <input
                      type="text"
                      id="phoneNumber"
                      className="form-control"
                      {...register("phoneNumber")}
                    />
                    <p className="error">{errors.phoneNumber?.message}</p>
                  </FormGroup>

                  <FormGroup>
                    <Label for="experience">Experience (years)</Label>
                    <input
                      type="number"
                      id="experience"
                      className="form-control"
                      {...register("experience")}
                    />
                    <p className="error">{errors.experience?.message}</p>
                  </FormGroup>
                </>
              )}

              <Button color="primary" className="figmaSubmit" type="submit">
                Create Account
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
