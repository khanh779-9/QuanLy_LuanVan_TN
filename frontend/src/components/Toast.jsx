import React from "react";

export default function Toast({ open, message, type = "info", onClose }) {
  if (!open) return null;
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>x</button>
    </div>
  );
}
