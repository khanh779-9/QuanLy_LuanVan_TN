const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }

  return payload;
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  const payload = await parseResponse(response, "Không thể tải danh sách users.");
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function createUser(input) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const payload = await parseResponse(response, "Không thể lưu user.");
  return payload.data;
}

export async function updateUser(userId, input) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const payload = await parseResponse(response, "Không thể lưu user.");
  return payload.data;
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE"
  });

  await parseResponse(response, "Không thể xóa user.");
}
