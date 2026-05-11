import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import * as ENV from "../config";

const initialState = {
  applications: [],
  status: "",
  error: "",
};

//thunk for applying to job
export const applyJob = createAsyncThunk(
  "applications/applyJob",
  async (applicationData) => {
    try {
      const response = await axios.post(
        `${ENV.SERVER_URL}/applyJob`,
        applicationData
      );
      const application = response.data.application;
      return application;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Application failed";
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

//thunk for getting applications
export const getApplications = createAsyncThunk(
  "applications/getApplications",
  async (filterData = {}) => {
    try {
      let url = `${ENV.SERVER_URL}/getApplications`;
      if (filterData.applicantId) {
        url = `${url}?applicantId=${filterData.applicantId}`;
      }
      if (filterData.companyId) {
        url = `${url}?companyId=${filterData.companyId}`;
      }
      const response = await axios.get(url);
      return response.data.applications;
    } catch (error) {
      console.log(error);
    }
  }
);

//thunk for updating application
export const updateApplication = createAsyncThunk(
  "applications/updateApplication",
  async (applicationData) => {
    try {
      const response = await axios.put(
        `${ENV.SERVER_URL}/updateApplication/${applicationData._id}`,
        applicationData
      );
      const application = response.data.application;
      return application;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Update failed";
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

//thunk for deleting application
export const deleteApplication = createAsyncThunk(
  "applications/deleteApplication",
  async (applicationId) => {
    try {
      await axios.delete(`${ENV.SERVER_URL}/deleteApplication/${applicationId}`);
      return applicationId;
    } catch (error) {
      console.log(error);
    }
  }
);

const applicationSlice = createSlice({
  name: "applications",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //extra reducer for applying job
      .addCase(applyJob.pending, (state) => {
        state.status = "loading";
      })
      .addCase(applyJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.applications.unshift(action.payload);
      })
      .addCase(applyJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //extra reducer for getting all applications
      .addCase(getApplications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getApplications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.applications = action.payload || [];
      })
      .addCase(getApplications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //extra reducer for updating application
      .addCase(updateApplication.fulfilled, (state, action) => {
        const updatedApplicationIndex = state.applications.findIndex(
          (application) => application._id === action.payload._id
        );
        if (updatedApplicationIndex !== -1) {
          state.applications[updatedApplicationIndex] = action.payload;
        }
      })

      //extra reducer for deleting application
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter(
          (application) => application._id !== action.payload
        );
      });
  },
});

export default applicationSlice.reducer;
