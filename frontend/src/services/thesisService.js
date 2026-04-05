
import { fetchWithAuth } from "./authService";
import { parseResponse } from "../utils/parseResponse";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

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

export async function saveGvhdScore(topicId, input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/topics/${topicId}/score-gvhd`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseResponse(response, "Không thể lưu điểm GVHD.");
  return payload.data;
}

export async function saveGvpbScore(topicId, input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/topics/${topicId}/score-gvpb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseResponse(response, "Không thể lưu điểm GVPB.");
  return payload.data;
}

async function fetchWordExport(url, fallbackName) {
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const payload = await parseResponse(response, "Không thể xuất file.");
    return payload;
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
  const filename = decodeURIComponent(match?.[1] || match?.[2] || fallbackName);
  return { blob, filename };
}

export async function exportAssignmentWord(topicId) {
  return fetchWordExport(`${API_BASE_URL}/exports/word/assignment/${topicId}`, `nhiemvu_${topicId}.docx`);
}

export async function exportGvhdWord(topicId) {
  return fetchWordExport(`${API_BASE_URL}/exports/word/gvhd/${topicId}`, `phieu_gvhd_${topicId}.docx`);
}

export async function exportGvpbWord(topicId) {
  return fetchWordExport(`${API_BASE_URL}/exports/word/gvpb/${topicId}`, `phieu_gvpb_${topicId}.docx`);
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
