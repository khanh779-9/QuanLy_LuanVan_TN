import React, { useState } from "react";

const initialForm = {
  topic_title: "",
  topic_description: "",
  topic_type: "single",
  student1_id: "",
  student1_name: "",
  student1_class: "",
  student1_email: "",
  student2_id: "",
  student2_name: "",
  student2_class: "",
  student2_email: "",
  gvhd_code: "",
  gvhd_workplace: "",
  gvpb_code: "",
  note: "",
  source: "google_form",
  status: "pending",
};

const statusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const typeOptions = [
  { value: "single", label: "1 sinh viên" },
  { value: "group", label: "2 sinh viên" },
];

export default function DataManagement() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic_title || !form.student1_id || !form.student1_name) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    setError("");
    if (editingId !== null) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...form, id: editingId } : item,
        ),
      );
    } else {
      setData((prev) => [
        ...prev,
        { ...form, id: Date.now(), registered_at: new Date().toLocaleString() },
      ]);
    }
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px #0002",
          padding: 32,
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            color: "#2d3a4a",
            marginBottom: 16,
            letterSpacing: 1,
          }}
        >
          Quản lý Đăng ký Đề tài
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#888" }}>
            Tổng số: <b>{data.length}</b>
          </span>
          <button
            className="btn btn-primary"
            style={{
              borderRadius: 8,
              fontWeight: 600,
              padding: "8px 24px",
              background: "#2563eb",
              border: "none",
            }}
            onClick={() => {
              setShowForm(true);
              setForm(initialForm);
              setEditingId(null);
            }}
          >
            + Thêm mới
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            className="table table-bordered"
            style={{ background: "#f9fafb", borderRadius: 8, minWidth: 900 }}
          >
            <thead style={{ background: "#e5e7eb" }}>
              <tr style={{ textAlign: "center" }}>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>SV1</th>
                <th>SV2</th>
                <th>GVHD</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      textAlign: "center",
                      background: editingId === item.id ? "#f1f5f9" : undefined,
                    }}
                  >
                    <td>{item.id}</td>
                    <td
                      style={{
                        maxWidth: 180,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.topic_title}
                    </td>
                    <td>
                      {typeOptions.find((t) => t.value === item.topic_type)
                        ?.label || item.topic_type}
                    </td>
                    <td>{item.student1_name}</td>
                    <td>{item.student2_name}</td>
                    <td>{item.gvhd_code}</td>
                    <td>
                      <span
                        style={{
                          background:
                            item.status === "approved"
                              ? "#22c55e22"
                              : item.status === "rejected"
                                ? "#ef444422"
                                : "#facc1522",
                          color:
                            item.status === "approved"
                              ? "#16a34a"
                              : item.status === "rejected"
                                ? "#b91c1c"
                                : "#b45309",
                          borderRadius: 8,
                          padding: "2px 10px",
                          fontWeight: 600,
                        }}
                      >
                        {statusOptions.find((s) => s.value === item.status)
                          ?.label || item.status}
                      </span>
                    </td>
                    <td>{item.registered_at}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm mr-2"
                        style={{ borderRadius: 6, fontWeight: 500 }}
                        onClick={() => handleEdit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ borderRadius: 6, fontWeight: 500 }}
                        onClick={() => handleDelete(item.id)}
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
      </div>

      {/* Modal Dialog for Form */}
      {showForm && (
        <div className="overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCancel}>
              ×
            </button>

            <form onSubmit={handleSubmit}>
              <h3 className="title">
                {editingId ? "Chỉnh sửa" : "Thêm mới"} đăng ký đề tài
              </h3>

              {error && <div className="alert alert-danger">{error}</div>}

              {/* ===== ĐỀ TÀI ===== */}
              <div className="section">
                <div className="grid-2">
                  <div>
                    <label>Tiêu đề *</label>
                    <input
                      name="topic_title"
                      value={form.topic_title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label>Loại *</label>
                    <select
                      name="topic_type"
                      value={form.topic_type}
                      onChange={handleChange}
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>Mô tả</label>
                  <textarea
                    name="topic_description"
                    value={form.topic_description}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
              </div>

              {/* ===== SV1 ===== */}
              <div className="section">
                <h5>Sinh viên 1</h5>
                <div className="grid-2">
                  <input
                    placeholder="MSSV *"
                    name="student1_id"
                    value={form.student1_id}
                    onChange={handleChange}
                    required
                  />
                  <input
                    placeholder="Tên SV *"
                    name="student1_name"
                    value={form.student1_name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    placeholder="Lớp *"
                    name="student1_class"
                    value={form.student1_class}
                    onChange={handleChange}
                    required
                  />
                  <input
                    placeholder="Email"
                    name="student1_email"
                    value={form.student1_email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ===== SV2 ===== */}
              {(form.topic_type === "group" ||
                form.student2_id ||
                form.student2_name ||
                form.student2_class ||
                form.student2_email) && (
                <div className="section sub">
                  <h5>Sinh viên 2</h5>
                  <div className="grid-2">
                    <input
                      placeholder="MSSV 2"
                      name="student2_id"
                      value={form.student2_id}
                      onChange={handleChange}
                    />
                    <input
                      placeholder="Tên SV 2"
                      name="student2_name"
                      value={form.student2_name}
                      onChange={handleChange}
                    />
                    <input
                      placeholder="Lớp"
                      name="student2_class"
                      value={form.student2_class}
                      onChange={handleChange}
                    />
                    <input
                      placeholder="Email"
                      name="student2_email"
                      value={form.student2_email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* ===== GIẢNG VIÊN ===== */}
              <div className="section">
                <h5>Giảng viên</h5>
                <div className="grid-2">
                  <input
                    placeholder="Mã GVHD"
                    name="gvhd_code"
                    value={form.gvhd_code}
                    onChange={handleChange}
                  />
                  <input
                    placeholder="Nơi công tác"
                    name="gvhd_workplace"
                    value={form.gvhd_workplace}
                    onChange={handleChange}
                  />
                  <input
                    placeholder="Mã GV phản biện"
                    name="gvpb_code"
                    value={form.gvpb_code}
                    onChange={handleChange}
                  />
                  <input
                    placeholder="Nguồn"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ===== KHÁC ===== */}
              <div className="section">
                <div className="grid-2">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Ghi chú"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ACTION */}
              <div className="actions">
                <button className="btn btn-success">Lưu</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
