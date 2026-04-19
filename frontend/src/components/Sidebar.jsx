import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlinePencilSquare,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";
import { useCurrentStage } from "../hooks/useCurrentStage";
export default function Sidebar({ isOpen, onClose }) {
  const { stage, isLoading } = useCurrentStage();
  const config = stage?.data || {};
  const navigate = useNavigate();
  const location = useLocation();
  const { user: contextUser, clearAuth } = useAuth();


  // Lấy user chỉ từ context
  const user = contextUser;
  let role = user?.role?.toLowerCase();
  if (role === "sinhvien") role = "sv";
  else if (role && role !== "thuky") role = "gv";

  // Menu cấu hình theo role
  const menuConfig = {
    thuky: [
      { label: "Tổng quan", path: "/admin/tong-quan", icon: HiOutlineHome },
      { label: "Sinh viên", path: "/admin/sinhvien", icon: HiOutlineUsers,hidden: true },
      { label: "Giảng viên", path: "/admin/giangvien", icon: HiOutlineAcademicCap },
      { label: "Nhập liệu", path: "/admin/nhaplieu", icon: HiOutlineDocumentText, featureKey: "con_dangky" },
      { label: "Phân công GVHD", path: "/admin/phanconggvhd", icon: HiOutlineUserGroup, featureKey: "con_phancong_hd" },
      { label: "Giai đoạn", path: "/admin/giaidoan", icon: HiOutlineCog6Tooth },
    ],
    gv: [
      { label: "Tổng quan", path: "/gv/tong-quan", icon: HiOutlineHome },
      { label: "Đề tài", path: "/gv/de-tai", icon: HiOutlineDocumentText },
      { label: "Chấm giữa kỳ", path: "/gv/giua-ky", icon: HiOutlineChartBar },
      { label: "Chấm hướng dẫn", path: "/gv/huongdan", icon: HiOutlinePencilSquare },
      { label: "Chấm phản biện", path: "/gv/phanbien", icon: HiOutlineClipboardDocumentCheck },
      { label: "Chấm hội đồng", path: "/gv/hoidong", icon: HiOutlineUserGroup },
    ],
    sv:[
      { label: "Tổng quan", path: "/sv/dashboard", icon: HiOutlineHome },
      { label: "Đăng ký đề tài", path: "/sv/dang-ky-detai", icon: HiOutlinePencilSquare },
      { label: "Kết quả đề tài", path: "/sv/ket-qua-detai", icon: HiOutlineChartBar },
    ]
  };
  const rawMenuItems = role && menuConfig[role] ? menuConfig[role] : [];
  const menuItems = rawMenuItems.filter((item) => {
    if (item.hidden) return false;
    if (!item.featureKey) return true; // Mục mặc định luôn hiện
    return config[item.featureKey] === true || config[item.featureKey] === "true";
  });
  const roleLabels = { thuky: "Thư ký khoa", gv: "Giảng viên",sv: "Sinh viên" };
  const getRoleLabel = () => (role ? roleLabels[role] || "Người dùng" : "");

  const handleLogout = async () => {
    const isSv = role === "sv";
    try {
      await logout();
    } catch {}
    clearAuth();
    if (isSv) {
    navigate("/sv/login");
  } else {
    navigate("/login");
  }
  };

  return (
    <div
      className={`fixed z-40 left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform ${isOpen ? "" : "-translate-x-full"} md:translate-x-0 md:static`}
    >
      <div className="px-6 py-6 border-b border-slate-200 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-800">
          QL Luận văn
        </span>
        <button
          className="md:hidden text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <nav className="flex-1 mt-4">
  {isLoading ? (
    <div className="px-6 py-3 text-xs text-slate-400">Đang tải menu...</div>
  ) : (
    menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      return (
        <div
          key={item.path}
          onClick={() => {
            navigate(item.path);
            if (onClose) onClose();
          }}
          className={`flex items-center gap-3 px-6 py-3 text-sm cursor-pointer ...`}
        >
          <Icon size={18} />
          <span>{item.label}</span>
        </div>
      );
    })
  )}
</nav>

      <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <p
          className="text-sm font-medium text-slate-800 truncate"
          title={user?.name || "Người dùng"}
        >
          Xin chào, {user?.name || "Người dùng"}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{getRoleLabel()}</p>
        <div
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 -mx-2 mt-3 rounded transition-colors text-sm cursor-pointer w-fit font-medium"
        >
          <HiArrowRightOnRectangle size={18} />
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
}
