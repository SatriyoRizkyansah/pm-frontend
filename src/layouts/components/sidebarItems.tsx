import React from "react";
import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  BarChartOutlined as BarChartIcon,
  SettingsOutlined as SettingsIcon,
  FolderOutlined as FolderIcon,
  AssignmentOutlined as AssignmentIcon,
  NotificationsOutlined as NotifIcon,
  ShieldOutlined as ShieldIcon,
  ReceiptOutlined as ReceiptIcon,
  CalendarMonthOutlined as CalendarIcon,
  SupportAgentOutlined as SupportIcon,
  ArticleOutlined as ArticleIcon,
  AccountBoxOutlined as AccountBoxIcon,
  LockOutlined as LockIcon,
} from "@mui/icons-material";

export interface NavItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
  href?: () => string | Promise<string>;
}

export type MenuRole = "admin" | "user" | "default" | string;

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
  if (label.includes("manager")) return "manager";
  // TODO: Tambahkan role lain sesuai kebutuhan
  return "user";
};

// ─── Home path per role ───────────────────────────────────────────────────────
export const get_role_home_path = (_role: MenuRole): string => {
  return "/";
};

// ─── Nav Items ────────────────────────────────────────────────────────────────

const overviewItems: NavItem[] = [
  { title: "Dashboard",    icon: <DashboardIcon fontSize="small" />, path: "/" },
  { title: "Kalender",     icon: <CalendarIcon  fontSize="small" />, path: "/kalender" },
  { title: "Notifikasi",   icon: <NotifIcon     fontSize="small" />, path: "/notifikasi", badge: 3 },
];

const dataItems: NavItem[] = [
  { title: "Pengguna",     icon: <PeopleIcon    fontSize="small" />, path: "/pengguna" },
  { title: "Dokumen",      icon: <FolderIcon    fontSize="small" />, path: "/dokumen" },
  { title: "Laporan",      icon: <AssignmentIcon fontSize="small" />, path: "/laporan" },
  { title: "Artikel",      icon: <ArticleIcon   fontSize="small" />, path: "/artikel" },
];

const analyticsItems: NavItem[] = [
  { title: "Statistik",    icon: <BarChartIcon  fontSize="small" />, path: "/statistik" },
  { title: "Keuangan",     icon: <ReceiptIcon   fontSize="small" />, path: "/keuangan" },
];

const systemItems: NavItem[] = [
  { title: "Profil",       icon: <AccountBoxIcon fontSize="small" />, path: "/profil" },
  { title: "Keamanan",     icon: <ShieldIcon    fontSize="small" />, path: "/keamanan" },
  { title: "Akses & Hak",  icon: <LockIcon      fontSize="small" />, path: "/akses" },
  { title: "Pengaturan",   icon: <SettingsIcon  fontSize="small" />, path: "/pengaturan" },
  { title: "Bantuan",      icon: <SupportIcon   fontSize="small" />, path: "/bantuan" },
];

// ─── Section konfigurasi per role ─────────────────────────────────────────────

const adminSections: SidebarSection[] = [
  { key: "overview", title: "Overview",   abbreviation: "OV", items: overviewItems },
  { key: "data",     title: "Manajemen",  abbreviation: "MN", items: dataItems },
  { key: "analytics",title: "Analitik",   abbreviation: "AN", items: analyticsItems },
  { key: "system",   title: "Sistem",     abbreviation: "SY", items: systemItems },
];

const userSections: SidebarSection[] = [
  { key: "overview", title: "Overview",   abbreviation: "OV", items: overviewItems },
  { key: "data",     title: "Konten",     abbreviation: "KN", items: [dataItems[0], dataItems[2]] },
  { key: "system",   title: "Akun",       abbreviation: "AK", items: [systemItems[0], systemItems[4]] },
];

// ─── Exported helpers ─────────────────────────────────────────────────────────

export const get_sidebar_sections = (role: MenuRole): SidebarSection[] => {
  if (role === "admin" || role === "manager") return adminSections;
  return userSections;
};

export const get_available_paths_for_role = (role: MenuRole): string[] => {
  const paths: string[] = [];
  get_sidebar_sections(role).forEach((s) => s.items.forEach((i) => paths.push(i.path)));
  return paths;
};

export const is_path_available_for_role = (path: string, role: MenuRole): boolean => {
  return get_available_paths_for_role(role).includes(path);
};
