import React from 'react';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

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
          <td style={{display: 'flex', gap: 5}}>
            <button className="btn btn-info" title="Chi tiết" onClick={() => onDetail(row)}>
              <FaSearch />
            </button>
            <button className="btn btn-warning" title="Sửa" onClick={() => onEdit(row)}>
              <FaEdit />
            </button>
            <button className="btn btn-danger" title="Xóa" onClick={() => onDelete(row)}>
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
