import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, MenuItem, Grid, Card } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutlined, VisibilityOutlined, Inventory2Outlined } from "@mui/icons-material";

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
}

interface Barang {
  id: string;
  nama: string;
  deskripsi?: string;
  satuan?: string;
  hargaEstimasi?: number;
  kategoriId: string;
  kategori?: Kategori;
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

export function BarangPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [kategoriFilter, setKategoriFilter] = useState("__all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Barang | null>(null);

  const [formNama, setFormNama] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formSatuan, setFormSatuan] = useState("");
  const [formHarga, setFormHarga] = useState("");
  const [formKategoriId, setFormKategoriId] = useState("");

  // Fetch kategori list for dropdown
  const { response: kategoriRes } = use_query({
    api_tag: "kategoriPengadaan",
    api_method: "kategoriGetControllerFindAll",
    api_query: [{ limit: 100, page: 1 }],
  });
  const kategoriList = useMemo<Kategori[]>(() => extract_payload_with_pagination<Kategori>(kategoriRes).items, [kategoriRes]);

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
      kategoriId: kategoriFilter !== "__all" ? kategoriFilter : undefined,
    }),
    [search, page, rowsPerPage, kategoriFilter],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "barang",
    api_method: "barangGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Barang>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const createBarang = use_mutation({
    api_tag: "barang",
    api_method: "barangPostControllerCreate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Barang berhasil ditambahkan!",
    },
  });

  const updateBarang = use_mutation({
    api_tag: "barang",
    api_method: "barangPutControllerUpdate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Barang berhasil diperbarui!",
    },
  });

  const deleteBarang = use_mutation({
    api_tag: "barang",
    api_method: "barangDeleteControllerRemove",
    options: {
      call_back: () => {
        call_back();
        setConfirmOpen(false);
      },
      success_message_text: "Barang berhasil dihapus!",
    },
  });

  const openCreateModal = useCallback(() => {
    setSelected(null);
    setFormNama("");
    setFormDeskripsi("");
    setFormSatuan("");
    setFormHarga("");
    setFormKategoriId("");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: Barang) => {
    setSelected(item);
    setFormNama(item.nama || "");
    setFormDeskripsi(item.deskripsi || "");
    setFormSatuan(item.satuan || "");
    setFormHarga(item.hargaEstimasi ? String(item.hargaEstimasi) : "");
    setFormKategoriId(item.kategoriId || "");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
  }, []);

  const handleSave = useCallback(() => {
    const payload: any = { nama: formNama, kategoriId: formKategoriId, deskripsi: formDeskripsi || undefined, satuan: formSatuan || undefined, hargaEstimasi: formHarga ? Number(formHarga) : undefined };
    if (selected) {
      updateBarang([selected.id, payload]);
    } else {
      createBarang([payload]);
    }
  }, [formNama, formDeskripsi, formSatuan, formHarga, formKategoriId, selected, createBarang, updateBarang]);

  const formatRupiah = (val?: number) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  };

  const columns: Column<Barang>[] = [
    {
      id: "nama",
      label: "Nama Barang",
      width: "25%",
      render: (_, row) => (
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nama}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{row.kategori?.nama || "-"}</Typography>
        </Box>
      ),
    },
    {
      id: "satuan",
      label: "Satuan",
      width: "12%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--muted-foreground)" }}>{row.satuan || "-"}</Typography>,
    },
    {
      id: "hargaEstimasi",
      label: "Harga Estimasi",
      width: "18%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", color: "var(--foreground)", fontWeight: 500 }}>{formatRupiah(row.hargaEstimasi)}</Typography>,
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

  const kategoriFilterOptions = useMemo(() => [{ value: "__all", label: "Semua Kategori" }, ...kategoriList.map((k) => ({ value: k.id, label: k.nama }))], [kategoriList]);

  const viewSections: ModalSection[] = selected
    ? [
        {
          title: "Informasi Barang",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
              {[
                ["Nama", selected.nama],
                ["Kategori", selected.kategori?.nama],
                ["Satuan", selected.satuan],
                ["Harga Estimasi", formatRupiah(selected.hargaEstimasi)],
                ["Deskripsi", selected.deskripsi],
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
      title: selected ? "Edit Barang" : "Tambah Barang",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Nama Barang *" value={formNama} onChange={(e) => setFormNama(e.target.value)} size="small" fullWidth />
          <TextField label="Kategori *" value={formKategoriId} onChange={(e) => setFormKategoriId(e.target.value)} size="small" fullWidth select>
            {kategoriList.map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.nama}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Satuan" value={formSatuan} onChange={(e) => setFormSatuan(e.target.value)} size="small" fullWidth placeholder="Contoh: pcs, liter, kg" />
          <TextField label="Harga Estimasi" value={formHarga} onChange={(e) => setFormHarga(e.target.value)} size="small" fullWidth type="number" placeholder="0" />
          <TextField label="Deskripsi" value={formDeskripsi} onChange={(e) => setFormDeskripsi(e.target.value)} size="small" fullWidth multiline rows={2} />
        </Box>
      ),
    },
  ];

  const formActions: ModalAction[] = [
    { label: "Batal", onClick: closeModal, variant: "ghost" },
    { label: "Simpan", onClick: handleSave, variant: "primary", disabled: !formNama || !formKategoriId },
  ];

  return (
    <DashboardLayout sectionTitle="Master Data" title="Barang">
      <Box sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Barang" value={totalRows} icon={<Inventory2Outlined />} color="#0891b2" />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <SoftButton startIcon={<AddOutlined />} onClick={openCreateModal}>
            Tambah Barang
          </SoftButton>
        </Box>

        <ServerDataTable
          columns={columns}
          data={data}
          title="Data Barang"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari barang..."
          filters={[
            {
              id: "kategori",
              label: "Kategori",
              value: kategoriFilter,
              options: kategoriFilterOptions,
              onChange: (v) => {
                setKategoriFilter(v);
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
          emptyStateLabel="Tidak ada data barang"
        />
      </Box>

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Detail Barang — ${selected?.nama || ""}`} sections={viewSections} actions={[{ label: "Tutup", onClick: () => setViewModalOpen(false), variant: "ghost" }]} />
      <Modal open={modalOpen} onClose={closeModal} title={selected ? "Edit Barang" : "Tambah Barang"} sections={formSections} actions={formActions} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selected) deleteBarang([selected.id]);
        }}
        title="Hapus Barang"
        message={`Yakin ingin menghapus "${selected?.nama}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default BarangPage;
