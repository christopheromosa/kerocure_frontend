// app/components/Loading.tsx
"use client";

import React from "react";

const Loading: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "#fff",
        fontSize: "1.5rem",
      }}
    >
      <div className="spinner">Loading...</div>
    </div>
  );
};

export default Loading;
