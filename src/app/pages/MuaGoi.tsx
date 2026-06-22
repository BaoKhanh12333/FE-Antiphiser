import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Loader2, ShoppingCart, AlertCircle, Star, Zap, Users, User } from "lucide-react";
import { toast } from "sonner";
import { subscriptionService } from "../services/subscriptionService";
import { orderService } from "../services/orderService";
import { QRPaymentModal } from "../components/QRPaymentModal";
import { motion } from "motion/react";

interface Plan {
  id: number;
  name: string;
  price: number;
  durationInMonths: number;
  feature?: string;
  maxSlots?: number;
}

interface OrderInfo {
  orderId: number;
  amount: number;
  content: string;
  qrUrl: string;
}

export function MuaGoi() {
  const navigate = useNavigate();
  const [plans, setPlans]         = useState<Plan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadErr, setLoadErr]     = useState("");
  const [buying, setBuying]       = useState<number | null>(null);
  const [order, setOrder]         = useState<OrderInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    subscriptionService.getAllPlans()
      .then((data: Plan[]) => setPlans(data ?? []))
      .catch(() => setLoadErr("Không thể tải danh sách gói. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (plan: Plan) => {
    setBuying(plan.id);
    try {
      const result = (plan.maxSlots ?? 0) <= 1
        ? await orderService.createOrderIndividual(plan.id)
        : await orderService.createOrderBusinessUpgrade(plan.id);
      setOrder(result);
      setModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setBuying(null);
    }
  };

  const handlePaid = () => navigate("/nguoi-dung/cai-dat");

  const parseFeatures = (feature?: string): string[] => {
    if (!feature) return [];
    return feature.split(/[,;\n]/).map(f => f.trim()).filter(Boolean);
  };

  // Xác định plan tier: individual = maxSlots <= 1; pro = business với maxSlots cao nhất
  const isIndividual = (p: Plan) => (p.maxSlots ?? 0) <= 1;
  const businessPlans = plans.filter(p => !isIndividual(p));
  const maxSlots = businessPlans.length > 0
    ? Math.max(...businessPlans.map(p => p.maxSlots ?? 0))
    : -1;
  const isProPlan = (p: Plan) => !isIndividual(p) && (p.maxSlots ?? 0) === maxSlots && maxSlots > 0;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#F8FAFF" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "#6366F1" }}>
            NÂNG CẤP TÀI KHOẢN
          </p>
          <h1 className="text-3xl font-extrabold mb-3" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-sm text-slate-500">
            Mở khoá đầy đủ bài học, mô phỏng thực chiến và báo cáo AI.
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        )}

        {loadErr && (
          <div className="flex items-center gap-2 justify-center py-10 text-red-500">
            <AlertCircle size={18} />
            <span className="text-sm">{loadErr}</span>
          </div>
        )}

        {/* Plan cards */}
        {!loading && !loadErr && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => {
              const features  = parseFeatures(plan.feature);
              const isBuying  = buying === plan.id;
              const individual = isIndividual(plan);
              const pro        = isProPlan(plan);

              // ── Pro card ────────────────────────────────────────────────────
              if (pro) {
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="relative flex flex-col rounded-2xl overflow-visible"
                    style={{
                      background: "#fff",
                      border: "2px solid rgba(245,158,11,0.55)",
                      boxShadow: "0 0 0 4px rgba(245,158,11,0.08), 0 8px 40px rgba(245,158,11,0.22), 0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Floating badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                      style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.5)" }}>
                      <Star size={11} fill="white" className="text-white" />
                      <span className="text-[11px] font-black tracking-widest uppercase text-white whitespace-nowrap">
                        PHỔ BIẾN NHẤT
                      </span>
                    </div>

                    {/* Dark header */}
                    <div className="px-6 pt-8 pb-5 rounded-t-2xl relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #18165a 0%, #312E81 55%, #4338CA 100%)" }}>
                      {/* Decorative glow blobs */}
                      <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)" }} />
                      <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }} />

                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {plan.durationInMonths} tháng
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide"
                            style={{ background: "rgba(245,158,11,0.2)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.35)" }}>
                            <Users size={9} className="inline mr-1" />Doanh nghiệp
                          </span>
                        </div>

                        <h2 className="text-xl font-extrabold mb-3" style={{ color: "#fff", letterSpacing: "-0.01em" }}>
                          {plan.name}
                        </h2>

                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-3xl font-black" style={{ color: "#FCD34D", letterSpacing: "-0.02em" }}>
                            {plan.price.toLocaleString("vi-VN")}
                          </span>
                          <span className="text-base font-bold" style={{ color: "rgba(252,211,77,0.7)" }}>đ</span>
                        </div>
                        {plan.maxSlots != null && plan.maxSlots > 0 && (
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                            Tối đa {plan.maxSlots} người dùng
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="px-6 py-5 flex-1">
                      {features.length > 0 ? (
                        <ul className="flex flex-col gap-2.5">
                          {features.map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm" style={{ color: "#374151" }}>
                              <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
                              <span className="font-medium">{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Không có mô tả tính năng.</p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6">
                      <motion.button
                        onClick={() => handleBuy(plan)}
                        disabled={isBuying || buying !== null}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(135deg, #F59E0B, #D97706)",
                          color: "#1C1917",
                          boxShadow: "0 0 24px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {isBuying ? (
                          <><Loader2 size={15} className="animate-spin" /> Đang tạo đơn...</>
                        ) : (
                          <><Zap size={15} fill="currentColor" /> Mua ngay</>
                        )}
                      </motion.button>
                      <p className="text-center text-[11px] mt-2" style={{ color: "#94A3B8" }}>
                        Hủy bất kỳ lúc nào · Hỗ trợ ưu tiên
                      </p>
                    </div>
                  </motion.div>
                );
              }

              // ── Individual card ─────────────────────────────────────────────
              if (individual) {
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="flex flex-col rounded-2xl overflow-hidden"
                    style={{
                      background: "#fff",
                      border: "1.5px solid rgba(16,185,129,0.25)",
                      boxShadow: "0 2px 16px rgba(16,185,129,0.08)",
                    }}
                  >
                    <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #ECFDF5, #F0FDF4)", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                          {plan.durationInMonths} tháng
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
                          <User size={9} className="inline mr-1" />Cá nhân
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold mb-2" style={{ color: "#1E293B" }}>{plan.name}</h2>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold" style={{ color: "#10B981" }}>
                          {plan.price.toLocaleString("vi-VN")}
                        </span>
                        <span className="text-sm text-slate-400">đ</span>
                      </div>
                      {plan.maxSlots != null && plan.maxSlots > 0 && (
                        <p className="text-xs text-slate-400 mt-1">Tối đa {plan.maxSlots} người dùng</p>
                      )}
                    </div>

                    <div className="px-6 py-4 flex-1">
                      {features.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                          {features.map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Không có mô tả tính năng.</p>
                      )}
                    </div>

                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleBuy(plan)}
                        disabled={isBuying || buying !== null}
                        className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                        style={{
                          background: "linear-gradient(135deg, #10B981, #059669)",
                          color: "#fff",
                          boxShadow: "0 0 16px rgba(16,185,129,0.25)",
                        }}
                      >
                        {isBuying ? (
                          <><Loader2 size={15} className="animate-spin" /> Đang tạo đơn...</>
                        ) : (
                          <><ShoppingCart size={15} /> Mua gói</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              }

              // ── Standard business card ──────────────────────────────────────
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex flex-col rounded-2xl overflow-hidden"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #E0E7FF",
                    boxShadow: "0 2px 16px rgba(99,102,241,0.06)",
                  }}
                >
                  <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)", borderBottom: "1px solid #E0E7FF" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                        {plan.durationInMonths} tháng
                      </p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                        style={{ background: "#D1FAE5", color: "#059669" }}>
                        <Users size={9} className="inline mr-1" />Doanh nghiệp
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-800 mb-2">{plan.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-indigo-600">
                        {plan.price.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-sm text-slate-400">đ</span>
                    </div>
                    {plan.maxSlots != null && plan.maxSlots > 0 && (
                      <p className="text-xs text-slate-400 mt-1">Tối đa {plan.maxSlots} người dùng</p>
                    )}
                  </div>

                  <div className="px-6 py-4 flex-1">
                    {features.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-indigo-400" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Không có mô tả tính năng.</p>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={isBuying || buying !== null}
                      className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                      style={{
                        background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                        color: "#fff",
                        boxShadow: "0 0 16px rgba(99,102,241,0.25)",
                      }}
                    >
                      {isBuying ? (
                        <><Loader2 size={15} className="animate-spin" /> Đang tạo đơn...</>
                      ) : (
                        <><ShoppingCart size={15} /> Mua gói</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <QRPaymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        order={order}
        onPaid={handlePaid}
        onCancelled={() => setOrder(null)}
      />
    </div>
  );
}
