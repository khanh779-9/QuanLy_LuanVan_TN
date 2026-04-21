import { useEffect, useState } from "react";
import hoiDongService from "../../services/hoiDongService";

export default function GVHoiDong() {
  const [hoiDongList, setHoiDongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    hoiDongService.getAllHoiDong()
      .then(res => {
        setHoiDongList(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Không thể tải danh sách hội đồng");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6 text-blue-800">Danh sách Hội đồng chấm điểm</h2>
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã hội đồng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên hội đồng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa điểm</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(3)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-4 py-16 text-center">
                  <span className="text-red-500 font-semibold">{error}</span>
                </td>
              </tr>
            ) : hoiDongList.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Không có hội đồng nào.</p>
                </td>
              </tr>
            ) : (
              hoiDongList.map((hd) => (
                <tr key={hd.maHoiDong} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{hd.maHoiDong}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{hd.tenHoiDong}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{hd.diaDiem}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
