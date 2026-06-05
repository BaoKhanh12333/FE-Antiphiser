import { authService } from "../services/authService";

/**
 * Lấy userId của user đang đăng nhập từ JWT token.
 * Đọc từ token thay vì localStorage.user để tránh lệch field (profile dùng "id",
 * một số chỗ cũ đọc sai "userId").
 * @returns userId dạng số, hoặc null nếu chưa đăng nhập / token hết hạn
 */
export function getCurrentUserId(): number | null {
  const raw = authService.getCurrentUserId(); // trả về string từ claim "UserId"
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}
