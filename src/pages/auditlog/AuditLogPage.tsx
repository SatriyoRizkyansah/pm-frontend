import React, { useState, useMemo, useCallback } from "react";
import { Box, Typography, Chip, Card, Grid, TextField, InputAdornment, IconButton, Button, ToggleButtonGroup, ToggleButton, Tooltip, Table, TableHead, TableBody, TableRow, TableCell, Paper, Tabs, Tab, Collapse, Alert } from "@mui/material";
import {
  HistoryOutlined,
  Timeline,
  TableChartOutlined,
  SearchOutlined,
  RefreshOutlined,
  ContentCopyOutlined,
  CheckOutlined,
  ArrowForwardRounded,
  AddCircleOutline,
  EditNoteOutlined,
  DeleteOutline,
  VisibilityOutlined,
  BusinessOutlined,
  AssignmentOutlined,
  FactCheckOutlined,
  PersonOutlined,
  DescriptionOutlined,
  CategoryOutlined,
  AltRouteOutlined,
  LayersOutlined,
  CloseRounded,
  Inventory2Outlined,
  NotificationsOutlined,
} from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { Modal, SoftButton, TableSkeleton } from "../../components";
import type { ModalSection } from "../../components";
import { UserAvatar } from "../../components/avatar/UserAvatar";

import use_query from "@Hooks/api-use-query";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface AuditUser {
  id: string;
  nama: string;
  email: string;
  unitKerja?: string;
}

interface AuditLog {
  id: string;
  tabel: string;
  recordId: string;
  aksi: string;
  dilakukanOleh?: string;
  dataSebelum?: Record<string, any> | null;
  dataSesudah?: Record<string, any> | null;
  createdAt: string;
  dilakukanOlehUser?: AuditUser | null;
  [key: string]: any;
}

interface DiffItem {
  key: string;
  before: any;
  after: any;
  type: "added" | "modified" | "removed" | "unchanged";
}

// ─── Config & Formatters ─────────────────────────────────────────────────────

const MODULE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pengadaan: {
    label: "Pengadaan",
    icon: <AssignmentOutlined fontSize="small" />,
    color: "#2563eb",
    bg: "rgba(37, 99, 235, 0.12)",
  },
  pengadaanItem: {
    label: "Item Pengadaan",
    icon: <Inventory2Outlined fontSize="small" />,
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
  },
  approval: {
    label: "Approval",
    icon: <FactCheckOutlined fontSize="small" />,
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.12)",
  },
  approvalWorkflow: {
    label: "Alur Approval",
    icon: <AltRouteOutlined fontSize="small" />,
    color: "#9333ea",
    bg: "rgba(147, 51, 234, 0.12)",
  },
  vendor: {
    label: "Vendor Rekanan",
    icon: <BusinessOutlined fontSize="small" />,
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.12)",
  },
  barang: {
    label: "Katalog Barang",
    icon: <CategoryOutlined fontSize="small" />,
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.12)",
  },
  kategoriPengadaan: {
    label: "Kategori Pengadaan",
    icon: <CategoryOutlined fontSize="small" />,
    color: "#ea580c",
    bg: "rgba(234, 88, 12, 0.12)",
  },
  user: {
    label: "Pengguna & Akun",
    icon: <PersonOutlined fontSize="small" />,
    color: "#0891b2",
    bg: "rgba(8, 145, 178, 0.12)",
  },
  dokumen: {
    label: "Dokumen",
    icon: <DescriptionOutlined fontSize="small" />,
    color: "#4f46e5",
    bg: "rgba(79, 70, 229, 0.12)",
  },
  notifikasi: {
    label: "Notifikasi",
    icon: <NotificationsOutlined fontSize="small" />,
    color: "#e11d48",
    bg: "rgba(225, 29, 72, 0.12)",
  },
};

