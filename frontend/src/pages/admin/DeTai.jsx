import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDeTais } from "../../services/deTaiService";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import { HiOutlineEye, HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function AdminDeTai() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDeTai, setSelectedDeTai] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-detai", { search, page }],
    queryFn: () => getDeTais({ q: search, page }),
  });

  const listDeTai = data?.data || [];

  // Hàm tính điểm tổng kết dựa trên công thức 20-20-60
  const calculateFinalGrade = (hd, pb, hdScore) => {
    if (hd == null || pb == null || hdScore == null) return "---";
    return (hd * 0.2 + pb * 0.2 + hdScore * 0.6).toFixed(2);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý Đề tài & Điểm số</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm tên đề tài, MSSV..."
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm w-80 outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase">Đề tài & Nhóm SV</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Điểm (HD | PB | HĐ)</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Tổng kết</th>
              <th className="px-4 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
  {listDeTai.map((dt) => {
    const data = typeof dt.data_json === 'string' ? JSON.parse(dt.data_json) : dt.data_json || {};

  // Lấy điểm trung bình của cả nhóm (hoặc sv đầu tiên) từ data_json mới
  const getAverageScore = (roleData) => {
    const svList = roleData?.sinh_viens;
    if (!svList || svList.length === 0) return null;
    // Tính trung bình điểm Final của các SV trong nhóm
    const total = svList.reduce((sum, sv) => sum + (Number(sv.diemFinal) || 0), 0);
    return (total / svList.length).toFixed(1);
  };

  const diemHD = getAverageScore(data?.gvhd);
  const diemPB = getAverageScore(data?.gvpb);
  const diemHoiDong = getAverageScore(data?.hd);
  
  const finalGrade = calculateFinalGrade(diemHD, diemPB, diemHoiDong);
    return (
      <tr key={dt.maDeTai} className="hover:bg-slate-50/50 transition-colors">
        <td className="px-6 py-4">
          <div className="font-bold text-slate-800 mb-1">{dt.tenDeTai}</div>
          {/* Hiển thị Nhóm SV */}
          <div className="flex flex-wrap gap-2 mb-2">
            {dt.sinh_viens?.map(sv => (
              <span key={sv.mssv} className="bg-yellow-100  text-xs py-0.5 rounded  ">{sv.hoTen}_{sv.mssv}</span>
            ))}
          </div>
          {/* Dòng thông tin Giảng viên & Hội đồng */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">GVHD:</span>
              <span className="text-blue-700 font-semibold">{dt.giang_vien_h_d?.tenGV || "—"}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">GVPB:</span>
              <span className="text-orange-700 font-semibold">{dt.giang_vien_p_b?.tenGV || "—"}</span>
            </span>
            {dt.maHoiDong && (
              <>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">HĐ:</span>
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded font-bold uppercase">{dt.maHoiDong}</span>
                </span>
              </>
            )}
          </div>
        </td>

        {/* Các cột điểm lấy từ data_json */}
        <td className="px-6 py-4 text-center font-mono">
          <div className="flex justify-center items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">HD</span>
              <span className="text-blue-600">{diemHD ?? "-"}</span>
            </div>
            <span className="text-slate-200">/</span>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">PB</span>
              <span className="text-orange-600">{diemPB ?? "-"}</span>
            </div>
            <span className="text-slate-200">/</span>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">HĐ</span>
              <span className="text-emerald-600 font-bold">{diemHoiDong ?? "-"}</span>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 text-center font-bold text-slate-900 text-lg">
          {finalGrade}
        </td>

        <td className="px-4 py-4 text-right">
          <button onClick={() => setSelectedDeTai(dt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <HiOutlineEye size={20} />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} total={data?.total} perPage={15} />

      {selectedDeTai && (
        <Modal isOpen={true} onClose={() => setSelectedDeTai(null)} title="Bảng điểm chi tiết" maxWidth="max-w-4xl">
          <DetailScoreView dt={selectedDeTai} />
        </Modal>
      )}
    </div>
  );
}

function DetailScoreView({ dt }) {
  // Chuẩn hóa dữ liệu JSON
  const data = typeof dt.data_json === 'string' ? JSON.parse(dt.data_json) : dt.data_json || {};
  
  return (
    <div className="space-y-6">
      {/* Thông tin Giảng viên nhận xét chung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="text-xs font-bold uppercase text-blue-500 mb-2 tracking-widest">Nhận xét của GVHD</h4>
          <p className="text-sm text-slate-700 italic">"{data?.gvhd?.nhanXet || "Chưa có nhận xét"}"</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <h4 className="text-xs font-bold uppercase text-orange-500 mb-2 tracking-widest">Nhận xét của GVPB</h4>
          <p className="text-sm text-slate-700 italic">"{data?.gvpb?.nhanXet || "Chưa có nhận xét"}"</p>
        </div>
      </div>

      {/* Bảng điểm chi tiết từng sinh viên */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Họ tên & MSSV</th>
              <th className="px-4 py-3 text-center">Điểm HD</th>
              <th className="px-4 py-3 text-center">Điểm PB</th>
              <th className="px-4 py-3 text-center">Điểm HĐ</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {dt.sinh_viens?.map(sv => {
              // Truy xuất dữ liệu riêng của từng SV trong data_json
              const svHD = data?.gvhd?.sinh_viens?.find(s => s.mssv === sv.mssv);
              const svPB = data?.gvpb?.sinh_viens?.find(s => s.mssv === sv.mssv);
              const svHDG = data?.hd?.sinh_viens?.find(s => s.mssv === sv.mssv);
              
              // Điều kiện không được ra hội đồng
              const isRejected = dt.trangThai === 'khong_dat' || dt.trangThaiGiuaKy === 'dinh_chi';
              
              return (
                <tr key={sv.mssv} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-700">{sv.hoTen}</div>
                    <div className="text-xs text-slate-400">{sv.mssv} - {sv.lop}</div>
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-bold text-blue-600">
                    {svHD?.diemFinal || "---"}
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-bold text-orange-600">
                    {svPB?.diemFinal || "---"}
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-bold text-emerald-600">
                    {svHDG?.diemFinal || "---"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {isRejected ? (
                      <span className="inline-flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase bg-red-50 px-2 py-1 rounded border border-red-100">
                        <HiOutlineExclamationTriangle /> Loại
                      </span>
                    ) : (
                      <span className="text-green-600 font-bold text-[10px] uppercase bg-green-50 px-2 py-1 rounded border border-green-100">
                        Đủ điều kiện
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}