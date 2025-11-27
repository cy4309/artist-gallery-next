import axios from "axios";
import { UserData } from "@/stores/features/userSlice";
// const baseUrl = `http://localhost:8080`;

// -------------------------------------------------------------
// == 這樣的寫法也可以 ==
export interface AddUserPayload {
  name: string;
  email: string;
  password: string;
}

export async function postAddUser(payload: AddUserPayload) {
  const response = await axios.post<UserData>("/api/add-user", payload);
  return response.data;
}

// -------------------------------------------------------------
// export async function postUserLogin(email, password) {
//   const response = await axios.post(`${baseUrl}/auth/login`, {
//     email: email,
//     password: password,
//   });
//   return response.data;
// }
export async function postUserLogin(email: string, password: string) {
  const response = await axios.post<UserData>("/api/login", {
    email,
    password,
  });
  return response.data;
}

// export async function postUserLogout() {
//   const response = await axios.post(`/api/auth/logout`);
//   return response.data;
// }
