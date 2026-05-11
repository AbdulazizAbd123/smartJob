import * as yup from "yup"; //import all exports from the yup

const numberField = (message) =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError(message);

export const userSchemaValidation = yup.object().shape({
  role: yup.string().required("Role is required"),

  fullName: yup.string().required("Full name is required"),

  email: yup
    .string()
    .email("Not valid email format")
    .required("Email is required"),
  password: yup.string().min(4).max(20).required("Password is required"),

  age: numberField("Age must be a number").when("role", {
    is: "applicant",
    then: (schema) =>
      schema
        .integer("Age must be an integer")
        .required("Age is required")
        .min(18, "Age must be at least 18")
        .max(70, "Age must be 70 or below"),
    otherwise: (schema) => schema.notRequired(),
  }),

  phoneNumber: yup.string().when("role", {
    is: "applicant",
    then: (schema) => schema.required("Phone number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  experience: numberField("Experience must be a number").when("role", {
    is: "applicant",
    then: (schema) =>
      schema
        .required("Experience is required")
        .min(0, "Experience must be zero or more"),
    otherwise: (schema) => schema.notRequired(),
  }),

  companyName: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Company name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  location: yup.string().notRequired(),

  contactNumber: yup.string().notRequired(),
});
