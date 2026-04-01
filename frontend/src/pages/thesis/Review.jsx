
import React, { useEffect, useState } from "react";
import { fetchTheses, updateThesis } from "../../services/thesisService";
import Toast from "../../components/Toast";
import LoadingSection from "../../components/LoadingSection";
import FormField from "../../components/FormField";
import { calcStudentScore, recalcAllStudents } from "../../utils/scoreUtils";

const TABS = [
  { key: "review", label: "Chấm điểm phản biện" },
  { key: "guide", label: "Chấm hướng dẫn" },
  // { key: "history", label: "Lịch sử chấm" },
  // { key: "export", label: "Xuất file" },
];

const defaultScale = {
  maxPhanTich: 2.5,
  maxThietKe: 2.5,
  maxHienThuc: 2.5,
  maxBaoCao: 2.5,
};

const defaultStudent = {
  diemPhanTich: 0,
  diemThietKe: 0,
  diemHienThuc: 0,
  diemBaoCao: 0,
  diemFinal: 0,
  diemPercent: "0%",
};


export default function Review() {
  const [tab, setTab] = useState("review");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const [theses, setTheses] = useState([]);
  const [selected, setSelected] = useState("");
  const [scale, setScale] = useState(defaultScale);
  const [students, setStudents] = useState([ { ...defaultStudent }, { ...defaultStudent } ]);
  const [form, setForm] = useState({
    ndDieuChinh: "",
    nxTongQuat_PB: "",
    thuyetMinh_PB: "dat",
    uuDiem_PB: "",
    thieuSot_PB: "",
    cauHoi_PB: "",
    deNghi_PB: "duoc",
  });
  // ...existing code...
  const [guideForm, setGuideForm] = useState({
    ndDieuChinh: "",
    nxTongQuat_HD: "",
    thuyetMinh_HD: "dat",
    uuDiem_HD: "",
    thieuSot_HD: "",
    cauHoi_HD: "",
    deNghi_HD: "duoc",
  });
  const [guideStudents, setGuideStudents] = useState([ { ...defaultStudent }, { ...defaultStudent } ]);
  const [guideScale, setGuideScale] = useState(defaultScale);

  const maGV = JSON.parse(localStorage.getItem("user"))?.maGV || "";
  // ...existing code...

  const showToast = (message, type = "info") => setToast({ open: true, message, type });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTheses();
        // ...existing code...
        setTheses(res || []);
      } catch (e) {
        showToast(e.message, "error");
      }
      setLoading(false);
    };
    load();
  }, [maGV]);

  // ...existing code...
  useEffect(() => {
    if (!selected) return;
    // ...existing code...
    setScale(defaultScale);
    setStudents([ { ...defaultStudent }, { ...defaultStudent } ]);
    setForm({
      ndDieuChinh: "",
      nxTongQuat_PB: "",
      thuyetMinh_PB: "dat",
      uuDiem_PB: "",
      thieuSot_PB: "",
      cauHoi_PB: "",
      deNghi_PB: "duoc",
    });
    setGuideScale(defaultScale);
    setGuideStudents([ { ...defaultStudent }, { ...defaultStudent } ]);
    setGuideForm({
      ndDieuChinh: "",
      nxTongQuat_HD: "",
      thuyetMinh_HD: "dat",
      uuDiem_HD: "",
      thieuSot_HD: "",
      cauHoi_HD: "",
      deNghi_HD: "duoc",
    });
  }, [selected]);
  // Tính điểm tự động cho hướng dẫn (dùng utils)
  const calcGuideStudent = (idx, field, value) => {
    setGuideStudents((prev) => prev.map((s, i) => i === idx ? calcStudentScore({ ...s, [field]: value }, guideScale) : s));
  };

  const handleGuideScaleChange = (field, value) => {
    setGuideScale((s) => ({ ...s, [field]: value }));
    setGuideStudents((prev) => recalcAllStudents(prev, guideScale, field, value));
  };

  const handleGuideFormChange = (field, value) => {
    setGuideForm((f) => ({ ...f, [field]: value }));
  };

  const handleGuideSave = async () => {
    if (!selected) return showToast("Vui lòng chọn đề tài", "error");
    setSaving(true);
    try {
      await updateThesis(selected, {
        ...guideForm,
        diemHuongDan1: guideStudents[0].diemFinal,
        diemHuongDan2: guideStudents[1].diemFinal,
        scale: guideScale,
      });
      showToast("Lưu thành công!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setSaving(false);
  };


  // Tính điểm tự động (dùng utils)
  const calcStudent = (idx, field, value) => {
    setStudents((prev) => prev.map((s, i) => i === idx ? calcStudentScore({ ...s, [field]: value }, scale) : s));
  };

  const handleScaleChange = (field, value) => {
    setScale((s) => ({ ...s, [field]: value }));
    setStudents((prev) => recalcAllStudents(prev, scale, field, value));
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (!selected) return showToast("Vui lòng chọn đề tài", "error");
    setSaving(true);
    try {
      await updateThesis(selected, {
        ...form,
        diemPhanBien1: students[0].diemFinal,
        diemPhanBien2: students[1].diemFinal,
        scale,
      });
      showToast("Lưu thành công!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
    setSaving(false);
  };

  const handleExport = () => {
    // TODO: Gọi API xuất file hoặc tạo file từ dữ liệu form
    showToast("Chức năng xuất file đang phát triển", "info");
  };

  return (
    <div className="review-page">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      <h2 style={{ color: "#1e293b", fontWeight: 700, marginBottom: 24 }}>Chấm điểm phản biện</h2>
    
    <div className="overflow-auto scrollbar-thin p-2" style={{ maxHeight: "calc(100vh - 160px)" }}>
        {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: tab === t.key ? "#2563eb" : "#f1f5f9",
              color: tab === t.key ? "#fff" : "#334155",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: tab === t.key ? "0 2px 8px #2563eb22" : "none",
              transition: "all .2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <LoadingSection />
      ) : tab === "review" ? (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <FormField
              as="select"
              label="Chọn đề tài/phản biện"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">-- Chọn một đề tài --</option>
              {theses
                .filter((t) => t.maGV_PB === maGV)
                .map((t) => {
                  const svList = t.students?.map((sv) => sv.hoTen).join(", ") || "Chưa có SV";
                  const gvhd = t.lecturer?.tenGV || "";
                  const topicName = t.tenDeTai || "Chưa cập nhật tên đề tài";
                  return (
                    <option key={t.maDeTai} value={t.maDeTai}>
                      {topicName} (GVHD: {gvhd}, SV: {svList})
                    </option>
                  );
                })}
            </FormField>
          </div>
          {selected && (
            <>
              {/* Thang điểm */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#2563eb", margin: 0, marginBottom: 12 }}>Thang điểm</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <FormField label="Phân tích" type="number" min={0} max={10} step={0.1} value={scale.maxPhanTich} onChange={e => handleScaleChange("maxPhanTich", e.target.value)} />
                  <FormField label="Thiết kế" type="number" min={0} max={10} step={0.1} value={scale.maxThietKe} onChange={e => handleScaleChange("maxThietKe", e.target.value)} />
                  <FormField label="Hiện thực" type="number" min={0} max={10} step={0.1} value={scale.maxHienThuc} onChange={e => handleScaleChange("maxHienThuc", e.target.value)} />
                  <FormField label="Báo cáo" type="number" min={0} max={10} step={0.1} value={scale.maxBaoCao} onChange={e => handleScaleChange("maxBaoCao", e.target.value)} />
                </div>
              </div>
              {/* Sinh viên 1 */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#2563eb", margin: 0, marginBottom: 12 }}>Sinh viên 1</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <FormField label="Phân tích" type="number" min={0} step={0.1} value={students[0].diemPhanTich} onChange={e => calcStudent(0, "diemPhanTich", e.target.value)} />
                  <FormField label="Thiết kế" type="number" min={0} step={0.1} value={students[0].diemThietKe} onChange={e => calcStudent(0, "diemThietKe", e.target.value)} />
                  <FormField label="Hiện thực" type="number" min={0} step={0.1} value={students[0].diemHienThuc} onChange={e => calcStudent(0, "diemHienThuc", e.target.value)} />
                  <FormField label="Báo cáo" type="number" min={0} step={0.1} value={students[0].diemBaoCao} onChange={e => calcStudent(0, "diemBaoCao", e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <FormField label="Tổng cộng (%)" value={students[0].diemPercent} readOnly className="bg-slate-100 font-semibold" />
                  <FormField label="Điểm chấm (thang 10)" value={students[0].diemFinal} readOnly className="bg-slate-100 font-semibold text-blue-600" />
                </div>
              </div>
              {/* Sinh viên 2 */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#2563eb", margin: 0, marginBottom: 12 }}>Sinh viên 2 (nếu có)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <FormField label="Phân tích" type="number" min={0} step={0.1} value={students[1].diemPhanTich} onChange={e => calcStudent(1, "diemPhanTich", e.target.value)} />
                  <FormField label="Thiết kế" type="number" min={0} step={0.1} value={students[1].diemThietKe} onChange={e => calcStudent(1, "diemThietKe", e.target.value)} />
                  <FormField label="Hiện thực" type="number" min={0} step={0.1} value={students[1].diemHienThuc} onChange={e => calcStudent(1, "diemHienThuc", e.target.value)} />
                  <FormField label="Báo cáo" type="number" min={0} step={0.1} value={students[1].diemBaoCao} onChange={e => calcStudent(1, "diemBaoCao", e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <FormField label="Tổng cộng (%)" value={students[1].diemPercent} readOnly className="bg-slate-100 font-semibold" />
                  <FormField label="Điểm chấm (thang 10)" value={students[1].diemFinal} readOnly className="bg-slate-100 font-semibold text-blue-600" />
                </div>
              </div>
              {/* Nhận xét & đề nghị */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#1e293b", margin: 0, marginBottom: 12 }}>Nhận xét & Đề nghị</h4>
                <FormField label="Nội dung điều chỉnh" value={form.ndDieuChinh} onChange={e => handleFormChange("ndDieuChinh", e.target.value)} />
                <FormField label="Nhận xét tổng quát" value={form.nxTongQuat_PB} onChange={e => handleFormChange("nxTongQuat_PB", e.target.value)} />
                <div style={{ margin: "12px 0" }}>
                  <span style={{ fontWeight: 500, marginRight: 12 }}>Thuyết minh:</span>
                  <label style={{ marginRight: 16 }}><input type="radio" name="thuyetMinh_PB" value="dat" checked={form.thuyetMinh_PB === "dat"} onChange={e => handleFormChange("thuyetMinh_PB", e.target.value)} /> Đạt</label>
                  <label><input type="radio" name="thuyetMinh_PB" value="khongdat" checked={form.thuyetMinh_PB === "khongdat"} onChange={e => handleFormChange("thuyetMinh_PB", e.target.value)} /> Không đạt</label>
                </div>
                <FormField label="Ưu điểm" value={form.uuDiem_PB} onChange={e => handleFormChange("uuDiem_PB", e.target.value)} />
                <FormField label="Thiếu sót" value={form.thieuSot_PB} onChange={e => handleFormChange("thieuSot_PB", e.target.value)} />
                <FormField label="Câu hỏi phản biện" value={form.cauHoi_PB} onChange={e => handleFormChange("cauHoi_PB", e.target.value)} />
                <div style={{ margin: "12px 0" }}>
                  <span style={{ fontWeight: 500, marginRight: 12 }}>Đề nghị:</span>
                  <label style={{ marginRight: 16 }}><input type="radio" name="deNghi_PB" value="duoc" checked={form.deNghi_PB === "duoc"} onChange={e => handleFormChange("deNghi_PB", e.target.value)} /> Được bảo vệ</label>
                  <label style={{ marginRight: 16 }}><input type="radio" name="deNghi_PB" value="khong" checked={form.deNghi_PB === "khong"} onChange={e => handleFormChange("deNghi_PB", e.target.value)} /> Không bảo vệ</label>
                  <label><input type="radio" name="deNghi_PB" value="bosung" checked={form.deNghi_PB === "bosung"} onChange={e => handleFormChange("deNghi_PB", e.target.value)} /> Bổ sung</label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ background: "#10b981", color: "#fff", padding: "12px 32px", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #10b98122" }}
                >
                  Lưu điểm
                </button>
                <button
                  onClick={handleExport}
                  style={{ background: "#2563eb", color: "#fff", padding: "12px 32px", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #2563eb22" }}
                >
                  Xuất file
                </button>
              </div>
            </>
          )}
        </div>
      ) : tab === "guide" ? (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <FormField
              as="select"
              label="Chọn đề tài/hướng dẫn"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">-- Chọn một đề tài --</option>
              {theses
                .filter((t) => t.maGV_HD === maGV)
                .map((t) => {
                  const svList = t.students?.map((sv) => sv.hoTen).join(", ") || "Chưa có SV";
                  const gvhd = t.lecturer?.tenGV || "";
                  const topicName = t.tenDeTai || "Chưa cập nhật tên đề tài";
                  return (
                    <option key={t.maDeTai} value={t.maDeTai}>
                      {topicName} (GVHD: {gvhd}, SV: {svList})
                    </option>
                  );
                })}
            </FormField>
          </div>
          {selected && (
            <>
              {/* Thang điểm hướng dẫn */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#2563eb", margin: 0, marginBottom: 12 }}>Thang điểm</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <FormField label="Phân tích" type="number" min={0} max={10} step={0.1} value={guideScale.maxPhanTich} onChange={e => handleGuideScaleChange("maxPhanTich", e.target.value)} />
                  <FormField label="Thiết kế" type="number" min={0} max={10} step={0.1} value={guideScale.maxThietKe} onChange={e => handleGuideScaleChange("maxThietKe", e.target.value)} />
                  <FormField label="Hiện thực" type="number" min={0} max={10} step={0.1} value={guideScale.maxHienThuc} onChange={e => handleGuideScaleChange("maxHienThuc", e.target.value)} />
                  <FormField label="Báo cáo" type="number" min={0} max={10} step={0.1} value={guideScale.maxBaoCao} onChange={e => handleGuideScaleChange("maxBaoCao", e.target.value)} />
                </div>
              </div>
              {/* Sinh viên 1 */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#2563eb", margin: 0, marginBottom: 12 }}>Sinh viên 1</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <FormField label="Phân tích" type="number" min={0} step={0.1} value={guideStudents[0].diemPhanTich} onChange={e => calcGuideStudent(0, "diemPhanTich", e.target.value)} />
                  <FormField label="Thiết kế" type="number" min={0} step={0.1} value={guideStudents[0].diemThietKe} onChange={e => calcGuideStudent(0, "diemThietKe", e.target.value)} />
                  <FormField label="Hiện thực" type="number" min={0} step={0.1} value={guideStudents[0].diemHienThuc} onChange={e => calcGuideStudent(0, "diemHienThuc", e.target.value)} />
                  <FormField label="Báo cáo" type="number" min={0} step={0.1} value={guideStudents[0].diemBaoCao} onChange={e => calcGuideStudent(0, "diemBaoCao", e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <FormField label="Tổng cộng (%)" value={guideStudents[0].diemPercent} readOnly className="bg-slate-100 font-semibold" />
                  <FormField label="Điểm chấm (thang 10)" value={guideStudents[0].diemFinal} readOnly className="bg-slate-100 font-semibold text-blue-600" />
                </div>
              </div>
              {/* Sinh viên 2 */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#2563eb", margin: 0, marginBottom: 12 }}>Sinh viên 2 (nếu có)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  <FormField label="Phân tích" type="number" min={0} step={0.1} value={guideStudents[1].diemPhanTich} onChange={e => calcGuideStudent(1, "diemPhanTich", e.target.value)} />
                  <FormField label="Thiết kế" type="number" min={0} step={0.1} value={guideStudents[1].diemThietKe} onChange={e => calcGuideStudent(1, "diemThietKe", e.target.value)} />
                  <FormField label="Hiện thực" type="number" min={0} step={0.1} value={guideStudents[1].diemHienThuc} onChange={e => calcGuideStudent(1, "diemHienThuc", e.target.value)} />
                  <FormField label="Báo cáo" type="number" min={0} step={0.1} value={guideStudents[1].diemBaoCao} onChange={e => calcGuideStudent(1, "diemBaoCao", e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <FormField label="Tổng cộng (%)" value={guideStudents[1].diemPercent} readOnly className="bg-slate-100 font-semibold" />
                  <FormField label="Điểm chấm (thang 10)" value={guideStudents[1].diemFinal} readOnly className="bg-slate-100 font-semibold text-blue-600" />
                </div>
              </div>
              {/* Nhận xét & đề nghị hướng dẫn */}
              <div style={{ marginBottom: 24, background: "#f8fafc", borderRadius: 8, padding: 20, border: "1px solid #e2e8f0" }}>
                <h4 style={{ color: "#1e293b", margin: 0, marginBottom: 12 }}>Nhận xét & Đề nghị</h4>
                <FormField label="Nội dung điều chỉnh" value={guideForm.ndDieuChinh} onChange={e => handleGuideFormChange("ndDieuChinh", e.target.value)} />
                <FormField label="Nhận xét tổng quát" value={guideForm.nxTongQuat_HD} onChange={e => handleGuideFormChange("nxTongQuat_HD", e.target.value)} />
                <div style={{ margin: "12px 0" }}>
                  <span style={{ fontWeight: 500, marginRight: 12 }}>Thuyết minh:</span>
                  <label style={{ marginRight: 16 }}><input type="radio" name="thuyetMinh_HD" value="dat" checked={guideForm.thuyetMinh_HD === "dat"} onChange={e => handleGuideFormChange("thuyetMinh_HD", e.target.value)} /> Đạt</label>
                  <label><input type="radio" name="thuyetMinh_HD" value="khongdat" checked={guideForm.thuyetMinh_HD === "khongdat"} onChange={e => handleGuideFormChange("thuyetMinh_HD", e.target.value)} /> Không đạt</label>
                </div>
                <FormField label="Ưu điểm" value={guideForm.uuDiem_HD} onChange={e => handleGuideFormChange("uuDiem_HD", e.target.value)} />
                <FormField label="Thiếu sót" value={guideForm.thieuSot_HD} onChange={e => handleGuideFormChange("thieuSot_HD", e.target.value)} />
                <FormField label="Câu hỏi hướng dẫn" value={guideForm.cauHoi_HD} onChange={e => handleGuideFormChange("cauHoi_HD", e.target.value)} />
                <div style={{ margin: "12px 0" }}>
                  <span style={{ fontWeight: 500, marginRight: 12 }}>Đề nghị:</span>
                  <label style={{ marginRight: 16 }}><input type="radio" name="deNghi_HD" value="duoc" checked={guideForm.deNghi_HD === "duoc"} onChange={e => handleGuideFormChange("deNghi_HD", e.target.value)} /> Được bảo vệ</label>
                  <label style={{ marginRight: 16 }}><input type="radio" name="deNghi_HD" value="khong" checked={guideForm.deNghi_HD === "khong"} onChange={e => handleGuideFormChange("deNghi_HD", e.target.value)} /> Không bảo vệ</label>
                  <label><input type="radio" name="deNghi_HD" value="bosung" checked={guideForm.deNghi_HD === "bosung"} onChange={e => handleGuideFormChange("deNghi_HD", e.target.value)} /> Bổ sung</label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                <button
                  onClick={handleGuideSave}
                  disabled={saving}
                  style={{ background: "#10b981", color: "#fff", padding: "12px 32px", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #10b98122" }}
                >
                  Lưu điểm
                </button>
                <button
                  onClick={handleExport}
                  style={{ background: "#2563eb", color: "#fff", padding: "12px 32px", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #2563eb22" }}
                >
                  Xuất file
                </button>
              </div>
            </>
          )}
        </div>
      ) : tab === "history" ? (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 32, minHeight: 200 }}>
          <p>Lịch sử chấm điểm sẽ hiển thị ở đây (đang phát triển).</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 32, minHeight: 200 }}>
          <p>Chức năng xuất file sẽ hiển thị ở đây (đang phát triển).</p>
        </div>
      )}
    </div>
    </div>
  );
}
