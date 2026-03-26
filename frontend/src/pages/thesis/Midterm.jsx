import React, { useEffect, useState } from 'react';
import { fetchTheses, updateThesis } from '../../services/thesisApi';
import Toast from '../../components/Toast';

const STATUS_OPTIONS = [
  'Được làm tiếp',
  'Đình chỉ',
  'Cảnh cáo'
];

export default function Midterm() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      const theses = await fetchTheses();
      setData(theses);
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (row, field, value) => {
    setData(data => data.map(dt => dt.maDeTai === row.maDeTai ? { ...dt, [field]: value } : dt));
  };

  const handleSave = async (row) => {
    setSaving(true);
    try {
      await updateThesis(row.maDeTai, {
        ...row,
        diemGiuaKy: row.diemGiuaKy,
        trangThaiGiuaKy: row.trangThaiGiuaKy,
        nhanXetGiuaKy: row.nhanXetGiuaKy
      });
      showToast('Lưu thành công!', 'success');
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  return (
    <div className="midterm-page">
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(t => ({...t, open: false}))} />
      <h2 className='pb-[10px]'>Chấm điểm giữa kỳ</h2>
      {loading ? <div>Đang tải...</div> : (
        <table className="thesis-table">
          <thead>
            <tr>
              <th>Mã đề tài</th>
              <th>Tên đề tài</th>
              <th>Điểm giữa kỳ</th>
              <th>Trạng thái</th>
              <th>Nhận xét</th>
              <th>Lưu</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.maDeTai}>
                <td>{row.maDeTai}</td>
                <td>{row.tenDeTai}</td>
                <td>
                  <input
                    type="number"
                    min="0" max="100" step="0.1"
                    value={row.diemGiuaKy || ''}
                    onChange={e => handleChange(row, 'diemGiuaKy', e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <select
                    className='custom-select'
                    value={row.trangThaiGiuaKy || ''}
                    onChange={e => handleChange(row, 'trangThaiGiuaKy', e.target.value)}
                    disabled={saving}
                  >
                    <option value="">-- Chọn --</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={row.nhanXetGiuaKy || ''}
                    onChange={e => handleChange(row, 'nhanXetGiuaKy', e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleSave(row)} disabled={saving}>Lưu</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
