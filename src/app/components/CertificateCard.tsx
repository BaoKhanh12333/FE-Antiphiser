import { forwardRef } from "react";
import { Shield } from "lucide-react";

interface CertificateCardProps {
  certCode: string;
  fullName: string;
  companyName?: string | null;
  issuedAt: string;
  correctRate: number;
  totalAttempts: number;
  verifyUrl: string;
}

export const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>((props, ref) => {
  const { certCode, fullName, companyName, issuedAt, correctRate, totalAttempts, verifyUrl } = props;

  const date = new Date(issuedAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={ref}
      style={{
        width: 720,
        padding: 48,
        background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
        borderRadius: 24,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* decorative blobs */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={28} color="#A5B4FC" />
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#A5B4FC", marginBottom: 3 }}>
            AntiPhisher Platform
          </p>
          <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>
            Chứng chỉ nhận thức bảo mật
          </p>
        </div>
      </div>

      {/* Recipient */}
      <p style={{ fontSize: "0.8rem", color: "#C7D2FE", marginBottom: 6 }}>Được cấp cho</p>
      <p style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>
        {fullName}
      </p>
      {companyName && (
        <p style={{ fontSize: "0.95rem", color: "#A5B4FC", marginBottom: 32 }}>{companyName}</p>
      )}
      {!companyName && <div style={{ marginBottom: 32 }} />}

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 20px", flex: 1 }}>
          <p style={{ fontSize: "0.65rem", color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Tỉ lệ đúng
          </p>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#6EE7B7" }}>
            {correctRate.toFixed(1)}%
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 20px", flex: 1 }}>
          <p style={{ fontSize: "0.65rem", color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Bài đã thực hành
          </p>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
            {totalAttempts}
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 20px", flex: 2 }}>
          <p style={{ fontSize: "0.65rem", color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Ngày cấp
          </p>
          <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
            {date}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "0.65rem", color: "#A5B4FC", marginBottom: 5 }}>Mã chứng chỉ</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "monospace", color: "#E0E7FF", letterSpacing: "0.08em" }}>
            {certCode}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.65rem", color: "#A5B4FC", marginBottom: 5 }}>Xác minh tại</p>
          <p style={{ fontSize: "0.72rem", color: "#C7D2FE" }}>{verifyUrl}</p>
        </div>
      </div>
    </div>
  );
});

CertificateCard.displayName = "CertificateCard";