const ACTION_CONFIG: Record<string, { label: string; title: string; color: string; bg: string; icon: React.ReactNode }> = {
  create: {
    label: "CREATE",
    title: "Data Dibuat",
    color: "#16a34a",
    bg: "rgba(22, 163, 74, 0.12)",
    icon: <AddCircleOutline fontSize="small" />,
  },
  update: {
    label: "UPDATE",
    title: "Perubahan / Transisi Alur",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    icon: <EditNoteOutlined fontSize="small" />,
  },
  delete: {
    label: "DELETE",
    title: "Data Dihapus",
    color: "#dc2626",
    bg: "rgba(220, 38, 38, 0.12)",
    icon: <DeleteOutline fontSize="small" />,
  },
  read: {
    label: "READ",
    title: "Akses Data",
    color: "#2563eb",
    bg: "rgba(37, 99, 235, 0.12)",
    icon: <VisibilityOutlined fontSize="small" />,
  },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft / Konsep", color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)" },
  diajukan: { label: "Diajukan", color: "#2563eb", bg: "rgba(37, 99, 235, 0.15)" },
  dalam_review: { label: "Dalam Review", color: "#d97706", bg: "rgba(217, 119, 6, 0.15)" },
  disetujui: { label: "Disetujui", color: "#16a34a", bg: "rgba(22, 163, 74, 0.15)" },
  ditolak: { label: "Ditolak", color: "#dc2626", bg: "rgba(220, 38, 38, 0.15)" },
  revisi: { label: "Perlu Revisi", color: "#ea580c", bg: "rgba(234, 88, 12, 0.15)" },
  sedang_proses: { label: "Sedang Proses", color: "#0891b2", bg: "rgba(8, 145, 178, 0.15)" },
  selesai: { label: "Selesai", color: "#059669", bg: "rgba(5, 150, 105, 0.15)" },
  dibatalkan: { label: "Dibatalkan", color: "#991b1b", bg: "rgba(153, 27, 27, 0.15)" },
  aktif: { label: "Aktif", color: "#16a34a", bg: "rgba(22, 163, 74, 0.15)" },
  nonaktif: { label: "Nonaktif", color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)" },
  menunggu: { label: "Menunggu", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
};

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "-";
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function computeDiff(before: any, after: any): DiffItem[] {
  const b = before && typeof before === "object" ? before : {};
  const a = after && typeof after === "object" ? after : {};
  const allKeys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));

  return allKeys.map((key) => {
    const hasBefore = key in b;
    const hasAfter = key in a;
    const valB = b[key];
    const valA = a[key];

    let type: DiffItem["type"] = "unchanged";
    if (!hasBefore && hasAfter) type = "added";
    else if (hasBefore && !hasAfter) type = "removed";
    else if (JSON.stringify(valB) !== JSON.stringify(valA)) type = "modified";

    return { key, before: valB, after: valA, type };
  });
}

