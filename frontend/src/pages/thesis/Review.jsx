import React, { useEffect, useState } from 'react';
import { fetchTheses, updateThesis } from '../../services/thesisApi';
import Toast from '../../components/Toast';
import LoadingSection from '../../components/LoadingSection';

export default function Review() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  // Lấy mã GV từ token hoặc localStorage nếu cần
  const maGV = localStorage.getItem('maGV') || '';

  const showToast = (message, type = 'info') => setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      const theses = await fetchTheses();
      // Lọc đề tài được phân công phản biện cho GV hiện tại
      const filtered = theses.filter(t => t.maGV_PB === maGV);
      setData(filtered);
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
        diemPhanBien: row.diemPhanBien,
        nhanXetPhanBien: row.nhanXetPhanBien
      });
      showToast('Lưu thành công!', 'success');
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  return (
    <div className="review-page">
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(t => ({...t, open: false}))} />
      <h2 className='pb-[10px]'>Chấm điểm phản biện</h2>
      {loading ? 
      <div>
        {/* Đang tải... */}
        <LoadingSection />
      </div> : (
        <table className="thesis-table">
          <thead>
            <tr>
              <th>Mã đề tài</th>
              <th>Tên đề tài</th>
              <th>Điểm phản biện</th>
              <th>Nhận xét phản biện</th>
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
                    value={row.diemPhanBien || ''}
                    onChange={e => handleChange(row, 'diemPhanBien', e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.nhanXetPhanBien || ''}
                    onChange={e => handleChange(row, 'nhanXetPhanBien', e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <button className="btn btn-success" onClick={() => handleSave(row)} disabled={saving}>Lưu</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
