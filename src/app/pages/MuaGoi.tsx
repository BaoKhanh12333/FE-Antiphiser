import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Loader2, ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { subscriptionService } from "../services/subscriptionService";
import { orderService } from "../services/orderService";
import { QRPaymentModal } from "../components/QRPaymentModal";

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

  const handlePaid = () => {
    navigate("/nguoi-dung/cai-dat");
  };

  const parseFeatures = (feature?: string): string[] => {
    if (!feature) return [];
    return feature.split(/[,;\n]/).map(f => f.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#F8FAFF" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-bold tracking-[0.25em] uppercase mb-2"
            style={{ color: "#6366F1" }}
          >
            NÂNG CẤP TÀI KHOẢN
          </p>
          <h1
            className="text-3xl font-extrabold mb-3"
            style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
          >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const features = parseFeatures(plan.feature);
              const isBuying = buying === plan.id;
              return (
                <div
                  key={plan.id}
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #E0E7FF",
                    boxShadow: "0 2px 16px rgba(99,102,241,0.06)",
                  }}
                >
                  {/* Card header */}
                  <div
                    className="px-6 pt-6 pb-4"
                    style={{
                      background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
                      borderBottom: "1px solid #E0E7FF",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                        {plan.durationInMonths} tháng
                      </p>
                      {(plan.maxSlots ?? 0) > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                          style={{ background: "#D1FAE5", color: "#059669" }}>
                          Doanh nghiệp
                        </span>
                      )}
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

                  {/* Features */}
                  <div className="px-6 py-4 flex-1">
                    {features.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2
                              size={14}
                              className="shrink-0 mt-0.5 text-indigo-400"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Không có mô tả tính năng.</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={isBuying || buying !== null}
                      className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
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
