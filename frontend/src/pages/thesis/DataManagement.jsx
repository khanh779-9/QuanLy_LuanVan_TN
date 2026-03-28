import React, { useState } from "react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic_title || !form.student1_id || !form.student1_name) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    setError("");
    if (editingId !== null) {
      setData((prev) =>
        prev.map((item) => (item.id === editingId ? { ...form, id: editingId } : item))
      );
    } else {
      setData((prev) => [
        ...prev,
        { ...form, id: Date.now(), registered_at: new Date().toLocaleString() },
      ]);
    }
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      setData((prev) => prev.filter((item) => item.id !== id));
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
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #0002", padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700, color: "#2d3a4a", marginBottom: 16, letterSpacing: 1 }}>Quản lý Đăng ký Đề tài</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: "#888" }}>
            Tổng số: <b>{data.length}</b>
          </span>
          <button
            className="btn btn-primary"
            style={{ borderRadius: 8, fontWeight: 600, padding: "8px 24px", background: "#2563eb", border: "none" }}
            onClick={() => { setShowForm(true); setForm(initialForm); setEditingId(null); }}
          >
            + Thêm mới
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table table-bordered" style={{ background: "#f9fafb", borderRadius: 8, minWidth: 900 }}>
            <thead style={{ background: "#e5e7eb" }}>
              <tr style={{ textAlign: "center" }}>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>SV1</th>
                <th>SV2</th>
                <th>GVHD</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={9} className="text-center">Chưa có dữ liệu</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} style={{ textAlign: "center", background: editingId === item.id ? "#f1f5f9" : undefined }}>
                  <td>{item.id}</td>
                  <td style={{ maxWidth: 180, whiteSpace: "pre-line", wordBreak: "break-word" }}>{item.topic_title}</td>
                  <td>{typeOptions.find(t => t.value === item.topic_type)?.label || item.topic_type}</td>
                  <td>{item.student1_name}</td>
                  <td>{item.student2_name}</td>
                  <td>{item.gvhd_code}</td>
                  <td>
                    <span style={{
                      background: item.status === "approved" ? "#22c55e22" : item.status === "rejected" ? "#ef444422" : "#facc1522",
                      color: item.status === "approved" ? "#16a34a" : item.status === "rejected" ? "#b91c1c" : "#b45309",
                      borderRadius: 8,
                      padding: "2px 10px",
                      fontWeight: 600,
                    }}>{statusOptions.find(s => s.value === item.status)?.label || item.status}</span>
                  </td>
                  <td>{item.registered_at}</td>
                  <td>
                    <button className="btn btn-warning btn-sm mr-2" style={{ borderRadius: 6, fontWeight: 500 }} onClick={() => handleEdit(item)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" style={{ borderRadius: 6, fontWeight: 500 }} onClick={() => handleDelete(item.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #0002", padding: 32, maxWidth: 900, margin: "0 auto" }}>
          <form className="row" onSubmit={handleSubmit}>
            <h4 style={{ fontWeight: 600, color: "#2563eb", marginBottom: 24 }}>{editingId ? "Chỉnh sửa" : "Thêm mới"} đăng ký đề tài</h4>
            {error && <div className="alert alert-danger w-100">{error}</div>}
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Tiêu đề *</label>
              <input className="form-control" name="topic_title" value={form.topic_title} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Loại đề tài *</label>
              <select className="form-control" name="topic_type" value={form.topic_type} onChange={handleChange} required>
                {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="col-md-12 mb-3">
              <label className="font-weight-bold">Mô tả</label>
              <textarea className="form-control" name="topic_description" value={form.topic_description} onChange={handleChange} rows={2} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="font-weight-bold">MSSV 1 *</label>
              <input className="form-control" name="student1_id" value={form.student1_id} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="font-weight-bold">Tên SV 1 *</label>
              <input className="form-control" name="student1_name" value={form.student1_name} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="font-weight-bold">Lớp SV 1 *</label>
              <input className="form-control" name="student1_class" value={form.student1_class} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Email SV 1</label>
              <input className="form-control" name="student1_email" value={form.student1_email} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">MSSV 2</label>
              <input className="form-control" name="student2_id" value={form.student2_id} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Tên SV 2</label>
              <input className="form-control" name="student2_name" value={form.student2_name} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Lớp SV 2</label>
              <input className="form-control" name="student2_class" value={form.student2_class} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Email SV 2</label>
              <input className="form-control" name="student2_email" value={form.student2_email} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Mã GVHD</label>
              <input className="form-control" name="gvhd_code" value={form.gvhd_code} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Nơi công tác GVHD</label>
              <input className="form-control" name="gvhd_workplace" value={form.gvhd_workplace} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="font-weight-bold">Mã GV Phản biện</label>
              <input className="form-control" name="gvpb_code" value={form.gvpb_code} onChange={handleChange} />
            </div>
            <div className="col-md-12 mb-3">
              <label className="font-weight-bold">Ghi chú</label>
              <textarea className="form-control" name="note" value={form.note} onChange={handleChange} rows={2} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="font-weight-bold">Nguồn</label>
              <input className="form-control" name="source" value={form.source} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="font-weight-bold">Trạng thái</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="col-12 mt-4" style={{ textAlign: "right" }}>
              <button className="btn btn-success mr-2" style={{ borderRadius: 8, fontWeight: 600, minWidth: 100 }} type="submit">Lưu</button>
              <button className="btn btn-secondary" style={{ borderRadius: 8, fontWeight: 600, minWidth: 100 }} type="button" onClick={handleCancel}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
