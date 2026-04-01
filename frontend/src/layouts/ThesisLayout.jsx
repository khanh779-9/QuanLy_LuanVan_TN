import React from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
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
  if (!token) {
    return <Navigate to="/thesis/login" replace />;
  }
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        className="sidebar"
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
        </div>
        <div className="mt-5"></div>
        <NavLink
          to="/thesis/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faHouse} className="pr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/thesis/topicmanagement"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faInfo} className="pr-3" />
          Topic Management
        </NavLink>

        <NavLink
          to="/thesis/assignment"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faListCheck} className="pr-3" />
          Assignment
        </NavLink>
        <NavLink
          to="/thesis/midterm"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faBook} className="pr-3" />
          Midterm
        </NavLink>
        <NavLink
          to="/thesis/review"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faGavel} className="pr-3" />
          Counter-Argument
        </NavLink>
        <NavLink
          to="/thesis/council"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faPeopleGroup} className="pr-3" />
          Council
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
      <main
        style={{
          flex: 1,
          background: "url('/assets/background.jpg')",
          padding: 24,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default ThesisLayout;
