import React from 'react';

const ThesisDetail = ({ thesis }) => {
  // TODO: Fetch thesis detail by ID if needed
  return (
    <div className="thesis-detail-page">
      <h2>Chi tiết Luận văn</h2>
      <div className="detail-group">
        <div><strong>Mã đề tài:</strong> {thesis?.maDeTai}</div>
        <div><strong>Tên đề tài:</strong> {thesis?.tenDeTai}</div>
        <div><strong>Sinh viên:</strong> {thesis?.sinhVien}</div>
        <div><strong>GV Hướng dẫn:</strong> {thesis?.gvHuongDan}</div>
        <div><strong>GV Phản biện:</strong> {thesis?.gvPhanBien}</div>
        <div><strong>Điểm:</strong> {thesis?.diem}</div>
        <div><strong>Trạng thái:</strong> {thesis?.trangThai}</div>
      </div>
      <button className="btn btn-secondary" style={{marginTop: 16}}>Quay lại</button>
    </div>
  );
};

export default ThesisDetail;
