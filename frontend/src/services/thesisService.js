
import { fetchWithAuth } from "./authService";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";
import { parseResponse } from "../utils/parseResponse";

export async function fetchTheses() {
  const response = await fetchWithAuth(`${API_BASE_URL}/topics`);
  const payload = await parseResponse(
    response,
    "Không thể tải danh sách luận văn."
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function createThesis(input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseResponse(response, "Không thể lưu luận văn.");
  return payload.data;
}

export async function updateThesis(id, input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/topics/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseResponse(response, "Không thể cập nhật luận văn.");
  return payload.data;
}

export async function deleteThesis(id) {
  const response = await fetchWithAuth(`${API_BASE_URL}/topics/${id}`, {
    method: "DELETE",
  });
  await parseResponse(response, "Không thể xóa luận văn.");
}

export async function fetchStudentsByThesisId(thesisId) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/topics/${thesisId}/students`
  );
  const payload = await parseResponse(
    response,
    "Không thể tải danh sách sinh viên."
  );
  return Array.isArray(payload.data) ? payload.data : [];
}
