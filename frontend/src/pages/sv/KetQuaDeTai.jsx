import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
} from "react-icons/hi2";

function StatusBadge({ status }) {
  if (status === "dat" || status === "da_duyet")
    return <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-0.5 text-xs font-semibold"><HiOutlineCheckCircle size={14} /> Đạt</span>;
  if (status === "cho_duyet")
    return <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-3 py-0.5 text-xs font-semibold"><HiOutlineClock size={14} /> Chờ duyệt</span>;
  if (status === "tu_choi" || status === "khong_dat")
    return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-0.5 text-xs font-semibold"><HiOutlineXCircle size={14} /> Không đạt</span>;
  return <span className="text-slate-400 text-xs">{status || "—"}</span>;
}

function ScoreRow({ label, score, nhanXet }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-slate-100 last:border-0">
      <div className="sm:w-48 text-sm font-medium text-slate-600">{label}</div>
      <div className="flex-1 flex items-center gap-3">
        <span className={`text-2xl font-bold ${score != null ? "text-blue-700" : "text-slate-300"}`}>
          {score != null ? score.toFixed(1) : "—"}
        </span>
        {nhanXet && <span className="text-slate-500 text-sm italic">"{nhanXet}"</span>}
      </div>
    </div>
  );
}

export default function KetQuaDeTaiSV() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["sv-stats"],
    queryFn: () => api.get("/sv-stats").then(r => r.data),
    retry: false,
  });

  const { data: regForm, isLoading: regLoading, error: regError } = useQuery({
    queryKey: ["my-topic-registration-form"],
    queryFn: () => api.get("/topic-registration-form/my").then(r => r.data.data),
    retry: false,
  });

  const hasError = statsError || regError;
  const isLoading = statsLoading || regLoading;

  const detai = stats?.ten_de_tai ? {
    tenDeTai: stats.ten_de_tai,
    trangThai: stats.trang_thai_de_tai,
  } : null;

  return (
    <div className="mx-auto px-2 sm:px-0">
      <h1 className="text-2xl font-bold text-slate-900 mb-7 tracking-tight">Kết quả đề tài</h1>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : hasError ? (
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-8 text-center">
          <HiOutlineDocumentText size={40} className="mx-auto text-slate-300 mb-3" />
          <div className="text-slate-500 font-medium">Chưa có điểm.</div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Thông tin đề tài */}
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineAcademicCap className="text-blue-500" size={22} />
              <h2 className="text-base font-semibold text-slate-800">Thông tin đề tài</h2>
            </div>
            {detai ? (
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Tên đề tài:</span>
                  <span className="text-slate-900 font-semibold flex-1">{detai.tenDeTai}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Trạng thái:</span>
                  <StatusBadge status={detai.trangThai} />
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm py-2">Bạn chưa được phân công đề tài.</div>
            )}
          </div>

          {/* Thông tin đăng ký */}
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineDocumentText className="text-blue-500" size={22} />
              <h2 className="text-base font-semibold text-slate-800">Phiếu đăng ký</h2>
            </div>
            {regForm ? (
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Tên đề tài:</span>
                  <span className="text-slate-800">{regForm.topic_title || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Hướng đề tài:</span>
                  <span className="text-slate-800">{regForm.topic_description || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Loại:</span>
                  <span className="text-slate-800">
                    {regForm.topic_type === "mot_sinh_vien" ? "Một sinh viên" : "Hai sinh viên"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Trạng thái:</span>
                  <StatusBadge status={regForm.status} />
                </div>
                {regForm.gvhd_code && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="sm:w-40 font-medium text-slate-500">GVHD:</span>
                    <span className="text-slate-800">{regForm.gvhd_code}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="sm:w-40 font-medium text-slate-500">Ngày đăng ký:</span>
                  <span className="text-slate-800">
                    {regForm.registered_at ? new Date(regForm.registered_at).toLocaleString("vi-VN") : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm py-2">Chưa có phiếu đăng ký.</div>
            )}
          </div>

          {/* Bảng điểm */}
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineCheckCircle className="text-blue-500" size={22} />
              <h2 className="text-base font-semibold text-slate-800">Bảng điểm</h2>
            </div>
            {detai ? (
              <div>
                <ScoreRow label="Điểm giữa kỳ" score={stats?.diem_giua_ky ?? null} nhanXet={stats?.nhan_xet_giua_ky} />
                <ScoreRow label="Điểm hướng dẫn" score={stats?.diem_huong_dan ?? null} nhanXet={stats?.nhan_xet_huong_dan} />
                <ScoreRow label="Điểm phản biện" score={stats?.diem_phan_bien ?? null} nhanXet={stats?.nhan_xet_phan_bien} />
                <ScoreRow label="Điểm hội đồng" score={stats?.diem_hoi_dong ?? null} />
                <div className="mt-4 pt-3 border-t-2 border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Điểm tổng kết</span>
                  <span className={`text-3xl font-bold ${stats?.diem_tong_ket != null ? "text-blue-700" : "text-slate-300"}`}>
                    {stats?.diem_tong_ket != null ? Number(stats.diem_tong_ket).toFixed(1) : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm py-2">Chưa có điểm.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
