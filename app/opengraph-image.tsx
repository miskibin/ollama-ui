import { ImageResponse } from "next/og";

export const alt = "Asystent RP";
export const size = {
  width: 800,
  height: 400,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a1a",
          color: "white",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
            gap: "24px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 57 58"
          >
            <mask id="path-1-inside-1" fill="white">
              <path d="M28.2721 56.5437C24.5594 56.5437 20.883 55.8125 17.4529 54.3917C14.0228 52.9709 10.9061 50.8884 8.28084 48.2631C5.65556 45.6378 3.57307 42.5211 2.15227 39.091C0.731478 35.6609 0.000204433 31.9846 0.000204758 28.2719L28.2721 28.2719L28.2721 56.5437Z" />
            </mask>
            <path
              d="M28.2721 56.5437C24.5594 56.5437 20.883 55.8125 17.4529 54.3917C14.0228 52.9709 10.9061 50.8884 8.28084 48.2631C5.65556 45.6378 3.57307 42.5211 2.15227 39.091C0.731478 35.6609 0.000204433 31.9846 0.000204758 28.2719L28.2721 28.2719L28.2721 56.5437Z"
              fill="#386BC0"
              fillOpacity="0.96"
              stroke="white"
              strokeWidth="4"
              mask="url(#path-1-inside-1)"
            />
            <mask id="path-2-inside-2" fill="white">
              <path d="M0.000204758 29.7281C0.000205413 22.2299 2.97884 15.0389 8.28084 9.73688C13.5828 4.43487 20.7739 1.45624 28.2721 1.45624L28.2721 29.7281L0.000204758 29.7281Z" />
            </mask>
            <path
              d="M0.000204758 29.7281C0.000205413 22.2299 2.97884 15.0389 8.28084 9.73688C13.5828 4.43487 20.7739 1.45624 28.2721 1.45624L28.2721 29.7281L0.000204758 29.7281Z"
              fill="#CA3B3B"
              stroke="white"
              strokeWidth="4"
              mask="url(#path-2-inside-2)"
            />
            <path
              d="M20.0256 36.3044C18.3255 34.6043 17.2792 32.3726 17.0485 30L27.33 30L37.6114 30C37.3807 32.3726 36.3344 34.6043 34.6343 36.3044C32.6971 38.2416 30.0697 39.3299 27.33 39.3299C24.5903 39.3299 21.9629 38.2416 20.0256 36.3044Z"
              fill="#CA3B3B"
              stroke="white"
              strokeWidth="2.1"
            />
            <path
              d="M34.6294 21.6956C36.3295 23.3957 37.3758 25.6274 37.6065 28H27.325L17.0436 28C17.2743 25.6274 18.3206 23.3957 20.0207 21.6956C21.9579 19.7584 24.5854 18.6701 27.325 18.6701C30.0647 18.6701 32.6922 19.7584 34.6294 21.6956Z"
              fill="white"
              stroke="white"
              strokeWidth="2.1"
            />
          </svg>
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "white",
            }}
          >
            Asystent RP
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#888",
            maxWidth: "80%",
            textAlign: "center",
          }}
        >
          Inteligentny asystent do analizy polskiego prawa
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
