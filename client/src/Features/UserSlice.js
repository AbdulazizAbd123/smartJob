import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import * as ENV from "../config";

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.error || fallbackMessage;

const initialState = {
  user: {},
  users: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

//Create the thunk for register new user
export const registerUser = createAsyncThunk(
  "users/registerUser",
  async (userData) => {
    try {
      const response = await axios.post(`${ENV.SERVER_URL}/registerUser`, userData);
      const user = response.data.user; //retrieve the response from the server
      return user; //return the response from the server as payload to the thunk
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Registration failed");
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

//thunk to login
export const login = createAsyncThunk("users/login", async (userData) => {
  try {
    const response = await axios.post(`${ENV.SERVER_URL}/login`, {
      email: userData.email.trim(),
      password: userData.password,
    });
    const user = response.data.user;
    return user;
  } catch (error) {
    const errorMessage = getErrorMessage(
      error,
      "Cannot connect to server. Start the server terminal first."
    );
    alert(errorMessage);
    throw new Error(errorMessage);
  }
});

export const logout = createAsyncThunk("/users/logout", async () => {
  try {
    await axios.post(`${ENV.SERVER_URL}/logout`);
  } catch (error) {}
});

export const getUsers = createAsyncThunk("users/getUsers", async () => {
  try {
    const response = await axios.get(`${ENV.SERVER_URL}/getUsers`);
    return response.data.users;
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Loading users failed");
    alert(errorMessage);
    throw new Error(errorMessage);
  }
});

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (userData) => {
    try {
      const response = await axios.put(
        `${ENV.SERVER_URL}/updateUser/${userData._id}`,
        userData
      );
      return response.data.user;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Update failed");
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId) => {
    try {
      await axios.delete(`${ENV.SERVER_URL}/deleteUser/${userId}`);
      return userId;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Deleting user failed");
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

export const userSlice = createSlice({
  name: "users", //name of the state
  initialState, // initial value of the state
  reducers: {
    resetUserMessage: (state) => {
      state.message = "";
      state.isError = false;
    },
  },

  extraReducers: (builder) => {
    //Asynchronous actions that update the state directly,
    builder
      //extra reducer for adding the registered record
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Registration successful.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.error.message;
      })

      //extra reducer for login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload; //assign the payload which is the user object return from the server after authentication
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.error.message;
      })

      //extra reducer for logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        // Clear user data or perform additional cleanup if needed
        state.user = {};
        state.isLoading = false;
        state.isSuccess = false;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      //extra reducer for getting all users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload || [];
        state.isLoading = false;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      //extra reducer for updating user
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUserIndex = state.users.findIndex(
          (user) => user._id === action.payload._id
        );
        if (updatedUserIndex !== -1) {
          state.users[updatedUserIndex] = action.payload;
        }
        if (state.user._id === action.payload._id) {
          state.user = action.payload;
        }
      })

      //extra reducer for deleting user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export const { resetUserMessage } = userSlice.actions; //export the function
export default userSlice.reducer;
