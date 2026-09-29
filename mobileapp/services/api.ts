// import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// export const api = async (
//   endpoint: string,
//   options: RequestInit = {}
// ) => {
//   const token = await AsyncStorage.getItem("token");

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",

//       ...(token
//         ? {
//             Authorization: `Bearer ${token}`,
//           }
//         : {}),

//       ...(options.headers || {}),
//     },
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || "Something went wrong");
//   }

//   return data;
// };



import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

export const api = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData
        ? {}
        : { "Content-Type": "application/json" }),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

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