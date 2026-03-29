import React, { useState, useEffect } from "react";
import {
  fetchThesesForm,
  createThesisForm,
  updateThesisForm,
  deleteThesisForm,
  deleteAllThesisForms,
} from "../../services/thesisFormService";

import Toast from "../../components/Toast"; 
import LoadingSection from "../../components/LoadingSection";

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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  // Fetch data from API
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchThesesForm();
      setData(res || []);
      // setToast({ show: true, type: "success", message: "Tải dữ liệu thành công!" }); // Không cần thông báo khi chỉ tải dữ liệu
    } catch (e) {
      setError("Không thể tải dữ liệu: " + (e.message || e));
      setToast({ show: true, type: "error", message: "Không thể tải dữ liệu: " + (e.message || e) });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic_title || !form.student1_id || !form.student1_name) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      setToast({ show: true, type: "error", message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
      return;
    }
    setError("");
    try {
      if (editingId !== null) {
        await updateThesisForm(editingId, form);
        setToast({ show: true, type: "success", message: "Cập nhật đăng ký thành công!" });
      } else {
        await createThesisForm(form);
        setToast({ show: true, type: "success", message: "Thêm đăng ký mới thành công!" });
      }
      await loadData();
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
    } catch (e) {
      setError("Lỗi khi lưu dữ liệu: " + (e.message || e));
      setToast({ show: true, type: "error", message: "Lỗi khi lưu dữ liệu: " + (e.message || e) });
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await deleteThesisForm(id);
        setToast({ show: true, type: "success", message: "Xóa đăng ký thành công!" });
        await loadData();
      } catch (e) {
        setError("Lỗi khi xóa: " + (e.message || e));
        setToast({ show: true, type: "error", message: "Lỗi khi xóa: " + (e.message || e) });
      }
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
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      {loading && <LoadingSection text="Đang tải dữ liệu..." />}
      {!loading && (
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
            Thêm mới
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            justifyContent: "flex-start",
            alignItems: "stretch",
          }}
        >
          {data.length === 0 ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                color: "#888",
                padding: 32,
              }}
            >
              Chưa có dữ liệu
            </div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                style={{
                  background: editingId === item.id ? "#f1f5f9" : "#fff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 16,
                  boxShadow: "0 4px 16px #0001",
                  padding: 28,
                  minWidth: 340,
                  maxWidth: 380,
                  flex: "1 1 340px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "340px",
                  marginBottom: 8,
                  position: "relative",
                  transition: "box-shadow 0.2s, border 0.2s",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 20,
                      color: "#2563eb",
                      marginBottom: 2,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.topic_title || (
                      <span style={{ color: "#bbb" }}>[Chưa có tiêu đề]</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: "#444", marginBottom: 2 }}>
                    <span style={{ marginRight: 12 }}>
                      <b>Loại:</b>{" "}
                      {typeOptions.find((t) => t.value === item.topic_type)
                        ?.label || item.topic_type}
                    </span>
                    <span>
                      <b>Trạng thái:</b>{" "}
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
                    </span>
                  </div>
                  <div style={{ fontSize: 15, marginBottom: 2 }}>
                    <b>SV1:</b>{" "}
                    {item.student1_name || (
                      <span style={{ color: "#bbb" }}>[Chưa có tên]</span>
                    )}{" "}
                    {item.student1_id && `(${item.student1_id})`}
                    <br />
                    <b>Lớp:</b>{" "}
                    {item.student1_class || (
                      <span style={{ color: "#bbb" }}>[Chưa có lớp]</span>
                    )}{" "}
                    <b>Email:</b>{" "}
                    {item.student1_email || (
                      <span style={{ color: "#bbb" }}>[Chưa có email]</span>
                    )}
                  </div>
                  {item.student2_name && (
                    <div style={{ fontSize: 15, marginBottom: 2 }}>
                      <b>SV2:</b> {item.student2_name}{" "}
                      {item.student2_id && `(${item.student2_id})`}
                      <br />
                      <b>Lớp:</b>{" "}
                      {item.student2_class || (
                        <span style={{ color: "#bbb" }}>[Chưa có lớp]</span>
                      )}{" "}
                      <b>Email:</b>{" "}
                      {item.student2_email || (
                        <span style={{ color: "#bbb" }}>[Chưa có email]</span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 15, marginBottom: 2 }}>
                    <b>GVHD:</b>{" "}
                    {item.gvhd_code || (
                      <span style={{ color: "#bbb" }}>[Chưa có mã]</span>
                    )}{" "}
                    {item.gvhd_workplace && (
                      <span>({item.gvhd_workplace})</span>
                    )}
                  </div>
                  {item.gvpb_code && (
                    <div style={{ fontSize: 15, marginBottom: 2 }}>
                      <b>GV phản biện:</b> {item.gvpb_code}
                    </div>
                  )}
                  {item.note && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "#b45309",
                        marginBottom: 2,
                      }}
                    >
                      <b>Ghi chú:</b> {item.note}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>
                    <b>Ngày đăng ký:</b>{" "}
                    {item.registered_at ? (
                      item.registered_at
                    ) : (
                      <span style={{ color: "#bbb" }}>[Chưa có]</span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 18,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-warning btn-sm"
                    style={{ borderRadius: 6, fontWeight: 600, minWidth: 64 }}
                    onClick={() => handleEdit(item)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ borderRadius: 6, fontWeight: 600, minWidth: 64 }}
                    onClick={() => handleDelete(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

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
