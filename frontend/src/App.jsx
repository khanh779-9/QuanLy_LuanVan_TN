import React from "react";
import { Route, Routes, Outlet, Navigate, NavLink } from "react-router-dom";
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

import HomePage from "./pages/HomePage";
import UsersPage from "./pages/users/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/thesis/LoginPage";
import Dashboard from "./pages/thesis/Dashboard";
import Assignment from "./pages/thesis/Assignment";
import Midterm from "./pages/thesis/Midterm";
import DataManagement from "./pages/thesis/TopicManagement";
import Review from "./pages/thesis/Review";
import Council from "./pages/thesis/Council";
import ThesisLayout from "./layouts/ThesisLayout";

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
