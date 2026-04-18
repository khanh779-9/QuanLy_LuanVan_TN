import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getList, createRecord, updateRecord, deleteRecord, importExcel } from '../../services/nhapLieuService';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

const STATUS_MAP = {
  cho_duyet: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
  da_duyet: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700' },
  tu_choi: { label: 'Từ chối', cls: 'bg-red-50 text-red-600' },
};

export default function AdminNhapLieuPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['nhaplieu', { search, status: statusFilter, page }],
    queryFn: () => getList({ search: search || undefined, status: statusFilter || undefined, page }).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const approveMut = useMutation({
    mutationFn: (id) => api.post(`/topic-registration-form/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
    },
  });
  const approveAllPendingMut = useMutation({
    mutationFn: () => api.post('/nhap-lieu/approve-all-pending'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
      alert(res.data.message || "Đã duyệt toàn bộ thành công!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi duyệt toàn bộ!");
    }
  });
  const handleSelectAll = (e) => {
    if (e.target.checked && Array.isArray(listData?.data)) {
        setSelectedIds(listData.data.map(item => item.id));
    } else {
        setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const tableData = listData?.data || [];
  const total = listData?.total || 0;
  const perPage = listData?.per_page || 20;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Nhập liệu đăng ký đề tài</h1>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Tìm theo MSSV, tên SV..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="da_duyet">Đã duyệt</option>
          <option value="tu_choi">Từ chối</option>
        </select>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Import Excel
        </button>
        <button
          onClick={() => { setEditItem(null); setShowFormModal(true); }}
          className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Thêm bản ghi
        </button>
        <button
          onClick={() => {
            if(confirm("Bạn có chắc chắn muốn duyệt tất cả?")) {
              approveAllPendingMut.mutate();
            }
          }}
          disabled={approveAllPendingMut.isPending}
          className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {approveAllPendingMut.isPending ? 'Đang xử lý...' : 'Duyệt toàn bộ'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                
                <th className="px-4 py-4 text-left whitespace-nowrap">Nhóm</th>
                <th className="px-4 py-4 text-left">Sinh viên 1</th>
                <th className="px-4 py-4 text-left">Sinh viên 2</th>
                <th className="px-4 py-4 text-left">Hướng đề tài</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">Trạng thái</th>
                <th className="px-4 py-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">Đang tải dữ liệu...</td></tr>
              ) : Array.isArray(listData?.data) && listData.data.length > 0 ? (
                listData.data.map((row) => (
                  <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(row.id) ? 'bg-blue-50/30' : ''}`}>
                    
                    
                    <td className="px-4 py-4">
                        <span className='text-sm font-medium'>
                            {row.topic_type === 'hai_sinh_vien' ? '2 Người' : '1 Người'}
                        </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-slate-900">{row.student1_name}</div>
                      <div className="text-xs text-slate-900 mt-0.5">{row.student1_id}</div>
                    </td>
                    
                    <td className="px-4 py-4">
                      {row.student2_id ? (
                        <>
                          <div className="text-sm font-semibold text-slate-900">{row.student2_name}</div>
                          <div className="text-xs text-slate-900 mt-0.5">{row.student2_id} </div>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium italic"></span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 max-w-[200px]">
                      <span className="text-sm font-medium">
                        {row.topic_description || "Chưa xác định"}
                      </span>
                    </td>
                    
                    
                    
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_MAP[row.status]?.cls}`}>
                        {STATUS_MAP[row.status]?.label}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {row.status === 'cho_duyet' && (
  <button 
    onClick={() => approveMut.mutate(row.id)} 
    className="text-green-600 hover:bg-green-50 rounded-lg transition-colors mr-1 font-semibold text-xs"
  >
    Duyệt
  </button>
)}
                        <button onClick={() => { setEditItem(row); setShowFormModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1 font-semibold text-xs">Sửa</button>
                        <button onClick={() => { setDeleteItem(row); setShowDeleteConfirm(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold text-xs">Xóa</button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
          <Pagination 
            page={page} 
            setPage={setPage} 
            total={total} 
            perPage={perPage} 
            itemName="bản ghi" 
          />
      </div>

      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}

      {showFormModal && (
        <FormModal editItem={editItem} onClose={() => { setShowFormModal(false); setEditItem(null); }} />
      )}

      {showDeleteConfirm && deleteItem && (
        <ConfirmModal 
          isOpen={true}
          title="Xóa bản đăng ký?"
          message={`Bạn có chắc muốn xóa bản ghi ${deleteItem.student1_name}-${deleteItem.student1_id}? Hành động này không thể hoàn tác`}
          onConfirm={() => deleteMut.mutate(deleteItem.id)}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}
          loading={deleteMut.isPending}
          confirmText="Xóa"
        />
      )}
    </div>
  );
}

function ImportModal({ onClose }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const importMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('file', file);
      return importExcel(fd).then(r => r.data);
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
      queryClient.invalidateQueries({ queryKey: ['sinhvien'] });
    },
  });

  return (
    <Modal isOpen={true} onClose={onClose} title="Import đăng ký đề tài từ Excel" maxWidth="max-w-lg">
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-1">File Excel</label>
        <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0] || null)}
          className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
      </div>
      <button onClick={() => importMut.mutate()} disabled={!file || importMut.isPending}
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
        {importMut.isPending ? 'Đang xử lý...' : 'Import'}
      </button>
      {importMut.isError && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mt-4">Không thể import file. Vui lòng thử lại.</div>}
      {result && (
        <div className="mt-4">
          {result.imported > 0 && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">Đã import {result.imported} bản ghi thành công.</div>}
          {result.errors?.length > 0 && (
            <div className="mt-3 border border-amber-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-amber-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-700">Sheet</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-700">Lỗi</th>
                </tr></thead>
                <tbody>
                  {result.errors.map((err, i) => (
                    <tr key={i} className="border-t border-amber-100">
                      <td className="px-3 py-2 text-sm text-slate-700">{err.sheet || err.row || i + 1}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function FormModal({ editItem, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    topic_description: editItem?.topic_description || '',
    topic_type: editItem?.topic_type || 'mot_sinh_vien',
    student1_id: editItem?.student1_id || '',
    student1_name: editItem?.student1_name || '',
    student1_class: editItem?.student1_class || '',
    student1_email: editItem?.student1_email || '',
    student2_id: editItem?.student2_id || '',
    student2_name: editItem?.student2_name || '',
    student2_class: editItem?.student2_class || '',
    student2_email: editItem?.student2_email || '',
    note: editItem?.note || '',
    status: editItem?.status || 'cho_duyet',
  });
  const [errors, setErrors] = useState({});

  const createMut = useMutation({
    mutationFn: (data) => createRecord(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['nhaplieu'] }); onClose(); },
    onError: (err) => { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); },
  });

  const updateMut = useMutation({
    mutationFn: (data) => updateRecord(editItem.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['nhaplieu'] }); onClose(); },
    onError: (err) => { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); },
  });

  const loading = createMut.isPending || updateMut.isPending;

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (editItem) updateMut.mutate(form);
    else createMut.mutate(form);
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  const isHaiSV = form.topic_type === 'hai_sinh_vien';

  return (
    <Modal isOpen={true} onClose={onClose} title={editItem ? 'Sửa bản đăng ký' : 'Thêm bản đăng ký'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit}>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Hướng đề tài</label>
          <textarea rows={2} value={form.topic_description} onChange={e => handleChange('topic_description', e.target.value)} disabled={loading}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Loại</label>
          <select value={form.topic_type} onChange={e => handleChange('topic_type', e.target.value)} disabled={loading}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white disabled:opacity-50">
            <option value="mot_sinh_vien">1 sinh viên</option>
            <option value="hai_sinh_vien">2 sinh viên</option>
          </select>
        </div>

        <p className="text-sm font-semibold text-slate-600 mb-2 mt-4">Sinh viên 1</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">MSSV</label>
            <input type="text" value={form.student1_id} onChange={e => handleChange('student1_id', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Họ tên</label>
            <input type="text" value={form.student1_name} onChange={e => handleChange('student1_name', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Lớp</label>
            <input type="text" value={form.student1_class} onChange={e => handleChange('student1_class', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Email</label>
            <input type="email" value={form.student1_email} onChange={e => handleChange('student1_email', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
        </div>

        {isHaiSV && (
          <>
            <p className="text-sm font-semibold text-slate-600 mb-2">Sinh viên 2</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">MSSV</label>
                <input type="text" value={form.student2_id} onChange={e => handleChange('student2_id', e.target.value)} disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Họ tên</label>
                <input type="text" value={form.student2_name} onChange={e => handleChange('student2_name', e.target.value)} disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Lớp</label>
                <input type="text" value={form.student2_class} onChange={e => handleChange('student2_class', e.target.value)} disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Email</label>
                <input type="email" value={form.student2_email} onChange={e => handleChange('student2_email', e.target.value)} disabled={loading}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
              </div>
            </div>
          </>
        )}

        
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái</label>
          <select value={form.status} onChange={e => handleChange('status', e.target.value)} disabled={loading}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white disabled:opacity-50">
            <option value="cho_duyet">Chờ duyệt</option>
            <option value="da_duyet">Đã duyệt</option>
            <option value="tu_choi">Từ chối</option>
          </select>
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