const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseResponse(response, defaultErrorMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || defaultErrorMessage);
  }
  return payload;
}

export async function login(username, password) {
  // BE yêu cầu username, password
  const response = await fetch(API_BASE_URL + `/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maGV: username, matKhau: password }),
  });

  let payload = {};
  try {
    payload = await response.json();
    const userData = payload.user;
    localStorage.setItem("user", JSON.stringify(userData));
  } catch (e) {
    throw new Error("Đăng nhập thất bại.");
  }
  if (!response.ok) {
    throw new Error(payload?.message || "Đăng nhập thất bại.");
  }
  return payload;
}

export async function fetchCurrentUser() {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/me`);
  const payload = await parseResponse(
    response,
    "Không thể tải thông tin người dùng.",
  );
  // Trả về data bên trong data của payload (nếu có)
  if (payload && payload.data && payload.data.data) {
    return payload.data.data;
  }
  if (payload && payload.data) {
    return payload.data;
  }
  return payload;
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export async function logout() {
  // Gọi API logout nếu cần thiết
  // Sau đó xóa token và chuyển hướng
  localStorage.removeItem("token");
  window.location.href = "/thesis/login";
}

export async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/thesis/login";
    // Trả về Promise.reject để dừng các xử lý tiếp theo
    return Promise.reject(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
  }
  return response;
}
