import { useState, useMemo } from "react";
import { Box, Typography, Chip, Card, Grid } from "@mui/material";
import { HistoryOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable } from "../../components";
import type { Column } from "../../components";

import use_query from "@Hooks/api-use-query";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string;
  tabel: string;
  recordId: string;
  aksi: string;
  dataSebelum?: any;
  dataSesudah?: any;
  userId?: string;
  createdAt: string;
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

const ACTION_COLORS: Record<string, "success" | "warning" | "error" | "info"> = {
  CREATE: "success",
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "error",
  READ: "info",
  create: "success",
  insert: "success",
  update: "warning",
  delete: "error",
  read: "info",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const queryParams = useMemo(() => ({}), []);

  const { response, is_loading } = use_query({
    api_tag: "auditLog",
    api_method: "auditLogGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<AuditLog>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const columns: Column<AuditLog>[] = [
    {
      id: "createdAt",
      label: "Waktu",
      width: "16%",
      render: (_, row) => <Typography sx={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{formatDate(row.createdAt)}</Typography>,
    },
    {
      id: "tabel",
      label: "Tabel",
      width: "14%",
      render: (_, row) => <Chip label={row.tabel} size="small" sx={{ fontSize: "0.72rem", fontWeight: 600 }} />,
    },
    {
      id: "aksi",
      label: "Aksi",
      width: "12%",
      render: (_, row) => <Chip label={row.aksi} size="small" color={ACTION_COLORS[row.aksi?.toUpperCase()] || ACTION_COLORS[row.aksi] || "default"} variant="outlined" sx={{ fontSize: "0.72rem", fontWeight: 600 }} />,
    },
    {
      id: "recordId",
      label: "Record ID",
      width: "16%",
      render: (_, row) => <Typography sx={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--muted-foreground)" }}>{row.recordId?.substring(0, 8)}...</Typography>,
    },
    {
      id: "dataSebelum",
      label: "Data Sebelum",
      width: "20%",
      render: (_, row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontFamily: "monospace", wordBreak: "break-all" }}>{row.dataSebelum ? JSON.stringify(row.dataSebelum).substring(0, 60) + "..." : "-"}</Typography>
      ),
    },
    {
      id: "dataSesudah",
      label: "Data Sesudah",
      width: "20%",
      render: (_, row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontFamily: "monospace", wordBreak: "break-all" }}>{row.dataSesudah ? JSON.stringify(row.dataSesudah).substring(0, 60) + "..." : "-"}</Typography>
      ),
    },
  ];

  return (
    <DashboardLayout sectionTitle="Sistem" title="Audit Log">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Log" value={totalRows} icon={<HistoryOutlined />} color="#6b7280" />
          </Grid>
        </Grid>

        <ServerDataTable
          columns={columns}
          data={data}
          title="Riwayat Audit Log"
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
          emptyStateLabel="Tidak ada data audit log"
          compact={false}
        />
      </Box>
    </DashboardLayout>
  );
}

export default AuditLogPage;
