import {
  faBook,
  faGavel,
  faHouse,
  faInfo,
  faListCheck,
  faPeopleGroup,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/users/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";

import ThesisList from "./pages/thesis/ThesisList";
import LoginPage from "./pages/thesis/LoginPage";
import Dashboard from "./pages/thesis/Dashboard";
import Assignment from "./pages/thesis/Assignment";
import Midterm from "./pages/thesis/Midterm";
import DataManagement from "./pages/thesis/DataManagement";
import Review from "./pages/thesis/Review";
import Council from "./pages/thesis/Council";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import React from "react";
import StuLogo from "../public/assets/Logo_STU.png";
import { logout } from "./services/authApi";

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
          to="/thesis/datamanagement"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faInfo} className="pr-3" />
          Data Management
        </NavLink>

        <NavLink
          to="/thesis/assignment"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
          }
        >
          <FontAwesomeIcon icon={faListCheck} className="pr-3" />
          Topic Management
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
            to=""
            className="w-full text-left font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
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
        // style={{ flex: 1, background: "#f5f6fa", padding: 24 }}
        style={{
          flex: 1,
          background: "url('../public/assets/background.jpg')",
          padding: 24,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />

      <Route path="/thesis">
        <Route path="login" element={<LoginPage />} />
        <Route element={<ThesisLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="datamanagement" element={<DataManagement />} />
          <Route path="assignment" element={<Assignment />} />
          <Route path="midterm" element={<Midterm />} />
          <Route path="review" element={<Review />} />
          <Route path="council" element={<Council />} />
          <Route index element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
