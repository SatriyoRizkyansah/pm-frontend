import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, MenuItem, Grid, Card } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutlined, VisibilityOutlined, StorefrontOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, Modal, ConfirmDialog, StatusChip, SoftButton, ActionButton, ActionButtonGroup, ActionMenuButton } from "../../components";
import type { Column, ModalAction, ModalSection } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Vendor {
  id: string;
  nama: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  status: string;
  createdAt?: string;
  [key: string]: any;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

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

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "__all", label: "Semua Status" },
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

function getStatusVariant(status: string): "success" | "neutral" | "danger" | "warning" {
  switch (status?.toLowerCase()) {
    case "aktif":
      return "success";
    case "nonaktif":
      return "neutral";
    default:
      return "warning";
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function VendorPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("__all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState("aktif");

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
      status: statusFilter !== "__all" ? statusFilter : undefined,
    }),
    [search, page, rowsPerPage, statusFilter],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "vendor",
    api_method: "vendorGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Vendor>(response), [response]);

  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  // ── Mutations ────────────────────────────────────────────────────────────

  const createVendor = use_mutation({
    api_tag: "vendor",
    api_method: "vendorPostControllerCreate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Vendor berhasil ditambahkan!",
    },
  });

  const updateVendor = use_mutation({
    api_tag: "vendor",
    api_method: "vendorPutControllerUpdate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Vendor berhasil diperbarui!",
    },
  });

  const deleteVendor = use_mutation({
    api_tag: "vendor",
    api_method: "vendorDeleteControllerRemove",
    options: {
      call_back: () => {
        call_back();
        setConfirmOpen(false);
      },
      success_message_text: "Vendor berhasil dihapus!",
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setSelectedVendor(null);
    setFormNama("");
    setFormAlamat("");
    setFormTelepon("");
    setFormEmail("");
    setFormStatus("aktif");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormNama(vendor.nama || "");
    setFormAlamat(vendor.alamat || "");
    setFormTelepon(vendor.telepon || "");
    setFormEmail(vendor.email || "");
    setFormStatus(vendor.status || "aktif");
    setModalOpen(true);
  }, []);

  const openViewModal = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedVendor(null);
  }, []);

  const handleSave = useCallback(() => {
    const payload = { nama: formNama, alamat: formAlamat || undefined, telepon: formTelepon || undefined, email: formEmail || undefined, status: formStatus as "aktif" | "nonaktif" };
    if (selectedVendor) {
      updateVendor([selectedVendor.id, payload as any]);
    } else {
      createVendor([payload]);
    }
  }, [formNama, formAlamat, formTelepon, formEmail, formStatus, selectedVendor, createVendor, updateVendor]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedVendor) {
      deleteVendor([selectedVendor.id]);
    }
  }, [selectedVendor, deleteVendor]);

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns: Column<Vendor>[] = [
    {
      id: "nama",
      label: "Nama Vendor",
      width: "25%",
      render: (_, row) => <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nama}</Typography>,
    },
    {
      id: "email",
      label: "Email",
      width: "20%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{row.email || "-"}</Typography>,
    },
    {
      id: "telepon",
      label: "Telepon",
      width: "15%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{row.telepon || "-"}</Typography>,
    },
    {
      id: "status",
      label: "Status",
      width: "12%",
      render: (_, row) => <StatusChip label={row.status || "aktif"} variant={getStatusVariant(row.status)} />,
    },
    {
      id: "id",
      label: "Aksi",
      align: "center",
      width: "15%",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton variant="view" title="Lihat" icon={<VisibilityOutlined fontSize="small" />} onClick={() => openViewModal(row)} />
          <ActionButton variant="edit" title="Edit" icon={<EditOutlined fontSize="small" />} onClick={() => openEditModal(row)} />
          <ActionMenuButton
            items={[
              {
                label: "Hapus",
                icon: <DeleteOutlined fontSize="small" />,
                onClick: () => {
                  setSelectedVendor(row);
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

  // ── Modal Sections ───────────────────────────────────────────────────────

  const viewSections: ModalSection[] = selectedVendor
    ? [
        {
          title: "Informasi Vendor",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
              {[
                ["Nama", selectedVendor.nama],
                ["Email", selectedVendor.email],
                ["Telepon", selectedVendor.telepon],
                ["Alamat", selectedVendor.alamat],
                ["Status", selectedVendor.status],
              ].map(([k, v]) => (
                <Box key={k}>
                  <Typography sx={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{k}</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{v || "-"}</Typography>
                </Box>
              ))}
            </Box>
          ),
        },
      ]
    : [];

  const formSections: ModalSection[] = [
    {
      title: selectedVendor ? "Edit Vendor" : "Tambah Vendor",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Nama Vendor *" value={formNama} onChange={(e) => setFormNama(e.target.value)} size="small" fullWidth />
          <TextField label="Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} size="small" fullWidth />
          <TextField label="Telepon" value={formTelepon} onChange={(e) => setFormTelepon(e.target.value)} size="small" fullWidth />
          <TextField label="Alamat" value={formAlamat} onChange={(e) => setFormAlamat(e.target.value)} size="small" fullWidth multiline rows={2} />
          <TextField label="Status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)} size="small" fullWidth select>
            <MenuItem value="aktif">Aktif</MenuItem>
            <MenuItem value="nonaktif">Nonaktif</MenuItem>
          </TextField>
        </Box>
      ),
    },
  ];

  const formActions: ModalAction[] = [
    { label: "Batal", onClick: closeModal, variant: "ghost" },
    { label: "Simpan", onClick: handleSave, variant: "primary", disabled: !formNama },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout sectionTitle="Master Data" title="Vendor">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Vendor" value={totalRows} icon={<StorefrontOutlined />} color="#2563eb" />
          </Grid>
        </Grid>

        {/* Action Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <SoftButton startIcon={<AddOutlined />} onClick={openCreateModal}>
            Tambah Vendor
          </SoftButton>
        </Box>

        {/* Data Table */}
        <ServerDataTable
          columns={columns}
          data={data}
          title="Data Vendor"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari vendor..."
          filters={[
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              options: STATUS_OPTIONS,
              onChange: (v) => {
                setStatusFilter(v);
                setPage(0);
              },
            },
          ]}
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
          emptyStateLabel="Tidak ada data vendor"
        />
      </Box>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Detail Vendor — ${selectedVendor?.nama || ""}`}
        description="Informasi lengkap vendor."
        sections={viewSections}
        actions={[{ label: "Tutup", onClick: () => setViewModalOpen(false), variant: "ghost" }]}
      />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={selectedVendor ? "Edit Vendor" : "Tambah Vendor"} description="Isi form berikut." sections={formSections} actions={formActions} />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Vendor"
        message={`Yakin ingin menghapus "${selectedVendor?.nama}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default VendorPage;
