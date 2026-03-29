import React from "react";

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <header
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: 16,
          fontWeight: 700,
        }}
      >
        Quản lý Luận văn
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
