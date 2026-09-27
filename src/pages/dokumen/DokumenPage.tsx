import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, Grid, Card, Button } from "@mui/material";
import { DeleteOutlined, VisibilityOutlined, UploadFileOutlined, FolderOpenOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, ConfirmDialog, SoftButton, ActionButton, ActionButtonGroup, ActionMenuButton } from "../../components";
import type { Column } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Dokumen {
  id: string;
  nama: string;
  fileName?: string;
  filePath?: string;
  tipePenyimpanan?: string;
  pengadaanId?: string;
  createdAt?: string;
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

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function DokumenPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Dokumen | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNama, setUploadNama] = useState("");
  const [uploadPengadaanId, setUploadPengadaanId] = useState("");

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
    }),
    [search, page, rowsPerPage],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "dokumen",
    api_method: "dokumenGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Dokumen>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const deleteDokumen = use_mutation({
    api_tag: "dokumen",
    api_method: "dokumenDeleteControllerRemove",
    options: {
      call_back: () => {
        call_back();
        setConfirmOpen(false);
      },
      success_message_text: "Dokumen berhasil dihapus!",
    },
  });

  // For upload we need to call the raw API directly since it uses FormData
  const authState = useSignalValue(auth_signal);
  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append("file", uploadFile);
    if (uploadNama) formData.append("nama", uploadNama);
    if (uploadPengadaanId) formData.append("pengadaanId", uploadPengadaanId);

    try {
      const { Api } = await import("@Hooks/api-generated");
      const api = new Api({ baseApiParams: { headers: { authorization: `Bearer ${authState?.selectedToken || ""}` } } });
      await api.dokumen.dokumenPostControllerUpload({ file: uploadFile, nama: uploadNama || undefined, pengadaanId: uploadPengadaanId || undefined });
      call_back();
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadNama("");
      setUploadPengadaanId("");
    } catch (err) {
      console.error("Upload error:", err);
    }
  }, [uploadFile, uploadNama, uploadPengadaanId, authState, call_back]);

  const columns: Column<Dokumen>[] = [
    {
      id: "nama",
      label: "Nama Dokumen",
      width: "30%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FolderOpenOutlined sx={{ fontSize: 18, color: "var(--muted-foreground)" }} />
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nama}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{row.filePath || "-"}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "tipePenyimpanan",
      label: "Tipe",
      width: "15%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{row.tipePenyimpanan?.replace(/_/g, " ") || "-"}</Typography>,
    },
    {
      id: "createdAt",
      label: "Tanggal",
      width: "18%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{formatDate(row.createdAt)}</Typography>,
    },
    {
      id: "id",
      label: "Aksi",
      align: "center",
      width: "12%",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            variant="view"
            title="Lihat"
            icon={<VisibilityOutlined fontSize="small" />}
            onClick={() => {
              if (row.filePath) window.open(`/uploads/dokumen/${row.filePath}`, "_blank");
            }}
          />
          <ActionMenuButton
            items={[
              {
                label: "Hapus",
                icon: <DeleteOutlined fontSize="small" />,
                onClick: () => {
                  setSelected(row);
                  setConfirmOpen(true);
                },
                variant: "danger",
              },
            ]}
          />
        </ActionButtonGroup>
      ),
    },
  ];

  return (
    <DashboardLayout sectionTitle="Pengadaan" title="Dokumen">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Dokumen" value={totalRows} icon={<FolderOpenOutlined />} color="#b45309" />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <SoftButton startIcon={<UploadFileOutlined />} onClick={() => setUploadModalOpen(true)}>
            Upload Dokumen
          </SoftButton>
        </Box>

        <ServerDataTable
          columns={columns}
          data={data}
          title="Data Dokumen"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari dokumen..."
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
          emptyStateLabel="Tidak ada data dokumen"
        />
      </Box>

      {/* Upload Modal */}
      <Box
        component="div"
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          display: uploadModalOpen ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onClick={() => setUploadModalOpen(false)}
      >
        <Card sx={{ p: 3, width: 480, maxWidth: "90vw" }} onClick={(e) => e.stopPropagation()}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Upload Dokumen
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Nama Dokumen" value={uploadNama} onChange={(e) => setUploadNama(e.target.value)} size="small" fullWidth />
            <TextField label="Pengadaan ID (opsional)" value={uploadPengadaanId} onChange={(e) => setUploadPengadaanId(e.target.value)} size="small" fullWidth />
            <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
              {uploadFile ? uploadFile.name : "Pilih File"}
              <input type="file" hidden onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
            <SoftButton onClick={() => setUploadModalOpen(false)} variant="text" size="small">
              Batal
            </SoftButton>
            <SoftButton onClick={handleUpload} variant="contained" size="small">
              Upload
            </SoftButton>
          </Box>
        </Card>
      </Box>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selected) deleteDokumen([selected.id]);
        }}
        title="Hapus Dokumen"
        message={`Yakin ingin menghapus "${selected?.nama}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default DokumenPage;
