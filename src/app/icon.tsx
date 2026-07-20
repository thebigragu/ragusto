import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon derived from Ragusto geometric mark */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          borderRadius: 14,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
          <path
            d="M12 44 C12 22 22 12 32 12 C42 12 52 22 52 44"
            stroke="#f5f5f4"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path d="M18 44 H46" stroke="#f5f5f4" strokeWidth="2.8" strokeLinecap="round" />
          <path
            d="M24 44 V28 M32 44 V22 M40 44 V28"
            stroke="#5eead4"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="32" cy="18" r="2.6" fill="#5eead4" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
