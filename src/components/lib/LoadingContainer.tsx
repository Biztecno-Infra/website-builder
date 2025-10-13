import React from "react";

interface LoadingSpinnerProps {
  size?: number; 
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = "#3498db",
  message = "Loading...",
  fullScreen = false,
  style = {},
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: fullScreen ? "100vw" : "100%",
        height: fullScreen ? "100vh" : "100%",
        ...style,
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `${size * 0.1}px solid #f3f3f3`,
          borderTop: `${size * 0.1}px solid ${color}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {message && (
        <span style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
          {message}
        </span>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
