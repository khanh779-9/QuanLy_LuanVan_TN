
import React from "react";

const typeMap = {
  info: "bg-blue-100 text-blue-800 border-blue-300",
  success: "bg-green-100 text-green-800 border-green-300",
  error: "bg-red-100 text-red-800 border-red-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export default function Toast({ open, message, type = "info", onClose }) {
  if (!open) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 border px-4 py-2 rounded shadow-lg flex items-center gap-3 transition-all duration-300 ${typeMap[type] || typeMap.info}`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold text-slate-500 hover:text-slate-900 focus:outline-none">×</button>
    </div>
  );
}
