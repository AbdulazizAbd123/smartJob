import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import * as ENV from "../config";

const initialState = {
  jobs: [],
  status: "",
  error: "",
};

//thunk for saving job
export const saveJob = createAsyncThunk("jobs/saveJob", async (jobData) => {
  try {
    const response = await axios.post(`${ENV.SERVER_URL}/saveJob`, jobData);
    const job = response.data.job;
    return job; //Return the new job to Redux
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Saving job failed";
    alert(errorMessage);
    throw new Error(errorMessage);
  }
});

//thunk for getting jobs
export const getJobs = createAsyncThunk("jobs/getJobs", async (companyId) => {
  try {
    const url = companyId
      ? `${ENV.SERVER_URL}/getJobs?companyId=${companyId}`
      : `${ENV.SERVER_URL}/getJobs`;
    const response = await axios.get(url);
    return response.data.jobs;
  } catch (error) {
    console.log(error);
  }
});

//thunk for updating job
export const updateJob = createAsyncThunk("jobs/updateJob", async (jobData) => {
  try {
    const response = await axios.put(
      `${ENV.SERVER_URL}/updateJob/${jobData._id}`,
      jobData
    );
    const job = response.data.job;
    return job;
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Updating job failed";
    alert(errorMessage);
    throw new Error(errorMessage);
  }
});

//thunk for deleting job
export const deleteJob = createAsyncThunk("jobs/deleteJob", async (jobId) => {
  try {
    await axios.delete(`${ENV.SERVER_URL}/deleteJob/${jobId}`);
    return jobId;
  } catch (error) {
    console.log(error);
  }
});

const jobSlice = createSlice({
  name: "jobs",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //extra reducer for saving job
      .addCase(saveJob.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobs.unshift(action.payload);
      })
      .addCase(saveJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //extra reducer for getting all jobs
      .addCase(getJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobs = action.payload || [];
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //extra reducer for updating job
      .addCase(updateJob.fulfilled, (state, action) => {
        const updatedJobIndex = state.jobs.findIndex(
          (job) => job._id === action.payload._id
        );
        if (updatedJobIndex !== -1) {
          state.jobs[updatedJobIndex] = action.payload;
        }
      })

      //extra reducer for deleting job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job._id !== action.payload);
      });
  },
});

export default jobSlice.reducer;
