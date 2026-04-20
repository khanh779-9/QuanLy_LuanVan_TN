import React, { useState } from "react";
import api from "../../services/api";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";

export default function DangKyDeTaiModal({ open, onClose, onSuccess, editData }) {
  const { user } = useAuth();
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicType, setTopicType] = useState("mot_sinh_vien");
  const [note, setNote] = useState("");
  const [student2Id, setStudent2Id] = useState("");
  const [student2Name, setStudent2Name] = useState("");
  const [student2Class, setStudent2Class] = useState("");
  const [student2Email, setStudent2Email] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open && editData) {
      setTopicTitle(editData.topic_title || "");
      setTopicDescription(editData.topic_description || "");
      setTopicType(editData.topic_type || "mot_sinh_vien");
      setNote(editData.note || "");
      setStudent2Id(editData.student2_id || "");
      setStudent2Name(editData.student2_name || "");
      setStudent2Class(editData.student2_class || "");
      setStudent2Email(editData.student2_email || "");
    } else if (open) {
      setTopicTitle("");
      setTopicDescription("");
      setTopicType("mot_sinh_vien");
      setNote("");
      setStudent2Id("");
      setStudent2Name("");
      setStudent2Class("");
      setStudent2Email("");
    }
    setError("");
  }, [open, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let ten = topicTitle.trim();
    if(ten==""){
      setError("Tên đề tài không được để trống");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        topic_title: topicTitle || "Chưa có tên đề tài",
        topic_description: topicDescription,
        topic_type: topicType,
        student1_id: user?.id,
        student1_name: user?.name,
        student1_class: user?.class || "Không rõ",
        student1_email: user?.email,
        note,
        ...(topicType === "hai_sinh_vien" && {
          student2_id: student2Id,
          student2_name: student2Name,
          student2_class: student2Class,
          student2_email: student2Email,
        }),
      };
      console.log("Payload gửi đi:", payload);
      if (editData) {
        await api.put(`/nhap-lieu/${editData.id}`, payload);
      } else {
        await api.post("/topic-registration-form", payload);
      }
      setLoading(false);
      onSuccess?.();
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 500 || !msg) {
        setError("Chưa phát triển chức năng");
      } else {
        setError("Loi He Thong ");
      }
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={editData ? "Chỉnh sửa thông tin đề tài" : "Đăng ký đề tài mới"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thông tin SV1 (readonly) */}
        <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 text-sm text-slate-700">
          <div className="font-medium text-slate-500 mb-1 text-xs uppercase tracking-wide">Sinh viên đăng ký</div>
          <div>{user?.name} — <span className="font-mono">{user?.id}</span> — {user?.class || "—"}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tên đề tài *</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tên đề tài của bạn"
            value={topicTitle}
            onChange={e => setTopicTitle(e.target.value)}
          />
          
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hướng đề tài / Mô tả</label>
          <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={topicDescription}
            onChange={e => setTopicDescription(e.target.value)}
            rows={3}
            placeholder="Nhập hướng đề tài hoặc mô tả..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Loại đề tài</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={topicType}
            onChange={e => setTopicType(e.target.value)}
          >
            <option value="mot_sinh_vien">Một sinh viên</option>
            <option value="hai_sinh_vien">Hai sinh viên</option>
          </select>
        </div>

        {topicType === "hai_sinh_vien" && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-3">
            <div className="text-sm font-medium text-blue-700">Thông tin sinh viên 2</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">MSSV <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={student2Id}
                  onChange={e => setStudent2Id(e.target.value)}
                  required={topicType === "hai_sinh_vien"}
                  placeholder="VD: 2151012345"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Lớp <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={student2Class}
                  onChange={e => setStudent2Class(e.target.value)}
                  required={topicType === "hai_sinh_vien"}
                  placeholder="VD: DHTTH17A"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={student2Name}
                onChange={e => setStudent2Name(e.target.value)}
                required={topicType === "hai_sinh_vien"}
                placeholder="Họ và tên sinh viên 2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={student2Email}
                onChange={e => setStudent2Email(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú thêm (không bắt buộc)"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? (editData ? "Đang lưu..." : "Đang đăng ký...")
              : (editData ? "Lưu thay đổi" : "Đăng ký")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
