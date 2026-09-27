import { useMemo } from "react";
import { Box, Typography, Grid, Card, Divider } from "@mui/material";
import { AssignmentOutlined, CheckCircleOutline, PendingOutlined, CancelOutlined, StorefrontOutlined, Inventory2Outlined, PeopleOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts";
import { StatusChip } from "../../components";
import type { Column } from "../../components";
import { DataTable } from "../../components";

import use_query from "@Hooks/api-use-query";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalPengadaan?: number;
  byStatus?: Record<string, number>;
  totalVendor?: number;
  totalBarang?: number;
  totalUser?: number;
  recentPengadaan?: any[];
  pendingApproval?: number;
  [key: string]: any;
}

interface RecentPengadaan {
  id: string;
  nomorSurat: string;
  judul: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ label, value, sub, icon, color, onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": onClick ? { borderColor: color, boxShadow: `0 0 0 1px ${color}20` } : {},
      }}
    >
      <Box sx={{ width: 48, height: 48, borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.1 }}>{value}</Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", mt: 0.25 }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)", mt: 0.1 }}>{sub}</Typography>}
      </Box>
    </Card>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--foreground)", fontSize: "1rem" }}>
          {title}
        </Typography>
        {description && <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)", mt: 0.25 }}>{description}</Typography>}
      </Box>
      <Divider sx={{ borderColor: "var(--border)", mb: 2.5 }} />
      {children}
    </Box>
  );
}

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; variant: "success" | "neutral" | "danger" | "warning" | "info" }> = {
  draft: { label: "Draft", variant: "neutral" },
  diajukan: { label: "Diajukan", variant: "info" },
  dalam_review: { label: "Dalam Review", variant: "warning" },
  disetujui: { label: "Disetujui", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
  revisi: { label: "Revisi", variant: "warning" },
  sedang_proses: { label: "Sedang Proses", variant: "info" },
  selesai: { label: "Selesai", variant: "success" },
  dibatalkan: { label: "Dibatalkan", variant: "danger" },
};

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();

  // ── Dashboard stats from API ─────────────────────────────────────────────
  const { response: statsRes } = use_query({
    api_tag: "dashboard",
    api_method: "dashboardGetControllerGetStats",
    api_query: [{}],
  });

  const stats = useMemo<DashboardStats>(() => {
    const raw = statsRes as any;
    return raw?.data?.data ?? raw?.data ?? raw ?? {};
  }, [statsRes]);

  const pengadaanStats = stats.pengadaan || {};
  const masterStats = stats.master || {};
  const byStatus = pengadaanStats; // pengadaan object has draft, diajukan, disetujui, ditolak etc.

  // Use recent_pengadaan from dashboard stats instead of separate query
  const recentPengadaan = useMemo<RecentPengadaan[]>(() => {
    return (stats.recent_pengadaan || []) as RecentPengadaan[];
  }, [stats]);

  // ── Recent columns ───────────────────────────────────────────────────────
  const recentColumns: Column<RecentPengadaan>[] = [
    {
      id: "nomorSurat",
      label: "Nomor",
      width: "25%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", fontWeight: 600 }}>{row.nomorSurat}</Typography>,
    },
    {
      id: "judul",
      label: "Judul",
      width: "35%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{row.judul}</Typography>,
    },
    {
      id: "status",
      label: "Status",
      width: "20%",
      render: (_, row) => {
        const s = STATUS_MAP[row.status] || { label: row.status, variant: "neutral" as const };
        return <StatusChip label={s.label} variant={s.variant} />;
      },
    },
    {
      id: "createdAt",
      label: "Tanggal",
      width: "20%",
      render: (_, row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</Typography>
      ),
    },
  ];

  return (
    <DashboardLayout sectionTitle="Overview" title="Dashboard">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Total Pengadaan" value={pengadaanStats.total ?? 0} sub="Semua pengadaan" icon={<AssignmentOutlined />} color="#2563eb" onClick={() => navigate("/pengadaan")} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Disetujui" value={byStatus.disetujui ?? 0} sub="Pengadaan selesai" icon={<CheckCircleOutline />} color="#16a34a" onClick={() => navigate("/pengadaan")} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Menunggu" value={stats.approval_pending ?? 0} sub="Perlu approval" icon={<PendingOutlined />} color="#d97706" onClick={() => navigate("/approval")} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Ditolak" value={byStatus.ditolak ?? 0} sub="Pengadaan ditolak" icon={<CancelOutlined />} color="#dc2626" onClick={() => navigate("/pengadaan")} />
          </Grid>
        </Grid>

        {/* ── Master Data Stats ─────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 4 }}>
            <StatCard label="Vendor" value={masterStats.vendor_aktif ?? 0} icon={<StorefrontOutlined />} color="#7c3aed" onClick={() => navigate("/vendor")} />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <StatCard label="Barang" value={masterStats.total_barang ?? 0} icon={<Inventory2Outlined />} color="#0891b2" onClick={() => navigate("/barang")} />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <StatCard label="Pengguna" value={masterStats.user_aktif ?? 0} icon={<PeopleOutlined />} color="#059669" onClick={() => navigate("/pengguna")} />
          </Grid>
        </Grid>

        {/* ── Recent Pengadaan ──────────────────────────────────────────── */}
        <Section title="Pengadaan Terbaru" description="5 pengadaan terakhir yang dibuat.">
          <DataTable columns={recentColumns} data={recentPengadaan} searchPlaceholder="Cari..." rowsPerPageOptions={[5]} />
        </Section>
      </Box>
    </DashboardLayout>
  );
}

export default DashboardPage;
