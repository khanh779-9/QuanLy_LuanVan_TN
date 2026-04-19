import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiOutlineDocumentText, HiOutlineEye, HiOutlinePencilSquare, HiOutlineUserGroup } from 'react-icons/hi2';
import { getDeTais, updateDeTai } from '../../services/deTaiService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { createStudent, updateStudent } from '../../services/sinhVienService';

function mergeDeTais(hdItems, pbItems) {
  const byId = new Map();

  hdItems.forEach((item) => {
    byId.set(item.maDeTai, { ...item, vaiTroGiangVien: ['Hướng dẫn'] });
  });

  pbItems.forEach((item) => {
    const existing = byId.get(item.maDeTai);
    if (existing) {
      existing.vaiTroGiangVien = [...existing.vaiTroGiangVien, 'Phản biện'];
      return;
    }

    byId.set(item.maDeTai, { ...item, vaiTroGiangVien: ['Phản biện'] });
  });

  return Array.from(byId.values()).sort((a, b) => b.maDeTai - a.maDeTai);
}

function formatTrangThai(trangThai) {
  if (!trangThai) return 'Chưa cập nhật';

  const trangThaiMap = {
    dat: 'ĐẠT',
    can_chinh_sua: 'CẦN CHỈNH SỬA',
    khong_dat: 'KHÔNG ĐẠT',
    duoc_lam_tiep: 'ĐƯỢC LÀM TIẾP',
    dinh_chi: 'ĐÌNH CHỈ',
    canh_cao: 'CẢNH CÁO',
  };

  return trangThaiMap[trangThai] || trangThai;
}

