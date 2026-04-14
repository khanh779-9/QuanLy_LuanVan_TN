import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HiOutlineXMark } from "react-icons/hi2";
import { approveTopicRegistrationForm } from "../services/deTaiService";
import {
  getList,
  createRecord,
  updateRecord,
  deleteRecord,
  importExcel,
} from "../services/nhapLieuService";

const STATUS_LABELS = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

const TYPE_LABELS = {
  mot_sinh_vien: "1 SV",
  hai_sinh_vien: "2 SV",
};

const initialForm = {
  topic_title: "",
  topic_description: "",
  topic_type: "mot_sinh_vien",
  student1_id: "",
  student1_name: "",
  student1_class: "",
  student1_email: "",
  student2_id: "",
  student2_name: "",
  student2_class: "",
  student2_email: "",
  gvhd_code: "",
  gvpb_code: "",
  gvhd_workplace: "",
  note: "",
  status: "cho_duyet",
  source: "",
};

export default function NhapLieu() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [
      "nhap-lieu",
      { page, search: search || undefined, status: status || undefined },
    ],
    queryFn: () =>
      getList({
        page,
        search: search || undefined,
        status: status || undefined,
      }).then((r) => r.data),
  });

  const rows = data?.data || [];
  const total = data?.total || 0;
  const perPage = data?.per_page || 20;
  const totalPages = Math.ceil(total / perPage);

  function openCreate() {
    setEditItem(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-start sm:items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">
          Nhập liệu đăng ký đề tài
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowImport(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Nhập Excel
          </button>
          <button
            onClick={openCreate}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Thêm mới
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Tìm MSSV, tên sinh viên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="da_duyet">Đã duyệt</option>
          <option value="tu_choi">Từ chối</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                STT
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tiêu đề đề tài
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                MSSV SV1
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Họ tên SV1
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Lớp SV1
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                MSSV SV2
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Họ tên SV2
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Lớp SV2
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                GVHD
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                Nguồn
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(10)].map((_, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-3 border-t border-slate-100"
                    >
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-16 text-center text-slate-500"
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {(page - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 max-w-[200px] truncate">
                    {row.topic_title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {TYPE_LABELS[row.topic_type] || row.topic_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.student1_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.student1_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.student1_class}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.student2_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.student2_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.student2_class}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {row.gvhd_code || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm border-t border-slate-100">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === "da_duyet"
                          ? "bg-green-100 text-green-700"
                          : row.status === "tu_choi"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {STATUS_LABELS[row.status] || row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 border-t border-slate-100">
                    {row.source}
                  </td>
                  <td className="px-4 py-3 text-sm border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Sửa
                      </button>
                      <DeleteBtn id={row.id} queryClient={queryClient} />
                      {/* <ApproveBtn id={row.id} queryClient={queryClient} /> */}
                      <button
                        onClick={() => {
                          if (window.confirm("Duyệt đề tài này?")) {
                            approveTopicRegistrationForm(row.id)
                              .then(() => {
                                queryClient.invalidateQueries({
                                  queryKey: ["nhap-lieu"],
                                });
                                alert("Đã duyệt đề tài");
                                // Làm mới lại bảng
                                queryClient.invalidateQueries({ queryKey: ["nhap-lieu"] });
                              })
                              .catch((err) => {
                                alert(
                                  err.response?.data?.message ||
                                    err.message ||
                                    "Lỗi khi duyệt đề tài",
                                );
                              });
                          }
                        }}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Duyệt
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">
            Hiển thị {(page - 1) * perPage + 1}-
            {Math.min(page * perPage, total)} / {total}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 text-sm border rounded ${page === i + 1 ? "bg-blue-500 text-white border-blue-500" : "border-slate-200 hover:bg-slate-50"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <FormModal
          editItem={editItem}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
          queryClient={queryClient}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

function DeleteBtn({ id, queryClient }) {
  const deleteMut = useMutation({
    mutationFn: () => deleteRecord(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nhap-lieu"] }),
  });

  function handleClick() {
    if (window.confirm("Xóa bản ghi này?")) {
      deleteMut.mutate();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={deleteMut.isPending}
      className="text-sm text-red-500 hover:text-red-700"
    >
      Xóa
    </button>
  );
}

function FormModal({ editItem, onClose, queryClient }) {
  const [form, setForm] = useState(
    editItem ? { ...editItem } : { ...initialForm },
  );
  const [errors, setErrors] = useState({});

  const saveMut = useMutation({
    mutationFn: (data) =>
      editItem
        ? updateRecord(editItem.id, data).then((r) => r.data)
        : createRecord(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhap-lieu"] });
      onClose();
    },
    onError: (err) => {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      }
    },
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    saveMut.mutate(form);
  }

  const is2sv = form.topic_type === "hai_sinh_vien";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <HiOutlineXMark size={20} />
        </button>

        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {editItem ? "Sửa bản ghi" : "Thêm mới"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tiêu đề đề tài
              </label>
              <input
                type="text"
                value={form.topic_title}
                onChange={(e) => handleChange("topic_title", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.topic_title ? "border-red-300" : "border-slate-200"}`}
              />
              {errors.topic_title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.topic_title[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Loại đề tài
              </label>
              <select
                value={form.topic_type}
                onChange={(e) => handleChange("topic_type", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="mot_sinh_vien">1 sinh viên</option>
                <option value="hai_sinh_vien">2 sinh viên</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="cho_duyet">Chờ duyệt</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="tu_choi">Từ chối</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                MSSV SV1 *
              </label>
              <input
                type="text"
                value={form.student1_id}
                onChange={(e) => handleChange("student1_id", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.student1_id ? "border-red-300" : "border-slate-200"}`}
              />
              {errors.student1_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.student1_id[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Họ tên SV1 *
              </label>
              <input
                type="text"
                value={form.student1_name}
                onChange={(e) => handleChange("student1_name", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.student1_name ? "border-red-300" : "border-slate-200"}`}
              />
              {errors.student1_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.student1_name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Lớp SV1 *
              </label>
              <input
                type="text"
                value={form.student1_class}
                onChange={(e) => handleChange("student1_class", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.student1_class ? "border-red-300" : "border-slate-200"}`}
              />
              {errors.student1_class && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.student1_class[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email SV1
              </label>
              <input
                type="email"
                value={form.student1_email}
                onChange={(e) => handleChange("student1_email", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {is2sv && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    MSSV SV2
                  </label>
                  <input
                    type="text"
                    value={form.student2_id}
                    onChange={(e) =>
                      handleChange("student2_id", e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Họ tên SV2
                  </label>
                  <input
                    type="text"
                    value={form.student2_name}
                    onChange={(e) =>
                      handleChange("student2_name", e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Lớp SV2
                  </label>
                  <input
                    type="text"
                    value={form.student2_class}
                    onChange={(e) =>
                      handleChange("student2_class", e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email SV2
                  </label>
                  <input
                    type="email"
                    value={form.student2_email}
                    onChange={(e) =>
                      handleChange("student2_email", e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mã GVHD
              </label>
              <input
                type="text"
                value={form.gvhd_code}
                onChange={(e) => handleChange("gvhd_code", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nơi công tác GVHD
              </label>
              <input
                type="text"
                value={form.gvhd_workplace}
                onChange={(e) => handleChange("gvhd_workplace", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saveMut.isPending ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImportModal({ onClose, queryClient }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const importMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("file", file);
      return importExcel(fd).then((r) => r.data);
    },
    onSuccess: (data) => {
      setResult(data);
      setErrorMsg(null);
      setFile(null);

      queryClient.invalidateQueries({ queryKey: ["nhap-lieu"] });
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || err.message || "Lỗi khi nhập Excel",
      );
    },
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <HiOutlineXMark size={20} />
        </button>

        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Nhập Excel
        </h2>

        {/* FIX: đúng tên sheet */}
        <p className="text-sm text-slate-500 mb-4">
          File Excel cần có sheet:
          <br />
          • DSSV_ĐK_HƯỚNG ĐỀ TÀI
          <br />• SVĐK_TheoLink
        </p>

        <div className="mb-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files[0] || null);
              setResult(null);
              setErrorMsg(null);
            }}
            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={() => importMut.mutate()}
          disabled={!file || importMut.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {importMut.isPending ? "Đang nhập..." : "Nhập"}
        </button>

        {/* ERROR DETAIL */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mt-4">
            {errorMsg}
          </div>
        )}

        {/* SUCCESS */}
        {result && (
          <div className="mt-4 space-y-3">
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
              Đã nhập {result.imported} bản ghi thành công.
            </div>

            {/* ERRORS LIST */}
            {result.errors?.length > 0 && (
              <div className="text-sm text-slate-700 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                <p className="font-semibold mb-2 text-red-600">
                  {result.errors.length} lỗi:
                </p>
                <ul className="list-disc list-inside text-slate-500 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      {err.sheet ? `[${err.sheet}] ` : ""}
                      {err.group ? `(Group: ${err.group}) ` : ""}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
