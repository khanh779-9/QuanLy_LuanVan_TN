

import React, { useEffect, useState } from "react";
import FormField from "./FormField";

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
          <FormField
            label="Mã đề tài"
            name="maDeTai"
            value={form.maDeTai}
            onChange={handleChange}
            required
          />
          <FormField
            label="Tên đề tài"
            name="tenDeTai"
            value={form.tenDeTai}
            onChange={handleChange}
            required
          />
          <FormField
            label="Sinh viên"
            name="sinhVien"
            value={form.sinhVien}
            onChange={handleChange}
            required
          />
          <FormField
            label="GV Hướng dẫn"
            name="gvHuongDan"
            value={form.gvHuongDan}
            onChange={handleChange}
            required
          />
          <FormField
            label="GV Phản biện"
            name="gvPhanBien"
            value={form.gvPhanBien}
            onChange={handleChange}
          />
          <FormField
            label="Điểm"
            name="diem"
            value={form.diem}
            onChange={handleChange}
            type="number"
            min="0"
            max="10"
            step="0.1"
          />
          <FormField
            label="Trạng thái"
            as="select"
            name="trangThai"
            value={form.trangThai}
            onChange={handleChange}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="dangthuchien">Đang thực hiện</option>
            <option value="dabao">Đã bảo vệ</option>
            <option value="hoanthanh">Hoàn thành</option>
          </FormField>
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
