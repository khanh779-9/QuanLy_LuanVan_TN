import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowed }) {
  let { user } = useAuth() || {};
  // if (!user) {
  //   const saved = localStorage.getItem('user');
  //   if (saved) {
  //     try {
  //       user = JSON.parse(saved);
  //     } catch (e) {}
  //   }
  // }

  // Chuẩn hoá role
  let role = user?.role?.toLowerCase();
  
  

  // Chặn nếu gv (tất cả các giảng viên) cố vào trang thuky
  if (allowed === 'thuky' && role !== 'thuky') {
    return <Navigate to="/gv/tong-quan" replace />;
  }

  // Chặn nếu thuky cố vào trang gv
  if (allowed === 'gv' && role === 'thuky') {
    return <Navigate to="/admin/tong-quan" replace />;
  }

  // Nếu hợp lệ, cho phép render các route con
  return <Outlet />;
}
