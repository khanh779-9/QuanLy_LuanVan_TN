import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/users/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import ThesisManagementPage from "./pages/thesis";
import Dashbroad from "./pages/thesis/Dashbroad";
import TopicManagement from "./pages/thesis/TopicManagement";
import Midterm from "./pages/thesis/Midterm";
import CounterArgument from "./pages/thesis/CounterArgument";
import Council from "./pages/thesis/Council";
import LoginPage from "./pages/thesis/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/thesis">
        <Route index element={<ThesisManagementPage />} />
        <Route path="dashbroad" element={<Dashbroad />} />
        <Route path="topic" element={<TopicManagement />} />
        <Route path="midterm" element={<Midterm />} />
        <Route path="counter" element={<CounterArgument />} />
        <Route path="council" element={<Council />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
