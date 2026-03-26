import { fetchWithAuth } from "./authApi";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+'/api';

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function fetchCouncils() {
  const response = await fetchWithAuth(`${API_BASE_URL}/councils`);
  const payload = await parseResponse(response, "Không thể tải danh sách hội đồng.");
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function updateCouncil(id, input) {
  const response = await fetchWithAuth(`${API_BASE_URL}/councils/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const payload = await parseResponse(response, "Không thể cập nhật hội đồng.");
  return payload.data;
}
