
import { memo, useEffect, useRef, useState } from "react";
import { fetchTheses } from "../../services/thesisApi";

function ListThesis() {
  const tableRef = useRef(null);
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTheses()
      .then(data => setTheses(data))
      .catch(() => setError("Không thể tải danh sách luận văn."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-x-auto w-full">
      {loading ? (
        <div className="text-center py-10 text-blue-500 font-semibold">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
      ) : (
        <table ref={tableRef} className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
            <tr>
              <th className="p-3 font-bold text-blue-800">#</th>
              <th className="p-3 font-bold text-blue-800">Tên luận văn</th>
              <th className="p-3 font-bold text-blue-800">Sinh viên</th>
              <th className="p-3 font-bold text-blue-800">Giảng viên</th>
              <th className="p-3 font-bold text-blue-800">Trạng thái</th>
              <th className="p-3 font-bold text-blue-800 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {theses.map((thesis, idx) => (
              <tr key={thesis.maDeTai} className="border-b last:border-b-0 hover:bg-blue-50 transition">
                <td className="p-3 text-center">{idx + 1}</td>
                <td className="p-3 font-semibold">{thesis.tenDeTai || "(Chưa cập nhật)"}</td>
                <td className="p-3">{thesis.sinhVien || "-"}</td>
                <td className="p-3">{thesis.giangVien || "-"}</td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {thesis.trangThaiGiuaKy || thesis.trangThaiHoiDong || "-"}
                  </span>
                </td>
                <td className="p-3 text-center flex gap-2 justify-center">
                  <button className="bg-emerald-500 text-white px-4 py-1 rounded-full font-semibold shadow hover:bg-emerald-600 transition">Sửa</button>
                  <button className="bg-red-500 text-white px-4 py-1 rounded-full font-semibold shadow hover:bg-red-600 transition">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default memo(ListThesis);
