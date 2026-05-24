import { useState } from "react";
import {
  Star, Clock, Users, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Mail, AlertTriangle,
  Paperclip, Eye,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */
const campaigns = [
  {
    id: 1,
    name: "Giả mạo thông báo thuế TNCN",
    tag: "Chính phủ",
    tagColor: "#10B981",
    tagBg: "#ECFDF5",
    difficulty: 4,
    scheduledDate: "10/03/2026",
    scheduledTime: "09:00",
    targetGroup: "Phòng Kế toán",
    targetCount: 12,
    createdBy: "Admin Lê Hoàng Phúc",
    status: "pending",
    emailPreview: {
      from: "hotro-thuế@gdt-gov.vn.tax",
      subject: "🚨 KHẨN: Cập nhật Mã số thuế cá nhân trước 15/03",
      body: `Kính gửi Quý nhân viên,

Theo quy định mới của Tổng cục Thuế, tất cả cá nhân cần xác minh lại Mã số thuế cá nhân (MST) trước ngày 15/03/2026 để tránh bị tạm khóa tài khoản thuế điện tử.

Vui lòng truy cập đường link bên dưới và điền thông tin xác minh:
→ https://gdt-gov.vn.tax/xac-minh-mst

⚠️ Lưu ý: Quá thời hạn, MST sẽ bị vô hiệu hóa và bạn sẽ không thể nộp thuế online.

Trân trọng,
Bộ phận Hỗ trợ – Tổng cục Thuế Việt Nam`,
      attachments: ["Huong_dan_xac_minh.pdf"],
    },
  },
  {
    id: 2,
    name: "Email CEO yêu cầu chuyển khoản",
    tag: "Doanh nghiệp",
    tagColor: "#EC4899",
    tagBg: "#FDF2F8",
    difficulty: 5,
    scheduledDate: "12/03/2026",
    scheduledTime: "14:00",
    targetGroup: "Phòng Kế toán & Kinh doanh",
    targetCount: 18,
    createdBy: "AI tự động tạo",
    status: "pending",
    emailPreview: {
      from: "giamdoc@c0ngty-group.com",
      subject: "Yêu cầu chuyển khoản khẩn - Hợp đồng đối tác mới",
      body: `Anh/Chị thân mến,

Tôi đang trong cuộc họp với đối tác nên không thể gọi điện. Cần anh/chị hỗ trợ chuyển khoản gấp cho đối tác 85.000.000 VNĐ theo thông tin bên dưới:

Ngân hàng: Techcombank
STK: 1903 2847 5612
Tên: CÔNG TY TNHH ABC SOLUTIONS

Hãy xử lý ngay trong ngày hôm nay. Tôi sẽ ký duyệt chứng từ khi về văn phòng.

Cảm ơn,
Nguyễn Văn A - Giám đốc`,
      attachments: [],
    },
  },
  {
    id: 3,
    name: "Xác nhận đơn hàng Shopee giả",
    tag: "Thương mại",
    tagColor: "#F59E0B",
    tagBg: "#FFFBEB",
    difficulty: 2,
    scheduledDate: "15/03/2026",
    scheduledTime: "10:30",
    targetGroup: "Toàn bộ phòng ban",
    targetCount: 35,
    createdBy: "Admin Lê Hoàng Phúc",
    status: "pending",
    emailPreview: {
      from: "no-reply@sh0pee-vn.store",
      subject: "Đơn hàng #SPE-9281742 đã được xác nhận - Thanh toán 2.450.000đ",
      body: `Xin chào,

Đơn hàng của bạn đã được xác nhận thành công!

Chi tiết đơn hàng:
- Mã đơn: #SPE-9281742
- Sản phẩm: iPhone 15 Pro Max 256GB
- Tổng thanh toán: 2.450.000đ (giảm 85%)
- Phương thức: Thanh toán khi nhận hàng

Nếu bạn KHÔNG đặt đơn hàng này, vui lòng hủy ngay tại đây:
→ https://sh0pee-vn.store/cancel-order

Shopee Vietnam`,
      attachments: ["Chi_tiet_don_hang.html"],
    },
  },
  {
    id: 4,
    name: "Reset mật khẩu Office 365",
    tag: "Tài khoản",
    tagColor: "#3B82F6",
    tagBg: "#EFF6FF",
    difficulty: 3,
    scheduledDate: "08/03/2026",
    scheduledTime: "08:00",
    targetGroup: "Phòng IT & Kinh doanh",
    targetCount: 15,
    createdBy: "AI tự động tạo",
    status: "approved",
    emailPreview: {
      from: "security@microsft-365.support",
      subject: "Hành động cần thiết: Mật khẩu Office 365 sắp hết hạn",
      body: `Mật khẩu Office 365 của bạn sẽ hết hạn trong 24 giờ.

Để tránh bị khóa tài khoản, vui lòng cập nhật mật khẩu ngay:
→ https://microsft-365.support/reset-password

Microsoft Support Team`,
      attachments: [],
    },
  },
];

type Campaign = (typeof campaigns)[number];

/* ── Email Preview Component ──────────────────────── */
function EmailPreviewCard({ campaign }: { campaign: Campaign }) {
  const ep = campaign.emailPreview;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(99,102,241,0.12)" }}>
      {/* Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: "#F8FAFF", borderColor: "rgba(99,102,241,0.08)" }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
        <Mail size={13} className="ml-2 text-indigo-400" />
        <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>Xem trước email giả lập</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-white" style={{ fontSize: "0.62rem", background: "#F59E0B", fontWeight: 700 }}>GIẢ LẬP</span>
      </div>

      {/* Header */}
      <div className="px-5 py-3 border-b" style={{ background: "#fff", borderColor: "rgba(99,102,241,0.06)" }}>
        <p className="text-slate-800 mb-1" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{ep.subject}</p>
        <div className="flex items-center gap-1">
          <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>Từ:</span>
          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.75rem", background: "#FEF2F2", color: "#EF4444", fontWeight: 600 }}>{ep.from}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4" style={{ background: "#fff" }}>
        <pre className="whitespace-pre-wrap text-slate-600" style={{ fontSize: "0.82rem", lineHeight: 1.7, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {ep.body}
        </pre>
        {ep.attachments.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Paperclip size={13} className="text-red-400" />
            {ep.attachments.map((a) => (
              <span key={a} className="px-2.5 py-1 rounded-lg" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA" }}>
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function ManagerPheDuyet() {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [statuses, setStatuses] = useState<Record<number, string>>(
    Object.fromEntries(campaigns.map((c) => [c.id, c.status]))
  );

  const handleApprove = (id: number) => setStatuses((s) => ({ ...s, [id]: "approved" }));
  const handleReject = (id: number) => setStatuses((s) => ({ ...s, [id]: "rejected" }));

  const pending = campaigns.filter((c) => statuses[c.id] === "pending");
  const processed = campaigns.filter((c) => statuses[c.id] !== "pending");

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
          Phê duyệt chiến dịch
        </h1>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
          {pending.length} chiến dịch đang chờ phê duyệt · Kiểm duyệt nội dung trước khi gửi đến nhân viên
        </p>
      </div>

      {/* Pending campaigns */}
      {pending.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-slate-600 flex items-center gap-2" style={{ fontWeight: 700, fontSize: "0.88rem" }}>
            <Clock size={15} className="text-amber-500" /> Đang chờ phê duyệt ({pending.length})
          </h2>
          {pending.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="rounded-3xl overflow-hidden transition-all"
                style={{
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                {/* Card header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: c.tagBg }}>
                      <AlertTriangle size={20} style={{ color: c.tagColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-slate-800" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}>{c.name}</h3>
                        <span className="px-2 py-0.5 rounded-lg" style={{ fontSize: "0.7rem", fontWeight: 700, color: c.tagColor, background: c.tagBg }}>{c.tag}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={`camp-star-${c.id}-${s}`} size={13} fill={s <= c.difficulty ? "#FBBF24" : "transparent"} className={s <= c.difficulty ? "text-yellow-400" : "text-slate-200"} />
                          ))}
                        </div>
                        <span className="text-slate-400 flex items-center gap-1" style={{ fontSize: "0.78rem" }}>
                          <Clock size={12} /> {c.scheduledDate} lúc {c.scheduledTime}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1" style={{ fontSize: "0.78rem" }}>
                          <Users size={12} /> {c.targetGroup} ({c.targetCount} người)
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1" style={{ fontSize: "0.75rem" }}>Tạo bởi: {c.createdBy}</p>
                    </div>
                    <div className="shrink-0">
                      {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-5" style={{ borderTop: "1px solid rgba(99,102,241,0.06)" }}>
                    <div className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye size={15} className="text-indigo-500" />
                        <span className="text-slate-700" style={{ fontWeight: 700, fontSize: "0.88rem" }}>Xem trước nội dung email</span>
                      </div>
                      <EmailPreviewCard campaign={c} />
                    </div>

                    {/* Approve / Reject */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(c.id); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{ background: "linear-gradient(135deg, #10B981, #34D399)", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
                      >
                        <CheckCircle2 size={17} /> Phê duyệt
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(c.id); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{ background: "linear-gradient(135deg, #EF4444, #F87171)", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}
                      >
                        <XCircle size={17} /> Từ chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Processed campaigns */}
      {processed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-slate-600 flex items-center gap-2" style={{ fontWeight: 700, fontSize: "0.88rem" }}>
            <CheckCircle2 size={15} className="text-emerald-500" /> Đã xử lý ({processed.length})
          </h2>
          {processed.map((c) => {
            const st = statuses[c.id];
            return (
              <div
                key={c.id}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: st === "approved" ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)",
                  border: `1px solid ${st === "approved" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"}`,
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: st === "approved" ? "#ECFDF5" : "#FEF2F2" }}>
                  {st === "approved" ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 truncate" style={{ fontWeight: 600, fontSize: "0.88rem" }}>{c.name}</p>
                  <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{c.targetGroup} · {c.scheduledDate}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-xl shrink-0"
                  style={{
                    fontSize: "0.78rem", fontWeight: 700,
                    color: st === "approved" ? "#10B981" : "#EF4444",
                    background: st === "approved" ? "#ECFDF5" : "#FEF2F2",
                  }}
                >
                  {st === "approved" ? "Đã duyệt" : "Đã từ chối"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
