import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineDocumentArrowDown, HiOutlineTrash, HiOutlinePencilSquare } from "react-icons/hi2";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function AdminHoiDong() {
  const queryClient = useQueryClient();
  const [selectedHD, setSelectedHD] = useState(null);
  const [activeTab, setActiveTab] = useState('thanhvien');
  
  // Modal states
  const [showFormHD, setShowFormHD] = useState(false);
  const [editHD, setEditHD] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // 1. Lấy danh sách hội đồng
  const { data: listHD, isLoading } = useQuery({
    queryKey: ['hoidong-all'],
    queryFn: () => api.get('/hoi-dong').then(res => res.data)
  });

  // 2. Mutation Thêm/Sửa Hội đồng
  const upsertHDMut = useMutation({
    mutationFn: (payload) => editHD 
      ? api.put(`/hoi-dong/${editHD.maHoiDong}`, payload)
      : api.post('/hoi-dong', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['hoidong-all']);
      setShowFormHD(false);
      setEditHD(null);
    }
  });

  // 3. Mutation Xóa Hội đồng
  const deleteHDMut = useMutation({
    mutationFn: (id) => api.delete(`/hoi-dong/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['hoidong-all']);
      setShowConfirmDelete(false);
      setSelectedHD(null);
    }
  });

  const handleExportAll = async () => {
  try {
    const token = localStorage.getItem('token'); // Phục kiểm tra key này trong Application tab nhé
    const baseUrl = api.defaults.baseURL;
    
    // Gọi theo cách Blob để kẹp Header an toàn như bạn muốn
    const response = await api.get('/hoi-dong/export-all', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_bao_ve_LVTN_Tong_Hop.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    alert("Lỗi xuất file tổng hợp!");
  }
};

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Hội đồng Bảo vệ LVTN</h1>
  <button 
    onClick={handleExportAll} // Đổi sang hàm xuất tất cả
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
  >
    <HiOutlineDocumentArrowDown size={20} />
    Xuất danh sách bảo vệ LVTN (Tổng hợp)
  </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* PANEL TRÁI: DANH SÁCH HỘI ĐỒNG */}
        <div className="w-1/3 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-700">Danh sách Hội đồng</h2>
            <button 
              onClick={() => { setEditHD(null); setShowFormHD(true); }}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >+ Tạo mới</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {isLoading ? <p className="text-center mt-10 text-slate-400">Đang tải...</p> : 
              listHD?.map(hd => (
                <div 
                  key={hd.maHoiDong} 
                  onClick={() => setSelectedHD(hd)}
                  className={`p-4 border rounded-lg cursor-pointer relative group transition-all ${
                    selectedHD?.maHoiDong === hd.maHoiDong ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold text-slate-800">{hd.tenHoiDong}</div>
                  <div className="text-xs text-slate-500 mt-1">Phòng: {hd.diaDiem || '—'} | Ngày: {hd.ngayBaoVe ? new Date(hd.ngayBaoVe).toLocaleDateString('vi-VN') : '—'}</div>
                  
                  <div className="absolute top-2 right-2 hidden group-hover:flex gap-2">
                     <button onClick={(e) => { e.stopPropagation(); setEditHD(hd); setShowFormHD(true); }} className="p-1 text-blue-600 hover:bg-white rounded"><HiOutlinePencilSquare/></button>
                     <button onClick={(e) => { e.stopPropagation(); setEditHD(hd); setShowConfirmDelete(true); }} className="p-1 text-red-600 hover:bg-white rounded"><HiOutlineTrash/></button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* PANEL PHẢI: CHI TIẾT */}
        <div className="w-2/3 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
          {selectedHD ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-xl text-slate-800">{selectedHD.tenHoiDong}</h2>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setActiveTab('thanhvien')} className={`pb-2 text-sm font-bold border-b-2 ${activeTab === 'thanhvien' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>Thành viên</button>
                  <button onClick={() => setActiveTab('detai')} className={`pb-2 text-sm font-bold border-b-2 ${activeTab === 'detai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>Đề tài bảo vệ</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'thanhvien' ? <QuanLyThanhVienHD maHoiDong={selectedHD.maHoiDong} /> : <QuanLyDeTaiHD maHoiDong={selectedHD.maHoiDong} />}
              </div>
            </>
          ) : <div className="m-auto text-slate-300">Chọn hội đồng để bắt đầu</div>}
        </div>
      </div>

      {/* Modal Thêm/Sửa Hội đồng */}
      {showFormHD && (
        <Modal isOpen={true} onClose={() => setShowFormHD(false)} title={editHD ? "Sửa hội đồng" : "Thêm hội đồng mới"}>
          <FormHoiDong 
            initialData={editHD} 
            onSubmit={(val) => upsertHDMut.mutate(val)} 
            isLoading={upsertHDMut.isPending} 
          />
        </Modal>
      )}

      {/* Modal Xác nhận xóa */}
      {showConfirmDelete && (
        <ConfirmModal 
          isOpen={true} 
          title="Xóa hội đồng?" 
          onConfirm={() => deleteHDMut.mutate(editHD.maHoiDong)} 
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// --- FORM HỘI ĐỒNG ---
function FormHoiDong({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    tenHoiDong: initialData?.tenHoiDong || "",
    diaDiem: initialData?.diaDiem || "",
    ngayBaoVe: initialData?.ngayBaoVe ? initialData.ngayBaoVe.substring(0, 16) : ""
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên hội đồng</label>
        <input className="w-full border rounded p-2" value={formData.tenHoiDong} onChange={e => setFormData({...formData, tenHoiDong: e.target.value})} />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Địa điểm (Phòng)</label>
          <input className="w-full border rounded p-2" value={formData.diaDiem} onChange={e => setFormData({...formData, diaDiem: e.target.value})} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Ngày giờ bảo vệ</label>
          <input type="datetime-local" className="w-full border rounded p-2" value={formData.ngayBaoVe} onChange={e => setFormData({...formData, ngayBaoVe: e.target.value})} />
        </div>
      </div>
      <button onClick={() => onSubmit(formData)} disabled={isLoading} className="w-full bg-blue-600 text-white p-2 rounded font-bold">
        {isLoading ? "Đang lưu..." : "Xác nhận"}
      </button>
    </div>
  );
}

// --- COMPONENT THÀNH VIÊN (KÈM PHÂN CÔNG) ---
function QuanLyThanhVienHD({ maHoiDong }) {
  const queryClient = useQueryClient();
  const [showAddGV, setShowAddGV] = useState(false);
  const [selectedGV, setSelectedGV] = useState("");
  const [vaiTro, setVaiTro] = useState("UyVien");

  const { data: thanhViens } = useQuery({ queryKey: ['thanhvien-hd', maHoiDong], queryFn: () => api.get(`/hoi-dong/${maHoiDong}/thanh-vien`).then(res => res.data) });
  const { data: gvChuaCo } = useQuery({ queryKey: ['gv-chua-co', maHoiDong], queryFn: () => api.get(`/hoi-dong/${maHoiDong}/giang-vien-chua-co`).then(res => res.data) });

  const addGVMut = useMutation({
    mutationFn: (payload) => api.post('/hoi-dong/phan-cong-giang-vien', payload),
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ['thanhvien-hd'] }); 
        queryClient.invalidateQueries({ queryKey: ['gv-chua-co'] });
        setShowAddGV(false); 
    },
    // Hiển thị lỗi nếu vi phạm ràng buộc (Trùng lịch, sai vai trò)
    onError: (err) => alert(err.response?.data?.message || "Có lỗi xảy ra!") 
  });

  const deleteGVMut = useMutation({
    mutationFn: (id) => api.delete(`/hoi-dong/thanh-vien/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['thanhvien-hd'] });
        // Thêm dòng này để load lại danh sách GV chưa có
        queryClient.invalidateQueries({ queryKey: ['gv-chua-co'] });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Thành viên hội đồng (Tối đa 4)</h3>
        <button onClick={() => setShowAddGV(true)} className="text-blue-600 font-bold">+ Thêm GV</button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr><th className="p-2 text-left">Vai trò</th><th className="p-2 text-left">Giảng viên</th><th className="p-2"></th></tr>
        </thead>
        <tbody>
          {thanhViens?.map(tv => (
            <tr key={tv.id} className="border-b">
              <td className="p-2 font-bold text-blue-600">{tv.vaiTro === 'ChuTich' ? 'Chủ tịch' : tv.vaiTro === 'ThuKy' ? 'Thư ký' : 'Ủy viên'}</td>
              <td className="p-2">{tv.giang_vien?.tenGV} <span className="text-xs text-slate-400">({tv.maGV})</span></td>
              <td className="p-2 text-right">
                <button onClick={() => deleteGVMut.mutate(tv.id)} className="text-red-500"><HiOutlineTrash/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddGV && (
        <Modal isOpen={true} onClose={() => setShowAddGV(false)} title="Thêm giảng viên vào hội đồng">
          <div className="space-y-4">
            <select className="w-full border p-2 rounded" value={selectedGV} onChange={e => setSelectedGV(e.target.value)}>
              <option value="">-- Chọn giảng viên --</option>
              {gvChuaCo?.map(gv => <option key={gv.maGV} value={gv.maGV}>{gv.tenGV} ({gv.maGV})</option>)}
            </select>
            <select className="w-full border p-2 rounded" value={vaiTro} onChange={e => setVaiTro(e.target.value)}>
              <option value="ChuTich">Chủ tịch Hội đồng</option>
              <option value="ThuKy">Thư ký Hội đồng</option>
              <option value="UyVien">Ủy viên</option>
            </select>
            <button onClick={() => addGVMut.mutate({ maHoiDong, maGV: selectedGV, vaiTro })} disabled={!selectedGV} className="w-full bg-blue-600 text-white p-2 rounded font-bold disabled:opacity-50">Xác nhận</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- COMPONENT ĐỀ TÀI (KÈM GVPB) ---
function QuanLyDeTaiHD({ maHoiDong }) {
  const queryClient = useQueryClient();
  const [showAddDT, setShowAddDT] = useState(false);
  const [selectedDT, setSelectedDT] = useState("");

  const { data: deTais } = useQuery({ queryKey: ['detai-hd', maHoiDong], queryFn: () => api.get(`/de-tai?maHoiDong=${maHoiDong}&per_page=100`).then(res => res.data.data) });
  const { data: detaiChuaHD } = useQuery({ queryKey: ['detai-no-hd'], queryFn: () => api.get(`/de-tai?per_page=100`).then(res => res.data.data.filter(d => !d.maHoiDong)) });

  const ganDTMut = useMutation({
    mutationFn: (maDeTai) => api.post(`/hoi-dong/${maHoiDong}/gan-de-tai`, { maDeTai, thuTuTrongHD: (deTais?.length || 0) + 1 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['detai-hd'] });queryClient.invalidateQueries({ queryKey: ['detai-no-hd'] }); setShowAddDT(false); }
  });

  const goDTMut = useMutation({
    mutationFn: (maDeTai) => api.post(`/hoi-dong/go-de-tai/${maDeTai}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['detai-hd'] });
        // Thêm dòng này để load lại danh sách đề tài chưa phân công
        queryClient.invalidateQueries({ queryKey: ['detai-no-hd'] });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Đề tài bảo vệ</h3>
        <button onClick={() => setShowAddDT(true)} className="text-green-600 font-bold">+ Phân công đề tài</button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-center w-12">STT</th>
            <th className="p-2 text-left">Đề tài & Sinh viên</th>
            <th className="p-2 text-left">GVHD / GVPB</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {deTais?.sort((a, b) => a.thuTuTrongHD - b.thuTuTrongHD).map((dt, idx) => (
            <tr key={dt.maDeTai} className="border-b">
              <td className="p-2 text-center font-bold text-blue-600">
      {/* Hiển thị giá trị từ DB */}
      {dt.thuTuTrongHD} 
    </td>
              <td className="p-2">
                <div className="font-bold text-blue-700">{dt.tenDeTai || dt.moTa}</div>
                {/* Hiển thị format: Tên SV - MSSV (xuống dòng nếu có 2 sv) */}
                <div className="text-xs font-semibold text-slate-600 mt-1 space-y-0.5">
                  {dt.sinh_vien?.map(sv => (
                    <div key={sv.mssv}>• {sv.hoTen} - {sv.mssv}</div>
                  ))}
                </div>
              </td>
              <td className="p-2 text-xs">
                <div>GVHD: <span className="font-bold">{dt.giang_vien_h_d?.tenGV}</span></div>
                <div>GVPB: <span className="font-bold">{dt.giang_vien_p_b?.tenGV || "Chưa có"}</span></div>
              </td>
              <td className="p-2 text-right">
                <button onClick={() => goDTMut.mutate(dt.maDeTai)} className="text-red-500 text-xs hover:underline">Gỡ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddDT && (
        <Modal isOpen={true} onClose={() => setShowAddDT(false)} title="Phân công đề tài vào hội đồng">
          <div className="space-y-4">
            <select className="w-full border p-2 rounded" value={selectedDT} onChange={e => setSelectedDT(e.target.value)}>
              <option value="">-- Chọn đề tài chưa có hội đồng --</option>
              {/* Hiển thị đầy đủ tất cả tên SV trong dropdown */}
              {detaiChuaHD?.map(d => (
                <option key={d.maDeTai} value={d.maDeTai}>
                  {d.tenDeTai || d.moTa} (SV: {d.sinh_vien?.map(s => s.hoTen).join(' & ')})
                </option>
              ))}
            </select>
            <button onClick={() => ganDTMut.mutate(selectedDT)} disabled={!selectedDT} className="w-full bg-green-600 text-white p-2 rounded font-bold disabled:opacity-50">Phân công</button>
          </div>
        </Modal>
      )}
    </div>
  );
}