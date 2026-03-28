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
  const [data, setData] = useState([]); // Dữ liệu bảng
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Xử lý nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Thêm hoặc cập nhật
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate cơ bản
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

  // Sửa
  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  // Xóa
  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Reset form
  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Đăng ký Đề tài (topic_registrations_form)</h2>
      <button className="btn btn-primary mb-3" onClick={() => { setShowForm(true); setForm(initialForm); setEditingId(null); }}>Thêm mới</button>
      <table className="table table-bordered">
        <thead>
          <tr>
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
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.topic_title}</td>
              <td>{typeOptions.find(t => t.value === item.topic_type)?.label || item.topic_type}</td>
              <td>{item.student1_name}</td>
              <td>{item.student2_name}</td>
              <td>{item.gvhd_code}</td>
              <td>{statusOptions.find(s => s.value === item.status)?.label || item.status}</td>
              <td>{item.registered_at}</td>
              <td>
                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(item)}>Sửa</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form className="mt-4 p-3 border rounded bg-light" onSubmit={handleSubmit}>
          <h4>{editingId ? "Chỉnh sửa" : "Thêm mới"} đăng ký đề tài</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row">
            <div className="col-md-6 mb-2">
              <label>Tiêu đề *</label>
              <input className="form-control" name="topic_title" value={form.topic_title} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-2">
              <label>Loại đề tài *</label>
              <select className="form-control" name="topic_type" value={form.topic_type} onChange={handleChange} required>
                {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="col-md-12 mb-2">
              <label>Mô tả</label>
              <textarea className="form-control" name="topic_description" value={form.topic_description} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-2">
              <label>MSSV 1 *</label>
              <input className="form-control" name="student1_id" value={form.student1_id} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-2">
              <label>Tên SV 1 *</label>
              <input className="form-control" name="student1_name" value={form.student1_name} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-2">
              <label>Lớp SV 1 *</label>
              <input className="form-control" name="student1_class" value={form.student1_class} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-2">
              <label>Email SV 1</label>
              <input className="form-control" name="student1_email" value={form.student1_email} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>MSSV 2</label>
              <input className="form-control" name="student2_id" value={form.student2_id} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>Tên SV 2</label>
              <input className="form-control" name="student2_name" value={form.student2_name} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>Lớp SV 2</label>
              <input className="form-control" name="student2_class" value={form.student2_class} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>Email SV 2</label>
              <input className="form-control" name="student2_email" value={form.student2_email} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>Mã GVHD</label>
              <input className="form-control" name="gvhd_code" value={form.gvhd_code} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>Nơi công tác GVHD</label>
              <input className="form-control" name="gvhd_workplace" value={form.gvhd_workplace} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label>Mã GV Phản biện</label>
              <input className="form-control" name="gvpb_code" value={form.gvpb_code} onChange={handleChange} />
            </div>
            <div className="col-md-12 mb-2">
              <label>Ghi chú</label>
              <textarea className="form-control" name="note" value={form.note} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-2">
              <label>Nguồn</label>
              <input className="form-control" name="source" value={form.source} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-2">
              <label>Trạng thái</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-success mr-2" type="submit">Lưu</button>
            <button className="btn btn-secondary" type="button" onClick={handleCancel}>Hủy</button>
          </div>
        </form>
      )}
    </div>
  );
}
