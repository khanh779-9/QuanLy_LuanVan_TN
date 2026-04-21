import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowTrendingUp,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentList,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { getDeTais, chamDiemHD } from '../../services/deTaiService';
import Modal from '../../components/common/Modal';

import { useAuth } from '../../context/AuthContext';

function OverviewCard({ icon: Icon, title, value, helper, tone = 'emerald' }) {
  const tones = {
    emerald: {
      chip: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: 'text-emerald-600',
      value: 'text-emerald-600',
    },
    teal: {
      chip: 'bg-teal-50 text-teal-700 border-teal-100',
      icon: 'text-teal-600',
      value: 'text-teal-600',
    },
    amber: {
      chip: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: 'text-amber-600',
      value: 'text-amber-600',
    },
  };

  const currentTone = tones[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className={`mt-4 text-4xl font-extrabold ${currentTone.value}`}>{value}</p>
        </div>
        <div className={`rounded-2xl border px-3 py-3 ${currentTone.chip}`}>
          <Icon className={currentTone.icon} size={22} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

function StatusBadge({ scored }) {
  if (scored) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
        Đã nhập
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
      Chưa nhập
    </span>
  );
}

function GuidanceRow({ label, value, tone }) {
  const tones = {
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    amber: 'bg-amber-400',
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${tones[tone]}`} />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-800">{value}</span>
    </div>
  );
}

export default function GVHDHuongDanPage() {
  const queryClient = useQueryClient();
  const [editDeTai, setEditDeTai] = useState(null);
  const [editForm, setEditForm] = useState({
    // Các trường cơ bản
    tong_diem: '',
    nhanXet: '',
    uuDiem: '',
    thieuSot: '',
    ndDieuChinh: '',
    cauHoi: '',
    thuyetMinh: '', // "Đạt" hoặc "Không đạt"
    diemPhanTich: ['', ''],
    diemThietKe: ['', ''],
    diemHienThuc: ['', ''],
    diemBaoCao: ['', ''],
    diemTongCong: ['', ''],
    diemFinal: ['', ''],
    deNghi: ['', ''], // "Được bảo vệ", "Không được bảo vệ", "Bổ sung"
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Lấy mã GV hiện tại từ context
  const { user } = useAuth() || {};
  const maGV_HD = user?.id || '';

  const { data: deTaiData, isLoading } = useQuery({
    queryKey: ['deTais', { maGV_HD, q: search }],
    queryFn: () => getDeTais({ maGV_HD, q: search || undefined }),
  });
  const tableData = deTaiData?.data || [];
  const scoredItems = tableData.filter((deTai) => deTai.diemHuongDan !== undefined && deTai.diemHuongDan !== null);
  const daChamCount = scoredItems.length;
  const chuaChamCount = tableData.length - daChamCount;
  const averageScore = scoredItems.length > 0
    ? (scoredItems.reduce((sum, deTai) => sum + Number(deTai.diemHuongDan || 0), 0) / scoredItems.length)
    : 0;
  const highestScore = scoredItems.length > 0
    ? Math.max(...scoredItems.map((deTai) => Number(deTai.diemHuongDan || 0)))
    : 0;
  const completionRate = tableData.length > 0 ? Math.round((daChamCount / tableData.length) * 100) : 0;
  const studentCount = tableData.reduce((sum, deTai) => sum + (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.length : 0), 0);
  const readyCount = scoredItems.filter((deTai) => {
    const students = Array.isArray(deTai?.data_json?.gvhd?.sinh_viens) ? deTai.data_json.gvhd.sinh_viens : [];
    return students.some((sv) => sv.deNghi === 'Được bảo vệ');
  }).length;

  const updateMut = useMutation({
    mutationFn: ({ deTaiId, data }) => chamDiemHD(deTaiId, data),
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries(['deTais']);
      setTimeout(() => {
        setShowEditModal(false);
        setEditDeTai(null);
        setEditForm({});
        setSaveSuccess(false);
      }, 1500);
    },
  });

  function openEdit(deTai) {
    setEditDeTai(deTai);
    // Ưu tiên lấy sinh viên từ data_json.gvhd.sinh_viens nếu có, fallback sang deTai.sinh_viens
    const gvhd = deTai.data_json && deTai.data_json.gvhd ? deTai.data_json.gvhd : {};
    const sinhViens = Array.isArray(gvhd.sinh_viens)
      ? gvhd.sinh_viens
      : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens : []);
    setEditForm(f => ({
      ...f,
      tong_diem: gvhd.tong_diem ?? deTai.diemHuongDan ?? '',
      nhanXet: gvhd.nhanXet ?? deTai.nhanXetHuongDan ?? '',
      uuDiem: gvhd.uuDiem ?? deTai.uuDiem ?? '',
      thieuSot: gvhd.thieuSot ?? deTai.thieuSot ?? '',
      ndDieuChinh: gvhd.ndDieuChinh ?? deTai.ndDieuChinh ?? '',
      cauHoi: gvhd.cauHoi ?? deTai.cauHoi ?? '',
      thuyetMinh: gvhd.thuyetMinh ?? deTai.thuyetMinh ?? '',
      diemPhanTich: sinhViens.map(sv => sv.diemPhanTich ?? ''),
      diemThietKe: sinhViens.map(sv => sv.diemThietKe ?? ''),
      diemHienThuc: sinhViens.map(sv => sv.diemHienThuc ?? ''),
      diemBaoCao: sinhViens.map(sv => sv.diemBaoCao ?? ''),
      diemTongCong: sinhViens.map(sv => sv.diemTongCong ?? ''),
      diemFinal: sinhViens.map(sv => sv.diemFinal ?? ''),
      deNghi: sinhViens.map(sv => sv.deNghi ?? ''),
    }));
    setSaveSuccess(false);
    setShowEditModal(true);
  }

  function tinhDiemHuongDanTuChiTiet() {
    const validScores = (editForm.diemTongCong || [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    if (validScores.length === 0) {
      return editForm.tong_diem === '' || editForm.tong_diem === null || editForm.tong_diem === undefined
        ? null
        : Number(editForm.tong_diem);
    }

    const average = validScores.reduce((sum, value) => sum + value, 0) / validScores.length;
    return Number(average.toFixed(1));
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-100/60 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-teal-100/70 blur-xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
              <HiOutlineSparkles size={14} />
              Chấm Điểm Hướng Dẫn
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl uppercase">
              Không gian chấm điểm hướng dẫn
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
              Theo dõi tiến độ hướng dẫn, mở nhanh phiếu chấm và quản lý nhận xét theo cùng nhịp giao diện với phần phản biện.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm đề tài, sinh viên..."
                className="min-w-[260px] rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <OverviewCard
          icon={HiOutlinePencilSquare}
          title="Điểm trung bình"
          value={daChamCount > 0 ? averageScore.toFixed(1) : '0.0'}
          helper="Điểm hướng dẫn trung bình của các đề tài đã được nhập nhận xét."
          tone="emerald"
        />
        <OverviewCard
          icon={HiOutlineClipboardDocumentList}
          title="Tiến độ nhập điểm"
          value={`${completionRate}%`}
          helper={`Đã nhập: ${daChamCount} | Chưa nhập: ${chuaChamCount}`}
          tone="teal"
        />
        <OverviewCard
          icon={HiOutlineCheckBadge}
          title="Đề nghị bảo vệ"
          value={readyCount}
          helper="Số đề tài hiện có ít nhất một sinh viên được đề nghị bảo vệ."
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Nhịp chấm hiện tại</h3>
              <p className="mt-1 text-sm text-slate-500">Mức độ hoàn thành nhập điểm và nhận xét hướng dẫn trong đợt này.</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Hướng dẫn
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">
              <span>Hoàn thành</span>
              <span>{completionRate}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Đã nhập</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{daChamCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chưa nhập</p>
              <p className="mt-2 text-3xl font-bold text-slate-700">{chuaChamCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Cao nhất</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">{daChamCount > 0 ? highestScore.toFixed(1) : '0.0'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <HiOutlineArrowTrendingUp className="text-emerald-600" size={20} />
            <h3 className="text-base font-semibold text-slate-900">Tín hiệu hướng dẫn</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">Tóm tắt nhanh khối lượng sinh viên và các đề tài đã sẵn sàng bước tiếp theo sau đánh giá.</p>
          <div className="mt-5 space-y-3">
            <GuidanceRow label="Tổng sinh viên đang theo dõi" value={studentCount} tone="emerald" />
            <GuidanceRow label="Đề tài đã có điểm hướng dẫn" value={daChamCount} tone="teal" />
            <GuidanceRow label="Có đề nghị được bảo vệ" value={readyCount} tone="amber" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50 px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Danh sách đề tài hướng dẫn</h2>
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
                <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Mã</th>
                <th className="border-b border-l border-slate-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Tên đề tài</th>
                <th className="border-b border-l border-slate-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Sinh viên</th>
                <th className="border-b border-l border-slate-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="border-b border-l border-slate-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, ci) => (
                      <td key={ci} className={`border-t border-slate-100 px-4 py-3 ${ci > 0 ? 'border-l border-slate-100' : ''}`}>
                        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="font-semibold text-slate-500">Chưa có đề tài</p>
                    <p className="mt-1 text-sm text-slate-400">Không có dữ liệu phù hợp.</p>
                  </td>
                </tr>
              ) : (
                tableData.map((deTai) => {
                  const hasScore = deTai.diemHuongDan !== undefined && deTai.diemHuongDan !== null;

                  return (
                    <tr key={deTai.maDeTai} className="transition hover:bg-emerald-50/35">
                      <td className="border-t border-slate-100 px-4 py-4 text-center text-sm font-semibold text-slate-700">
                        {deTai.maDeTai}
                      </td>
                      <td className="border-t border-l border-slate-100 px-4 py-4 text-center text-sm font-semibold text-slate-800">
                        {deTai.tenDeTai}
                      </td>
                      <td className="border-t border-l border-slate-100 px-4 py-4 text-center text-sm text-slate-700">
                        {Array.isArray(deTai.sinh_viens) && deTai.sinh_viens.length > 0 ? (
                          <div className="space-y-1">
                            {deTai.sinh_viens.map((sv) => (
                              <div key={sv.mssv}>
                                {sv.hoTen} <span className="font-medium text-slate-500">({sv.mssv})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-slate-400">Chưa có</span>
                        )}
                      </td>
                    
                      <td className="border-t border-l border-slate-100 px-4 py-4 text-center">
                        <StatusBadge scored={hasScore} />
                      </td>
                      <td className="border-t border-l border-slate-100 px-4 py-4 text-center">
                        <button
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                          onClick={() => openEdit(deTai)}
                        >
                          <HiOutlinePencilSquare size={16} />
                          Nhập điểm/Nhận xét
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showEditModal && editDeTai && (
        <Modal isOpen={true} onClose={() => setShowEditModal(false)} title="Phiếu chấm Hướng dẫn" maxWidth="max-w-2xl">
          <div className="max-h-[70vh] overflow-y-auto pr-0">
            <div className="mb-4 p-2 rounded border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 uppercase">Tên đề tài</span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{editDeTai.tenDeTai}</p>
            </div>

            {(() => {
              // Ưu tiên lấy sinh viên từ data_json.gvhd.sinh_viens nếu có, fallback sang editDeTai.sinh_viens
              const sinhViens = Array.isArray(editDeTai.data_json?.gvhd?.sinh_viens)
                ? editDeTai.data_json.gvhd.sinh_viens
                : (Array.isArray(editDeTai.sinh_viens) ? editDeTai.sinh_viens : []);
              return sinhViens.length > 0 ? (
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">1. Đánh giá sinh viên</h3>
                  <div className="space-y-2">
                    {sinhViens.map((sv, idx) => (
                    <div key={sv.mssv} className="bg-white border border-slate-200 rounded p-2">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{sv.hoTen} - ({sv.mssv})</h4>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Phân tích</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemPhanTich[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemPhanTich]; arr[idx] = e.target.value; return { ...f, diemPhanTich: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Thiết kế</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemThietKe[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemThietKe]; arr[idx] = e.target.value; return { ...f, diemThietKe: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Hiện thực</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemHienThuc[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemHienThuc]; arr[idx] = e.target.value; return { ...f, diemHienThuc: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Kiểm tra SP</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemBaoCao[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemBaoCao]; arr[idx] = e.target.value; return { ...f, diemBaoCao: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Tổng cộng</label>
                          <input type="number" min="0" max="40" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 font-medium placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemTongCong[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemTongCong]; arr[idx] = e.target.value; return { ...f, diemTongCong: arr }; })}
                          />
                        </div>
                       
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Đề nghị hội đồng:</label>
                        <select className="w-full md:w-auto min-w-[120px] border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400" 
                          value={editForm.deNghi[idx] ?? ''}
                          onChange={e => setEditForm(f => { const arr = [...f.deNghi]; arr[idx] = e.target.value; return { ...f, deNghi: arr }; })}>
                          <option value="">-- Chọn đề nghị --</option>
                          <option value="Được bảo vệ">Được bảo vệ</option>
                          <option value="Không được bảo vệ">Không được bảo vệ</option>
                          <option value="Bổ sung">Bổ sung/hiệu chỉnh để được bảo vệ</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : null;
            })()}

            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">2. Đánh giá chung của GVHD</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ưu điểm chính</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập ưu điểm..." value={editForm.uuDiem} onChange={e => setEditForm(f => ({ ...f, uuDiem: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thiếu sót chính</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập thiếu sót..." value={editForm.thieuSot} onChange={e => setEditForm(f => ({ ...f, thieuSot: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Yêu cầu điều chỉnh/bổ sung (nếu có)</label>
                  <textarea rows={1} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập yêu cầu..." value={editForm.ndDieuChinh} onChange={e => setEditForm(f => ({ ...f, ndDieuChinh: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Câu hỏi dành cho sinh viên</label>
                  <textarea rows={1} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập danh sách câu hỏi..." value={editForm.cauHoi} onChange={e => setEditForm(f => ({ ...f, cauHoi: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nhận xét chung</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập nhận xét..." value={editForm.nhanXet} onChange={e => setEditForm(f => ({ ...f, nhanXet: e.target.value }))} />
                </div>
                <div className="md:col-span-2 mt-2 flex flex-col md:flex-row md:items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Kết luận Thuyết minh:</label>
                  <select className="w-full md:w-32 border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 font-medium" value={editForm.thuyetMinh} onChange={e => setEditForm(f => ({ ...f, thuyetMinh: e.target.value }))}>
                    <option value="">-- Chọn kết quả --</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Không đạt">Không đạt</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-200 bg-white">
            <button
              className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
              onClick={() => setShowEditModal(false)}
            >Hủy</button>
            <button
              className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1"
              onClick={async () => {
                if (editDeTai?.maDeTai) {
                  const { exportWordGVHD } = await import('../../services/deTaiService');
                  exportWordGVHD(editDeTai.maDeTai);
                }
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Xuất Word
            </button>
            <button
              className="px-4 py-1.5 rounded bg-blue-600 text-white font-medium text-xs disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={updateMut.isPending || saveSuccess}
              onClick={() => {
                if (!updateMut.isPending && !saveSuccess) {
                  const tongDiemHuongDan = tinhDiemHuongDanTuChiTiet();

                  updateMut.mutate({
                    deTaiId: editDeTai?.maDeTai,
                    data: {
                      diemHuongDan: tongDiemHuongDan,
                      nhanXetHuongDan: editForm.nhanXet,
                      uuDiem: editForm.uuDiem,
                      thieuSot: editForm.thieuSot,
                      ndDieuChinh: editForm.ndDieuChinh,
                      cauHoi: editForm.cauHoi,
                      thuyetMinh: editForm.thuyetMinh,
                      diemPhanTich: editForm.diemPhanTich,
                      diemThietKe: editForm.diemThietKe,
                      diemHienThuc: editForm.diemHienThuc,
                      diemBaoCao: editForm.diemBaoCao,
                      diemTongCong: editForm.diemTongCong,
                      diemFinal: editForm.diemFinal,
                      deNghi: editForm.deNghi,
                      data_json: {
                        gvhd: {
                          tong_diem: tongDiemHuongDan,
                          nhanXet: editForm.nhanXet,
                          uuDiem: editForm.uuDiem,
                          thieuSot: editForm.thieuSot,
                          ndDieuChinh: editForm.ndDieuChinh,
                          cauHoi: editForm.cauHoi,
                          thuyetMinh: editForm.thuyetMinh,
                          sinh_viens: Array.isArray(editDeTai.sinh_viens) ? editDeTai.sinh_viens.map((sv, idx) => ({
                            mssv: sv.mssv,
                            hoTen: sv.hoTen,
                            lop: sv.lop ?? '',
                            diemPhanTich: editForm.diemPhanTich[idx] ?? '',
                            diemThietKe: editForm.diemThietKe[idx] ?? '',
                            diemHienThuc: editForm.diemHienThuc[idx] ?? '',
                            diemBaoCao: editForm.diemBaoCao[idx] ?? '',
                            diemTongCong: editForm.diemTongCong[idx] ?? '',
                            diemFinal: editForm.diemFinal[idx] ?? '',
                            deNghi: editForm.deNghi[idx] ?? '',
                          })) : [],
                        },
                        // Nếu muốn giữ nguyên dữ liệu gvpb thì lấy từ editDeTai.data_json.gvpb nếu có
                        gvpb: (editDeTai.data_json && editDeTai.data_json.gvpb) ? editDeTai.data_json.gvpb : {
                          tong_diem: '',
                          nhanXet: '',
                          uuDiem: '',
                          thieuSot: '',
                          ndDieuChinh: '',
                          cauHoi: '',
                          thuyetMinh: '',
                          sinh_viens: Array.isArray(editDeTai.sinh_viens) ? editDeTai.sinh_viens.map(sv => ({
                            mssv: sv.mssv,
                            hoTen: sv.hoTen,
                            lop: sv.lop ?? '',
                            diemPhanTich: '',
                            diemThietKe: '',
                            diemHienThuc: '',
                            diemBaoCao: '',
                            diemTongCong: '',
                            diemFinal: '',
                            deNghi: '',
                          })) : [],
                        }
                      },
                    },
                  });
                }
              }}
            >
              {saveSuccess ? 'Đã lưu!' : updateMut.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
          {updateMut.isError && <div className="text-red-500 mt-3 text-xs text-center font-medium bg-white p-2 rounded border border-red-100">Cập nhật thất bại, vui lòng kiểm tra lại dữ liệu và thử lại.</div>}
        </Modal>
      )}
    </div>
  );
}
