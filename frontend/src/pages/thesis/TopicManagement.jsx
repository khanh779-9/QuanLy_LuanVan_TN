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
          {/* ...existing code... */}
        </div>
      )}
      {showForm && (
        <div className="overlay">
          <div className="modal">
            {/* ...existing code... */}
          </div>
        </div>
      )}
    </div>
  );
}
