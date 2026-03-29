import { fetchWithAuth } from "./authApi";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+'/api';

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function fetchDashboard() {
    const response = await fetchWithAuth(`${API_BASE_URL}/dashboard`);
    return parseResponse(response, "Failed to fetch dashboard data");
}