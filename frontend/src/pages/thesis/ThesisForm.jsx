
import React from "react";
import FormField from "../../components/FormField";


const ThesisForm = ({ mode = "add", thesis, onSubmit, onCancel }) => {
  // TODO: Use form state and validation
  return (
    <div className="thesis-form-page">
      <h2>{mode === "add" ? "Thêm mới Luận văn" : "Chỉnh sửa Luận văn"}</h2>
      <form onSubmit={onSubmit}>
        <FormField
          label="Mã đề tài"
          name="maDeTai"
          type="text"
          defaultValue={thesis?.maDeTai || ""}
          required
        />
        <FormField
          label="Tên đề tài"
          name="tenDeTai"
          type="text"
          defaultValue={thesis?.tenDeTai || ""}
          required
        />
        <FormField
          label="Sinh viên"
          name="sinhVien"
          type="text"
          defaultValue={thesis?.sinhVien || ""}
          required
        />
        <FormField
          label="GV Hướng dẫn"
          name="gvHuongDan"
          type="text"
          defaultValue={thesis?.gvHuongDan || ""}
          required
        />
        <FormField
          label="GV Phản biện"
          name="gvPhanBien"
          type="text"
          defaultValue={thesis?.gvPhanBien || ""}
        />
        <FormField
          label="Điểm"
          name="diem"
          type="number"
          step="0.1"
          min="0"
          max="10"
          defaultValue={thesis?.diem || ""}
        />
        <FormField
          label="Trạng thái"
          as="select"
          name="trangThai"
          defaultValue={thesis?.trangThai || ""}
        >
          <option value="">-- Chọn trạng thái --</option>
          <option value="dangthuchien">Đang thực hiện</option>
          <option value="dabao">Đã bảo vệ</option>
          <option value="hoanthanh">Hoàn thành</option>
        </FormField>
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-success">
            Lưu
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ marginLeft: 8 }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThesisForm;
