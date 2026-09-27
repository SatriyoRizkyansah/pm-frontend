import { useState, useMemo } from "react";
import { Box, Typography, Grid, Card, IconButton, Tooltip, Chip } from "@mui/material";
import { MarkEmailReadOutlined, NotificationsNoneOutlined, RefreshOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, SoftButton } from "../../components";
import type { Column } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notifikasi {
  id: string;
  pesan: string;
  referensiTabel?: string;
  sudahDibaca: boolean;
  tanggalKirim: string;
  [key: string]: any;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card sx={{ p: 2.5, borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", backgroundColor: "var(--card)", display: "flex", alignItems: "center", gap: 2 }}>
      <Box sx={{ width: 48, height: 48, borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.1 }}>{value}</Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", mt: 0.25 }}>{label}</Typography>
      </Box>
    </Card>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function NotifikasiPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const queryParams = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
    }),
    [page, rowsPerPage],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "notifikasi",
    api_method: "notifikasiGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Notifikasi>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;
  const unreadCount = useMemo(() => data.filter((n) => !n.sudahDibaca).length, [data]);

  const markAsRead = use_mutation({
    api_tag: "notifikasi",
    api_method: "notifikasiPutControllerMarkAsRead",
    options: { call_back: () => call_back() },
  });

  const markAllAsRead = use_mutation({
    api_tag: "notifikasi",
    api_method: "notifikasiPutControllerMarkAllAsRead",
    options: { call_back: () => call_back(), success_message_text: "Semua notifikasi ditandai sudah dibaca!" },
  });

  const columns: Column<Notifikasi>[] = [
    {
      id: "pesan",
      label: "Notifikasi",
      width: "100%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, opacity: row.sudahDibaca ? 0.6 : 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: row.sudahDibaca ? "var(--muted-foreground)" : "var(--primary)", flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: row.sudahDibaca ? 400 : 600, color: "var(--foreground)" }}>{row.pesan}</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              {row.referensiTabel && <Chip label={row.referensiTabel} size="small" sx={{ fontSize: "0.65rem", height: 20 }} />}
              <Typography sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{formatDate(row.tanggalKirim)}</Typography>
            </Box>
          </Box>
          {!row.sudahDibaca && (
            <Tooltip title="Tandai sudah dibaca">
              <IconButton size="small" onClick={() => markAsRead([row.id])}>
                <MarkEmailReadOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout sectionTitle="Overview" title="Notifikasi">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Notifikasi" value={totalRows} icon={<NotificationsNoneOutlined />} color="#2563eb" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Belum Dibaca" value={unreadCount} icon={<MarkEmailReadOutlined />} color="#dc2626" />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
          <SoftButton startIcon={<MarkEmailReadOutlined />} onClick={() => markAllAsRead([])} variant="text" size="small">
            Tandai Semua Dibaca
          </SoftButton>
          <SoftButton startIcon={<RefreshOutlined />} onClick={() => call_back()} variant="text" size="small">
            Refresh
          </SoftButton>
        </Box>

        <ServerDataTable
          columns={columns}
          data={data}
          title="Daftar Notifikasi"
          searchValue=""
          onSearchChange={() => {}}
          isLoading={is_loading}
          totalRows={totalRows}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          emptyStateLabel="Tidak ada notifikasi"
          compact={false}
        />
      </Box>
    </DashboardLayout>
  );
}

export default NotifikasiPage;
