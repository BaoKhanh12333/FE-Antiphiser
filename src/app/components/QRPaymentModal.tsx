import { useEffect, useRef, useState } from "react";
import { Loader2, Copy, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { orderService } from "../services/orderService";

interface Order {
  orderId: number;
  amount: number;
  content: string;
  qrUrl: string;
}

interface QRPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onPaid: () => void;
  onCancelled?: () => void;
}

const POLL_INTERVAL_MS = 4000;
const TIMEOUT_MS = 10 * 60 * 1000;

export function QRPaymentModal({ open, onOpenChange, order, onPaid, onCancelled }: QRPaymentModalProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const clearTimers = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  useEffect(() => {
    if (!open || !order) {
      clearTimers();
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const result = await orderService.getOrderStatus(order.orderId);
        if (result?.status === "Paid") {
          clearTimers();
          toast.success("Thanh toán thành công! Gói dịch vụ đã được kích hoạt.");
          onPaid();
          onOpenChange(false);
        }
      } catch {
        // Bỏ qua lỗi poll — tiếp tục thử
      }
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      clearTimers();
      toast.error("Đơn hàng đã hết hạn (10 phút). Vui lòng tạo lại đơn mới.");
      onOpenChange(false);
    }, TIMEOUT_MS);

    return clearTimers;
  }, [open, order?.orderId]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await orderService.cancelPending();
      clearTimers();
      toast.success("Đã hủy đơn hàng.");
      onOpenChange(false);
      onCancelled?.();
    } catch (err: any) {
      toast.error(err?.message || "Không thể hủy đơn. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyContent = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.content).then(() => {
      toast.success("Đã sao chép nội dung chuyển khoản");
    });
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-slate-800">
            Quét mã QR để thanh toán
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* QR image */}
          <div
            className="rounded-2xl overflow-hidden border-2 p-2"
            style={{ borderColor: "#E0E7FF", background: "#fff" }}
          >
            <img
              src={order.qrUrl}
              alt="QR thanh toán"
              width={256}
              height={256}
              className="block"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Số tiền</p>
            <p className="text-2xl font-extrabold text-indigo-600">
              {order.amount.toLocaleString("vi-VN")}đ
            </p>
          </div>

          {/* Content / mã đối soát */}
          <div
            className="w-full rounded-xl px-4 py-3 flex items-center justify-between gap-2"
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Nội dung chuyển khoản
              </p>
              <p className="text-base font-bold text-slate-800 font-mono tracking-wider truncate">
                {order.content}
              </p>
            </div>
            <button
              onClick={handleCopyContent}
              className="shrink-0 p-2 rounded-lg transition-colors hover:bg-slate-200"
              title="Sao chép nội dung"
            >
              <Copy size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-slate-400 text-center leading-relaxed px-2">
            Quét bằng app ngân hàng. Nội dung chuyển khoản đã điền sẵn — giữ nguyên để hệ thống tự xác nhận.
          </p>

          {/* Polling indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 size={13} className="animate-spin text-indigo-400" />
            Đang chờ xác nhận thanh toán...
          </div>

          {/* Cancel button */}
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 mt-1"
          >
            {cancelling ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
            {cancelling ? "Đang hủy..." : "Hủy đơn & chọn gói khác"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
