import React, { useState, useEffect } from "react";
import FormField from "../../components/FormField";
import {
  fetchThesesForm,
  createThesisForm,
  updateThesisForm,
  deleteThesisForm,
  deleteAllThesisForms,
} from "../../services/thesisFormService";

import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../utils/convertFormat";

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
  gvhd_workplace: "ĐH CNSG",
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
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Fetch data from API
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchThesesForm();
      setData(res || []);
      // setToast({ show: true, type: "success", message: "Tải dữ liệu thành công!" }); // Không cần thông báo khi chỉ tải dữ liệu
    } catch (e) {
      setError("Không thể tải dữ liệu: " + (e.message || e));
      setToast({
        show: true,
        type: "error",
        message: "Không thể tải dữ liệu: " + (e.message || e),
      });
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
    // Validate các trường bắt buộc theo BE
    const requiredFields = [
      { key: "topic_title", label: "Tiêu đề" },
      { key: "topic_description", label: "Mô tả" },
      { key: "topic_type", label: "Loại đề tài" },
      { key: "student1_id", label: "MSSV 1" },
      { key: "student1_name", label: "Tên SV 1" },
      { key: "student1_class", label: "Lớp SV 1" },
      { key: "student1_email", label: "Email SV 1" },
      { key: "gvhd_workplace", label: "Nơi công tác GVHD" },
    ];
    for (let f of requiredFields) {
      if (
        !form[f.key] ||
        (typeof form[f.key] === "string" && form[f.key].trim() === "")
      ) {
        setError(`Vui lòng nhập ${f.label}!`);
        setToast({
          show: true,
          type: "error",
          message: `Vui lòng nhập ${f.label}!`,
        });
        return;
      }
    }
    // Validate email SV1
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.student1_email)) {
      setError("Email SV 1 không hợp lệ!");
      setToast({
        show: true,
        type: "error",
        message: "Email SV 1 không hợp lệ!",
      });
      return;
    }
    // Nếu có SV2 email thì kiểm tra hợp lệ
    if (form.student2_email && !emailRegex.test(form.student2_email)) {
      setError("Email SV 2 không hợp lệ!");
      setToast({
        show: true,
        type: "error",
        message: "Email SV 2 không hợp lệ!",
      });
      return;
    }
    // MSSV cho nhập tự do, không kiểm tra kiểu số
    setError("");
    setLoading(true);
    try {
      // Gửi dữ liệu giữ nguyên MSSV là string
      const payload = {
        ...form,
      };
      let res;
      if (editingId !== null) {
        res = await updateThesisForm(editingId, payload);
        setToast({
          show: true,
          type: "success",
          message: res?.message || "Cập nhật đăng ký thành công!",
        });
      } else {
        res = await createThesisForm(payload);
        setToast({
          show: true,
          type: "success",
          message: res?.message || "Thêm đăng ký mới thành công!",
        });
      }
      setShowForm(false); // Đóng form ngay khi lưu thành công
      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (e) {
      setError("Lỗi khi lưu dữ liệu: " + (e.message || e));
      setToast({
        show: true,
        type: "error",
        message: e?.message || "Lỗi khi lưu dữ liệu!",
      });
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setForm({ ...item });
    setEditingId(item.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      setLoading(true);
      try {
        const res = await deleteThesisForm(id);
        setToast({
          show: true,
          type: "success",
          message: res?.message || "Xóa đăng ký thành công!",
        });
        await loadData();
      } catch (e) {
        setError("Lỗi khi xóa: " + (e.message || e));
        setToast({
          show: true,
          type: "error",
          message: e?.message || "Lỗi khi xóa!",
        });
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="topic-management-page">
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <h2
        style={{
          color: "#2d3a4a",
          marginBottom: 16,
        }}
      >
        Quản lý Đăng ký Đề tài
      </h2>
      {loading && <LoadingSection />}
      {!loading && (
        <div>
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
              className="btn btn-success"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                padding: "8px 24px",
                border: "none",
                background: "#0a664f",
                right: 16,
                position: "relative",
              }}
              onClick={() => {
                // Này chỗ nhập file Excel, chưa làm nên tạm thời để alert
                alert("Tính năng này đang được phát triển!");
              }}
            >
              Nhập file Excel
            </button>

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
            <div style={{ overflowX: "auto" }}>
              <table className="thesis-table">
                <thead style={{ background: "#f1f5f9" }}>
                  <tr>
                    <th>STT</th>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Sinh viên 1</th>
                    <th>Sinh viên 2</th>
                    <th>GVHD</th>
                    <th>GV phản biện</th>
                    <th>Ngày đăng ký</th>
                    <th>Ghi chú</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ padding: 10 }}>{idx + 1}</td>
                      <td>
                        {item.topic_title || (
                          <span style={{ color: "#bbb" }}>[Chưa có]</span>
                        )}
                      </td>
                      <td>
                        {typeOptions.find((t) => t.value === item.topic_type)
                          ?.label || item.topic_type}
                      </td>
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
                            width: "fit-content",
                          }}
                        >
                          {statusOptions.find((s) => s.value === item.status)
                            ?.label || item.status}
                        </span>
                      </td>
                      <td style={{ padding: 10, textAlign: "left" }}>
                        {item.student1_id || item.student1_name ? (
                          <>
                            {item.student1_id ? (
                              item.student1_id
                            ) : (
                              <span style={{ color: "#bbb" }}>
                                [Chưa có MSSV]
                              </span>
                            )}
                            ,{" "}
                            {item.student1_name ? (
                              item.student1_name
                            ) : (
                              <span style={{ color: "#bbb" }}>
                                [Chưa có tên]
                              </span>
                            )}
                          </>
                        ) : (
                          <span style={{ color: "#bbb" }}>[Chưa có]</span>
                        )}
                      </td>
                      <td style={{ padding: 10, textAlign: "left" }}>
                        {item.student2_id || item.student2_name ? (
                          <>
                            {item.student2_id ? (
                              item.student2_id
                            ) : (
                              <span style={{ color: "#bbb" }}>
                                [Chưa có MSSV]
                              </span>
                            )}
                            ,{" "}
                            {item.student2_name ? (
                              item.student2_name
                            ) : (
                              <span style={{ color: "#bbb" }}>
                                [Chưa có tên]
                              </span>
                            )}
                          </>
                        ) : (
                          <span style={{ color: "#bbb" }}>[Không có]</span>
                        )}
                      </td>
                      <td style={{ padding: 10, textAlign: "left" }}>
                        {item.gvhd_code || (
                          <span style={{ color: "#bbb" }}>[Chưa có]</span>
                        )}
                      </td>

                      <td style={{ padding: 10 }}>
                        {item.gvpb_code || (
                          <span style={{ color: "#bbb" }}>[Chưa có]</span>
                        )}
                      </td>
                      <td style={{ padding: 10 }}>
                        {item.registered_at ? (
                         formatDate(item.registered_at, "dd/MM/yyyy HH:mm")
                        ) : (
                          <span style={{ color: "#bbb" }}>[Chưa có]</span>
                        )}
                      </td>
                      <td style={{ padding: 10 }}>
                        {item.note || (
                          <span style={{ color: "#bbb" }}>[Không có]</span>
                        )}
                      </td>
                      <td style={{ padding: 10 }}>
                        <button
                          className="btn btn-warning btn-sm"
                          style={{
                            marginBottom: 4,
                          }}
                          onClick={() => handleEdit(item)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{
                            marginBottom: 4,
                          }}
                          onClick={() => handleDelete(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <FormField
                    label="Tiêu đề *"
                    name="topic_title"
                    value={form.topic_title}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Loại *"
                    as="select"
                    name="topic_type"
                    value={form.topic_type}
                    onChange={handleChange}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </FormField>
                </div>

                <FormField
                  label="Mô tả"
                  as="textarea"
                  name="topic_description"
                  value={form.topic_description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              {/* ===== SV1 ===== */}
              <div className="section">
                <h5>Sinh viên 1</h5>
                <div className="grid-2">
                  <FormField
                    placeholder="MSSV *"
                    name="student1_id"
                    value={form.student1_id}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    placeholder="Tên SV *"
                    name="student1_name"
                    value={form.student1_name}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    placeholder="Lớp *"
                    name="student1_class"
                    value={form.student1_class}
                    onChange={handleChange}
                    required
                  />
                  <FormField
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
                    <FormField
                      placeholder="MSSV 2"
                      name="student2_id"
                      value={form.student2_id}
                      onChange={handleChange}
                    />
                    <FormField
                      placeholder="Tên SV 2"
                      name="student2_name"
                      value={form.student2_name}
                      onChange={handleChange}
                    />
                    <FormField
                      placeholder="Lớp"
                      name="student2_class"
                      value={form.student2_class}
                      onChange={handleChange}
                    />
                    <FormField
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
                  <FormField
                    placeholder="Mã GVHD"
                    name="gvhd_code"
                    value={form.gvhd_code}
                    onChange={handleChange}
                  />
                  <FormField
                    placeholder="Nơi công tác"
                    name="gvhd_workplace"
                    value={form.gvhd_workplace}
                    onChange={handleChange}
                  />
                  <FormField
                    placeholder="Mã GV phản biện"
                    name="gvpb_code"
                    value={form.gvpb_code}
                    onChange={handleChange}
                  />
                  <FormField
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
                  <FormField
                    as="select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </FormField>
                  <FormField
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
