import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { exportWordNhiemVu } from '../../services/deTaiService';
import DangKyDeTaiModal from "./DangKyDeTaiModal";

export default function DangKyDeTaiSV() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  // Lấy thông tin đề tài của sinh viên hiện tại
  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-detai"],
    queryFn: () => api.get("/de-tai/my").then((r) => r.data),
    refetchOnWindowFocus: false,
  });

  const handleOpenModal = (edit = null) => {
    setEditData(edit);
    setShowModal(true);
  };

  return (
    <div className="mx-auto px-2 sm:px-0">
      <h1 className="text-2xl font-bold text-slate-900 mb-7 tracking-tight">Đăng ký đề tài</h1>
      <div className="bg-white rounded-2xl shadow border border-slate-100 p-7">
        <h2 className="text-lg font-semibold text-blue-800 mb-5">Đề tài của tôi</h2>
        {isLoading ? (
          <div className="text-slate-400 text-base">Đang tải...</div>
        ) : data ? (
          <>
            <div className="space-y-3 text-[15px]">
              <div>
                <span className="font-medium text-slate-700">Tên đề tài:</span>{" "}
                <span className="text-slate-900">{data.tenDeTai}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Mô tả:</span>{" "}
                <span className="text-slate-800">{data.moTa || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Trạng thái:</span>{" "}
                <span className="text-slate-800">{data.trangThai || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">GVHD:</span>{" "}
                <span className="text-slate-800">{data.maGV_HD || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">GVPB:</span>{" "}
                <span className="text-slate-800">{data.maGV_PB || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Ghi chú:</span> <span className="text-slate-800">{data.ghiChu || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Ngày tạo:</span>{" "}
                <span className="text-slate-800">{data.created_at ? new Date(data.created_at).toLocaleString() : "—"}</span>
              </div>
            </div>
            {/* Nút xuất phiếu nhiệm vụ */}
            <div className="flex justify-end mt-3">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 text-[15px] font-medium rounded-lg shadow-sm transition-colors"
                onClick={() => {
                  if (!data?.maDeTai) return;
                  exportWordNhiemVu(data.maDeTai);
                }}
              >
                Xuất phiếu nhiệm vụ
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-slate-400 text-base">Bạn chưa có đề tài nào.</div>
          </div>
        )}
      </div>
      {/* Nếu muốn cho phép đăng ký/chỉnh sửa đề tài, mở modal ở đây */}
      {/* <DangKyDeTaiModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refetch();
        }}
        editData={editData}
      /> */}
    </div>
  );
}
