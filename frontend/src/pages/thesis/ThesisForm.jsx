import React from "react";


const ThesisForm = ({ mode = "add", thesis, onSubmit, onCancel }) => {
  // TODO: Use form state and validation
  return (
    <div className="thesis-form-page">
      <h2>{mode === "add" ? "Thêm mới Luận văn" : "Chỉnh sửa Luận văn"}</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Mã đề tài</label>
          <input
            type="text"
            name="maDeTai"
            defaultValue={thesis?.maDeTai || ""}
            required
          />
        </div>
        <div>
          <label>Tên đề tài</label>
          <input
            type="text"
            name="tenDeTai"
            defaultValue={thesis?.tenDeTai || ""}
            required
          />
        </div>
        <div>
          <label>Sinh viên</label>
          <input
            type="text"
            name="sinhVien"
            defaultValue={thesis?.sinhVien || ""}
            required
          />
        </div>
        <div>
          <label>GV Hướng dẫn</label>
          <input
            type="text"
            name="gvHuongDan"
            defaultValue={thesis?.gvHuongDan || ""}
            required
          />
        </div>
        <div>
          <label>GV Phản biện</label>
          <input
            type="text"
            name="gvPhanBien"
            defaultValue={thesis?.gvPhanBien || ""}
          />
        </div>
        <div>
          <label>Điểm</label>
          <input
            type="number"
            name="diem"
            step="0.1"
            min="0"
            max="10"
            defaultValue={thesis?.diem || ""}
          />
        </div>
        <div>
          <label>Trạng thái</label>
          <select name="trangThai" defaultValue={thesis?.trangThai || ""}>
            <option value="">-- Chọn trạng thái --</option>
            <option value="dangthuchien">Đang thực hiện</option>
            <option value="dabao">Đã bảo vệ</option>
            <option value="hoanthanh">Hoàn thành</option>
          </select>
        </div>
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
