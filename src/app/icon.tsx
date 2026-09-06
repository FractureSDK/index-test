import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050507",
        borderRadius: 40,
        color: "#c8ff3d",
        fontSize: 96,
        fontWeight: 700,
      }}
    >
      {initials}
    </div>,
    { ...size }
  );
}
