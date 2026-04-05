import React, { useEffect, useState } from "react";
import studentWithLaptop from "../../../public/assets/student with laptop.json";

import ThesisTable from "../../components/ThesisTable";
import ThesisFormModal from "../../components/ThesisFormModal";
import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";
import { fetchDashboard } from "../../services/dashboardService";

import LottieImport from "lottie-react";
const Lottie = LottieImport.default || LottieImport;
import {
  fetchTheses,
  createThesis,
  updateThesis,
  deleteThesis,
} from "../../services/thesisService";
import {
  fetchStudents,
  createStudents,
  updateStudent,
  deleteStudent,
  importStudents,
} from "../../services/studentService";

export default function Dashboard() {
  const [aboutMe, setAboutMe] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!aboutMe && !localStorage.getItem("token")) {
      window.location.href = "/thesis/login";
    }
  }, [aboutMe]);
  if (!aboutMe) return null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchMaDeTai, setSearchMaDeTai] = useState("");
  const [searchSinhVien, setSearchSinhVien] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [importing, setImporting] = useState(false);

  // Các bộ lọc
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGVHD, setFilterGVHD] = useState("");
  const [filterGVPB, setFilterGVPB] = useState("");

  // const recordsPerPage = 10;

  // Thống kê
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    students_all: 0,
    finished: 0,
    presentations: 0,
  });

  const showToast = (message, type = "info") =>
    setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      // Gọi song song các API
      const [thesesRes, studentsRes, dashboardRes] = await Promise.all([
        fetchTheses().catch(() => []),
        fetchStudents().catch(() => []),
        fetchDashboard().catch(() => null),
      ]);

      setData(thesesRes);
      const student_Count = studentsRes
        ? JSON.stringify(studentsRes).length
        : 0;
      setStats({
        total: thesesRes.length,
        students: thesesRes.reduce(
          (sum, t) => sum + (t.students?.length || 0),
          0,
        ),
        students_all: student_Count,
        finished: thesesRes.filter((t) => t.trangThai === "Đã hoàn thành")
          .length,
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

  // --- 2. LOGIC TÌM KIẾM VÀ LỌC BẰNG JAVASCRIPT (MỚI) ---
  const finalFilteredData = data.filter((row) => {
    // 1. Kiểm tra Search theo Mã Đề Tài
    const termMaDeTai = searchMaDeTai.toLowerCase();
    const passMaDeTai =
      !termMaDeTai ||
      String(row.maDeTai || "")
        .toLowerCase()
        .includes(termMaDeTai);

    // 2. Kiểm tra Search theo Sinh Viên (Lấy cả mssv và hoTen)
    const termSinhVien = searchSinhVien.toLowerCase();
    const passSinhVien =
      !termSinhVien ||
      (row.students || []).some((sv) => {
        // Dùng hàm .some() để kiểm tra xem có sinh viên nào khớp không
        const matchMSSV = String(sv.mssv || "")
          .toLowerCase()
          .includes(termSinhVien);
        const matchTen = String(sv.hoTen || "")
          .toLowerCase()
          .includes(termSinhVien);
        return matchMSSV || matchTen;
      });

    // 3. Kiểm tra các bộ lọc Cột (Giữ nguyên như cũ)
    const passStatus = !filterStatus || row.trangThai === filterStatus;
    const passGVHD_Filter =
      !filterGVHD ||
      String(row.lecturer?.tenGV || "")
        .toLowerCase()
        .includes(filterGVHD.toLowerCase());
    const passGVPB_Filter =
      !filterGVPB ||
      String(row.reviewer?.tenGV || "")
        .toLowerCase()
        .includes(filterGVPB.toLowerCase());

    // Trả về true nếu thỏa mãn TẤT CẢ các điều kiện (ô nào bỏ trống thì tự động pass)
    return (
      passMaDeTai &&
      passSinhVien &&
      passStatus &&
      passGVHD_Filter &&
      passGVPB_Filter
    );
  });

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

  const handleImportStudents = async () => {
    if (!importFile) {
      showToast("Vui lòng chọn file Excel trước khi import.", "error");
      return;
    }
    setImporting(true);
    setImportErrors([]);
    try {
      const result = await importStudents(importFile);
      showToast(`Import thành công ${result.imported || 0} sinh viên.`, "success");
      if (result.errors?.length) {
        setImportErrors(result.errors);
      }
      await loadData();
    } catch (e) {
      showToast(e.message, "error");
    }
    setImporting(false);
  };

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 className="font-bold">Xin chào, {aboutMe?.tenGV || "N/A"}!</h2>

          <div style={{ color: "#f1f1f1" }}>
            <div>Mã giảng viên: {aboutMe?.maGV || "N/A"}</div>
            {/* <div>Email: {aboutMe?.email || "N/A"}</div>
          <div>Số điện thoại: {aboutMe?.soDienThoai || "N/A"}</div>
          <div>Học vị: {aboutMe?.hocVi || "N/A"}</div>
          <div>Khoa: {aboutMe?.khoa || "N/A"}</div> */}
            <div>Vai trò: {aboutMe?.role || "N/A"}</div>
          </div>
        </div>

        {/* Ảnh động Lottie sẽ hiển thị ở đây nếu bạn đã cài đặt lottie-react và có file JSON hợp lệ. */}
        <div style={{ width: "150px" }}>
          <Lottie animationData={studentWithLaptop} loop={true} />
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
          <div className="stat-label">Số sinh viên</div>
          <div className="stat-value">{stats.students}</div>
        </div>

        {/* <div
          className="stat-card"
          style={{
            border: "1px solid #ddd",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="stat-label">Số sinh viên</div>
          <div className="stat-value">{stats.students_all}</div>
        </div> */}

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

      {aboutMe?.role === "ThuKy" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 2px 8px #0001",
          }}
        >
          <h3 style={{ marginBottom: 12, color: "#1e293b" }}>Import danh sách sinh viên</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <button
              className="btn btn-secondary"
              onClick={handleImportStudents}
              disabled={importing}
            >
              {importing ? "Đang import..." : "Import"}
            </button>
          </div>
          {importErrors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, color: "#b91c1c" }}>Lỗi import:</div>
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
        </div>
      )}
      <div
        className="toolbar"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* <button className="btn btn-primary" onClick={handleAdd}>
          Thêm mới
        </button> */}
        <input
          type="text"
          placeholder="Tìm theo mã đề tài..."
          value={searchMaDeTai}
          onChange={(e) => setSearchMaDeTai(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tìm MSSV hoặc Tên SV..."
          value={searchSinhVien}
          onChange={(e) => setSearchSinhVien(e.target.value)}
        />

        <input
          type="text"
          placeholder="Lọc GV Hướng dẫn..."
          value={filterGVHD}
          onChange={(e) => setFilterGVHD(e.target.value)}
        />

        <input
          type="text"
          placeholder="Lọc GV Phản biện..."
          value={filterGVPB}
          onChange={(e) => setFilterGVPB(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đã hoàn thành">Đã hoàn thành</option>
          <option value="Đang thực hiện">Đang thực hiện</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
        </select>
      </div>
      {loading ? (
        <div>
          {/* Đang tải... */}
          <LoadingSection />
        </div>
      ) : (
        <ThesisTable
          data={finalFilteredData}
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
