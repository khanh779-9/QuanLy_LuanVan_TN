import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function AdminPhanCongGVHD() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [maGV, setMaGV] = useState('');

  // 1. Lấy danh sách đề tài CHƯA có GVHD
  // Dữ liệu trả về từ API này là một mảng [] theo Controller cũ của bạn
  const { data: danhSachDT, isLoading } = useQuery({
    queryKey: ['danhSachPhanCongHD'],
    queryFn: () => api.get('/phan-cong/danh-sach-chua-co-gvhd').then(res => res.data)
  });

  // 2. Lấy danh sách Giảng viên để chọn
  // API này trả về Object phân trang: { data: [...], total: ... }
  const { data: gvPaginationData } = useQuery({
    queryKey: ['giangvien-all'],
    queryFn: () => api.get('/giang-vien').then(res => res.data)
  });
  const handleExport = async () => {
  try {
    // Gọi API với responseType là blob để nhận file nhị phân
    const response = await api.get('/phan-cong/export-gvhd', {
      responseType: 'blob',
    });

    // Tạo URL tạm thời cho file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_phan_cong_GVHD.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Giải phóng bộ nhớ
  } catch (error) {
    alert("Lỗi khi xuất danh sách GVHD!");
  }
  };
  // Trích xuất mảng giảng viên thực sự từ object phân trang
  const gvList = gvPaginationData?.data || [];

  // 3. Mutation gán GVHD hàng loạt
  const phanCongMut = useMutation({
    mutationFn: (payload) => api.post('/phan-cong/phan-cong-gvhd', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['danhSachPhanCongHD']);
      setSelectedIds([]);
      setMaGV('');
      alert("Đã phân công giảng viên hướng dẫn thành công!");
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
      <h1 className="text-xl font-bold text-gray-800 mb-6">Phân công Giảng viên Hướng dẫn</h1>

      {/* Thanh công cụ gán nhanh */}
      <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 border border-gray-200 rounded">
        <span className="text-sm font-semibold text-gray-700">Đã chọn: {selectedIds.length} nhóm</span>
        <select 
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
          value={maGV}
          onChange={(e) => setMaGV(e.target.value)}
        >
          <option value="">-- Chọn Giảng viên hướng dẫn --</option>
          {gvList.map(gv => (
            <option key={gv.maGV} value={gv.maGV}>{gv.tenGV} ({gv.maGV})</option>
          ))}
        </select>
        <button
          onClick={() => {
            if(!maGV) return alert("Vui lòng chọn Giảng viên!");
            phanCongMut.mutate({ ids: selectedIds, maGV_HD: maGV });
          }}
          disabled={selectedIds.length === 0 || phanCongMut.isPending}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {phanCongMut.isPending ? "Đang xử lý..." : "Xác nhận phân công GVHD"}
        </button>
        <button
          onClick={handleExport}
          className="bg-emerald-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          Xuất file danh sách phân công GVHD
        </button>
      </div>

      {/* Bảng danh sách */}
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
              <th className="p-3 text-left">Hướng đề tài</th>
              <th className="p-3 text-left">Nhóm Sinh viên</th>
              <th className="p-3 text-left">Lớp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : !danhSachDT || danhSachDT.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-500">Hiện không có đề tài nào chờ phân công.</td></tr>
            ) : (
              danhSachDT.map((dt) => (
                <tr key={dt.maDeTai} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(dt.maDeTai) ? 'bg-blue-50/50' : ''}`}>
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(dt.maDeTai)} 
                      onChange={() => handleSelect(dt.maDeTai)} 
                    />
                  </td>
                  <td className="p-3 text-sm text-gray-900 font-medium">
                    {dt.moTa || "Chưa có hướng"}
                  </td>
                  <td className="p-3">
                    {/* Sửa tên relation sinh_vien cho đúng với API trả về */}
                    {dt.sinh_vien && dt.sinh_vien.length > 0 ? (
                      dt.sinh_vien.map(sv => (
                        <div key={sv.mssv} className="text-sm text-gray-700">
                          {sv.hoTen} <span className="text-gray-400 text-xs">({sv.mssv})</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">Chưa có SV</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {dt.sinh_vien?.[0]?.lop || "—"}
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