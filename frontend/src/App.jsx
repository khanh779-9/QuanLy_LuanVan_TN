import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/users/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";

import ThesisList from "./pages/thesis/ThesisList";
import LoginPage from "./pages/thesis/LoginPage";
import Dashboard from "./pages/thesis/Dashboard";
import Assignment from "./pages/thesis/Assignment";
import Midterm from "./pages/thesis/Midterm";
import Review from "./pages/thesis/Review";
import Council from "./pages/thesis/Council";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import React from "react";

function ThesisLayout() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/thesis/login" replace />;
  }
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Quản lý LVTN</h2>
        </div>
        <NavLink to="/thesis/dashboard" className={({isActive})=>isActive?"sidebar-link sidebar-link-active":"sidebar-link"}>Dashboard</NavLink>
        <NavLink to="/thesis/assignment" className={({isActive})=>isActive?"sidebar-link sidebar-link-active":"sidebar-link"}>Phân công</NavLink>
        <NavLink to="/thesis/midterm" className={({isActive})=>isActive?"sidebar-link sidebar-link-active":"sidebar-link"}>Giữa kỳ</NavLink>
        <NavLink to="/thesis/review" className={({isActive})=>isActive?"sidebar-link sidebar-link-active":"sidebar-link"}>Phản biện</NavLink>
        <NavLink to="/thesis/council" className={({isActive})=>isActive?"sidebar-link sidebar-link-active":"sidebar-link"}>Hội đồng</NavLink>
      </aside>
      <main style={{flex:1,background:'#f5f6fa',padding:24}}>
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

      <Route path="/thesis" >
        <Route path="login" element={<LoginPage />} />
        <Route element={<ThesisLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
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
