import axios from "axios";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