export default function GVDeTaiPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDeTai, setSelectedDeTai] = useState(null);
  const [editingDeTai, setEditingDeTai] = useState(null);
  const { user } = useAuth() || {};
  const maGV = user?.id || '';

  const { data, isLoading } = useQuery({
    queryKey: ['gv-de-tais', maGV, search],
    enabled: Boolean(maGV),
    queryFn: async () => {
      const [hdResponse, pbResponse] = await Promise.all([
        getDeTais({ maGV_HD: maGV, q: search || undefined, per_page: 100 }),
        getDeTais({ maGV_PB: maGV, q: search || undefined, per_page: 100 }),
      ]);

      return mergeDeTais(hdResponse?.data || [], pbResponse?.data || []);
    },
  });

  const tableData = data || [];
  const huongDanCount = tableData.filter((item) => item.vaiTroGiangVien.includes('Hướng dẫn')).length;
  const phanBienCount = tableData.filter((item) => item.vaiTroGiangVien.includes('Phản biện')).length;
  const coSinhVienCount = tableData.filter((item) => Array.isArray(item.sinh_viens) && item.sinh_viens.length > 0).length;
  const detailRows = selectedDeTai
    ? [
        { label: 'Mã đề tài', value: `${selectedDeTai.maDeTai}` },
        { label: 'Tên đề tài', value: selectedDeTai.tenDeTai || 'Chưa có tên đề tài' },
        { label: 'Mô tả', value: selectedDeTai.moTa || 'Chưa có mô tả' },
        { label: 'Giảng viên hướng dẫn', value: selectedDeTai.maGV_HD || 'Chưa gán' },
        { label: 'Giảng viên phản biện', value: selectedDeTai.maGV_PB || 'Chưa gán' },
        { label: 'Hội đồng', value: selectedDeTai.maHoiDong || 'Chưa gán' },
        { label: 'Trạng thái', value: formatTrangThai(selectedDeTai.trangThai) },
        { label: 'Điểm giữa kỳ', value: selectedDeTai.diemGiuaKy ?? 'Chưa có' },
        { label: 'Điểm hướng dẫn', value: selectedDeTai.diemHuongDan ?? 'Chưa có' },
        { label: 'Điểm phản biện', value: selectedDeTai.diemPhanBien ?? 'Chưa có' },
        { label: 'Điểm hội đồng', value: selectedDeTai.diemHoiDong ?? 'Chưa có' },
        { label: 'Điểm tổng kết', value: selectedDeTai.diemTongKet ?? 'Chưa có' },
      ]
    : [];

  const editMut = useMutation({
    mutationFn: async (payload) => {
      await updateDeTai(payload.deTaiId, {
        tenDeTai: payload.tenDeTai,
        moTa: payload.moTa,
        maGV_HD: payload.maGV_HD,
        maGV_PB: payload.maGV_PB,
        maHoiDong: payload.maHoiDong,
        trangThai: payload.trangThai,
      });

      await updateStudent(payload.primaryOriginalMssv, {
        hoTen: payload.primaryStudent.hoTen,
        lop: payload.primaryStudent.lop,
        email: payload.primaryStudent.email,
        soDienThoai: payload.primaryStudent.soDienThoai,
        maDeTai: payload.deTaiId,
      });

      if (payload.teamSize === '2') {
        if (payload.secondaryStudent.isExisting) {
          await updateStudent(payload.secondaryStudent.originalMssv, {
            hoTen: payload.secondaryStudent.hoTen,
            lop: payload.secondaryStudent.lop,
            email: payload.secondaryStudent.email,
            soDienThoai: payload.secondaryStudent.soDienThoai,
            maDeTai: payload.deTaiId,
          });
        } else {
          await createStudent({
            mssv: payload.secondaryStudent.mssv,
            hoTen: payload.secondaryStudent.hoTen,
            lop: payload.secondaryStudent.lop,
            email: payload.secondaryStudent.email,
            soDienThoai: payload.secondaryStudent.soDienThoai,
            maDeTai: payload.deTaiId,
          });
        }
      } else if (payload.secondaryStudent?.isExisting) {
        await updateStudent(payload.secondaryStudent.originalMssv, {
          hoTen: payload.secondaryStudent.hoTen,
          lop: payload.secondaryStudent.lop,
          email: payload.secondaryStudent.email,
          soDienThoai: payload.secondaryStudent.soDienThoai,
          maDeTai: null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gv-de-tais'] });
      queryClient.invalidateQueries({ queryKey: ['deTais'] });
      setEditingDeTai(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-100/60 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-sky-100/70 blur-xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 shadow-sm">
              <HiOutlineDocumentText size={14} />
              Không Gian Đề Tài
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl uppercase">
              Danh sách đề tài phụ trách
            </h1>
            
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tìm kiếm nhanh
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên đề tài..."
              className="min-w-[260px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={HiOutlineDocumentText}
          title="Tổng Đề Tài"
          value={tableData.length}
          tone="cyan"
          helper="Đang xuất hiện trong danh sách hiện tại"
        />
        <StatCard
          icon={HiOutlinePencilSquare}
          title="Đề Tài Hướng Dẫn"
          value={huongDanCount}
          tone="amber"
          helper="Các đề tài bạn phụ trách trực tiếp"
        />
        <StatCard
          icon={HiOutlineUserGroup}
          title="Đề Tài Có Sinh Viên"
          value={coSinhVienCount}
          tone="emerald"
          helper={`Phản biện: ${phanBienCount}`}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Danh sách đề tài</h2>
              <p className="text-sm text-slate-500">Quản lý đề tài, thành viên nhóm và trạng thái thực hiện.</p>
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {tableData.length} bản ghi
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Mã</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Tên đề tài</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Sinh viên</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Vai trò</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Trạng thái</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(6)].map((_, colIndex) => (
                    <td key={colIndex} className={`px-4 py-3 border-t border-slate-100 ${colIndex > 0 ? 'border-l border-slate-100' : ''}`}>
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài phù hợp</p>
                  <p className="text-sm text-slate-400 mt-1">Hãy thử từ khóa khác hoặc kiểm tra lại phân công.</p>
                </td>
              </tr>
            ) : (
              tableData.map((deTai) => (
                <tr key={deTai.maDeTai} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium whitespace-nowrap text-center">
                    {deTai.maDeTai}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 font-semibold text-center">
                    {deTai.tenDeTai || 'Chưa có tên đề tài'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 text-center">
                    {Array.isArray(deTai.sinh_viens) && deTai.sinh_viens.length > 0 ? (
                      <div className="flex flex-col gap-1 items-center">
                        {deTai.sinh_viens.map((sv) => (
                          <span key={sv.mssv}>
                            {sv.hoTen} ({sv.mssv})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 text-center">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {deTai.vaiTroGiangVien.map((vaiTro) => (
                        <span
                          key={vaiTro}
                          className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                        >
                          {vaiTro}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 text-center">
                    {deTai.trangThai ? (
                      <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        {formatTrangThai(deTai.trangThai)}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa cập nhật</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800"
                        onClick={() => setEditingDeTai(deTai)}
                      >
                        <HiOutlinePencilSquare size={16} />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800"
                        onClick={() => setSelectedDeTai(deTai)}
                      >
                        <HiOutlineEye size={16} />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      {selectedDeTai && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDeTai(null)}
          title="Chi tiết đề tài"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <h3 className="text-lg font-semibold text-slate-900">{selectedDeTai.tenDeTai || 'Chưa có tên đề tài'}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedDeTai.vaiTroGiangVien.map((vaiTro) => (
                  <span
                    key={vaiTro}
                    className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                  >
                    {vaiTro}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailRows.map((row) => (
                <div key={row.label} className="rounded-lg border border-slate-200 p-4 bg-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{row.label}</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Sinh viên thực hiện</p>
              {Array.isArray(selectedDeTai.sinh_viens) && selectedDeTai.sinh_viens.length > 0 ? (
                <div className="space-y-2">
                  {selectedDeTai.sinh_viens.map((sv) => (
                    <div key={sv.mssv} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {sv.hoTen} ({sv.mssv})
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Chưa có sinh viên được gán cho đề tài này.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {editingDeTai && (
        <EditDeTaiModal
          deTai={editingDeTai}
          loading={editMut.isPending}
          errorMessage={editMut.error?.response?.data?.message || null}
          onClose={() => setEditingDeTai(null)}
          onSubmit={(payload) => editMut.mutate(payload)}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, helper, tone }) {
  const tones = {
    cyan: {
      box: 'from-cyan-50 to-sky-50 border-cyan-100',
      icon: 'bg-cyan-100 text-cyan-700',
      value: 'text-cyan-700',
    },
    amber: {
      box: 'from-amber-50 to-orange-50 border-amber-100',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-700',
    },
    emerald: {
      box: 'from-emerald-50 to-teal-50 border-emerald-100',
      icon: 'bg-emerald-100 text-emerald-700',
      value: 'text-emerald-700',
    },
  };

  const currentTone = tones[tone] || tones.cyan;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${currentTone.box}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <div className={`mt-3 text-3xl font-bold ${currentTone.value}`}>{value}</div>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-2xl p-3 shadow-sm ${currentTone.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function EditDeTaiModal({ deTai, loading, errorMessage, onClose, onSubmit }) {
  const students = Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens : [];
  const primary = students[0] || {};
  const secondary = students[1] || null;
  const [form, setForm] = useState({
    tenDeTai: deTai.tenDeTai || '',
    moTa: deTai.moTa || '',
    teamSize: secondary ? '2' : '1',
    primaryStudent: {
      originalMssv: primary.mssv || '',
      mssv: primary.mssv || '',
      hoTen: primary.hoTen || '',
      lop: primary.lop || '',
      email: primary.email || '',
      soDienThoai: primary.soDienThoai || '',
    },
    secondaryStudent: {
      isExisting: Boolean(secondary),
      originalMssv: secondary?.mssv || '',
      mssv: secondary?.mssv || '',
      hoTen: secondary?.hoTen || '',
      lop: secondary?.lop || '',
      email: secondary?.email || '',
      soDienThoai: secondary?.soDienThoai || '',
    },
  });

  function updateStudentForm(key, field, value) {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      deTaiId: deTai.maDeTai,
      tenDeTai: form.tenDeTai,
      moTa: form.moTa,
      maGV_HD: deTai.maGV_HD,
      maGV_PB: deTai.maGV_PB,
      maHoiDong: deTai.maHoiDong,
      trangThai: deTai.trangThai,
      teamSize: form.teamSize,
      primaryOriginalMssv: form.primaryStudent.originalMssv,
      primaryStudent: form.primaryStudent,
      secondaryStudent: form.secondaryStudent,
    });
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Chỉnh sửa đề tài" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đề tài</label>
            <input
              type="text"
              value={form.tenDeTai}
              onChange={(e) => setForm((prev) => ({ ...prev, tenDeTai: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              rows={3}
              value={form.moTa}
              onChange={(e) => setForm((prev) => ({ ...prev, moTa: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Loại nhóm</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, teamSize: '1' }))}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${form.teamSize === '1' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700'}`}
            >
              Nhóm 1 người
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, teamSize: '2' }))}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${form.teamSize === '2' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700'}`}
            >
              Nhóm 2 người
            </button>
          </div>
        </div>

        <StudentEditor
          title="Sinh viên 1"
          form={form.primaryStudent}
          onChange={(field, value) => updateStudentForm('primaryStudent', field, value)}
          disableMssv
        />

        {form.teamSize === '2' && (
          <StudentEditor
            title="Sinh viên 2"
            form={form.secondaryStudent}
            onChange={(field, value) => updateStudentForm('secondaryStudent', field, value)}
            disableMssv={Boolean(form.secondaryStudent.isExisting)}
          />
        )}

        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StudentEditor({ title, form, onChange, disableMssv = false }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
      <h3 className="text-base font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">MSSV</label>
          <input
            type="text"
            value={form.mssv}
            onChange={(e) => onChange('mssv', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm disabled:opacity-60"
            disabled={disableMssv}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Họ tên</label>
          <input
            type="text"
            value={form.hoTen}
            onChange={(e) => onChange('hoTen', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Lớp</label>
          <input
            type="text"
            value={form.lop}
            onChange={(e) => onChange('lop', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
          <input
            type="text"
            value={form.soDienThoai}
            onChange={(e) => onChange('soDienThoai', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
