import React, { useEffect, useState } from 'react';
import { fetchCouncils } from '../../services/councilsApi';
import { fetchTheses, updateThesis } from '../../services/thesisApi';
import Toast from '../../components/Toast';

export default function Council() {
  const [councils, setCouncils] = useState([]);
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => setToast({ open: true, message, type });

  const loadData = async () => {
    setLoading(true);
    try {
      const [councils, theses] = await Promise.all([
        fetchCouncils(),
        fetchTheses()
      ]);
      setCouncils(councils);
      setTheses(theses);
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAssignTopic = async (topic, councilId) => {
    setSaving(true);
    try {
      await updateThesis(topic.maDeTai, { ...topic, maHoiDong: councilId });
      showToast('Phân công thành công!', 'success');
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  return (
    <div className="council-page">
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(t => ({...t, open: false}))} />
      <h2 className='pb-[10px]'>Quản lý hội đồng</h2>
      {loading ? <div>Đang tải...</div> : (
        <div style={{display:'flex', flexDirection:'column', gap: '10px'}}>
          <div style={{flex:1}}>
            <h3>Danh sách hội đồng</h3>
            <table className="thesis-table">
              <thead>
                <tr>
                  <th>Tên hội đồng</th>
                  <th>Thành viên</th>
                  <th>Đề tài</th>
                </tr>
              </thead>
              <tbody>
                {councils.map(c => (
                  <tr key={c.maHoiDong}>
                    <td>{c.tenHoiDong}</td>
                    <td>
                      {c.members?.map(m => m.tenGV + (m.vaiTro ? ` (${m.vaiTro})` : '')).join(', ')}
                    </td>
                    <td>
                      {theses.filter(t => t.maHoiDong === c.maHoiDong).map(t => t.tenDeTai).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{flex:1}}>
            <h3>Phân công đề tài vào hội đồng</h3>
            <table className="thesis-table">
              <thead>
                <tr>
                  <th>Mã đề tài</th>
                  <th>Tên đề tài</th>
                  <th>Hội đồng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {theses.map(t => (
                  <tr key={t.maDeTai}>
                    <td>{t.maDeTai}</td>
                    <td>{t.tenDeTai}</td>
                    <td>
                      <select
                        className='custom-select'
                        value={t.maHoiDong || ''}
                        onChange={e => handleAssignTopic(t, e.target.value)}
                        disabled={saving}
                      >
                        <option value="">-- Chọn --</option>
                        {councils.map(c => (
                          <option key={c.maHoiDong} value={c.maHoiDong}>{c.tenHoiDong}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleAssignTopic(t, t.maHoiDong)} disabled={saving || !t.maHoiDong}>Lưu</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
