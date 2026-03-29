
import React, { useEffect, useState } from "react";

const ThesisFormModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    maDeTai: "",
    tenDeTai: "",
    sinhVien: "",
    gvHuongDan: "",
    gvPhanBien: "",
    diem: "",
    trangThai: "",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        maDeTai: "",
        tenDeTai: "",
        sinhVien: "",
        gvHuongDan: "",
        gvPhanBien: "",
        diem: "",
        trangThai: "",
      });
  }, [initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? "Chỉnh sửa" : "Thêm mới"} Luận văn</h2>
        <form onSubmit={handleSubmit} className="form-modal">
          <div className="form-row">
            <label htmlFor="maDeTai">Mã đề tài</label>
            <input
              id="maDeTai"
              name="maDeTai"
              value={form.maDeTai}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="tenDeTai">Tên đề tài</label>
            <input
              id="tenDeTai"
              name="tenDeTai"
              value={form.tenDeTai}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="sinhVien">Sinh viên</label>
            <input
              id="sinhVien"
              name="sinhVien"
              value={form.sinhVien}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="gvHuongDan">GV Hướng dẫn</label>
            <input
              id="gvHuongDan"
              name="gvHuongDan"
              value={form.gvHuongDan}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="gvPhanBien">GV Phản biện</label>
            <input
              id="gvPhanBien"
              name="gvPhanBien"
              value={form.gvPhanBien}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="diem">Điểm</label>
            <input
              id="diem"
              name="diem"
              value={form.diem}
              onChange={handleChange}
              type="number"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
          <div className="form-row">
            <label htmlFor="trangThai">Trạng thái</label>
            <input
              id="trangThai"
              name="trangThai"
              value={form.trangThai}
              onChange={handleChange}
            />
          </div>
          <div className="actions-row modal-actions">
            <button type="submit" className="btn btn-success">
              Lưu
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThesisFormModal;
