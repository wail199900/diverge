import axios from "axios";

const BASE_URL = "http://192.168.100.57:5001";
console.log("API BASE URL:", BASE_URL);
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Log all requests
client.interceptors.request.use((request) => {
  console.log("📤 REQUEST:", request.method?.toUpperCase(), request.url);
  console.log("📤 DATA:", request.data);
  return request;
});

// ✅ Log all responses
client.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.config.url);
    console.log("✅ DATA:", response.data);
    return response;
  },
  (error) => {
    console.log("❌ ERROR:", error.config?.url);

    if (error.response) {
      // Backend responded with error
      console.log("❌ STATUS:", error.response.status);
      console.log("❌ MESSAGE:", error.response.data);
    } else if (error.request) {
      // No response (network issue)
      console.log("❌ NETWORK ERROR:", error.message);
    } else {
      console.log("❌ UNKNOWN ERROR:", error.message);
    }

    return Promise.reject(error);
  },
);

export default client;
