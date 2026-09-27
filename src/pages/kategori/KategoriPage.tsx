import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, Grid, Card, Chip } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutlined, VisibilityOutlined, CategoryOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, Modal, ConfirmDialog, SoftButton, ActionButton, ActionButtonGroup, ActionMenuButton } from "../../components";
import type { Column, ModalAction, ModalSection } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Kategori {
  id: string;
  nama: string;
  deskripsi?: string;
  _count?: { barang?: number };
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

// ─── Page ────────────────────────────────────────────────────────────────────

export function KategoriPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Kategori | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formKode, setFormKode] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
    }),
    [search, page, rowsPerPage],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "kategoriPengadaan",
    api_method: "kategoriGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Kategori>(response), [response]);

  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const createKategori = use_mutation({
    api_tag: "kategoriPengadaan",
    api_method: "kategoriPostControllerCreate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Kategori berhasil ditambahkan!",
    },
  });

  const updateKategori = use_mutation({
    api_tag: "kategoriPengadaan",
    api_method: "kategoriPutControllerUpdate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Kategori berhasil diperbarui!",
    },
  });

  const deleteKategori = use_mutation({
    api_tag: "kategoriPengadaan",
    api_method: "kategoriDeleteControllerRemove",
    options: {
      call_back: () => {
        call_back();
        setConfirmOpen(false);
      },
      success_message_text: "Kategori berhasil dihapus!",
    },
  });

  const openCreateModal = useCallback(() => {
    setSelected(null);
    setFormNama("");
    setFormKode("");
    setFormDeskripsi("");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: Kategori) => {
    setSelected(item);
    setFormNama(item.nama || "");
    setFormKode((item as any).kode || "");
    setFormDeskripsi(item.deskripsi || "");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
  }, []);

  const handleSave = useCallback(() => {
    const payload = { kode: formKode, nama: formNama, deskripsi: formDeskripsi || undefined };
    if (selected) {
      updateKategori([selected.id, payload as any]);
    } else {
      createKategori([payload as any]);
    }
  }, [formNama, formDeskripsi, selected, createKategori, updateKategori]);

  const columns: Column<Kategori>[] = [
    {
      id: "nama",
      label: "Nama Kategori",
      width: "30%",
      render: (_, row) => <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nama}</Typography>,
    },
    {
      id: "deskripsi",
      label: "Deskripsi",
      width: "35%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{row.deskripsi || "-"}</Typography>,
    },
    {
      id: "_count",
      label: "Jumlah Barang",
      width: "15%",
      render: (_, row) => <Chip label={row._count?.barang ?? 0} size="small" sx={{ fontSize: "0.75rem" }} />,
    },
    {
      id: "id",
      label: "Aksi",
      align: "center",
      width: "15%",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            variant="view"
            title="Lihat"
            icon={<VisibilityOutlined fontSize="small" />}
            onClick={() => {
              setSelected(row);
              setViewModalOpen(true);
            }}
          />
          <ActionButton variant="edit" title="Edit" icon={<EditOutlined fontSize="small" />} onClick={() => openEditModal(row)} />
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

  const viewSections: ModalSection[] = selected
    ? [
        {
          title: "Informasi Kategori",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
              {[
                ["Nama", selected.nama],
                ["Deskripsi", selected.deskripsi],
                ["Jumlah Barang", String(selected._count?.barang ?? 0)],
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
      title: selected ? "Edit Kategori" : "Tambah Kategori",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Kode Kategori *" value={formKode} onChange={(e) => setFormKode(e.target.value)} size="small" fullWidth />
          <TextField label="Nama Kategori *" value={formNama} onChange={(e) => setFormNama(e.target.value)} size="small" fullWidth />
          <TextField label="Deskripsi" value={formDeskripsi} onChange={(e) => setFormDeskripsi(e.target.value)} size="small" fullWidth multiline rows={2} />
        </Box>
      ),
    },
  ];

  const formActions: ModalAction[] = [
    { label: "Batal", onClick: closeModal, variant: "ghost" },
    { label: "Simpan", onClick: handleSave, variant: "primary", disabled: !formKode || !formNama },
  ];

  return (
    <DashboardLayout sectionTitle="Master Data" title="Kategori Pengadaan">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Kategori" value={totalRows} icon={<CategoryOutlined />} color="#7c3aed" />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <SoftButton startIcon={<AddOutlined />} onClick={openCreateModal}>
            Tambah Kategori
          </SoftButton>
        </Box>

        <ServerDataTable
          columns={columns}
          data={data}
          title="Data Kategori"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari kategori..."
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
          emptyStateLabel="Tidak ada data kategori"
        />
      </Box>

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Detail Kategori — ${selected?.nama || ""}`}
        sections={viewSections}
        actions={[{ label: "Tutup", onClick: () => setViewModalOpen(false), variant: "ghost" }]}
      />
      <Modal open={modalOpen} onClose={closeModal} title={selected ? "Edit Kategori" : "Tambah Kategori"} sections={formSections} actions={formActions} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selected) deleteKategori([selected.id]);
        }}
        title="Hapus Kategori"
        message={`Yakin ingin menghapus "${selected?.nama}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default KategoriPage;
