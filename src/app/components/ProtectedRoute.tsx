import { Navigate, Outlet } from "react-router";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Component bảo vệ Router chống truy cập trái phép
 * Kiểm tra xem User đã đăng nhập chưa và có vai trò phù hợp không.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuth = authService.isAuthenticated();
  const currentRole = authService.getCurrentRole();

  if (!isAuth) {
    // Chưa đăng nhập -> chuyển hướng đến trang Đăng nhập
    return <Navigate to="/dang-nhap" replace />;
  }

  if (allowedRoles && (!currentRole || !allowedRoles.some(role => role.toLowerCase() === currentRole.toLowerCase()))) {
    // Đã đăng nhập nhưng sai Role -> chuyển hướng về Dashboard mặc định của Role đó
    console.warn(`Truy cập bị từ chối: Yêu cầu các role [${allowedRoles.join(", ")}], nhưng tài khoản có role [${currentRole}]`);
    
    const roleLower = currentRole?.toLowerCase() || "";
    if (roleLower === "admin") {
      return <Navigate to="/quan-tri" replace />;
    } else if (roleLower === "manager") {
      return <Navigate to="/quan-ly" replace />;
    } else {
      return <Navigate to="/nguoi-dung" replace />;
    }
  }

  // Có đủ quyền hạn -> hiển thị tiếp các route con
  return <Outlet />;
}
