import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace(
  /\/+$/,
  ""
)}/api`;

export const api = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the server. Check your internet connection and try again.",
      { cause: error }
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : typeof data === "string" && data
          ? data
          : "Something went wrong"
    );
  }

  return data;
};
