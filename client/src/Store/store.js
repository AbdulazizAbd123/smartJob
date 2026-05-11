import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../Features/UserSlice"; //import the reducer
import jobReducer from "../Features/JobSlice";
import applicationReducer from "../Features/ApplicationSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage by default
import { combineReducers } from "redux";

// Redux Persist config
const persistConfig = {
  key: "smartjobstore", // The key to identify the persisted state in storage
  storage, // The storage method (localStorage)
};

const rootReducer = combineReducers({
  users: usersReducer, // Manage users slice of the state
  jobs: jobReducer, // Manage jobs slice of the state
  applications: applicationReducer, // Manage applications slice of the state
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer in thestore,
});

const persistore = persistStore(store); // Create persistore for rehydration

export { store, persistore };

/*
export const store = configureStore({
  reducer: {
    users: usersReducer,
    jobs: jobReducer,
    applications: applicationReducer,
  },
});
*/
