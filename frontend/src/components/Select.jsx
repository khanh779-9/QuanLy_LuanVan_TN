
import React from "react";

export default function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>
          {label}
        </label>
      )}
      <select {...props} className="form-control">
        {children}
      </select>
    </div>
  );
}
