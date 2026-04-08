import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "../../components/AccessDenied";
import { ROLES } from "../../constants/roles";
import FormField from "../../components/FormField";
import {
  fetchThesesForm,
  createThesisForm,
  updateThesisForm,
  deleteThesisForm,
  deleteAllThesisForms,
  importThesisForms,
} from "../../services/thesisFormService";

import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../utils/convertFormat";

const initialForm = {
  topic_title: "",
  topic_description: "",
  topic_type: "mot_sinh_vien",
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
  status: "cho_duyet",
};

const statusOptions = [
  { value: "cho_duyet", label: "Chờ duyệt" },
  { value: "da_duyet", label: "Đã duyệt" },
  { value: "tu_choi", label: "Từ chối" },
];

const typeOptions = [
  { value: "mot_sinh_vien", label: "1 sinh viên" },
  { value: "hai_sinh_vien", label: "2 sinh viên" },
];

const statusLabelMap = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const statusValueMap = {
  pending: "cho_duyet",
  approved: "da_duyet",
  rejected: "tu_choi",
};

const typeLabelMap = {
  mot_sinh_vien: "1 SV",
  hai_sinh_vien: "2 SV",
  single: "1 SV",
  group: "2 SV",
};

const typeValueMap = {
  single: "mot_sinh_vien",
  group: "hai_sinh_vien",
};

const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {};

