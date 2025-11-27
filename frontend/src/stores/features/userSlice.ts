import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  postUserLogin,
  postAddUser,
  AddUserPayload,
} from "@/services/authService";
import axios from "axios";

// --------------------
// 型別
// --------------------

export interface UserData {
  id: string;
  name: string;
  email: string;
}

export interface UserState {
  loginStatus: "idle" | "success" | "error" | null;
  addStatus: "idle" | "success" | "error" | null;
  user: UserData | null;
}

interface UserLoginPayload {
  email: string;
  password: string;
}

// --------------------
// Async: 登入
// --------------------

export const userLogin = createAsyncThunk<
  UserData,
  UserLoginPayload,
  { rejectValue: string }
>("user/login", async (userData, { rejectWithValue }) => {
  try {
    const res = await postUserLogin(userData.email, userData.password);
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
    return rejectWithValue("Unknown error");
  }
});

// --------------------
// Async: 新增使用者
// --------------------

export const userAdd = createAsyncThunk<
  UserData,
  AddUserPayload,
  { rejectValue: string }
>("user/add", async (payload, { rejectWithValue }) => {
  try {
    const res = await postAddUser(payload);
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data || "Add user failed");
    }
    return rejectWithValue("Unknown error");
  }
});

// --------------------
// Slice
// --------------------

const initialState: UserState = {
  loginStatus: "idle",
  addStatus: "idle",
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(
        userLogin.fulfilled,
        (state, action: PayloadAction<UserData>) => {
          state.loginStatus = "success";
          state.user = action.payload;
        }
      )
      .addCase(userLogin.rejected, (state) => {
        state.loginStatus = "error";
      });

    // Add User
    builder
      .addCase(userAdd.fulfilled, (state, action: PayloadAction<UserData>) => {
        state.addStatus = "success";
      })
      .addCase(userAdd.rejected, (state) => {
        state.addStatus = "error";
      });
  },
});

export default userSlice.reducer;
