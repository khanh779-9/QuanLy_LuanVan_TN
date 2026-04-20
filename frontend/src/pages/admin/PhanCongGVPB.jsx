import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function AdminPhanCongGVPB() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [maGV, setMaGV] = useState('');

  // 1. Lấy danh sách đề tài CHƯA có GVPB
  const { data: danhSachDT, isLoading } = useQuery({
    queryKey: ['danhSachPhanCongPB'],
    queryFn: () => api.get('/phan-cong/danh-sach-chua-co-gvpb').then(res => res.data)
  });

  // 2. Lấy danh sách Giảng viên để chọn
  const { data: gvPaginationData } = useQuery({
    queryKey: ['giangvien-all'],
    queryFn: () => api.get('/giang-vien').then(res => res.data)
  });

  const gvList = gvPaginationData?.data || [];

  // 3. Mutation gán GVPB hàng loạt
  const phanCongMut = useMutation({
    mutationFn: (payload) => api.post('/phan-cong/phan-cong-gvpb', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['danhSachPhanCongPB']);
      setSelectedIds([]);
      setMaGV('');
      alert("Đã phân công giảng viên phản biện thành công!");
    },
    onError: (err) => {
      alert("Có lỗi xảy ra: " + (err.response?.data?.message || "Vui lòng thử lại"));
    }
  });

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked && Array.isArray(danhSachDT)) {
      setSelectedIds(danhSachDT.map(dt => dt.maDeTai));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Phân công Giảng viên Phản biện</h1>

      {/* Thanh công cụ gán nhanh */}
      <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 border border-gray-200 rounded text-sm">
        <span className="font-semibold text-gray-700">Đã chọn: {selectedIds.length} nhóm</span>
        <select 
          className="border border-gray-300 rounded px-3 py-1.5 bg-white outline-none focus:border-orange-500"
          value={maGV}
          onChange={(e) => setMaGV(e.target.value)}
        >
          <option value="">-- Chọn Giảng viên phản biện --</option>
          {gvList.map(gv => (
            <option key={gv.maGV} value={gv.maGV}>{gv.tenGV} ({gv.maGV})</option>
          ))}
        </select>
        <button
          onClick={() => {
            if(!maGV) return alert("Vui lòng chọn Giảng viên!");
            phanCongMut.mutate({ ids: selectedIds, maGV_PB: maGV });
          }}
          disabled={selectedIds.length === 0 || phanCongMut.isPending}
          className="bg-orange-600 text-white px-4 py-1.5 rounded font-bold disabled:opacity-50 hover:bg-orange-700 transition-colors"
        >
          {phanCongMut.isPending ? "Đang xử lý..." : "Xác nhận phân công GVPB"}
        </button>
      </div>

      {/* Bảng danh sách tương tự GVHD */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider border-b">
            <tr>
              <th className="p-3 text-left w-10">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedIds.length === danhSachDT?.length && danhSachDT?.length > 0}
                />
              </th>
              <th className="p-3 text-left">Đề tài (Hướng đề tài)</th>
              <th className="p-3 text-left">Nhóm Sinh viên</th>
              <th className="p-3 text-left text-orange-600">GV Hướng dẫn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : !danhSachDT || danhSachDT.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-500">Hiện không có đề tài nào chờ phân công phản biện.</td></tr>
            ) : (
              danhSachDT.map((dt) => (
                <tr key={dt.maDeTai} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(dt.maDeTai) ? 'bg-orange-50/50' : ''}`}>
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(dt.maDeTai)} 
                      onChange={() => handleSelect(dt.maDeTai)} 
                    />
                  </td>
                  <td className="p-3">
                     <div className="text-sm text-gray-900 font-bold">{dt.tenDeTai || "Chưa có tên đề tài"}</div>
                     <div className="text-xs text-gray-500">{dt.moTa}</div>
                  </td>
                  <td className="p-3">
                    {dt.sinh_vien?.map(sv => (
                      <div key={sv.mssv} className="text-xs text-gray-700">
                        {sv.hoTen} ({sv.mssv})
                      </div>
                    ))}
                  </td>
                  <td className="p-3 text-sm font-medium text-gray-600 italic">
                    {dt.giang_vien_h_d?.tenGV || dt.giangVienHD?.tenGV || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}