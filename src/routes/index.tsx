import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "../components";
import { is_authenticated, auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";
import { resolve_menu_role_from_akses, is_path_available_for_role } from "../layouts/components/sidebarItems";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const VendorPage = lazy(() => import("../pages/vendor/VendorPage"));
const KategoriPage = lazy(() => import("../pages/kategori/KategoriPage"));
const BarangPage = lazy(() => import("../pages/barang/BarangPage"));
const PengadaanPage = lazy(() => import("../pages/pengadaan/PengadaanPage"));
const ApprovalPage = lazy(() => import("../pages/approval/ApprovalPage"));
const UserPage = lazy(() => import("../pages/user/UserPage"));
const DokumenPage = lazy(() => import("../pages/dokumen/DokumenPage"));
const NotifikasiPage = lazy(() => import("../pages/notifikasi/NotifikasiPage"));
const AuditLogPage = lazy(() => import("../pages/auditlog/AuditLogPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

/** Redirect ke /login jika belum authenticated + cek role untuk path */
function ProtectedRoutes() {
  const location = useLocation();
  const authState = useSignalValue(auth_signal);

  if (!is_authenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Resolve role dari JWT akses
  const aksesLabel = authState?.selectedAuthorization?.akses;
  const role = resolve_menu_role_from_akses(aksesLabel);

  // Cek apakah path tersedia untuk role ini
  if (!is_path_available_for_role(location.pathname, role)) {
    return <Navigate to="/" replace />;
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
          <Route path="/login" element={<LoginPage appName="Pengadaan Minyak LEMIGAS" tagline="Sistem pengadaan minyak untuk LEMIGAS. Masuk untuk mengakses dashboard." />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<DashboardPage />} />

          {/* ── Master Data ──────────────────────────────── */}
          <Route path="/vendor" element={<VendorPage />} />
          <Route path="/kategori" element={<KategoriPage />} />
          <Route path="/barang" element={<BarangPage />} />

          {/* ── Pengadaan ────────────────────────────────── */}
          <Route path="/pengadaan" element={<PengadaanPage />} />
          <Route path="/approval" element={<ApprovalPage />} />

          {/* ── Sistem ───────────────────────────────────── */}
          <Route path="/pengguna" element={<UserPage />} />
          <Route path="/dokumen" element={<DokumenPage />} />
          <Route path="/notifikasi" element={<NotifikasiPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
