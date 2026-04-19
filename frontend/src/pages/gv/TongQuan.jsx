import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  HiOutlinePencilSquare,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineClock
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

export default function GVTongQuan() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['gv-stats'],
    queryFn: () => api.get('/gv-stats').then(res => res.data),
    refetchInterval: 30000,
  });

  const hdCount = statsData?.sodetai_hd || 0;
  const pbCount = statsData?.sodetai_pb || 0;
  const hdongCount = statsData?.sodetai_hoidong || 0;
  const currentStage = statsData?.giaidoan_hientai || null;


  const getRoleBadge = (roleName) => {
    if (!roleName) return 'Giảng viên';
    if (roleName.toLowerCase() === 'thuky') return 'Thư ký khoa';
    if (roleName.toLowerCase() === 'uyvien') return 'Ủy viên hội đồng';
    if (roleName.toLowerCase() === 'giangvien') return 'Giảng viên';
    
    
    return roleName;
  };

  const statCards = [
    { label: 'Đề tài Nhận Hướng Dẫn', value: hdCount, icon: HiOutlinePencilSquare, color: 'blue', path: '/gv/huongdan' },
    { label: 'Đề tài Phân Phản Biện', value: pbCount, icon: HiOutlineClipboardDocumentCheck, color: 'cyan', path: '/gv/phanbien' },
    { label: 'Hội đồng tham gia', value: hdongCount, icon: HiOutlineUserGroup, color: 'green', path: '/gv/hoidong' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  };


  return (
    <div>
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-xl px-6 py-8 mb-6 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-emerald-300/20 rounded-full translate-y-1/2"></div>
        
        <div className="relative z-10 w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Xin chào, {user?.name || 'Giảng viên'}!</h1>
          <p className="text-emerald-50 text-sm md:text-base">Chúc bạn một ngày làm việc hiệu quả và tràn đầy năng lượng.</p>
        </div>
        
        <div className="relative z-10 flex flex-col gap-2 bg-emerald-700/30 px-5 py-3 rounded-lg border border-emerald-400/20 w-fit backdrop-blur-sm self-start md:self-auto">
          <div className="text-sm">
            Mã giảng viên: <span className="font-semibold">{user?.id || '—'}</span>
          </div>
          <div className="text-sm border-t border-emerald-400/30 pt-2">
            Vai trò: {getRoleBadge(user?.role)}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Tổng quan công việc hiện tại</h2>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {isLoading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse min-h-[120px]">
                <div className="w-1/2 h-3 bg-slate-200 rounded mb-4"></div>
                <div className="w-1/4 h-8 bg-slate-200 rounded"></div>
              </div>
            ))
          : statCards.map(card => {
              const c = colorMap[card.color];
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  onClick={() => card.path && navigate(card.path)}
                  className={`group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${card.path ? 'cursor-pointer' : ''}`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${card.color === 'blue' ? 'bg-blue-500' : card.color === 'cyan' ? 'bg-cyan-500' : 'bg-green-500'}`}></div>
                  <div className="relative mb-5 flex items-start justify-between gap-4 pr-24">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">Tổng quan</span>
                      <h3 className="mt-2 text-base font-bold text-slate-600 uppercase tracking-wider">{card.label}</h3>
                    </div>
                    <div className={`absolute right-4 top-4 z-10 rounded-2xl border border-white/80 bg-white p-3 shadow-sm`}>
                      <Icon className={c.icon} size={22} />
                    </div>
                  </div>

                  <div className="relative flex items-end justify-between gap-3">
                    <div>
                      <div className={`text-5xl font-extrabold leading-none ${c.text}`}>{card.value}</div>
                      <p className="mt-3 text-sm text-slate-500">
                        {card.path === '/gv/huongdan' && 'Theo dõi công việc hướng dẫn'}
                        {card.path === '/gv/phanbien' && 'Theo dõi công việc phản biện'}
                        {card.path === '/gv/hoidong' && 'Số hội đồng đang tham gia'}
                      </p>
                    </div>
                    <div className="hidden md:block text-right">
                      <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Chi tiết
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Stage */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200"></div>
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-50 pointer-events-none"></div>
          <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            <HiOutlineClock size={14} />
            Tiến độ
          </div>
          <div className="flex min-h-[260px] flex-col items-center justify-center">
            <div className="mb-5 rounded-full border-8 border-amber-50 bg-white p-4 shadow-sm">
              <HiOutlineClock className="text-amber-500" size={36} />
            </div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
              Tiến độ chung
            </h3>
          {currentStage ? (
            <div>
              <p className="mb-2 text-lg font-bold text-slate-800">{currentStage.mo_ta}</p>
              <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">Đang diễn ra</span>
              <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 placeholder-slate-400">
                {currentStage.ngay_bat_dau} <span className="mx-2">đến</span> {currentStage.ngay_ket_thuc}
              </p>
            </div>
          ) : (
            <div className="max-w-sm">
              <p className="text-lg font-semibold text-slate-700">Hiện tại chưa có giai đoạn nào đang mở</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Khi Khoa mở đợt chấm tiếp theo, thông tin tiến độ và mốc thời gian sẽ hiển thị tại đây.</p>
            </div>
          )}
          </div>
        </div>

        {/* Quick Shortcut Panel */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300"></div>
          <div className="relative">
            <div className="mb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  <HiOutlineChartBar size={14} />
                  Bản tin nhanh
                </div>              
              
              </div>
            </div>
            <div className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="leading-relaxed">
                Bạn có thể tiến hành chấm điểm <span className="font-semibold text-slate-800">Giữa kỳ</span>, <span className="font-semibold text-slate-800">Hướng dẫn</span>, <span className="font-semibold text-slate-800">Phản biện</span> và <span className="font-semibold text-slate-800">Hội đồng</span> trong menu bên trái.
              </p>
              <p className="leading-relaxed">
                Hãy chú ý thời hạn các giai đoạn của Khoa. Bảng chấm điểm ở mỗi trang hỗ trợ <strong>nhập điểm liên tục</strong> và ngay lập tức đồng bộ về hệ thống chung.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: 'Giữa kỳ', path: '/gv/giua-ky' },
                  { label: 'Hướng dẫn', path: '/gv/huongdan' },
                  { label: 'Phản biện', path: '/gv/phanbien' },
                  { label: 'Hội đồng', path: '/gv/hoidong' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => navigate('/gv/giua-ky')}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white shadow-sm transition-colors hover:bg-blue-700 md:w-auto"
                >
                  Chuyển đến Chấm Giữa Kỳ →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
