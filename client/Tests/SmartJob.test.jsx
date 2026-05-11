import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

import Register from "../src/Components/Register";
import ApplicantPage from "../src/Components/ApplicantPage";
import CompanyPage from "../src/Components/CompanyPage";
import AdminPage from "../src/Components/AdminPage";
import usersReducer from "../src/Features/UserSlice";
import jobsReducer from "../src/Features/JobSlice";
import applicationsReducer from "../src/Features/ApplicationSlice";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithStore = (ui, preloadedState) => {
  const store = configureStore({
    reducer: {
      users: usersReducer,
      jobs: jobsReducer,
      applications: applicationsReducer,
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

const baseState = {
  users: {
    user: {},
    users: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
  },
  jobs: {
    jobs: [],
    status: "",
    error: "",
  },
  applications: {
    applications: [],
    status: "",
    error: "",
  },
};

describe("Smart Job Application Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  it("shows registration validation errors", async () => {
    renderWithStore(<Register />, baseState);

    userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it("renders applicant jobs and apply action", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("getJobs")) {
        return Promise.resolve({
          data: {
            jobs: [
              {
                _id: "job1",
                title: "Frontend Developer",
                description: "Build React screens",
                companyName: "Oman Tech",
                location: "Muscat",
                jobType: "Full Time",
                isOpen: true,
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { applications: [] } });
    });

    renderWithStore(<ApplicantPage />, {
      ...baseState,
      users: {
        ...baseState.users,
        user: {
          _id: "applicant1",
          role: "applicant",
          fullName: "Test Applicant",
        },
      },
    });

    expect(await screen.findByText(/frontend developer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
  });

  it("disables applying when job applicant limit is full", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("getJobs")) {
        return Promise.resolve({
          data: {
            jobs: [
              {
                _id: "job1",
                title: "Full Stack Developer",
                description: "Build MERN features",
                location: "Muscat",
                isOpen: true,
                applicantsNeeded: 1,
                applicationsCount: 1,
                isFull: true,
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { applications: [] } });
    });

    renderWithStore(<ApplicantPage />, {
      ...baseState,
      users: {
        ...baseState.users,
        user: {
          _id: "applicant1",
          role: "applicant",
          fullName: "Test Applicant",
        },
      },
    });

    expect(await screen.findByText(/full stack developer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /full/i })).toBeDisabled();
    expect(screen.getByText(/applicants: 1\/1/i)).toBeInTheDocument();
  });

  it("shows applied status while company has not responded", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("getApplications")) {
        return Promise.resolve({
          data: {
            applications: [
              {
                _id: "application1",
                jobId: "job1",
                jobTitle: "Frontend Developer",
                status: "Applied",
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { jobs: [] } });
    });

    renderWithStore(<ApplicantPage />, {
      ...baseState,
      users: {
        ...baseState.users,
        user: {
          _id: "applicant1",
          role: "applicant",
          fullName: "Test Applicant",
        },
      },
    });

    userEvent.click(screen.getByRole("button", { name: /job applied/i }));

    expect(await screen.findByText(/frontend developer/i)).toBeInTheDocument();
    expect(screen.getByText(/^applied$/i)).toBeInTheDocument();
    expect(screen.getByText(/waiting for company response/i)).toBeInTheDocument();
  });

  it("shows interview time clearly for applicant", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("getApplications")) {
        return Promise.resolve({
          data: {
            applications: [
              {
                _id: "application1",
                jobId: "job1",
                jobTitle: "Networker",
                status: "Interview",
                interviewDate: "2026-02-12T00:00:00.000Z",
                interviewTime: "00:00",
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { jobs: [] } });
    });

    renderWithStore(<ApplicantPage />, {
      ...baseState,
      users: {
        ...baseState.users,
        user: {
          _id: "applicant1",
          role: "applicant",
          fullName: "Test Applicant",
        },
      },
    });

    userEvent.click(screen.getByRole("button", { name: /job applied/i }));

    expect(
      (await screen.findAllByText(/interview 12 feb 12:00 am/i)).length
    ).toBeGreaterThan(0);
  });

  it("renders company application status controls", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("getJobs")) {
        return Promise.resolve({
          data: {
            jobs: [
              {
                _id: "job1",
                title: "Backend Developer",
                description: "Build API",
                location: "Sohar",
                jobType: "Full Time",
                salary: 700,
                isOpen: true,
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          applications: [
            {
              _id: "application1",
              applicantName: "Aisha Applicant",
              jobTitle: "Backend Developer",
              status: "Applied",
              interviewDate: "",
              interviewTime: "",
            },
          ],
        },
      });
    });

    renderWithStore(<CompanyPage />, {
      ...baseState,
      users: {
        ...baseState.users,
        user: {
          _id: "company1",
          role: "company",
          fullName: "Company HR",
          companyName: "Oman Tech",
          location: "Muscat",
        },
      },
    });

    userEvent.click(screen.getByRole("button", { name: /applicants/i }));

    expect(await screen.findByText(/aisha applicant/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Applied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^update$/i })).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /^update$/i }));

    expect(window.alert).toHaveBeenCalledWith("No changes have been made.");
  });

  it("renders admin user management list", async () => {
    axios.get.mockResolvedValue({
      data: {
        users: [
          {
            _id: "user1",
            fullName: "Test Company",
            role: "company",
            email: "company@test.com",
            companyName: "Test Co",
            location: "Muscat",
            isActive: true,
          },
          {
            _id: "user2",
            fullName: "Test Applicant",
            role: "applicant",
            email: "applicant@test.com",
            experience: 2,
            isActive: true,
          },
        ],
      },
    });

    renderWithStore(<AdminPage />, {
      ...baseState,
      users: {
        ...baseState.users,
        user: {
          _id: "admin1",
          role: "admin",
          fullName: "System Admin",
        },
      },
    });

    expect(await screen.findByText(/test applicant/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /companies/i }));

    expect(await screen.findByText(/test co/i)).toBeInTheDocument();
  });
});
