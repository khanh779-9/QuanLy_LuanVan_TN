import { fetchWithAuth } from "./authService";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function fetchThesesForm() {
  const response = await fetchWithAuth(`${API_BASE_URL}/thesis-form`);
  const payload = await parseResponse(
    response,
    "Không thể tải danh sách biểu mẫu luận văn.",
  );
  return Array.isArray(payload.data) ? payload.data : [];
}
