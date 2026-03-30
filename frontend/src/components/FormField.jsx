import React from "react";

export default function FormField({ label, as = "input", children, className = "", ...props }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block font-medium mb-1 text-slate-700">{label}</label>
      )}
      {as === "select" ? (
        <select {...props} className={"form-control rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 " + className}>
          {children}
        </select>
      ) : (
        <input {...props} className={"form-control rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 " + className} />
      )}
    </div>
  );
}