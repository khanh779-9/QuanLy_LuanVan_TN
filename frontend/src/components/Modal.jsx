import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="relative bg-white rounded-xl p-6 min-w-[320px] max-w-[540px] w-full shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
