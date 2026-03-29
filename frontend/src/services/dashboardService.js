import { fetchWithAuth } from "./authService";
import { parseResponse } from "../utils/parseResponse";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

export async function fetchDashboard() {
  const response = await fetchWithAuth(`${API_BASE_URL}/dashboard`);
  return parseResponse(response, "Failed to fetch dashboard data");
}
