import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";

export default function AccessDenied({ message }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      color: "#d9534f"
    }}>
      <FontAwesomeIcon icon={faBan} size="4x" />
      <h2 style={{ marginTop: 20 }}>Không có quyền truy cập</h2>
      {message && <p>{message}</p>}
    </div>
  );
}
