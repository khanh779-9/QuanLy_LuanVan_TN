import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLecturers, createLecturer, updateLecturer, deleteLecturer } from '../../services/giangVienService';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function GiangVien() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const { data: gvData, isLoading } = useQuery({
    queryKey: ['giangvien'],
    queryFn: getLecturers,
  });

  const deleteMut = useMutation({
    mutationFn: (maGV) => deleteLecturer(maGV),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giangvien'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteError('');
    },
    onError: (err) => {
      if (err.response?.status === 422) {
        setDeleteError(err.response.data.message || 'Không thể xóa giảng viên này.');
      }
    },
  });

  const filtered = useMemo(() => {
    if (!gvData?.data) return [];
    if (!search.trim()) return gvData.data;
    const q = search.toLowerCase();
    return gvData.data.filter(gv =>
      gv.maGV?.toLowerCase().includes(q) ||
      gv.tenGV?.toLowerCase().includes(q) ||
      gv.email?.toLowerCase().includes(q)
    );
  }, [gvData, search]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Giảng viên</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1"
        />
        <button
          onClick={() => { setEditItem(null); setShowFormModal(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Thêm giảng viên
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã GV</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên GV</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Học vị</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SĐT</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có giảng viên</p>
                  <p className="text-sm text-slate-400 mt-1">Thêm giảng viên đầu tiên để bắt đầu sử dụng hệ thống.</p>
                </td>
              </tr>
            ) : (
              filtered.map(gv => (
                <tr key={gv.maGV} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gv.maGV}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{gv.tenGV}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gv.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gv.hocVi || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gv.soDienThoai || '-'}</td>
                  
                  <td className="px-4 py-3 border-t border-slate-100">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditItem(gv); setShowFormModal(true); }} className="text-sm text-blue-600 hover:text-blue-800">Sửa</button>
                      <button onClick={() => { setDeleteItem(gv); setDeleteError(''); setShowDeleteConfirm(true); }} className="text-sm text-red-500 hover:text-red-700">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <GvFormModal
          editItem={editItem}
          onClose={() => { setShowFormModal(false); setEditItem(null); }}
        />
      )}

      {showDeleteConfirm && deleteItem && (
        <GvDeleteConfirm
          item={deleteItem}
          loading={deleteMut.isPending}
          error={deleteError}
          onConfirm={() => deleteMut.mutate(deleteItem.maGV)}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteItem(null); setDeleteError(''); }}
        />
      )}
    </div>
  );
}

function GvFormModal({ editItem, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    maGV: editItem?.maGV || '',
    tenGV: editItem?.tenGV || '',
    email: editItem?.email || '',
    hocVi: editItem?.hocVi || 'ThS',
    soDienThoai: editItem?.soDienThoai || '',
    password: '123',
  });
  const [errors, setErrors] = useState({});

  const createMut = useMutation({
    mutationFn: (data) => createLecturer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giangvien'] });
      onClose();
    },
    onError: (err) => {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: (data) => updateLecturer(editItem.maGV, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giangvien'] });
      onClose();
    },
    onError: (err) => {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      }
    },
  });

  const loading = createMut.isPending || updateMut.isPending;

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    const payload = { tenGV: form.tenGV, email: form.email, hocVi: form.hocVi, soDienThoai: form.soDienThoai };
    if (form.password) payload.password = form.password;
    if (editItem) {
      updateMut.mutate(payload);
    } else {
      createMut.mutate({ ...payload, maGV: form.maGV, password: form.password });
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={editItem ? 'Sửa giảng viên' : 'Thêm giảng viên'} maxWidth="max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Mã GV</label>
          <input type="text" value={form.maGV} onChange={e => handleChange('maGV', e.target.value)} disabled={!!editItem || loading}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.maGV ? 'border-red-300' : 'border-slate-200'}`} />
          {errors.maGV && <p className="text-red-500 text-xs mt-1">{errors.maGV[0]}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Họ tên</label>
          <input type="text" value={form.tenGV} onChange={e => handleChange('tenGV', e.target.value)} disabled={loading}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.tenGV ? 'border-red-300' : 'border-slate-200'}`} />
          {errors.tenGV && <p className="text-red-500 text-xs mt-1">{errors.tenGV[0]}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} disabled={loading}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.email ? 'border-red-300' : 'border-slate-200'}`} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Học vị</label>
          <select value={form.hocVi} onChange={e => handleChange('hocVi', e.target.value)} disabled={loading}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white disabled:opacity-50">
            <option value="ThS">ThS</option>
            <option value="TS">TS</option>
            <option value="PGS.TS">PGS.TS</option>
            <option value="GS.TS">GS.TS</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
          <input type="text" value={form.soDienThoai} onChange={e => handleChange('soDienThoai', e.target.value)} disabled={loading}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
        </div>
        

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg">Hủy</button>
          <button type="submit" disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function GvDeleteConfirm({ item, loading, error, onConfirm, onCancel }) {
  return (
    <ConfirmModal 
      isOpen={true}
      title="Xóa giảng viên?"
      message={`Bạn có chắc muốn xóa giảng viên ${item.tenGV} (${item.maGV})? Hành động này không thể hoàn tác.`}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
      error={error}
      confirmText="Xóa"
    />
  );
}
