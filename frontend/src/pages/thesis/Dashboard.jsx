import React, { useEffect, useState } from "react";
import ThesisTable from "../../components/ThesisTable";
import ThesisFormModal from "../../components/ThesisFormModal";
import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";
import { fetchCurrentUser } from "../../services/authApi";
import { fetchDashboard } from "../../services/dashboardApi";

import {
  fetchTheses,
  createThesis,
  updateThesis,
  deleteThesis,
} from "../../services/thesisApi";
import {
  fetchStudents,
  createStudents,
  updateStudent,
  deleteStudent,
} from "../../services/studentApi";

export default function Dashboard() {
  const [aboutMe, setAboutMe] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // Thống kê
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    students_all: 0,
    finished: 0,
    presentations: 0,
  });

  // useEffect(() => {
  //   fetchCurrentUser()
  //     .then((user) => setAboutMe(user))
  //     .catch(() => setAboutMe(null));
  // }, []);

  const showToast = (message, type = "info") =>
    setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      // Gọi song song các API
      const [aboutMeRes, thesesRes, studentsRes, dashboardRes] = await Promise.all([
        fetchCurrentUser().catch(() => null),
        fetchTheses().catch(() => []),
        fetchStudents().catch(() => []),
        fetchDashboard().catch(() => null),
      ]);
      setAboutMe(aboutMeRes);
      setData(thesesRes);
      const student_Count = studentsRes ? JSON.stringify(studentsRes).length : 0;
      setStats({
        total: thesesRes.length,
        students: thesesRes.reduce((sum, t) => sum + (t.students?.length || 0), 0),
        students_all: student_Count,
        finished: thesesRes.filter((t) => t.trangThai === "Đã hoàn thành").length,
        presentations: dashboardRes?.cauhinh?.giaiDoan || 0,
      });
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };
  const handleEdit = (row) => {
    setEditData(row);
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm("Xóa luận văn này?")) {
      try {
        await deleteThesis(row.maDeTai);
        showToast("Xóa thành công!", "success");
        loadData();
      } catch (e) {
        showToast(e.message, "error");
      }
    }
  };
  const handleDetail = (row) => {
    showToast("Chi tiết: " + row.tenDeTai, "info");
  };
  const handleSubmit = async (form) => {
    try {
      if (editData) await updateThesis(editData.maDeTai, form);
      else await createThesis(form);
      setModalOpen(false);
      showToast("Lưu thành công!", "success");
      loadData();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const filtered = data.filter(
    (row) =>
      row.tenDeTai?.toLowerCase().includes(search.toLowerCase()) ||
      row.maDeTai?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dashboard-page">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      {/* <h2>Dashboard</h2> */}

      <div
        style={{
          background: "var(--primary-color)",
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "20px",
          width: "100%",
          color: "#fff",
        }}
      >
        <h2 className="font-bold">
          Xin chào, {aboutMe?.tenGV || "N/A"}!
        </h2>

        <div style={{ color: "#f1f1f1" }}>
          <div>Mã giảng viên: {aboutMe?.maGV || "N/A"}</div>
          {/* <div>Email: {aboutMe?.email || "N/A"}</div>
          <div>Số điện thoại: {aboutMe?.soDienThoai || "N/A"}</div>
          <div>Học vị: {aboutMe?.hocVi || "N/A"}</div>
          <div>Khoa: {aboutMe?.khoa || "N/A"}</div> */}
          <div>Vai trò: {aboutMe?.role || "N/A"}</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px",
          marginTop: "10px",
        }}
      >
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Giai đoạn hiện tại</div>
          <div className="stat-value">{stats.presentations || 0}</div>
        </div>
        
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Số đề tài</div>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Số sinh viên (đề tài hiện hữu)</div>
          <div className="stat-value">{stats.students}</div>
        </div>
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Số sinh viên</div>
          <div className="stat-value">{stats.students_all}</div>
        </div>
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Đề tài đã xong</div>
          <div className="stat-value">{stats.finished}</div>
        </div>
      </div>
      <div
        className="toolbar"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button className="btn btn-primary" onClick={handleAdd}>
          Thêm mới
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>
          {/* Đang tải... */}
          <LoadingSection />
        </div>
      ) : (
        <ThesisTable
          data={filtered}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <ThesisFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
      />
    </div>
  );
}
