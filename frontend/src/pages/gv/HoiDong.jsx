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
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Danh sách Hội đồng</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Mã hội đồng</th>
                <th className="py-2 px-4 border-b">Tên hội đồng</th>
                <th className="py-2 px-4 border-b">Địa điểm</th>
              </tr>
            </thead>
            <tbody>
              {hoiDongList.map((hd) => (
                <tr key={hd.maHoiDong}>
                  <td className="py-2 px-4 border-b">{hd.maHoiDong}</td>
                  <td className="py-2 px-4 border-b">{hd.tenHoiDong}</td>
                  <td className="py-2 px-4 border-b">{hd.diaDiem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
