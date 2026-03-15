import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/users/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
