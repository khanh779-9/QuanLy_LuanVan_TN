import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteUser,
  fetchUsers,
  createUser,
  updateUser,
} from "../../services/usersApi";

const initialForm = {
  name: "",
  email: "",
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const submitLabel = useMemo(() => {
    return editingUserId ? "Cập nhật" : "Thêm";
  }, [editingUserId]);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      setErrorMessage(error.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit(user) {
    setEditingUserId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
    });
    setErrorMessage("");
  }

  function resetForm() {
    setEditingUserId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage("Tên không được để trống.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
    };

    try {
      if (editingUserId) {
        await updateUser(editingUserId, payload);
      } else {
        await createUser(payload);
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Đã xảy ra lỗi khi lưu user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(userId) {
    const shouldDelete = window.confirm("Bạn có chắc chắn muốn xóa user này?");
    if (!shouldDelete) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await deleteUser(userId);

      if (editingUserId === userId) {
        resetForm();
      }

      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Đã xảy ra lỗi khi xóa  user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card">

        <div style={{display: "flex", gap: "1rem"}}>
          <div className="quick-links" style={{height:"10px", padding:"0px"}}>
            <Link className="link-button" to="/">
              &larr; Quay trở lại
            </Link>
          </div>
          <h1>Test quản lý user</h1>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Tên</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Nhập tên user"
              value={form.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="actions-row">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : submitLabel}
            </button>
            {editingUserId ? (
              <button type="button" className="secondary" onClick={resetForm}>
                Hủy
              </button>
            ) : null}
          </div>
        </form>

        {errorMessage ? <p className="error">{errorMessage}</p> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4}>Đang tải dữ liệu...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4}>Chưa có user nào.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email || "-"}</td>
                    <td className="action-buttons">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleEdit(user)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default UsersPage;
