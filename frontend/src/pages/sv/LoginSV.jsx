import React, { useState } from "react";
import { loginSinhVien } from "../../services/sinhVienAuthService";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

export default function LoginSV({ onLogin }) {
  const [mssv, setMssv] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginSinhVien({ mssv, password });
      saveAuth(res.user, res.token);
      navigate("/sv/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm border border-slate-200"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-900">
          Đăng nhập Sinh viên
        </h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-slate-700">
            MSSV
          </label>
          <input
            type="text"
            value={mssv}
            onChange={(e) => setMssv(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-slate-700">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
