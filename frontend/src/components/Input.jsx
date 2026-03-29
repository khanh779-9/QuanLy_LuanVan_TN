import React from "react";

export default function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>
          {label}
        </label>
      )}
      <input {...props} className="form-control" />
    </div>
  );
}
