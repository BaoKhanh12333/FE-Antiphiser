import { useState } from "react";
import {
  Search,
  Plus,
  Star,
  Pencil,
  Zap,
  Filter,
  LayoutGrid,
  List,
  Eye,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

/* ── DATA ─────────────────────────────────────────── */
const categories = ["Tất cả", "Tài chính", "Mạng xã hội", "Nội bộ", "Thương mại", "Chính phủ"];

const scenarios = [
  {
    id: 1,
    title: "Email giả mạo Vietcombank",
    desc: "Giả mạo thông báo tài khoản bị khóa, yêu cầu xác minh thông tin ngân hàng.",
    tag: "Tài chính",
    difficulty: 4,
    uses: 245,
    successRate: 68,
    image: "https://images.unsplash.com/photo-1740479049014-274a2c756317?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGlzaGluZyUyMGVtYWlsJTIwc2NhbSUyMGJhbmtpbmclMjBmcmF1ZHxlbnwxfHx8fDE3NzI3MzI2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tagColor: "#EF4444",
    tagBg: "#FEF2F2",
  },
  {
    id: 2,
    title: "Thông báo đăng nhập Facebook lạ",
    desc: "Giả mạo cảnh báo bảo mật Facebook, dẫn đến trang login giả.",
    tag: "Mạng xã hội",
    difficulty: 2,
    uses: 312,
    successRate: 82,
    image: "https://images.unsplash.com/photo-1620794511798-d7ba5299a087?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGhhY2tpbmclMjBmYWtlJTIwbm90aWZpY2F0aW9ufGVufDF8fHx8MTc3MjczMjY5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    tagColor: "#3B82F6",
    tagBg: "#EFF6FF",
  },
  {
    id: 3,
    title: "Thư mời họp giả từ Ban giám đốc",
    desc: "Giả mạo email nội bộ từ CEO, yêu cầu click link xem lịch họp khẩn.",
    tag: "Nội bộ",
    difficulty: 5,
    uses: 89,
    successRate: 45,
    image: "https://images.unsplash.com/photo-1649424221028-8e7d31f2e3c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBlbWFpbCUyMGNvbXB1dGVyJTIwc2NyZWVufGVufDF8fHx8MTc3MjczMjY5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    tagColor: "#8B5CF6",
    tagBg: "#F5F3FF",
  },
  {
    id: 4,
    title: "Xác nhận đơn hàng Shopee giả",
    desc: "Giả mạo email xác nhận đơn hàng có giá trị lớn với link theo dõi giả.",
    tag: "Thương mại",
    difficulty: 2,
    uses: 420,
    successRate: 88,
    image: "https://images.unsplash.com/photo-1647221597996-54f3d0f73809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNrYWdlJTIwZGVsaXZlcnklMjBub3RpZmljYXRpb24lMjBtb2JpbGV8ZW58MXx8fHwxNzcyNzMyNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tagColor: "#F59E0B",
    tagBg: "#FFFBEB",
  },
  {
    id: 5,
    title: "Thông báo thuế TNCN giả",
    desc: "Giả mạo cơ quan thuế yêu cầu cập nhật mã số thuế cá nhân qua link.",
    tag: "Chính phủ",
    difficulty: 3,
    uses: 156,
    successRate: 62,
    image: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXglMjBkb2N1bWVudCUyMGdvdmVybm1lbnQlMjBvZmZpY2lhbCUyMHBhcGVyfGVufDF8fHx8MTc3MjczMjY5NHww&ixlib=rb-4.1.0&q=80&w=1080",
    tagColor: "#10B981",
    tagBg: "#ECFDF5",
  },
  {
    id: 6,
    title: "Email CEO giả mạo (BEC)",
    desc: "Giả mạo email CEO yêu cầu chuyển tiền khẩn cấp cho đối tác mới.",
    tag: "Nội bộ",
    difficulty: 5,
    uses: 44,
    successRate: 35,
    image: "https://images.unsplash.com/photo-1758518727984-17b37f2f0562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMHN1aXQlMjBtZWV0aW5nJTIwY29ycG9yYXRlfGVufDF8fHx8MTc3MjczMjY5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    tagColor: "#EC4899",
    tagBg: "#FDF2F8",
  },
];

/* ── MAIN ─────────────────────────────────────────── */
export function AdminThuVien() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filtered = scenarios.filter((s) => {
    const matchCat = activeCategory === "Tất cả" || s.tag === activeCategory;
    const matchSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
            Thư viện kịch bản Phishing
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            {scenarios.length} kịch bản · Quản lý và triển khai email giả lập
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            fontWeight: 700,
            fontSize: "0.875rem",
            boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
          }}
        >
          <Plus size={16} /> Thêm kịch bản
        </button>
      </div>

      {/* Search + Filters */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.03)",
        }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1 w-full sm:w-auto px-4 py-2.5 rounded-xl"
          style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <Search size={16} className="text-indigo-400 shrink-0" />
          <input
            className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400"
            placeholder="Tìm kịch bản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "0.88rem", fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-xl transition-all"
              style={{
                fontSize: "0.8rem",
                fontWeight: activeCategory === cat ? 700 : 500,
                color: activeCategory === cat ? "#fff" : "#64748B",
                background: activeCategory === cat ? "#6366F1" : "rgba(99,102,241,0.06)",
                border: activeCategory === cat ? "none" : "1px solid rgba(99,102,241,0.08)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sc) => (
          <div
            key={sc.id}
            className="rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer group"
            style={{
              background: "#fff",
              boxShadow:
                hoveredId === sc.id
                  ? "0 12px 48px rgba(99,102,241,0.15), 0 4px 12px rgba(0,0,0,0.04)"
                  : "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              transform: hoveredId === sc.id ? "translateY(-4px)" : "none",
            }}
            onMouseEnter={() => setHoveredId(sc.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Preview image */}
            <div className="relative overflow-hidden" style={{ height: 180 }}>
              <ImageWithFallback
                src={sc.image}
                alt={sc.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay gradient */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)" }}
              />

              {/* Tag */}
              <span
                className="absolute top-3 left-3 px-2.5 py-1 rounded-lg"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: sc.tagColor,
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {sc.tag}
              </span>

              {/* Difficulty stars */}
              <div className="absolute top-3 right-3 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={`star-${sc.id}-${s}`}
                    size={13}
                    fill={s <= sc.difficulty ? "#FBBF24" : "transparent"}
                    className={s <= sc.difficulty ? "text-yellow-400" : "text-white/40"}
                    style={{ filter: s <= sc.difficulty ? "drop-shadow(0 0 4px rgba(251,191,36,0.5))" : "none" }}
                  />
                ))}
              </div>

              {/* Hover buttons */}
              <div
                className="absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300"
                style={{
                  opacity: hoveredId === sc.id ? 1 : 0,
                  transform: hoveredId === sc.id ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white transition-all hover:opacity-90"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                  }}
                >
                  <Pencil size={13} /> Chỉnh sửa
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(129,140,248,0.9))",
                    backdropFilter: "blur(12px)",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                  }}
                >
                  <Zap size={13} /> Sử dụng ngay
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="p-5">
              <h3
                className="text-slate-800 mb-2"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
              >
                {sc.title}
              </h3>
              <p className="text-slate-500 mb-4" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
                {sc.desc}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye size={13} className="text-slate-400" />
                  <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                    {sc.uses} lần sử dụng
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: 48,
                      background: "#F1F5F9",
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${sc.successRate}%`,
                        background: sc.successRate >= 70 ? "#10B981" : sc.successRate >= 50 ? "#F59E0B" : "#EF4444",
                      }}
                    />
                  </div>
                  <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>
                    {sc.successRate}% phát hiện
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
