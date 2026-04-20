import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
} from "../../services/giaiDoanService";

import {
  getThoiGianTuyChinh,
  setThoiGianTuyChinh,
} from "../../services/cauHinhService";

import { formatDate } from "../../utils/helper";

export default function AdminGiaiDoanPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // Form state cho sửa
  const [formMoTa, setFormMoTa] = useState("");
  const [formLoai, setFormLoai] = useState("");
  const [formData, setFormData] = useState([]);
  const [formNgayBatDau, setFormNgayBatDau] = useState("");
  const [formNgayKetThuc, setFormNgayKetThuc] = useState("");
  const [formError, setFormError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isTimeLoading, setIsTimeLoading] = useState(false); 
  const [statusMsg, setStatusMsg] = useState("");
  const [dateError, setDateError] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    const fetchThoiGianTuyChinh = async () => {
      const data = await getThoiGianTuyChinh();
      setUseCustom(!!data.thoiGianTuyChinh);
      if (data.tg_TuyChinh) {
        const d = data.tg_TuyChinh;
        // Chuyển object {date, month, year} thành yyyy-mm-dd
        const mm = String(d.month).padStart(2, "0");
        const dd = String(d.day).padStart(2, "0");
        setCustomDate(`${d.year}-${mm}-${dd}`);
      } else {
        setCustomDate("");
      }
    };
    fetchThoiGianTuyChinh();
  }, []);

  const { data: gdData, isLoading } = useQuery({
    queryKey: ["giaidoan"],
    queryFn: getStages,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giaidoan"] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const filtered = useMemo(() => {
    if (!Array.isArray(gdData)) return [];
    if (!search.trim()) return gdData;
    const q = search.toLowerCase();
    return gdData.filter(
      (gd) =>
        gd.mo_ta?.toLowerCase().includes(q) ||
        gd.loai?.toLowerCase().includes(q),
    );
  }, [gdData, search]);

  // Xử lý mở modal sửa
  const handleEditClick = (gd) => {
    setEditItem(gd);
    setFormMoTa(gd.mo_ta || "");
    setFormLoai(gd.loai || "");
   
    setFormData(gd.data || {});
    setFormNgayBatDau(gd.ngay_bat_dau || "");
    setFormNgayKetThuc(gd.ngay_ket_thuc || "");
    setFormError("");
    setShowFormModal(true);
  };

  // Mutation update
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giaidoan"] });
      setShowFormModal(false);
      setEditItem(null);
    },
    onError: (err) => {
      setFormError("Có lỗi khi cập nhật. Vui lòng thử lại.");
    },
  });
  const createMut = useMutation({
  mutationFn: (data) => createStage(data), // Gọi service tạo mới
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["giaidoan"] });
    setShowFormModal(false);
  },
  onError: () => setFormError("Có lỗi khi thêm mới."),
});
  // Xử lý lưu sửa
  const handleSave = () => {
    if (!formMoTa.trim() || !formNgayBatDau || !formNgayKetThuc) {
      setFormError("Vui lòng nhập đầy đủ mô tả, ngày bắt đầu, ngày kết thúc.");
      return;
    }
    const payload = {
    mo_ta: formMoTa,
    loai: "process",
    data: formData,
    ngay_bat_dau: formNgayBatDau,
    ngay_ket_thuc: formNgayKetThuc,
  };

  if (editItem) {
    // Nếu có editItem thì là đang SỬA
    updateMut.mutate({ id: editItem.id, data: payload });
  } else {
    // Nếu KHÔNG có editItem thì là đang THÊM MỚI
    createMut.mutate(payload);
  }

  };


  const handleKichHoatGiaLapTime = async () => {
  if (!customDate) return setStatusMsg("Hãy chọn ngày!");
  setIsTimeLoading(true);
  try {
    const [y, m, d] = customDate.split("-");
    await setThoiGianTuyChinh({
      thoiGianTuyChinh: true,
      tg_TuyChinh: { day: Number(d), month: Number(m), year: Number(y) }
    });
    setUseCustom(true);
    setStatusMsg("Đã bật giả lập thời gian");
    queryClient.invalidateQueries(["thoiGianTuyChinh"]);
  } catch (e) { setStatusMsg("Lỗi kết nối"); }
  setIsTimeLoading(false);
};
  const handleTraLaiRealTime = async () => {
  setIsTimeLoading(true);
  try {
    await setThoiGianTuyChinh({ thoiGianTuyChinh: false, tg_TuyChinh: { day: 20, month: 4, year: 2026 } });
    setUseCustom(false);
    setStatusMsg("Đã tắt giả lập thời gian");
    queryClient.invalidateQueries(["thoiGianTuyChinh"]);
  } catch (e) { setStatusMsg("Lỗi kết nối"); }
  setIsTimeLoading(false);
};
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Giai đoạn</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1"
        />
        <button
          onClick={() => {
            setEditItem(null);
            setFormMoTa("");
            setFormNgayBatDau("");
            setFormNgayKetThuc("");
            setFormError("");
            setShowFormModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
        >
          Thêm giai đoạn
        </button>
      </div>

      <div className="gap-4 mb-4 border border-slate-200 rounded-lg px-4 py-3">
        {isLoading ? (
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-blue-500 text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm">
                Thời gian hiện tại tuỳ chỉnh:{" "}
              </p>
              <input
                type="date"
                className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={customDate}
                onChange={(e) => {
        setCustomDate(e.target.value);setStatusMsg("");
      }}
                
              />
              <button 
      onClick={handleKichHoatGiaLapTime} 
      disabled={isTimeLoading}
      className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-600 "
    >
      {isTimeLoading && !useCustom ? "Đang xử lý..." : "Bật giả lập thời gian"}
    </button>
  <button 
      onClick={handleTraLaiRealTime} 
      disabled={isTimeLoading || !useCustom}
      className="bg-gray-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-600 "
    >
      {isTimeLoading && useCustom ? "Đang xử lý..." : "Tắt giả lập thời gian"}
    </button>
            </div>
            {statusMsg && (
    <span className={`text-xs font-semibold ml-[125px] ${statusMsg.includes("✓") ? "text-green-600" : "text-red-500"}`}>
      {statusMsg}
    </span>
  )}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                STT
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Mô tả
              </th>
              
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ngày bắt đầu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ngày kết thúc
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-3 border-t border-slate-100"
                    >
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">
                    Chưa có giai đoạn
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Thêm giai đoạn đầu tiên để cấu hình hệ thống.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((gd, index) => (
                <tr key={gd.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-500 border-t border-slate-100 text-center">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">
                    {gd.mo_ta}
                  </td>
                  {/* <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gd.loai}</td> */}
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {formatDate(gd.ngay_bat_dau)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {formatDate(gd.ngay_ket_thuc)}
                  </td>
                  <td className="px-4 py-3 border-t border-slate-100">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditClick(gd)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          setDeleteItem(gd);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal sửa giai đoạn */}
      {showFormModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowFormModal(false);
            setEditItem(null);
          }}
          title={editItem ? "Sửa giai đoạn" : "Thêm giai đoạn"}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mô tả
              </label>
              <input
                type="text"
                value={formMoTa}
                onChange={(e) => setFormMoTa(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập mô tả giai đoạn"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formNgayBatDau}
                  onChange={(e) => setFormNgayBatDau(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formNgayKetThuc}
                  onChange={(e) => setFormNgayKetThuc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="gap-4">
              <p className="block text-sm font-medium text-slate-700 mb-1">
                Chức năng cho phép:
              </p>
              <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_phancong_hd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      con_phancong_hd: e.target.checked,
                    })
                  }
                />
                Còn phân công gvhd
              </label>

              <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_phancong_pb}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      con_phancong_pb: e.target.checked,
                    })
                  }
                />
                Còn phân công gvpb
              </label>

              <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_dangky}
                  onChange={(e) =>
                    setFormData({ ...formData, con_dangky: e.target.checked })
                  }
                />
                Còn đăng ký
              </label>

              <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_chamGK}
                  onChange={(e) =>
                    setFormData({ ...formData, con_chamGK: e.target.checked })
                  }
                />
                Còn chấm điểm giữa kỳ
              </label>

                 <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_chamHD}
                  onChange={(e) =>
                    setFormData({ ...formData, con_chamHD: e.target.checked })
                  }
                />
                Còn chấm điểm hướng dẫn
              </label>

              <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_chamPB}
                  onChange={(e) =>
                    setFormData({ ...formData, con_chamPB: e.target.checked })
                  }
                />
                Còn chấm điểm phản biện
              </label>

              <label className="flex block text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 accent-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  checked={formData.con_chamHDG}
                  onChange={(e) =>
                    setFormData({ ...formData, con_chamHDG: e.target.checked })
                  }
                />
                Còn chấm điểm hội đồng
              </label>
            </div>

            {formError && (
              <div className="text-red-500 text-sm mt-2">{formError}</div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => {
                setShowFormModal(false);
                setEditItem(null);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={updateMut.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {updateMut.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal xoá giữ nguyên */}
      {showDeleteConfirm && deleteItem && (
        <ConfirmModal
          isOpen={true}
          title="Xóa giai đoạn?"
          message={`Bạn có chắc muốn xóa giai đoạn này? Hành động này không thể hoàn tác.`}
          onConfirm={() => deleteMut.mutate(deleteItem.id)}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteItem(null);
          }}
          loading={deleteMut.isPending}
          confirmText="Xóa"
        />
      )}
    </div>
  );
}
