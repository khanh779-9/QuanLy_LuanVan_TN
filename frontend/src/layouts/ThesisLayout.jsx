import React, { useState } from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBars,
  faXmark,
  faGavel,
  faHouse,
  faInfo,
  faListCheck,
  faPeopleGroup,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import StuLogo from "../../public/assets/Logo_STU.png";
import { logout } from "../services/authService";

function ThesisLayout() {
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/thesis/login" replace />;
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside
        className={`sidebar${sidebarOpen ? " sidebar-mobile-open" : ""}`}
        style={{ boxShadow: "2px 0px 10px rgba(0,0,0,0.2)" }}
      >
        <div className="sidebar-header flex items-center gap-4">
          <img
            src={StuLogo}
            alt="STU Logo"
            className="object-contain drop-shadow-sm"
            style={{ width: "80px" }}
          />
          <div>
            <h2 className="mt-[10px] font-bold">MANAGING</h2>
            <h3>Graduation Theses</h3>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
          </button>
        </div>
        <div className="mt-5"></div>
        <NavLink
          to="/thesis/dashboard"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faHouse} className="pr-3" />
          Trang chủ
        </NavLink>

        <NavLink
          to="/thesis/topicmanagement"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faInfo} className="pr-3" />
          Quản lý đề tài
        </NavLink>

        <NavLink
          to="/thesis/assignment"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faListCheck} className="pr-3" />
          Phân công
        </NavLink>
        <NavLink
          to="/thesis/midterm"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faBook} className="pr-3" />
          Giữa kỳ
        </NavLink>
        <NavLink
          to="/thesis/review"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faGavel} className="pr-3" />
          Phản biện
        </NavLink>
        <NavLink
          to="/thesis/council"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faPeopleGroup} className="pr-3" />
          Hội đồng
        </NavLink>

        <div className="sidebar-footer">
          <div
           className="w-full text-left font-bold text-red-500 hover:text-red-700 transition-all cursor-pointer hover:scale-105"
            onClick={() => {
              logout();
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="pr-3" />
            Logout
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile topbar */}
        <header className="mobile-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="mobile-topbar-title">
            <img src={StuLogo} alt="STU Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span>MANAGING</span>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            background: "url('/assets/background.jpg')",
            padding: 24,
            backgroundSize: "cover",
          }}
          className="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ThesisLayout;
