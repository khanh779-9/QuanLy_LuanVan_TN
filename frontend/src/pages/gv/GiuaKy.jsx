import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineChartBar, HiOutlineCheckBadge, HiOutlineMagnifyingGlass, HiOutlinePencilSquare } from 'react-icons/hi2';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDeTais } from '../../services/deTaiService';
import { chamDiemGK } from '../../services/giuaKyService';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function formatTrangThaiGiuaKy(trangThai) {
  if (!trangThai) return 'CHƯA CẬP NHẬT';

  const map = {
    dat: 'ĐẠT',
    khong_dat: 'KHÔNG ĐẠT',
    duoc_lam_tiep: 'ĐƯỢC LÀM TIẾP',
    dinh_chi: 'ĐÌNH CHỈ',
    canh_cao: 'CẢNH CÁO',
  };

  return map[trangThai] || trangThai;
}

export default function GVHDGiuaKyPage() {
  const queryClient = useQueryClient();
  const [editDeTai, setEditDeTai] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Lấy mã GVHD hiện tại từ context
  const { user } = useAuth() || {};
  const maGV_HD = user?.id || '';

  const { data: deTaiData, isLoading } = useQuery({
    queryKey: ['deTais', { maGV_HD, q: search }],
    queryFn: () => getDeTais({ maGV_HD, q: search || undefined }),
  });
  const tableData = deTaiData?.data || [];
  const scoredItems = tableData.filter((deTai) => deTai.diemGiuaKy !== undefined && deTai.diemGiuaKy !== null);
  const daChamCount = scoredItems.length;
  const chuaChamCount = tableData.length - daChamCount;
  const datCount = tableData.filter((deTai) => deTai.trangThaiGiuaKy === 'dat').length;
  const averageScore = daChamCount > 0
    ? (scoredItems.reduce((sum, deTai) => sum + Number(deTai.diemGiuaKy || 0), 0) / daChamCount)
    : 0;
  const highestScore = daChamCount > 0
    ? Math.max(...scoredItems.map((deTai) => Number(deTai.diemGiuaKy || 0)))
    : 0;
  const passRate = daChamCount > 0 ? Math.round((datCount / daChamCount) * 100) : 0;

  const scoreBuckets = {
    '0-4.5': 0,
    '5-6.5': 0,
    '7-8': 0,
    '8.5-10': 0,
  };

  scoredItems.forEach((deTai) => {
    const score = Number(deTai.diemGiuaKy || 0);
    if (score < 5) scoreBuckets['0-4.5'] += 1;
    else if (score < 7) scoreBuckets['5-6.5'] += 1;
    else if (score < 8.5) scoreBuckets['7-8'] += 1;
    else scoreBuckets['8.5-10'] += 1;
  });

  const doughnutData = {
    labels: ['ĐÃ CHẤM', 'CHƯA CHẤM'],
    datasets: [
      {
        data: [daChamCount, chuaChamCount],
        backgroundColor: ['#2563eb', '#dbeafe'],
        borderColor: ['#2563eb', '#dbeafe'],
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };

  const barData = {
    labels: Object.keys(scoreBuckets),
    datasets: [
      {
        label: 'SỐ ĐỀ TÀI',
        data: Object.values(scoreBuckets),
        backgroundColor: ['#f97316', '#facc15', '#38bdf8', '#10b981'],
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
    },
  };

  const updateMut = useMutation({
    mutationFn: ({ deTaiId, data }) => chamDiemGK(deTaiId, data),
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
    let nhanXet = deTai.nhanXetGiuaKy ?? '';
    let tong = deTai.diemGiuaKy ?? 0;
    setEditForm({ tong_diem: tong, nhanXet });
    setSaveSuccess(false);
    setShowEditModal(true);
  }

  const hasInput = editForm.tong_diem !== null && editForm.tong_diem !== undefined && editForm.tong_diem !== '';
  const trangThaiGiuaKy = hasInput ? (editForm.tong_diem >= 5 ? 'dat' : 'khong_dat') : null;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-100/70 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-sky-100/70 blur-xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
              <HiOutlineChartBar size={14} />
              Chấm Điểm Giữa Kỳ
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl uppercase">
              chấm điểm giữa kỳ
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
              Theo dõi nhanh đề tài đang phụ trách, kiểm tra trạng thái chấm điểm và nhập điểm ngay từ một giao diện gọn gàng hơn.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm đề tài, sinh viên..."
                className="min-w-[260px] rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={HiOutlinePencilSquare}
          title="Điểm Trung Bình"
          value={daChamCount > 0 ? averageScore.toFixed(1) : '0.0'}
          tone="blue"
          helper="Trung bình điểm giữa kỳ của các đề tài đã chấm"
        />
        <StatCard
          icon={HiOutlineChartBar}
          title="Điểm Cao Nhất"
          value={daChamCount > 0 ? highestScore.toFixed(1) : '0.0'}
          tone="emerald"
          helper={`Đã chấm: ${daChamCount} | Chưa chấm: ${chuaChamCount}`}
        />
        <StatCard
          icon={HiOutlineCheckBadge}
          title="Tỷ Lệ Đạt"
          value={`${passRate}%`}
          tone="amber"
          helper={`${datCount}/${daChamCount || 0} đề tài đã đạt sau khi chấm`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Tiến độ chấm điểm</h3>
            <p className="text-sm text-slate-500 mt-1">So sánh nhanh số đề tài đã nhập điểm và chưa nhập điểm.</p>
          </div>
          <div className="mx-auto max-w-[240px]">
            <Doughnut
              data={doughnutData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
                cutout: '68%',
              }}
            />
          </div>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <LegendChip colorClass="bg-blue-600" label="ĐÃ CHẤM" value={daChamCount} />
            <LegendChip colorClass="bg-blue-100" label="CHƯA CHẤM" value={chuaChamCount} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Phân bố điểm giữa kỳ</h3>
            <p className="text-sm text-slate-500 mt-1">Nhìn nhanh nhóm điểm để đánh giá chất lượng chấm hiện tại.</p>
          </div>
          <Bar
            data={barData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#64748b',
                    font: {
                      weight: '600',
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                    color: '#64748b',
                  },
                  grid: {
                    color: '#e2e8f0',
                  },
                },
              },
            }}
          />
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <LegendChip colorClass="bg-orange-500" label="0-4.5" value={scoreBuckets['0-4.5']} />
            <LegendChip colorClass="bg-yellow-400" label="5-6.5" value={scoreBuckets['5-6.5']} />
            <LegendChip colorClass="bg-sky-400" label="7-8" value={scoreBuckets['7-8']} />
            <LegendChip colorClass="bg-emerald-500" label="8.5-10" value={scoreBuckets['8.5-10']} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Danh sách đề tài giữa kỳ</h2>
              <p className="text-sm text-slate-500">Theo dõi điểm, trạng thái và thao tác nhập điểm cho từng đề tài.</p>
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
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Điểm giữa kỳ</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Trạng thái</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-l border-slate-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, ci) => (
                    <td key={ci} className={`px-4 py-3 border-t border-slate-100 ${ci > 0 ? 'border-l border-slate-100' : ''}`}>
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài</p>
                  <p className="text-sm text-slate-400 mt-1">Không có dữ liệu phù hợp.</p>
                </td>
              </tr>
            ) : (
              tableData.map(deTai => {
                const trangThai = deTai.trangThaiGiuaKy;
                return (
                  <tr key={deTai.maDeTai} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium align-middle text-center">
                      {deTai.maDeTai}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-semibold align-middle text-center">
                      <div className="inline-flex max-w-[280px] items-center justify-center rounded-xl bg-slate-50 px-4 py-2 text-center shadow-sm">
                        {deTai.tenDeTai}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 align-middle text-center">
                      {Array.isArray(deTai.sinh_viens) && deTai.sinh_viens.length > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          {deTai.sinh_viens.map(sv => (
                            <span key={sv.mssv} className="block text-slate-700">
                              {sv.hoTen} (<span className="font-medium text-slate-800">{sv.mssv}</span>)
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 text-center align-middle">
                      {deTai.diemGiuaKy !== undefined && deTai.diemGiuaKy !== null
                        ? <span className="inline-flex min-w-[74px] justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{deTai.diemGiuaKy}</span>
                        : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-3 border-t border-l border-slate-100 align-middle text-center">
                      {trangThai ? (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          trangThai === 'dat'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {formatTrangThaiGiuaKy(trangThai)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-sm">CHƯA CẬP NHẬT</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-l border-slate-100 align-middle text-center">
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800"
                        onClick={() => openEdit(deTai)}
                      >
                        <HiOutlinePencilSquare size={16} />
                        <span>Nhập điểm</span>
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
        <Modal isOpen={true} onClose={() => setShowEditModal(false)} title="Nhập điểm giữa kỳ" maxWidth="max-w-xl">
          <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-4 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">Đề tài đang chấm</p>
            <p className="text-base font-semibold text-slate-900">{editDeTai.tenDeTai}</p>
          </div>
          {Array.isArray(editDeTai.sinh_viens) && editDeTai.sinh_viens.length > 0 && (
            <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Sinh viên</p>
              {editDeTai.sinh_viens.map(sv => (
                <p key={sv.mssv} className="text-sm text-slate-700">{sv.hoTen} — {sv.mssv}</p>
              ))}
            </div>
          )}
          <div className="mb-5 rounded-xl border border-slate-100 bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">Điểm giữa kỳ (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={editForm.tong_diem ?? ''}
              onChange={e => setEditForm(f => ({ ...f, tong_diem: e.target.value }))}
              className="border border-slate-300 rounded-xl px-3 py-3 text-sm w-full max-w-[170px] focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
            <div className="flex items-center gap-3 mt-4 rounded-xl bg-slate-50 px-3 py-3">
              <span className="text-sm text-slate-600 flex-1 font-medium">Trạng thái dự kiến</span>
              {trangThaiGiuaKy && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${trangThaiGiuaKy === 'dat' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {trangThaiGiuaKy === 'dat' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4 rounded-xl border border-slate-100 bg-white p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Nhận xét</label>
            <textarea
              rows={4}
              value={editForm.nhanXet ?? ''}
              onChange={e => setEditForm(f => ({ ...f, nhanXet: e.target.value }))}
              className="border border-slate-300 rounded-xl px-3 py-3 text-sm w-full focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700"
              onClick={() => setShowEditModal(false)}
            >Hủy</button>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
              disabled={updateMut.isPending || saveSuccess}
              onClick={() => {
                if (!updateMut.isPending && !saveSuccess) {
                  updateMut.mutate({
                    deTaiId: editDeTai?.maDeTai,
                    data: {
                      tong_diem: editForm.tong_diem,
                      nhan_xet: editForm.nhanXet,
                    },
                  });
                }
              }}
            >
              {saveSuccess ? 'Đã lưu!' : updateMut.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
          {updateMut.isError && <div className="text-red-500 mt-3 text-sm">Có lỗi xảy ra, vui lòng thử lại.</div>}
        </Modal>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, helper, tone }) {
  const tones = {
    blue: {
      box: 'from-blue-50 to-sky-50 border-blue-100',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-blue-700',
    },
    emerald: {
      box: 'from-emerald-50 to-teal-50 border-emerald-100',
      icon: 'bg-emerald-100 text-emerald-700',
      value: 'text-emerald-700',
    },
    amber: {
      box: 'from-amber-50 to-orange-50 border-amber-100',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-700',
    },
  };

  const currentTone = tones[tone] || tones.blue;

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

function LegendChip({ colorClass, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
      <span>{label}</span>
      <span className="text-slate-400">•</span>
      <span>{value}</span>
    </div>
  );
}
