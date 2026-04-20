import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useLocation } from "react-router-dom";

const statusMessages = {
  con_phancong_hd: "Chưa đến hoặc đã qua thời hạn phân công HD",
  con_phancong_pb: "Chưa đến hoặc đã qua thời hạn phân công PB",
  con_dangky: "Chưa đến hoặc đã qua thời hạn đăng ký",
  con_chamGK: "Chưa đến hoặc đã qua thời hạn chấm điểm GK",
  con_chamPB: "Chưa đến hoặc đã qua thời hạn chấm điểm PB",
  con_chamHD: "Chưa đến hoặc đã qua thời hạn chấm điểm HD",
  con_chamHDG: "Chưa đến hoặc đã qua thời hạn chấm điểm hội đồng",
};

function StageStatusBanner({ children }) {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    api
      .get("/giai-doan/current")
      .then((res) => {
        let data = res.data?.data || {};

        // Khai báo map ánh xạ: Một đường dẫn có thể dính tới nhiều cờ trạng thái (mảng Array)
        const routeKeyMap = {
          "/admin/phancong": ["con_phancong_hd", "con_phancong_pb"],
          // "/sv/dang-ky-detai": ["con_dangky"],
          "/gv/giua-ky": ["con_chamGK"],
          "/gv/phanbien": ["con_chamPB"],
          "/gv/huongdan": ["con_chamHD"],
          "/gv/hoidong": ["con_chamHDG"],
        };

        const currentKeys = routeKeyMap[location.pathname];
        let inactiveMessages = [];

        // Lặp qua tất cả các key thuộc đường dẫn hiện tại để render các cảnh báo
        if (currentKeys) {
          currentKeys.forEach((key) => {
            const value = data[key];
            if (value === false || value === "false") {
              inactiveMessages.push(statusMessages[key]);
            }
          });
        }

        setStatus(inactiveMessages);
      })
      .catch(() => setStatus(["Không thể lấy trạng thái giai đoạn"]))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  if (loading) return null;

  // Trạng thái bình thường không khoá -> Cho phép render nội dung trang
  if (status.length === 0) {
    return <>{children}</>;
  }

  // Nếu bị khoá vòng này -> Render ô vàng cảnh báo và CHẶN (không render `children`)
  return (
    <div>
      <div
        style={{
          background: "#fff3cd",
          color: "#856404",
          padding: "8px 16px",
          border: "1px solid #ffeeba",
          borderRadius: 4,
          marginBottom: 16,
        }}
      >
        <strong className="block mb-2 text-sm uppercase">Cảnh báo hệ thống:</strong>
        {status.map((msg, idx) => (
          <div key={idx} className="font-semibold">- {msg}</div>
        ))}
      </div>
      {/* 
        Ta KHÔNG ĐẶT {children} VÀO ĐÂY => React sẽ không vẽ bất kỳ code nào của trang (bị chặn hoàn toàn). 
      */}
    </div>
  );
}

export default StageStatusBanner;
