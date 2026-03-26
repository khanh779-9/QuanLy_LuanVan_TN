import { fetchWithAuth } from "./authApi";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+'/api';

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function fetchStudents() {
  const response = await fetchWithAuth(`${API_BASE_URL}/students`);
  const payload = await parseResponse(response, "Không thể tải danh sách sinh viên.");
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function createStudents(input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const payload = await parseResponse(response, "Không thể lưu sinh viên.");
  return payload.data;
}

export async function updateStudent(id, input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const payload = await parseResponse(response, "Không thể cập nhật sinh viên.");
  return payload.data;
}

export async function deleteStudent(id) {
  const response = await fetchWithAuth(`${API_BASE_URL}/students/${id}`, {
    method: "DELETE"
  });
  await parseResponse(response, "Không thể xóa luận văn.");
}
