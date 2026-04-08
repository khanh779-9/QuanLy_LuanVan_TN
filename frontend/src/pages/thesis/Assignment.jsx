import React, { useEffect, useState } from "react";
import { fetchTheses, updateThesis } from "../../services/thesisService";
import { fetchLecturers } from "../../services/lecturerService";
import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";

export default function Assignment() {
    
    const role = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).role : null;
  const [data, setData] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [searchType, setSearchType] = useState("maDeTai");
  const [searchTerm, setSearchTerm] = useState("");
  const showToast = (message, type = "info") =>
    setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      const [theses, lecturers] = await Promise.all([
        fetchTheses(),
        fetchLecturers(),
      ]);
      setData(theses);
      setLecturers(lecturers);
    } catch (e) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (row, field, value) => {
    setSaving(true);
    try {
      await updateThesis(row.maDeTai, { ...row, [field]: value });
      showToast("Phân công thành công!", "success");
      loadData();
    } catch (e) {
      showToast(e.message, "error");
    }
    setSaving(false);
  };

  // --- LOGIC TÌM KIẾM THEO DROPDOWN ---
  const filteredData = data.filter((row) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true; // Nếu không nhập gì thì hiện tất cả

    switch (searchType) {
      case "maDeTai":
        return String(row.maDeTai || "").toLowerCase().includes(term);
      case "tenDeTai":
        return String(row.tenDeTai || "").toLowerCase().includes(term);
      case "mssv":
        // Tìm trong mảng sinh viên xem có ai khớp MSSV không
        return (row.students || []).some(sv => 
          String(sv.mssv || "").toLowerCase().includes(term)
        );
      case "hoTen":
        // Tìm trong mảng sinh viên xem có ai khớp Tên không
        return (row.students || []).some(sv => 
          String(sv.hoTen || "").toLowerCase().includes(term)
        );
      default:
        return true;
    }
  });
  return (
    <div className="assignment-page">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      <h2 className="pb-[10px]">Phân công giảng viên</h2>
      <div className="toolbar-responsive">
        <select
          className="custom-select"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{ minWidth: '150px', flex: '0 0 auto' }}
        >
          <option value="maDeTai">Mã đề tài</option>
          <option value="tenDeTai">Tên đề tài</option>
          <option value="mssv">Mã sinh viên</option>
          <option value="hoTen">Tên sinh viên</option>
        </select>

        <input
          type="text"
          placeholder={`Bộ lọc theo ${searchType === 'maDeTai' ? 'mã đề tài' : searchType === 'tenDeTai' ? 'tên đề tài' : searchType === 'mssv' ? 'MSSV' : 'tên SV'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 0, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      {loading ? (
        <div>
          {/* Đang tải... */}
          <LoadingSection />
        </div>
      ) : (
        <div className="table-responsive"><table className="thesis-table">
          <thead>
            <tr>
              <th>Mã đề tài</th>
              <th>Tên đề tài</th>
              <th>Sinh viên</th>
              <th>GV Hướng dẫn</th>
              <th>GV Phản biện</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.maDeTai}>
                <td>{row.maDeTai}</td>
                <td>{row.tenDeTai}</td>
                <td>{row.students?.map((sv) => sv.hoTen).join(", ")}</td>
                <td>
                  {role === "ThuKy" ? (
                    <select
                      className="custom-select"
                      value={row.maGV_HD || ""}
                      onChange={(e) =>
                        handleAssign(row, "maGV_HD", e.target.value)
                      }
                      disabled={saving}
                    >
                      <option value="">-- Chọn --</option>
                      {lecturers.map((l) => (
                        <option key={l.maGV} value={l.maGV}>
                          {l.tenGV}
                        </option>
                      ))}
                    </select>
                  ) : (
                    lecturers.find((l) => l.maGV === row.maGV_HD)?.tenGV || ""
                  )}
                </td>
                <td>
                  {role === "ThuKy" ? (
                    <select
                      className="custom-select"
                      value={row.maGV_PB || ""}
                      onChange={(e) =>
                        handleAssign(row, "maGV_PB", e.target.value)
                      }
                      disabled={saving}
                    >
                      <option value="">-- Chọn --</option>
                      {lecturers.map((l) => (
                        <option key={l.maGV} value={l.maGV}>
                          {l.tenGV}
                        </option>
                      ))}
                    </select>
                  ) : (
                    lecturers.find((l) => l.maGV === row.maGV_PB)?.tenGV || ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
