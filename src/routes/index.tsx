import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "../components";
import { is_authenticated } from "@Signal/use-signal/auth-init-signal";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
// TODO: Tambahkan page baru di sini dengan pola yang sama:
// const MyPage = lazy(() => import("../pages/my-module/MyPage"));

/** Redirect ke /login jika belum authenticated */
function ProtectedRoutes() {
  const location = useLocation();
  if (!is_authenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Redirect ke home jika sudah authenticated */
function GuestOnlyRoute() {
  if (is_authenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// ─── App Routes ───────────────────────────────────────────────────────────────

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Guest-only routes */}
        <Route element={<GuestOnlyRoute />}>
          <Route
            path="/login"
            element={<LoginPage appName="MyApp" tagline="Masuk untuk mengakses dashboard aplikasi kamu." />}
          />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<DashboardPage />} />
          {/* TODO: Tambahkan route module baru di sini */}
          {/* <Route path="/my-module" element={<MyPage />} /> */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
