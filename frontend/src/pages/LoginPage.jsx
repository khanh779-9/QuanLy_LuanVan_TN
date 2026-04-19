import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function getDefaultRoute(user) {
  if (user.type === "giangvien") {
    return "/admin/tong-quan";
  }
  return "/login";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveAuth, user: contextUser } = useAuth();

  const [maGV, setMaGV] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu đã có user trong context thì redirect luôn
    if (contextUser) {
      navigate(getDefaultRoute(contextUser));
    }
  }, [contextUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maGV || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await login(maGV, password);
      saveAuth(data.user, data.token);
      navigate(getDefaultRoute(data.user));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 422) {
        setError("Mã GV hoặc mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)),
        url('/assets/dai-hoc-cong-nghe-sai-gon-1.webp')`,
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-md w-full mx-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý Luận văn Tốt nghiệp
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Khoa Công nghệ Thông tin — Đại học Công Nghệ Sài Gòn
          </p>
        </div>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="maGV"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Mã giảng viên
            </label>
            <input
              id="maGV"
              type="text"
              autoComplete="username"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
              value={maGV}
              onChange={(e) => setMaGV(e.target.value)}
              placeholder="Nhập mã giảng viên"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {/* // Chuyển trang đến trang đăng nhập sinh viên */}
          <a href="/sv/login" className="text-blue-500 hover:underline">
            Đăng nhập sinh viên
          </a>
        </div>
      </div>
    </div>
  );
}
