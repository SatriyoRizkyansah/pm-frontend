import React from "react";
import {
  DashboardOutlined as DashboardIcon,
  StorefrontOutlined as VendorIcon,
  CategoryOutlined as KategoriIcon,
  Inventory2Outlined as BarangIcon,
  AssignmentOutlined as PengadaanIcon,
  GradingOutlined as ApprovalIcon,
  FolderOutlined as DokumenIcon,
  PeopleOutlined as PeopleIcon,
  NotificationsOutlined as NotifIcon,
  ShieldOutlined as AuditLogIcon,
} from "@mui/icons-material";

export interface NavItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
  href?: () => string | Promise<string>;
}

export type MenuRole = "admin" | "operator" | "verifikator" | "pimpinan" | string;

export interface SidebarSection {
  key: string;
  title: string;
  abbreviation: string;
  items: NavItem[];
}

// ─── Resolve role dari akses JWT ──────────────────────────────────────────────
export const resolve_menu_role_from_akses = (aksesLabel?: string): MenuRole => {
  const label = (aksesLabel ?? "").toLowerCase();
  if (label.includes("admin")) return "admin";
  if (label.includes("operator")) return "operator";
  if (label.includes("verifikator")) return "verifikator";
  if (label.includes("pimpinan")) return "pimpinan";
  return "user";
};

// ─── Home path per role ───────────────────────────────────────────────────────
export const get_role_home_path = (_role: MenuRole): string => {
  return "/";
};

// ─── Nav Items ────────────────────────────────────────────────────────────────

const overviewItems: NavItem[] = [
  { title: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/" },
  { title: "Notifikasi", icon: <NotifIcon fontSize="small" />, path: "/notifikasi" },
];

const masterDataItems: NavItem[] = [
  { title: "Vendor", icon: <VendorIcon fontSize="small" />, path: "/vendor" },
  { title: "Kategori", icon: <KategoriIcon fontSize="small" />, path: "/kategori" },
  { title: "Barang", icon: <BarangIcon fontSize="small" />, path: "/barang" },
];

const pengadaanItems: NavItem[] = [
  { title: "Pengadaan", icon: <PengadaanIcon fontSize="small" />, path: "/pengadaan" },
  { title: "Approval", icon: <ApprovalIcon fontSize="small" />, path: "/approval" },
  { title: "Dokumen", icon: <DokumenIcon fontSize="small" />, path: "/dokumen" },
];

const systemItems: NavItem[] = [
  { title: "Pengguna", icon: <PeopleIcon fontSize="small" />, path: "/pengguna" },
  { title: "Audit Log", icon: <AuditLogIcon fontSize="small" />, path: "/audit-log" },
];

// ─── Section konfigurasi per role ─────────────────────────────────────────────

const adminSections: SidebarSection[] = [
  { key: "overview", title: "Overview", abbreviation: "OV", items: overviewItems },
  { key: "master", title: "Data Master", abbreviation: "DM", items: masterDataItems },
  { key: "pengadaan", title: "Pengadaan", abbreviation: "PG", items: pengadaanItems },
  { key: "system", title: "Sistem", abbreviation: "SY", items: systemItems },
];

const operatorSections: SidebarSection[] = [
  { key: "overview", title: "Overview", abbreviation: "OV", items: overviewItems },
  { key: "master", title: "Data Master", abbreviation: "DM", items: masterDataItems },
  { key: "pengadaan", title: "Pengadaan", abbreviation: "PG", items: [pengadaanItems[0], pengadaanItems[2]] },
];

const verifikatorSections: SidebarSection[] = [
  { key: "overview", title: "Overview", abbreviation: "OV", items: overviewItems },
  { key: "pengadaan", title: "Pengadaan", abbreviation: "PG", items: [pengadaanItems[0], pengadaanItems[1]] },
];

const pimpinanSections: SidebarSection[] = [
  { key: "overview", title: "Overview", abbreviation: "OV", items: overviewItems },
  { key: "pengadaan", title: "Pengadaan", abbreviation: "PG", items: [pengadaanItems[1]] },
];

const defaultSections: SidebarSection[] = [
  { key: "overview", title: "Overview", abbreviation: "OV", items: overviewItems },
  { key: "pengadaan", title: "Pengadaan", abbreviation: "PG", items: [pengadaanItems[0], pengadaanItems[2]] },
];

// ─── Exported helpers ─────────────────────────────────────────────────────────

export const get_sidebar_sections = (role: MenuRole): SidebarSection[] => {
  switch (role) {
    case "admin":
      return adminSections;
    case "operator":
      return operatorSections;
    case "verifikator":
      return verifikatorSections;
    case "pimpinan":
      return pimpinanSections;
    default:
      return defaultSections;
  }
};

export const get_available_paths_for_role = (role: MenuRole): string[] => {
  const paths: string[] = [];
  get_sidebar_sections(role).forEach((s) => s.items.forEach((i) => paths.push(i.path)));
  return paths;
};

export const is_path_available_for_role = (path: string, role: MenuRole): boolean => {
  return get_available_paths_for_role(role).includes(path);
};
