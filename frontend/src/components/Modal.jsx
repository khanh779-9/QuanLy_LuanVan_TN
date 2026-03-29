
import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="modal"
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          position: "relative",
          minWidth: 320,
          maxWidth: 540,
          width: "100%",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 18,
            fontSize: 24,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
