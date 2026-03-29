import React, { useEffect, useState } from "react";
import { fetchTheses, updateThesis } from "../../services/thesisService";
import { fetchLecturers } from "../../services/lecturerService";
import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";

export default function Assignment() {
  const [data, setData] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });

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

  return (
    <div className="assignment-page">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      <h2 className="pb-[10px]">Phân công giảng viên</h2>
      {loading ? (
        <div>
          {/* Đang tải... */}
          <LoadingSection />
        </div>
      ) : (
        <table className="thesis-table">
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
            {data.map((row) => (
              <tr key={row.maDeTai}>
                <td>{row.maDeTai}</td>
                <td>{row.tenDeTai}</td>
                <td>{row.students?.map((sv) => sv.hoTen).join(", ")}</td>
                <td>
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
                </td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
