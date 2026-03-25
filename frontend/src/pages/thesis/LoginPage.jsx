import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoSTU from "/assets/LoginPage/Logo_STU.png";
import { login, saveToken } from "../../services/authApi";

export default function LoginPage() {
  const [maGV, setMaGV] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!maGV || !matKhau) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ maGV, matKhau });
      if (res.token) {
        saveToken(res.token);
        navigate("/thesis");
      } else {
        setError("Đăng nhập thất bại.");
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-white"
      style={{
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        className="bg-white/90 border border-blue-200 rounded-3xl shadow-2xl px-10 py-12 items-center gap-8 animate-fadeIn backdrop-blur-sm"
        style={{
          width: "400px",
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          border: "1px solid #e0e0e0",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: "2rem",
        }}
      >
        <img
          src={LogoSTU}
          alt="STU Logo"
          // className="w-24 h-24 mb-2 drop-shadow-lg"
          style={{width: "50px"}}
        />

        <h1 className="text-3xl font-extrabold text-blue-700 text-center w-full">
          Đăng nhập hệ thống luận văn
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
            borderRadius: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Mã giảng viên"
            className="border border-blue-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base shadow-sm w-full"
            value={maGV}
            onChange={(e) => setMaGV(e.target.value)}
            autoFocus
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="border border-blue-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base shadow-sm w-full"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl py-3 font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60 shadow-md"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
