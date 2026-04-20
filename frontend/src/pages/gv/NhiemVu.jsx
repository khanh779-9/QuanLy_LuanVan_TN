

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeTais, updateDeTai } from "../../services/deTaiService";
import { useAuth } from "../../context/AuthContext";

import Modal from "../../components/common/Modal";
// import { getStudents } from "../../services/sinhVienService";


export default function NhiemVuGV() {
  const { user } = useAuth();
  const maGV = user?.id || user?.maGV;
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Lấy danh sách đề tài mà GV này là GVHD
  const { data, isLoading } = useQuery({
    queryKey: ["de-tai-gvhd", maGV],
    enabled: Boolean(maGV),
    queryFn: async () => {
      const res = await getDeTais({ maGV_HD: maGV, per_page: 100 });
      return res?.data || [];
    },
  });

  // Mutation cập nhật nhiệm vụ
  const updateMut = useMutation({
    mutationFn: async ({ id, nhiemVu }) => {
      const old = data.find((d) => d.maDeTai === id) || {};
      const data_json = typeof old.data_json === "object" && old.data_json !== null ? { ...old.data_json } : {};
      data_json.nhiemVu = nhiemVu;
      await updateDeTai(id, { data_json });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["de-tai-gvhd"]);
      setEditingId(null);
      setShowModal(false);
    },
  });




  // Xử lý mở modal sửa
  const handleEdit = (row) => {
    setEditingId(row.maDeTai);
    // Luôn lấy sinh viên từ row.sinh_viens nếu có
    let svs = (row.sinh_viens && row.sinh_viens.length > 0)
      ? row.sinh_viens.map(sv => ({ hoTen: sv.hoTen, mssv: sv.mssv, lop: sv.lop }))
      : [{ hoTen: "", mssv: "", lop: "" }, { hoTen: "", mssv: "", lop: "" }];

    let nv = row.data_json?.nhiemVu || {};
    // Gán sinhViens từ đề tài nếu chưa có trong nhiệm vụ
    nv = {
      ...nv,
      sinhViens: svs
    };
    if (!nv.tieuDe) nv.tieuDe = row.tenDeTai || "";
    if (!nv.tenGVHD) nv.tenGVHD = row.giang_vien_hd?.tenGV || user?.name || "";
    setEditData(nv);
    setShowModal(true);
  };

  // Xử lý lưu
  const handleSave = (e) => {
    e.preventDefault();
    updateMut.mutate({ id: editingId, nhiemVu: editData });
  };

  // Xử lý thay đổi input
  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };
  const handleSinhVienChange = (idx, field, value) => {
    setEditData((prev) => {
      const sinhViens = [...(prev.sinhViens || [{}, {}])];
      sinhViens[idx] = { ...sinhViens[idx], [field]: value };
      return { ...prev, sinhViens };
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6 text-blue-800">Quản lý nhiệm vụ đề tài hướng dẫn</h2>
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên đề tài</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sinh viên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhiệm vụ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Không có đề tài nào bạn hướng dẫn.</p>
                </td>
              </tr>
            ) : data.map((row) => (
              <tr key={row.maDeTai} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{row.maDeTai}</td>
                <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{row.tenDeTai}</td>
                <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                  {(row.sinh_viens || []).map((sv, idx) => (
                    <div key={sv.mssv || idx}>{sv.hoTen} ({sv.mssv})</div>
                  ))}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                  <div className="font-semibold">{row.data_json?.nhiemVu?.tieuDe || <span className="text-slate-400">—</span>}</div>
                  <div className="text-xs text-slate-500">{row.data_json?.nhiemVu?.nhiemVu || <span className="text-slate-400">—</span>}</div>
                </td>
                <td className="px-4 py-3 border-t border-slate-100 text-right">
                  <button
                    className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    onClick={() => handleEdit(row)}
                  >Điền/Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal sửa nhiệm vụ */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title="Điền/Sửa nhiệm vụ" maxWidth="max-w-2xl">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[0, 1].map((i) => (
                <div key={i} className="border rounded p-3">
                  <div className="font-semibold mb-2">Sinh viên {i + 1}</div>
                  <input
                    className="input input-bordered w-full mb-2"
                    placeholder="Họ tên"
                    value={editData?.sinhViens?.[i]?.hoTen || ""}
                    onChange={(e) => handleSinhVienChange(i, "hoTen", e.target.value)}
                  />
                  <input
                    className="input input-bordered w-full mb-2"
                    placeholder="MSSV"
                    value={editData?.sinhViens?.[i]?.mssv || ""}
                    onChange={(e) => handleSinhVienChange(i, "mssv", e.target.value)}
                  />
                  <input
                    className="input input-bordered w-full"
                    placeholder="Lớp"
                    value={editData?.sinhViens?.[i]?.lop || ""}
                    onChange={(e) => handleSinhVienChange(i, "lop", e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề đề tài</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tiêu đề đề tài"
                value={editData?.tieuDe || ""}
                onChange={(e) => handleChange("tieuDe", e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung nhiệm vụ</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nội dung nhiệm vụ"
                value={editData?.nhiemVu || ""}
                onChange={(e) => handleChange("nhiemVu", e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tài liệu ban đầu</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tài liệu ban đầu"
                value={editData?.taiLieu || ""}
                onChange={(e) => handleChange("taiLieu", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày giao</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ngày giao"
                  value={editData?.ngayGiao || ""}
                  onChange={(e) => handleChange("ngayGiao", e.target.value)}
                  type="date"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày hoàn thành</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ngày hoàn thành"
                  value={editData?.ngayHoanThanh || ""}
                  onChange={(e) => handleChange("ngayHoanThanh", e.target.value)}
                  type="date"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên GVHD</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tên GVHD"
                value={editData?.tenGVHD || ""}
                onChange={(e) => handleChange("tenGVHD", e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg">Hủy</button>
              <button type="submit" disabled={updateMut.isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {updateMut.isLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
