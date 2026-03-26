import React from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const ThesisTable = ({ data, onDetail, onEdit, onDelete }) => (
  <table className="thesis-table">
    <thead>
      <tr>
        <th>Mã đề tài</th>
        <th>Tên đề tài</th>
        <th>Sinh viên</th>
        <th>GV Hướng dẫn</th>
        <th>GV Phản biện</th>
        <th>Điểm</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      {data && data.length > 0 ? data.map((row) => (
        <tr key={row.maDeTai}>
          <td>{row.maDeTai}</td>
          <td>{row.tenDeTai}</td>
          <td>{row.students?.map(sv => sv.hoTen).join(', ')}</td>
          <td>{row.lecturer?.tenGV}</td>
          <td>{row.reviewer?.tenGV}</td>
          <td>{row.diemTong || '-'}</td>
          <td>{row.trangThai || '-'}</td>
          <td>
            <button className="btn btn-info mt-2" title="Chi tiết" onClick={() => onDetail(row)}>
              <FaEye />
            </button>
            <button className="btn btn-warning mt-2" title="Sửa" onClick={() => onEdit(row)}>
              <FaEdit />
            </button>
            <button className="btn btn-danger mt-2" title="Xóa" onClick={() => onDelete(row)}>
              <FaTrash />
            </button>
          </td>
        </tr>
      )) : (
        <tr><td colSpan={8} className="text-center">Không có dữ liệu</td></tr>
      )}
    </tbody>
  </table>
);

export default ThesisTable;
