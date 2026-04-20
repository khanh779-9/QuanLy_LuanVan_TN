import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import AdminSinhVien from './pages/admin/SinhVien';
import AdminGiangVien from './pages/admin/GiangVien';
import AdminPhanCongGVHD from './pages/admin/PhanCongGVHD';
import AdminPhanCongGVPB from './pages/admin/PhanCongGVPB';
import AdminDeTai from './pages/admin/DeTai';
import AdminNhapLieu from './pages/admin/NhapLieu';
import AdminGiaiDoanPage from './pages/admin/GiaiDoan';
import GVTongQuan from './pages/gv/TongQuan';
import GVDeTai from './pages/gv/DeTai';
import GVHDGiuaKy from './pages/gv/GiuaKy';
import GVHDHuongDan from './pages/gv/HuongDan';
import GVPBPhanBien from './pages/gv/PhanBien';
import GVHoiDong from './pages/gv/HoiDong';
import TongQuan from './pages/admin/TongQuan';
import { useAuth } from './context/AuthContext';
import LoginSV from './pages/sv/LoginSV';
import DashboardSV from './pages/sv/DashboardSV';
import DangKyDeTaiSV from './pages/sv/DangKyDeTai';
import KetQuaDeTaiSV from './pages/sv/KetQuaDeTai';
import NhiemVuGV from './pages/gv/NhiemVu';
import AdminHoiDong from './pages/admin/HoiDong';

const queryClient = new QueryClient();



function App() {
  // Lấy user chỉ từ context
  const { user } = useAuth() || {};

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Đăng nhập sinh viên */}
        <Route path="/sv/login" element={<LoginSV />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<RoleRoute allowed="thuky" />}>
              <Route path="/admin/tong-quan" element={<TongQuan />} />
              <Route path="/admin/sinhvien" element={<AdminSinhVien />} />
              <Route path="/admin/giangvien" element={<AdminGiangVien />} />
              <Route path="/admin/phanconggvhd" element={<AdminPhanCongGVHD />} />
              <Route path="/admin/phanconggvpb" element={<AdminPhanCongGVPB />} />
              <Route path="/admin/detai" element={<AdminDeTai />} />
              <Route path="/admin/giaidoan" element={<AdminGiaiDoanPage />} />
              <Route path="/admin/nhaplieu" element={<AdminNhapLieu />} />
              <Route path="/admin/hoidong" element={<AdminHoiDong />} />
            </Route>
            <Route element={<RoleRoute allowed="gv" />}>
              <Route path="/gv/tong-quan" element={<GVTongQuan />} />
              <Route path="/gv/de-tai" element={<GVDeTai />} />
              <Route path="/gv/giua-ky" element={<GVHDGiuaKy />} />
              <Route path="/gv/nhiem-vu" element={<NhiemVuGV />} />
              <Route path="/gv/huongdan" element={<GVHDHuongDan />} />
              <Route path="/gv/phanbien" element={<GVPBPhanBien />} />
              <Route path="/gv/hoidong" element={<GVHoiDong />} />
            </Route>

            <Route element={<RoleRoute allowed="sv" />}>
                <Route path="/sv/dashboard" element={<DashboardSV />} />
                <Route path="/sv/dang-ky-detai" element={<DangKyDeTaiSV />} />
                <Route path="/sv/ket-qua-detai" element={<KetQuaDeTaiSV />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
