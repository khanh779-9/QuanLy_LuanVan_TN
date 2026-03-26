import React, { useEffect, useState } from "react";
import ThesisTable from "../../components/ThesisTable";
import ThesisFormModal from "../../components/ThesisFormModal";
import Toast from "../../components/Toast";
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
  });

  const showToast = (message, type = "info") =>
    setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      const theses = await fetchTheses();
      const students = await fetchStudents();
      const student_Count = students ? JSON.stringify(students).length : 0;
  
      setData(theses);
      setStats({
        total: theses.length,
        students: theses.reduce((sum, t) => sum + (t.students?.length || 0), 0),
        students_all: student_Count,
        finished: theses.filter((t) => t.trangThai === "Đã hoàn thành").length,
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
      <h2>Dashboard</h2>
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
          <div className="stat-label">Tổng số đề tài</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Tổng số sinh viên (đề tài hiện hữu)</div>
          <div className="stat-value">{stats.students}</div>
        </div>
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Tổng số sinh viên</div>
          <div className="stat-value">{stats.students_all}</div>
        </div>
        <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Đề tài đã hoàn thành</div>
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
