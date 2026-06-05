import axios from "axios";
import { Platform } from "react-native";

// We will write a small AsyncStorage fallback wrapper since AsyncStorage is standard and easy to use.
// Let's check if AsyncStorage or SecureStore is available. For React Native, we can write a simple token storage.
// We can use LocalStorage on web, and a simple memory/AsyncStorage on mobile.
// Let's implement a storage helper in a separate file or directly inside api.ts to make it simple.

import Constants from "expo-constants";

const getBaseUrl = () => {
  // Check if we are running in web mode
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  // Dynamically resolve the computer's local IP address (works on physical devices via Wi-Fi and emulators)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000`;
  }

  // Fallbacks
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000"; // Android Emulator Loopback
  }
  return "http://localhost:5000"; // iOS Simulator / fallback
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Storage helper for tokens (In-memory + web localstorage fallback)
let _accessToken = null;
let _refreshToken = null;
let _user = null;

export const tokenStorage = {
  async getAccessToken() {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return _accessToken;
  },
  async getRefreshToken() {
    if (Platform.OS === "web") {
      return localStorage.getItem("refreshToken");
    }
    return _refreshToken;
  },
  async getUser() {
    if (Platform.OS === "web") {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    }
    return _user;
  },
  async saveTokens(accessToken, refreshToken, user) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    _user = user;
    if (Platform.OS === "web") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
  },
  async clear() {
    _accessToken = null;
    _refreshToken = null;
    _user = null;
    if (Platform.OS === "web") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },
};

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops on auth endpoints
    if (
      originalRequest.url?.includes("/api/auth/login") ||
      originalRequest.url?.includes("/api/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = await tokenStorage.getRefreshToken();
        if (!refresh) {
          throw new Error("No refresh token available");
        }

        // Request new access token
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {
            refreshToken: refresh,
          },
        );

        const { accessToken } = response.data;
        const currentUser = await tokenStorage.getUser();
        await tokenStorage.saveTokens(accessToken, refresh, currentUser);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        await tokenStorage.clear();
        // Redirect or trigger logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
export default api;
