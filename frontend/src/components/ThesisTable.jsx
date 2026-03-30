
import React from "react";


const ThesisTable = ({ data, onDetail, onEdit, onDelete }) => (
  <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ddd" }}>
  <table className="thesis-table">
    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
      <tr>
        <th>Mã đề tài</th>
        <th>Tên đề tài</th>
        <th>Sinh viên</th>
        <th>GV Hướng dẫn</th>
        <th>GV Phản biện</th>
        <th>Điểm</th>
        <th>Trạng thái</th>

      </tr>
    </thead>
    <tbody>
      {data && data.length > 0 ? (
        data.map((row) => (
          <tr key={row.maDeTai}>
            <td>{row.maDeTai}</td>
            <td>{row.tenDeTai}</td>
            <td>{row.students?.map((sv) => sv.hoTen).join(", ")}</td>
            <td>{row.lecturer?.tenGV}</td>
            <td>{row.reviewer?.tenGV}</td>
            <td>{row.diemTong || "-"}</td>
            <td>{row.trangThai || "-"}</td>

          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={8} className="text-center">
            Không có dữ liệu
          </td>
        </tr>
      )}
    </tbody>
  </table>
  </div>
);

export default ThesisTable;
