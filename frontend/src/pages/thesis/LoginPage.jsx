import React, { useState } from "react";
import { saveToken, login } from "../../services/authService";
import FormField from "../../components/FormField";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      saveToken(data.token);
      window.location.href = "/thesis";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        height: "100vh",
        background: "#f5f6fa",
      }}
    >
      <form
        className="w-120 mt-20"
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 8,
          boxShadow: "0 2px 8px #0001",
        }}
      >
        <img src="/assets/Logo_STU.png" alt="Logo" width={80} height={80} />

        <h2 style={{ marginTop: 10, marginBottom: 20 }}>
          Đăng nhập Giảng viên
        </h2>
        <FormField
          className="w-full"
          label="Mã giảng viên"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormField
          className="w-full"
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