export default function DataManagement() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchThesesForm();
      setData(res || []);
      // ...existing code...
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
    // ...existing code...
    if (form.student2_email && !emailRegex.test(form.student2_email)) {
      setError("Email SV 2 không hợp lệ!");
      setToast({
        show: true,
        type: "error",
        message: "Email SV 2 không hợp lệ!",
      });
      return;
    }

    setError("");
    setLoading(true);
    try {
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
      setShowForm(false);
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
    const normalize = (value) => (value === null || value === undefined ? "" : value);

    setForm({
      ...item,
      topic_title: normalize(item.topic_title),
      topic_description: normalize(item.topic_description),
      student1_id: normalize(item.student1_id),
      student1_name: normalize(item.student1_name),
      student1_class: normalize(item.student1_class),
      student1_email: normalize(item.student1_email),
      student2_id: normalize(item.student2_id),
      student2_name: normalize(item.student2_name),
      student2_class: normalize(item.student2_class),
      student2_email: normalize(item.student2_email),
      gvhd_code: normalize(item.gvhd_code),
      gvhd_workplace: normalize(item.gvhd_workplace),
      gvpb_code: normalize(item.gvpb_code),
      note: normalize(item.note),
      status: statusValueMap[item.status] || item.status,
      topic_type: typeValueMap[item.topic_type] || item.topic_type,
    });
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

  const handleImport = async () => {
    if (!importFile) {
      setToast({
        show: true,
        type: "error",
        message: "Vui lòng chọn file Excel trước khi import.",
      });
      return;
    }

    setImporting(true);
    setImportErrors([]);
    try {
      const result = await importThesisForms(importFile);
      setToast({
        show: true,
        type: "success",
        message: `Import thành công ${result.imported || 0} dòng.`,
      });
      if (result.errors?.length) {
        setImportErrors(result.errors);
      }
      await loadData();
    } catch (e) {
      setToast({
        show: true,
        type: "error",
        message: e?.message || "Không thể import dữ liệu.",
      });
    }
    setImporting(false);
  };

  // RBAC: Only ThuKy can access
  if (!user || user.role !== ROLES.THUKY) {
    return (
      <div className="topic-management-page">
        <AccessDenied message="Chỉ thư ký (ThuKy) mới được phép truy cập chức năng này." />
      </div>
    );
  }

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
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setShowForm(true);
              }}
            >
              Thêm đăng ký
            </button>
            <button
              className="btn btn-secondary"
              onClick={async () => {
                if (window.confirm("Xóa toàn bộ đăng ký?")) {
                  setLoading(true);
                  try {
                    await deleteAllThesisForms();
                    await loadData();
                    setToast({
                      show: true,
                      type: "success",
                      message: "Đã xóa toàn bộ đăng ký.",
                    });
                  } catch (e) {
                    setToast({
                      show: true,
                      type: "error",
                      message: e?.message || "Không thể xóa dữ liệu.",
                    });
                  }
                  setLoading(false);
                }
              }}
            >
              Xóa tất cả
            </button>
          </div>

          {/* <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12, color: "#1e293b" }}>
              Import đăng ký đề tài
            </h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <button
                className="btn btn-secondary"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? "Đang import..." : "Import"}
              </button>
            </div>
            {importErrors.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, color: "#b91c1c" }}>
                  Lỗi import:
                </div>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {importErrors.slice(0, 10).map((err, idx) => (
                    <li key={`${err.row}-${idx}`}>
                      Dòng {err.row}: {err.msg}
                    </li>
                  ))}
                  {importErrors.length > 10 && (
                    <li>...và {importErrors.length - 10} lỗi khác</li>
                  )}
                </ul>
              </div>
            )}
          </div> */}

          {error && (
            <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>
          )}

          <div className="table-responsive"><table className="thesis-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>SV 1</th>
                <th>SV 2</th>
                <th>GVHD</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 16 }}>
                    Chưa có đăng ký nào.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.topic_title}</td>
                    <td>
                      {typeLabelMap[item.topic_type] || item.topic_type}
                    </td>
                    <td>
                      {item.student1_name} ({item.student1_id})
                    </td>
                    <td>
                      {item.student2_name
                        ? `${item.student2_name} (${item.student2_id})`
                        : "-"}
                    </td>
                    <td>{item.gvhd_code || "-"}</td>
                    <td>
                      {statusLabelMap[item.status] || item.status}
                    </td>
                    <td>{formatDate(item.registered_at || item.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(item)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item.id)}
                        style={{ marginLeft: 8 }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>
      )}
      {showForm && (
        <div className="overlay">
          <div className="modal">
            <h3 style={{ marginBottom: 12 }}>
              {editingId ? "Cập nhật đăng ký" : "Thêm đăng ký"}
            </h3>
            <form onSubmit={handleSubmit} className="thesis-form">
              <div className="thesis-form-grid">
                <section className="thesis-form-section">
                  <h4>Thông tin đề tài</h4>
                  <div className="thesis-form-fields">
                    <FormField
                      label="Tiêu đề"
                      name="topic_title"
                      value={form.topic_title}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Mô tả"
                      name="topic_description"
                      value={form.topic_description}
                      onChange={handleChange}
                    />
                    <FormField
                      as="select"
                      label="Loại đề tài"
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
                </section>

                <section className="thesis-form-section">
                  <h4>Thông tin sinh viên 1</h4>
                  <div className="thesis-form-fields">
                    <FormField
                      label="MSSV 1"
                      name="student1_id"
                      value={form.student1_id}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Tên SV 1"
                      name="student1_name"
                      value={form.student1_name}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Lớp SV 1"
                      name="student1_class"
                      value={form.student1_class}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Email SV 1"
                      name="student1_email"
                      value={form.student1_email}
                      onChange={handleChange}
                    />
                  </div>
                </section>

                <section className="thesis-form-section">
                  <h4>Thông tin sinh viên 2</h4>
                  <div className="thesis-form-fields">
                    <FormField
                      label="MSSV 2"
                      name="student2_id"
                      value={form.student2_id}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Tên SV 2"
                      name="student2_name"
                      value={form.student2_name}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Lớp SV 2"
                      name="student2_class"
                      value={form.student2_class}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Email SV 2"
                      name="student2_email"
                      value={form.student2_email}
                      onChange={handleChange}
                    />
                  </div>
                </section>

                <section className="thesis-form-section">
                  <h4>Giảng viên & trạng thái</h4>
                  <div className="thesis-form-fields">
                    <FormField
                      label="Mã GVHD"
                      name="gvhd_code"
                      value={form.gvhd_code}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Nơi công tác GVHD"
                      name="gvhd_workplace"
                      value={form.gvhd_workplace}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Mã GVPB"
                      name="gvpb_code"
                      value={form.gvpb_code}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Ghi chú"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                    />
                    <FormField
                      as="select"
                      label="Trạng thái"
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
                  </div>
                </section>
              </div>

              <div className="thesis-form-actions">
                <button className="btn btn-primary" type="submit">
                  Lưu
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
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
