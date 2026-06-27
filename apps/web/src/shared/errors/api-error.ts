import axios from "axios";

export interface ApiError {
  code: string;
  message: string;
}

export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (
      data &&
      typeof data.code === "string" &&
      typeof data.message === "string"
    ) {
      return data;
    }
  }

  return {
    code: "UNKNOWN_ERROR",

    message: "Something went wrong",
  };
}
