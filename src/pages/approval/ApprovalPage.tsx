import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, Grid, Card, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { CheckCircleOutline, CancelOutlined, GradingOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, Modal, StatusChip, SoftButton, ActionButton, ActionButtonGroup } from "../../components";
import type { Column, ModalSection } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApprovalStep {
  id: string;
  urutan: number;
  namaLangkah: string;
  status: string;
  catatan?: string;
  createdAt?: string;
}

interface Pengadaan {
  id: string;
  nomorSurat: string;
  judul: string;
  status: string;
  prioritas: string;
  totalEstimasi?: number;
  approvalSteps?: ApprovalStep[];
  createdAt?: string;
  [key: string]: any;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; variant: "success" | "neutral" | "danger" | "warning" | "info" }> = {
  draft: { label: "Draft", variant: "neutral" },
  diajukan: { label: "Diajukan", variant: "info" },
  dalam_review: { label: "Dalam Review", variant: "warning" },
  disetujui: { label: "Disetujui", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
  revisi: { label: "Revisi", variant: "warning" },
};

const STEP_STATUS: Record<string, { variant: "success" | "warning" | "danger" | "info" }> = {
  menunggu: { variant: "warning" },
  disetujui: { variant: "success" },
  ditolak: { variant: "danger" },
  revisi: { variant: "info" },
};

const TAB_OPTIONS = [
  { value: "pending", label: "Menunggu Approval" },
  { value: "my", label: "Pengajuan Saya" },
];

function formatRupiah(val?: number) {
  if (!val) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

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

// ─── Page ────────────────────────────────────────────────────────────────────

export function ApprovalPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("pending");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Pengadaan | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState<"approve" | "reject">("approve");
  const [decisionKomentar, setDecisionKomentar] = useState("");

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
    }),
    [search, page, rowsPerPage],
  );

  const apiTag = activeTab === "pending" ? "approval" : "approval";
  const apiMethod = activeTab === "pending" ? "approvalGetControllerFindAll" : "approvalGetControllerFindMyPengadaan";

  const { response, is_loading, call_back } = use_query({
    api_tag: apiTag,
    api_method: apiMethod,
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Pengadaan>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const processDecision = use_mutation({
    api_tag: "approval",
    api_method: "approvalActionControllerDecide",
    options: {
      call_back: () => {
        call_back();
        setDecisionOpen(false);
      },
      success_message_text: "Keputusan approval berhasil diproses!",
    },
  });

  const handleApprove = useCallback((pengadaan: Pengadaan) => {
    setSelected(pengadaan);
    setDecisionAction("approve");
    setDecisionKomentar("");
    setDecisionOpen(true);
  }, []);

  const handleReject = useCallback((pengadaan: Pengadaan) => {
    setSelected(pengadaan);
    setDecisionAction("reject");
    setDecisionKomentar("");
    setDecisionOpen(true);
  }, []);

  const submitDecision = useCallback(() => {
    if (!selected) return;
    // Find the first pending step
    const pendingStep = selected.approvalSteps?.find((s) => s.status === "menunggu");
    if (!pendingStep) return;
    processDecision([selected.id, pendingStep.id, { decision: decisionAction === "approve" ? "disetujui" : "ditolak", catatan: decisionKomentar || undefined }]);
  }, [selected, decisionAction, decisionKomentar, processDecision]);

  const columns: Column<Pengadaan>[] = [
    {
      id: "nomorSurat",
      label: "Nomor Surat",
      width: "18%",
      render: (_, row) => (
        <Box>
          <Typography sx={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nomorSurat}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{row.prioritas}</Typography>
        </Box>
      ),
    },
    {
      id: "judul",
      label: "Judul",
      width: "25%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--foreground)" }}>{row.judul}</Typography>,
    },
    {
      id: "status",
      label: "Status",
      width: "14%",
      render: (_, row) => {
        const s = STATUS_MAP[row.status] || { label: row.status, variant: "neutral" as const };
        return <StatusChip label={s.label} variant={s.variant} />;
      },
    },
    {
      id: "totalEstimasi",
      label: "Total Estimasi",
      width: "15%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", fontWeight: 500 }}>{formatRupiah(row.totalEstimasi)}</Typography>,
    },
    {
      id: "id",
      label: "Aksi",
      align: "center",
      width: "18%",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            variant="view"
            title="Lihat Detail"
            icon={<GradingOutlined fontSize="small" />}
            onClick={() => {
              setSelected(row);
              setDetailOpen(true);
            }}
          />
          {activeTab === "pending" && row.status === "diajukan" && (
            <>
              <ActionButton variant="approve" title="Setujui" icon={<CheckCircleOutline fontSize="small" />} onClick={() => handleApprove(row)} />
              <ActionButton variant="reject" title="Tolak" icon={<CancelOutlined fontSize="small" />} onClick={() => handleReject(row)} />
            </>
          )}
        </ActionButtonGroup>
      ),
    },
  ];

  const detailSections: ModalSection[] = selected
    ? [
        {
          title: "Informasi Pengadaan",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
              {[
                ["Nomor Surat", selected.nomorSurat],
                ["Judul", selected.judul],
                ["Status", STATUS_MAP[selected.status]?.label || selected.status],
                ["Prioritas", selected.prioritas],
                ["Total Estimasi", formatRupiah(selected.totalEstimasi)],
              ].map(([k, v]) => (
                <Box key={k}>
                  <Typography sx={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{k}</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{v || "-"}</Typography>
                </Box>
              ))}
            </Box>
          ),
        },
        ...(selected.approvalSteps?.length
          ? [
              {
                title: "Langkah Approval",
                content: (
                  <Box sx={{ mt: 1, overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Step</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Nama</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Catatan</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selected.approvalSteps!.map((step) => (
                          <TableRow key={step.id}>
                            <TableCell sx={{ fontSize: "0.825rem" }}>{step.urutan}</TableCell>
                            <TableCell sx={{ fontSize: "0.825rem" }}>{step.namaLangkah}</TableCell>
                            <TableCell>
                              <StatusChip label={step.status} variant={STEP_STATUS[step.status]?.variant || "info"} size="small" />
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{step.catatan || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ),
              },
            ]
          : []),
      ]
    : [];

  return (
    <DashboardLayout sectionTitle="Pengadaan" title="Approval">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Pengajuan" value={totalRows} icon={<GradingOutlined />} color="#7c3aed" />
          </Grid>
        </Grid>

        {/* Tab Switcher */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {TAB_OPTIONS.map((tab) => (
            <SoftButton
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(0);
                setSearch("");
              }}
              variant={activeTab === tab.value ? "contained" : "text"}
              size="small"
            >
              {tab.label}
            </SoftButton>
          ))}
        </Box>

        <ServerDataTable
          columns={columns}
          data={data}
          title={activeTab === "pending" ? "Menunggu Approval" : "Pengajuan Saya"}
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari pengadaan..."
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
          emptyStateLabel={activeTab === "pending" ? "Tidak ada pengadaan menunggu approval" : "Tidak ada pengajuan"}
        />
      </Box>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detail — ${selected?.nomorSurat || ""}`}
        maxWidth={680}
        sections={detailSections}
        actions={[{ label: "Tutup", onClick: () => setDetailOpen(false), variant: "ghost" }]}
      />

      {/* Decision Modal */}
      <Modal
        open={decisionOpen}
        onClose={() => setDecisionOpen(false)}
        title={decisionAction === "approve" ? "Setujui Pengadaan" : "Tolak Pengadaan"}
        maxWidth={480}
        sections={[
          {
            content: (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", mb: 2 }}>{decisionAction === "approve" ? `Setujui pengadaan "${selected?.nomorSurat}"?` : `Tolak pengadaan "${selected?.nomorSurat}"?`}</Typography>
                <TextField label="Komentar" value={decisionKomentar} onChange={(e) => setDecisionKomentar(e.target.value)} size="small" fullWidth multiline rows={3} placeholder="Opsional..." />
              </Box>
            ),
          },
        ]}
        actions={[
          { label: "Batal", onClick: () => setDecisionOpen(false), variant: "ghost" },
          { label: decisionAction === "approve" ? "Ya, Setujui" : "Ya, Tolak", onClick: submitDecision, variant: decisionAction === "approve" ? "primary" : "secondary" },
        ]}
      />
    </DashboardLayout>
  );
}

export default ApprovalPage;
