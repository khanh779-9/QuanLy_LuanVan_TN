import axios from "axios";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout phía context nếu cần
    }
    return Promise.reject(error);
  },
);

export default api;
