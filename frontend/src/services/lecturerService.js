import { fetchWithAuth } from "./authService";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function fetchLecturers() {
  const response = await fetchWithAuth(`${API_BASE_URL}/lecturers`);
  const payload = await parseResponse(
    response,
    "Không thể tải danh sách giảng viên.",
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function updateLecturer(id, input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/lecturers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseResponse(
    response,
    "Không thể cập nhật giảng viên.",
  );
  return payload.data;
}
