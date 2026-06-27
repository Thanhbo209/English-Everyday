import { api } from "./axios";

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function register(data: RegisterRequest) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

export async function login(data: LoginRequest) {
  const response = await api.post("/auth/login", data);

  return response.data;
}

export async function getMe() {
  const response = await api.get("/auth/me");

  return response.data;
}
