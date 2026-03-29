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

export async function createThesisForm(formData) {
  const response = await fetchWithAuth(`${API_BASE_URL}/thesis-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return await parseResponse(
    response,
    "Không thể tạo biểu mẫu luận văn mới.",
  );
}

export async function updateThesisForm(formId, formData) {
  const response = await fetchWithAuth(`${API_BASE_URL}/thesis-form/${formId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return await parseResponse(
    response,
    "Không thể cập nhật biểu mẫu luận văn.",
  );
}

export async function deleteThesisForm(formId) {
  const response = await fetchWithAuth(`${API_BASE_URL}/thesis-form/${formId}`, {
    method: "DELETE",
  });
  return await parseResponse(
    response,
    "Không thể xóa biểu mẫu luận văn.",
  );
}

export async function deleteAllThesisForms() {
  const response = await fetchWithAuth(`${API_BASE_URL}/thesis-forms`, {
    method: "DELETE",
  });
  return await parseResponse(
    response,
    "Không thể xóa tất cả biểu mẫu luận văn.",
  );
}