function formatJsonValue(val: any): string {
  if (val === undefined) return "—";
  if (val === null) return "null";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

// StatCard component removed – it was unused.

// ─── Status Transition Badge ─────────────────────────────────────────────────

function StatusTransitionFlow({ before, after }: { before?: string | null; after?: string | null }) {
  if (!before && !after) return null;

  const bConfig = before ? STATUS_LABELS[before.toLowerCase()] || { label: before, color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)" } : null;
  const aConfig = after ? STATUS_LABELS[after.toLowerCase()] || { label: after, color: "#16a34a", bg: "rgba(22, 163, 74, 0.15)" } : null;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: "var(--radius)",
        backgroundColor: "var(--secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)" }}>Alur Status:</Typography>

      {bConfig ? (
        <Chip
          size="small"
          label={bConfig.label}
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: bConfig.color,
            backgroundColor: bConfig.bg,
            border: `1px solid ${bConfig.color}40`,
            height: 22,
          }}
        />
      ) : (
        <Chip size="small" label="Awal (Baru)" sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)", height: 22 }} />
      )}

      <ArrowForwardRounded sx={{ fontSize: 16, color: "var(--muted-foreground)" }} />

      {aConfig ? (
        <Chip
          size="small"
          label={aConfig.label}
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: aConfig.color,
            backgroundColor: aConfig.bg,
            border: `1px solid ${aConfig.color}`,
            height: 22,
          }}
        />
      ) : (
        <Chip size="small" label="—" sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)", height: 22 }} />
      )}
    </Box>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [actionFilter, setActionFilter] = useState("__all");
  const [moduleFilter, setModuleFilter] = useState("__all");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);
  const [activeDiffTab, setActiveDiffTab] = useState(0);

  // ── Query Parameters ───────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, any> = {
      page: page + 1,
      limit: rowsPerPage,
    };
    if (search.trim()) p.query = search.trim();
    if (actionFilter !== "__all") p.aksi = actionFilter;
    if (moduleFilter !== "__all") p.tabel = moduleFilter;
    if (selectedRecordId) p.recordId = selectedRecordId;
    return p;
  }, [page, rowsPerPage, search, actionFilter, moduleFilter, selectedRecordId]);

  const { response, is_loading, call_back } = use_query({
    api_tag: "auditLog",
    api_method: "auditLogGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: rawData, pagination } = useMemo(() => extract_payload_with_pagination<AuditLog>(response), [response]);

  const data: AuditLog[] = Array.isArray(rawData) ? rawData : [];
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  // ── Copy Helper ────────────────────────────────────────────────────────────
  const handleCopyRecordId = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedRecordId(id);
      setTimeout(() => setCopiedRecordId(null), 2000);
    }
  }, []);

  const handleOpenDetail = useCallback((log: AuditLog) => {
    setSelectedLog(log);
    setActiveDiffTab(0);
    setDiffModalOpen(true);
  }, []);

  const handleFilterRecord = useCallback((recordId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedRecordId(recordId);
    setPage(0);
    setDiffModalOpen(false);
  }, []);

  const handleClearRecordFilter = useCallback(() => {
    setSelectedRecordId(null);
    setPage(0);
  }, []);

  // ── Computed Diff for Selected Log ─────────────────────────────────────────
  const selectedDiff = useMemo(() => {
    if (!selectedLog) return [];
    return computeDiff(selectedLog.dataSebelum, selectedLog.dataSesudah);
  }, [selectedLog]);

  // Check if status changed in selected log
  const statusTransition = useMemo(() => {
    if (!selectedLog) return null;
    const b = selectedLog.dataSebelum?.status;
    const a = selectedLog.dataSesudah?.status;
    if (b || a) {
      return { before: b, after: a };
    }
    return null;
  }, [selectedLog]);

  // ── Sections for Detail Modal ──────────────────────────────────────────────
  const modalSections: ModalSection[] = useMemo(() => {
    if (!selectedLog) return [];

    const actor = selectedLog.dilakukanOlehUser;
    const aKey = (selectedLog.aksi || "").toLowerCase();
    const actionMeta = ACTION_CONFIG[aKey] || ACTION_CONFIG.update;
    const modMeta = MODULE_CONFIG[selectedLog.tabel] || {
      label: selectedLog.tabel,
      icon: <LayersOutlined fontSize="small" />,
      color: "#6b7280",
      bg: "rgba(107, 114, 128, 0.12)",
    };

    return [
      {
        title: "Informasi Eksekusi & Pelaku",
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "var(--radius)",
                backgroundColor: "var(--secondary)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <UserAvatar name={actor?.nama || "Sistem"} id={actor?.id} size="medium" showName={false} showId={false} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--foreground)" }}>{actor?.nama || "Sistem Otomatis"}</Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                    {actor?.email || "internal@lemigas.esdm.go.id"}
                    {actor?.unitKerja ? ` • ${actor.unitKerja}` : ""}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  icon={modMeta.icon as React.ReactElement}
                  label={modMeta.label}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: modMeta.color,
                    backgroundColor: modMeta.bg,
                    border: `1px solid ${modMeta.color}30`,
                  }}
                />
                <Chip
                  icon={actionMeta.icon as React.ReactElement}
                  label={actionMeta.label}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: actionMeta.color,
                    backgroundColor: actionMeta.bg,
                    border: `1px solid ${actionMeta.color}40`,
                  }}
                />
              </Box>
            </Box>

            {/* Record ID & Timestamp row */}
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: "var(--radius)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600 }}>RECORD ID</Typography>
                    <Typography sx={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{selectedLog.recordId || "—"}</Typography>
                  </Box>
                  {selectedLog.recordId && (
                    <Tooltip title={copiedRecordId === selectedLog.recordId ? "Tersalin!" : "Salin Record ID"}>
                      <IconButton size="small" onClick={(e) => handleCopyRecordId(selectedLog.recordId, e)}>
                        {copiedRecordId === selectedLog.recordId ? <CheckOutlined fontSize="small" sx={{ color: "#16a34a" }} /> : <ContentCopyOutlined fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "var(--radius)" }}>
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600 }}>WAKTU EKSEKUSI</Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>{formatFullDate(selectedLog.createdAt)}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* If status changed, show visual flow */}
            {statusTransition && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "var(--radius)",
                  border: "1px dashed var(--border)",
                  backgroundColor: "rgba(37, 99, 235, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--foreground)" }}>Alur Transisi Status Entitas</Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Perubahan status siklus kerja pengadaan pada aksi ini</Typography>
                </Box>
                <StatusTransitionFlow before={statusTransition.before} after={statusTransition.after} />
              </Box>
            )}
          </Box>
        ),
      },
      {
        title: "Perbandingan Nilai & Data Diff",
        content: (
          <Box sx={{ mt: 1 }}>
            <Tabs
              value={activeDiffTab}
              onChange={(_, v) => setActiveDiffTab(v)}
              sx={{
                minHeight: 38,
                mb: 2,
                "& .MuiTab-root": {
                  minHeight: 38,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "none",
                  py: 0.5,
                },
              }}
            >
              <Tab label="Visual Diff (Per-Field)" />
              <Tab label="Data Mentah JSON" />
            </Tabs>

            {activeDiffTab === 0 ? (
              <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
                {selectedDiff.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center", color: "var(--muted-foreground)" }}>
                    <Typography sx={{ fontSize: "0.85rem" }}>Tidak ada detail perubahan data</Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "var(--secondary)" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "25%" }}>Atribut / Kolom</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "35%" }}>Data Sebelum</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "40%" }}>Data Sesudah</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDiff.map((diff) => {
                        const isMod = diff.type === "modified";
                        const isAdd = diff.type === "added";
                        const isRem = diff.type === "removed";

                        return (
                          <TableRow
                            key={diff.key}
                            sx={{
                              backgroundColor: isMod ? "rgba(245, 158, 11, 0.05)" : isAdd ? "rgba(22, 163, 74, 0.05)" : isRem ? "rgba(220, 38, 38, 0.05)" : undefined,
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                              {diff.key}
                              {isMod && (
                                <Chip
                                  label="Berubah"
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    fontSize: "0.62rem",
                                    height: 18,
                                    color: "#f59e0b",
                                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                                  }}
                                />
                              )}
                              {isAdd && (
                                <Chip
                                  label="Baru"
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    fontSize: "0.62rem",
                                    height: 18,
                                    color: "#16a34a",
                                    backgroundColor: "rgba(22, 163, 74, 0.15)",
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.78rem",
                                color: isMod ? "#b91c1c" : "var(--muted-foreground)",
                                fontFamily: "var(--font-mono)",
                                wordBreak: "break-all",
                              }}
                            >
                              {formatJsonValue(diff.before)}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.78rem",
                                color: isMod || isAdd ? "#15803d" : "var(--foreground)",
                                fontWeight: isMod || isAdd ? 600 : 400,
                                fontFamily: "var(--font-mono)",
                                wordBreak: "break-all",
                              }}
                            >
                              {formatJsonValue(diff.after)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, mb: 0.75, color: "var(--muted-foreground)" }}>DATA SEBELUM</Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      maxHeight: 280,
                      overflow: "auto",
                      backgroundColor: "var(--secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <pre style={{ margin: 0 }}>{selectedLog.dataSebelum ? JSON.stringify(selectedLog.dataSebelum, null, 2) : "null (Data Baru Dibuat)"}</pre>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, mb: 0.75, color: "var(--muted-foreground)" }}>DATA SESUDAH</Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      maxHeight: 280,
                      overflow: "auto",
                      backgroundColor: "var(--secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <pre style={{ margin: 0 }}>{selectedLog.dataSesudah ? JSON.stringify(selectedLog.dataSesudah, null, 2) : "null (Data Dihapus)"}</pre>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        ),
      },
    ];
  }, [selectedLog, selectedDiff, statusTransition, activeDiffTab, copiedRecordId, handleCopyRecordId]);

  return (
    <DashboardLayout
      sectionTitle="Sistem"
      title="Audit Log & Jejak Aktivitas"
      headerTitle="Jejak Audit & Alur Aktivitas"
      headerDescription="Pantau kronologi alur pengadaan, transisi status approval, registrasi vendor, dan histori perubahan sistem LEMIGAS secara interaktif."
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* ── Active Record Filter Banner (Alur Pelacakan Record Tertentu) ─── */}
        <Collapse in={Boolean(selectedRecordId)}>
          <Alert
            severity="info"
            icon={<AltRouteOutlined fontSize="inherit" />}
            action={
              <Button color="inherit" size="small" onClick={handleClearRecordFilter} sx={{ fontWeight: 700 }}>
                Kembali ke Semua Log
              </Button>
            }
            sx={{
              mb: 3,
              borderRadius: "var(--radius)",
              border: "1px solid rgba(37, 99, 235, 0.3)",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              color: "var(--foreground)",
            }}
          >
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
              Sedang Menelusuri Jejak Alur Khusus Record:{" "}
              <Box component="span" sx={{ fontFamily: "var(--font-mono)", color: "#2563eb" }}>
                {selectedRecordId}
              </Box>
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)", mt: 0.25 }}>Hanya menampilkan tahapan siklus hidup (lifecycle) yang berhubungan langsung dengan entitas record ini.</Typography>
          </Alert>
        </Collapse>

        {/* ── Interactive Toolbar & Module Switcher ────────────────────────── */}
        <Card
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Module Pills */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflowX: "auto", pb: 0.5 }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted-foreground)", mr: 0.5, flexShrink: 0 }}>Kategori Alur:</Typography>

            {[
              { id: "__all", label: "Semua Alur", icon: <LayersOutlined sx={{ fontSize: 16 }} /> },
              { id: "pengadaan", label: "Pengadaan", icon: <AssignmentOutlined sx={{ fontSize: 16 }} /> },
              { id: "approval", label: "Approval", icon: <FactCheckOutlined sx={{ fontSize: 16 }} /> },
              { id: "vendor", label: "Vendor", icon: <BusinessOutlined sx={{ fontSize: 16 }} /> },
              { id: "barang", label: "Barang & Kategori", icon: <CategoryOutlined sx={{ fontSize: 16 }} /> },
              { id: "user", label: "Pengguna & Akun", icon: <PersonOutlined sx={{ fontSize: 16 }} /> },
              { id: "dokumen", label: "Dokumen", icon: <DescriptionOutlined sx={{ fontSize: 16 }} /> },
            ].map((mod) => {
              const isSelected = moduleFilter === mod.id;
              return (
                <Chip
                  key={mod.id}
                  icon={mod.icon as React.ReactElement}
                  label={mod.label}
                  clickable
                  onClick={() => {
                    setModuleFilter(mod.id);
                    setPage(0);
                  }}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    borderRadius: "var(--radius)",
                    flexShrink: 0,
                    ...(isSelected
                      ? {
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          borderColor: "#2563eb",
                          "& .MuiChip-icon": { color: "#ffffff" },
                        }
                      : {
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }),
                  }}
                />
              );
            })}
          </Box>

          {/* Search, Action Filter & View Mode Toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {/* Search Box */}
            <TextField
              size="small"
              placeholder="Cari tabel, aksi, record ID, atau pengguna..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ fontSize: 18, color: "var(--muted-foreground)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch("")}>
                        <CloseRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                width: { xs: "100%", sm: 340 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "var(--radius)",
                  fontSize: "0.82rem",
                  backgroundColor: "var(--background)",
                },
              }}
            />

            {/* Action Buttons & View Mode */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              {/* Action Filter Pills */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {(["__all", "create", "update", "delete"] as const).map((a) => {
                  const isSel = actionFilter === a;
                  const label = a === "__all" ? "Semua Aksi" : a.toUpperCase();
                  return (
                    <Button
                      key={a}
                      size="small"
                      variant={isSel ? "contained" : "text"}
                      onClick={() => {
                        setActionFilter(a);
                        setPage(0);
                      }}
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        borderRadius: "var(--radius-sm)",
                        py: 0.35,
                        px: 1.2,
                        textTransform: "none",
                        backgroundColor: isSel ? "var(--foreground)" : "transparent",
                        color: isSel ? "var(--background)" : "var(--muted-foreground)",
                        "&:hover": {
                          backgroundColor: isSel ? "var(--foreground)" : "var(--secondary)",
                        },
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Box>

              {/* View Mode Toggle */}
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, val) => val && setViewMode(val)}
                sx={{
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  "& .MuiToggleButton-root": {
                    py: 0.4,
                    px: 1.2,
                    textTransform: "none",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    gap: 0.75,
                    color: "var(--muted-foreground)",
                    "&.Mui-selected": {
                      backgroundColor: "var(--secondary)",
                      color: "var(--foreground)",
                      fontWeight: 700,
                    },
                  },
                }}
              >
                <ToggleButton value="timeline">
                  <Timeline sx={{ fontSize: 18 }} />
                  Alur Jejak
                </ToggleButton>
                <ToggleButton value="table">
                  <TableChartOutlined sx={{ fontSize: 18 }} />
                  Tabel
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Refresh Button */}
              <Tooltip title="Muat Ulang Data">
                <IconButton
                  size="small"
                  onClick={() => call_back()}
                  sx={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    p: 0.75,
                  }}
                >
                  <RefreshOutlined sx={{ fontSize: 18, color: "var(--foreground)" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Card>

        {/* ── Main View Content ────────────────────────────────────────────── */}
        {is_loading ? (
          <TableSkeleton rows={6} />
        ) : data.length === 0 ? (
          <Card
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <HistoryOutlined sx={{ fontSize: 48, color: "var(--muted-foreground)", mb: 1, opacity: 0.5 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>Tidak ada data jejak aktivitas</Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "var(--muted-foreground)", mt: 0.5, mb: 2 }}>
              {search || actionFilter !== "__all" || moduleFilter !== "__all" || selectedRecordId ? "Tidak ada data yang cocok dengan kriteria filter saat ini." : "Belum ada histori audit log yang tercatat di sistem."}
            </Typography>
            {(search || actionFilter !== "__all" || moduleFilter !== "__all" || selectedRecordId) && (
              <SoftButton
                size="small"
                variant="outlined"
                onClick={() => {
                  setSearch("");
                  setActionFilter("__all");
                  setModuleFilter("__all");
                  setSelectedRecordId(null);
                  setPage(0);
                }}
              >
                Reset Semua Filter
              </SoftButton>
            )}
          </Card>
        ) : viewMode === "timeline" ? (
          /* ── TIMELINE / ALUR PERJALANAN VIEW ────────────────────────────── */
          <Box sx={{ position: "relative", pl: { xs: 2, sm: 3 } }}>
            {/* Connected Vertical Timeline Line */}
            <Box
              sx={{
                position: "absolute",
                top: 24,
                bottom: 24,
                left: { xs: 26, sm: 34 },
                width: 2,
                backgroundColor: "var(--border)",
                zIndex: 0,
              }}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, position: "relative", zIndex: 1 }}>
              {data.map((item, index) => {
                const aKey = (item.aksi || "").toLowerCase();
                const actionMeta = ACTION_CONFIG[aKey] || ACTION_CONFIG.update;
                const modMeta = MODULE_CONFIG[item.tabel] || {
                  label: item.tabel,
                  icon: <LayersOutlined fontSize="small" />,
                  color: "#6b7280",
                  bg: "rgba(107, 114, 128, 0.12)",
                };

                const actor = item.dilakukanOlehUser;
                const bStatus = item.dataSebelum?.status;
                const aStatus = item.dataSesudah?.status;
                const hasStatusTransition = Boolean(bStatus || aStatus);

                // Highlighted changes summary
                const diffs = computeDiff(item.dataSebelum, item.dataSesudah);
                const modifiedKeys = diffs.filter((d) => d.type !== "unchanged").map((d) => d.key);

                return (
                  <Box
                    key={item.id || index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2.5,
                    }}
                  >
                    {/* Node Dot / Action Icon */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "var(--card)",
                        border: `2px solid ${actionMeta.color}`,
                        color: actionMeta.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 0 0 4px color-mix(in srgb, ${actionMeta.color} 15%, transparent)`,
                        mt: 1.5,
                      }}
                    >
                      {actionMeta.icon}
                    </Box>

                    {/* Timeline Event Card */}
                    <Card
                      sx={{
                        flex: 1,
                        p: 2.25,
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--card)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: actionMeta.color,
                          boxShadow: "var(--shadow-sm)",
                        },
                      }}
                    >
                      {/* Top Header Row */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 1.5,
                          mb: 1.5,
                        }}
                      >
                        {/* Actor & Entity Info */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <UserAvatar name={actor?.nama || "Sistem"} id={actor?.id} size="small" showName={false} showId={false} />
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--foreground)" }}>{actor?.nama || "Sistem Otomatis"}</Typography>
                              {actor?.unitKerja && (
                                <Chip
                                  label={actor.unitKerja}
                                  size="small"
                                  sx={{
                                    fontSize: "0.65rem",
                                    height: 18,
                                    backgroundColor: "var(--secondary)",
                                    color: "var(--muted-foreground)",
                                  }}
                                />
                              )}
                            </Box>
                            <Typography sx={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{actor?.email || "internal@lemigas.esdm.go.id"}</Typography>
                          </Box>
                        </Box>

                        {/* Relative & Full Timestamp */}
                        <Tooltip title={formatFullDate(item.createdAt)}>
                          <Chip
                            label={formatTimeAgo(item.createdAt)}
                            size="small"
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              backgroundColor: "var(--secondary)",
                              color: "var(--muted-foreground)",
                              borderRadius: "var(--radius-sm)",
                            }}
                          />
                        </Tooltip>
                      </Box>

                      {/* Action & Module Bar */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                        <Chip
                          icon={modMeta.icon as React.ReactElement}
                          label={modMeta.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            color: modMeta.color,
                            backgroundColor: modMeta.bg,
                            border: `1px solid ${modMeta.color}35`,
                          }}
                        />
                        <Chip
                          label={actionMeta.title}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            color: actionMeta.color,
                            backgroundColor: actionMeta.bg,
                            border: `1px solid ${actionMeta.color}40`,
                          }}
                        />

                        {/* Record ID Chip with Copy */}
                        {item.recordId && (
                          <Chip
                            label={`#${item.recordId.substring(0, 8)}`}
                            size="small"
                            onClick={(e) => handleCopyRecordId(item.recordId, e)}
                            icon={copiedRecordId === item.recordId ? <CheckOutlined sx={{ fontSize: "14px !important", color: "#16a34a" }} /> : <ContentCopyOutlined sx={{ fontSize: "14px !important" }} />}
                            sx={{
                              fontSize: "0.72rem",
                              fontFamily: "var(--font-mono)",
                              backgroundColor: "var(--secondary)",
                              color: "var(--foreground)",
                              cursor: "pointer",
                            }}
                          />
                        )}
                      </Box>

                      {/* Visual Status Transition (if present) */}
                      {hasStatusTransition && (
                        <Box sx={{ mb: 1.5 }}>
                          <StatusTransitionFlow before={bStatus} after={aStatus} />
                        </Box>
                      )}

                      {/* Summary of Modified Fields */}
                      {modifiedKeys.length > 0 && !hasStatusTransition && (
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: "var(--radius)",
                            backgroundColor: "var(--secondary)",
                            mb: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)" }}>Atribut Diperbarui:</Typography>
                          {modifiedKeys.slice(0, 4).map((k) => (
                            <Chip
                              key={k}
                              label={k}
                              size="small"
                              sx={{
                                fontSize: "0.68rem",
                                fontFamily: "var(--font-mono)",
                                height: 20,
                                backgroundColor: "var(--card)",
                                border: "1px solid var(--border)",
                              }}
                            />
                          ))}
                          {modifiedKeys.length > 4 && <Typography sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>+{modifiedKeys.length - 4} lainnya</Typography>}
                        </Box>
                      )}

                      {/* Footer Actions */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          pt: 1.25,
                          borderTop: "1px solid var(--border)",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {item.recordId && selectedRecordId !== item.recordId && (
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<AltRouteOutlined fontSize="small" />}
                            onClick={(e) => handleFilterRecord(item.recordId, e)}
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "none",
                              color: "#2563eb",
                              p: 0.5,
                            }}
                          >
                            Telusuri Alur Record Ini
                          </Button>
                        )}

                        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                          <SoftButton size="small" variant="outlined" onClick={() => handleOpenDetail(item)}>
                            Inspeksi Detail & Diff JSON
                          </SoftButton>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          /* ── TABLE VIEW ─────────────────────────────────────────────────── */
          <Paper
            variant="outlined"
            sx={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              backgroundColor: "var(--card)",
            }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: "var(--secondary)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "15%" }}>Waktu</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "18%" }}>Pengguna (Aktor)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "14%" }}>Modul / Tabel</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "12%" }}>Aksi</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "24%" }}>Alur & Perubahan</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: "17%", textAlign: "right" }}>Tindakan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const aKey = (row.aksi || "").toLowerCase();
                  const actionMeta = ACTION_CONFIG[aKey] || ACTION_CONFIG.update;
                  const modMeta = MODULE_CONFIG[row.tabel] || {
                    label: row.tabel,
                    icon: <LayersOutlined fontSize="small" />,
                    color: "#6b7280",
                    bg: "rgba(107, 114, 128, 0.12)",
                  };
                  const actor = row.dilakukanOlehUser;
                  const bStatus = row.dataSebelum?.status;
                  const aStatus = row.dataSesudah?.status;

                  return (
                    <TableRow key={row.id} hover sx={{ "&:hover": { backgroundColor: "var(--secondary)" } }}>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>{formatTimeAgo(row.createdAt)}</Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{formatFullDate(row.createdAt)}</Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <UserAvatar name={actor?.nama || "Sistem"} id={actor?.id} size="small" showName={false} showId={false} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.2 }}>{actor?.nama || "Sistem"}</Typography>
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: "var(--muted-foreground)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {actor?.unitKerja || actor?.email || "—"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={modMeta.icon as React.ReactElement}
                          label={modMeta.label}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            color: modMeta.color,
                            backgroundColor: modMeta.bg,
                            border: `1px solid ${modMeta.color}30`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={actionMeta.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            color: actionMeta.color,
                            backgroundColor: actionMeta.bg,
                            border: `1px solid ${actionMeta.color}40`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {bStatus || aStatus ? (
                          <StatusTransitionFlow before={bStatus} after={aStatus} />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: "var(--muted-foreground)",
                              fontFamily: "var(--font-mono)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 240,
                            }}
                          >
                            {row.dataSesudah ? JSON.stringify(row.dataSesudah).substring(0, 45) + "..." : row.dataSebelum ? JSON.stringify(row.dataSebelum).substring(0, 45) + "..." : "—"}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                          {row.recordId && selectedRecordId !== row.recordId && (
                            <Tooltip title="Telusuri Alur Record Ini">
                              <IconButton size="small" onClick={(e) => handleFilterRecord(row.recordId, e)} sx={{ color: "#2563eb" }}>
                                <AltRouteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <SoftButton size="small" variant="outlined" onClick={() => handleOpenDetail(row)}>
                            Detail
                          </SoftButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* ── Pagination Bar ──────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mt: 3,
            p: 1.5,
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            Menampilkan{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "var(--foreground)" }}>
              {data.length}
            </Box>{" "}
            dari total{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "var(--foreground)" }}>
              {totalRows}
            </Box>{" "}
            riwayat log
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)", mr: 0.5 }}>Baris:</Typography>
              {[10, 15, 30, 50].map((r) => (
                <Button
                  key={r}
                  size="small"
                  variant={rowsPerPage === r ? "contained" : "text"}
                  onClick={() => {
                    setRowsPerPage(r);
                    setPage(0);
                  }}
                  sx={{
                    minWidth: 28,
                    px: 0.75,
                    py: 0.2,
                    fontSize: "0.72rem",
                    fontWeight: rowsPerPage === r ? 700 : 500,
                    backgroundColor: rowsPerPage === r ? "var(--foreground)" : "transparent",
                    color: rowsPerPage === r ? "var(--background)" : "var(--muted-foreground)",
                  }}
                >
                  {r}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button size="small" disabled={page === 0 || is_loading} onClick={() => setPage((p) => Math.max(0, p - 1))} sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600 }}>
                Sebelumnya
              </Button>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, px: 0.5 }}>Halaman {page + 1}</Typography>
              <Button size="small" disabled={(page + 1) * rowsPerPage >= totalRows || is_loading} onClick={() => setPage((p) => p + 1)} sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600 }}>
                Selanjutnya
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Detail & Diff Inspection Modal ───────────────────────────────── */}
      <Modal
        open={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        title={`Inspeksi Jejak Audit — #${selectedLog?.recordId?.substring(0, 8) || ""}`}
        maxWidth={720}
        sections={modalSections}
        actions={[
          ...(selectedLog?.recordId && selectedRecordId !== selectedLog.recordId
            ? [
                {
                  label: "Telusuri Alur Record Ini",
                  variant: "secondary" as const,
                  onClick: () => handleFilterRecord(selectedLog.recordId),
                },
              ]
            : []),
          {
            label: "Tutup",
            variant: "ghost" as const,
            onClick: () => setDiffModalOpen(false),
          },
        ]}
      />
    </DashboardLayout>
  );
}

export default AuditLogPage;
