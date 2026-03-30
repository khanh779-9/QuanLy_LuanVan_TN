import React from "react";

const LoadingSection = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
    <p className="mt-4 text-gray-500">Đang tải dữ liệu. Vui lòng chờ đợi ...</p>
  </div>
);

export default LoadingSection;
