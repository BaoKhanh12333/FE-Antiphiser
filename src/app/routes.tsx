import { createBrowserRouter, Outlet } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UserLayout } from "./UserLayout";
import { ManagerLayout } from "./ManagerLayout";
import { AdminLayout } from "./AdminLayout";
import { TongQuan } from "./pages/TongQuan";
import { LoTrinh } from "./pages/LoTrinh";
import { BaiHoc } from "./pages/BaiHoc";
import { MoPhong } from "./pages/MoPhong";
import { BaoCao } from "./pages/BaoCao";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { ManagerDoiNgu } from "./pages/manager/ManagerDoiNgu";
import { ManagerBaoCao } from "./pages/manager/ManagerBaoCao";
import { ManagerTaoCampaign } from "./pages/manager/ManagerTaoCampaign";
import { AdminTongQuan } from "./pages/admin/AdminTongQuan";
import { AdminThuVien } from "./pages/admin/AdminThuVien";
import { AdminAIController } from "./pages/admin/AdminAIController";
import { AdminQuanLyNguoiDung } from "./pages/admin/AdminQuanLyNguoiDung";
import { Settings } from "./pages/Settings";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentFail } from "./pages/PaymentFail";

function RootLayout() {
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl text-indigo-500 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Trang bạn tìm không tồn tại.</p>
        <a href="/" className="text-indigo-500 underline">Quay về trang chủ</a>
      </div>
    </div>
  );
}

function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl text-red-500 mb-4">Đã xảy ra lỗi</h1>
        <p className="text-gray-600 mb-6">Vui lòng thử lại sau.</p>
        <a href="/" className="text-indigo-500 underline">Quay về trang chủ</a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: LandingPage },
      { path: "dang-nhap", Component: LoginPage },
      { path: "dang-ky", Component: RegisterPage },
      { path: "dat-lai-mat-khau", Component: ResetPasswordPage },

      // Payment Callback Pages (from VNPAY)
      { path: "paymentsuccess", Component: PaymentSuccess },
      { path: "paymentfail", Component: PaymentFail },

      // Nhóm người dùng (User/Nhân viên, Manager, Admin)
      {
        element: <ProtectedRoute allowedRoles={["User", "Manager", "Admin"]} />,
        children: [
          {
            path: "nguoi-dung",
            Component: UserLayout,
            children: [
              { index: true, Component: TongQuan },
              { path: "lo-trinh", Component: LoTrinh },
              { path: "bai-hoc/:lessonId", Component: BaiHoc },
              { path: "mo-phong", Component: MoPhong },
              { path: "bao-cao", Component: BaoCao },
              { path: "cai-dat", Component: Settings },
            ],
          },
        ],
      },

      // Nhóm Quản lý (Manager)
      {
        element: <ProtectedRoute allowedRoles={["Manager"]} />,
        children: [
          {
            path: "quan-ly",
            Component: ManagerLayout,
            children: [
              { index: true, Component: ManagerDashboard },
              { path: "doi-ngu", Component: ManagerDoiNgu },
              { path: "bao-cao", Component: ManagerBaoCao },
              { path: "tao-chien-dich", Component: ManagerTaoCampaign },
              { path: "cai-dat", Component: Settings },
            ],
          },
        ],
      },

      // Nhóm Quản trị hệ thống (Admin)
      {
        element: <ProtectedRoute allowedRoles={["Admin"]} />,
        children: [
          {
            path: "quan-tri",
            Component: AdminLayout,
            children: [
              { index: true, Component: AdminTongQuan },
              { path: "kich-ban", Component: AdminThuVien },
              { path: "ai-controller", Component: AdminAIController },
              { path: "quan-ly", Component: AdminQuanLyNguoiDung },
              { path: "cai-dat", Component: Settings },
            ],
          },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);

