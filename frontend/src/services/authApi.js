const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function login({ maGV, matKhau }) {
  // BE yêu cầu username, password
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: maGV, password: matKhau })
  });
  // BE trả về redirect hoặc lỗi, nên chỉ trả về message nếu có lỗi
  // Nếu BE trả về JSON, sẽ có thể lấy user hoặc message
  let payload = {};
  try {
    payload = await response.json();
  } catch (e) {
    // Nếu không phải JSON (redirect), trả về lỗi chung
    throw new Error("Đăng nhập thất bại.");
  }
  if (!response.ok) {
    throw new Error(payload?.message || "Đăng nhập thất bại.");
  }
  return payload;
}

export function saveToken(token) {
  localStorage.setItem("access_token", token);
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
}
