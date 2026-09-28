import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, MenuItem, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutlined, VisibilityOutlined, SendOutlined, AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, Modal, ConfirmDialog, StatusChip, SoftButton, ActionButton, ActionButtonGroup, ActionMenuButton } from "../../components";
import type { Column, ModalAction, ModalSection } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PengadaanItem {
  id?: string;
  barangId: string;
  barang?: { id: string; nama: string; satuan?: string };
  jumlah: number;
  hargaSatuan?: number;
  totalHarga?: number;
  keterangan?: string;
}

interface Pengadaan {
  id: string;
  nomorSurat: string;
  judul: string;
  deskripsi?: string;
  status: string;
  metode: string;
  prioritas: string;
  totalEstimasi?: number;
  items?: PengadaanItem[];
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
  sedang_proses: { label: "Sedang Proses", variant: "info" },
  selesai: { label: "Selesai", variant: "success" },
  dibatalkan: { label: "Dibatalkan", variant: "danger" },
};

const METODE_OPTIONS = [
  { value: "__all", label: "Semua Metode" },
  { value: "tender", label: "Tender" },
  { value: "pengadaan_langsung", label: "Pengadaan Langsung" },
  { value: "penunjukan_langsung", label: "Penunjukan Langsung" },
  { value: "e_procurement", label: "E-Procurement" },
];

const STATUS_FILTER_OPTIONS = [{ value: "__all", label: "Semua Status" }, ...Object.entries(STATUS_MAP).map(([v, l]) => ({ value: v, label: l.label }))];

const PRIORITAS_OPTIONS = [
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
  { value: "darurat", label: "Darurat" },
];

function formatRupiah(val?: number) {
  if (!val) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function PengadaanPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("__all");
  const [metodeFilter, setMetodeFilter] = useState("__all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Pengadaan | null>(null);

  // Form state
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formMetode, setFormMetode] = useState("pengadaan_langsung");
  const [formPrioritas, setFormPrioritas] = useState("sedang");
  const [formItems, setFormItems] = useState<{ barangId: string; jumlah: number; hargaSatuan: number; keterangan: string }[]>([{ barangId: "", jumlah: 1, hargaSatuan: 0, keterangan: "" }]);

  // Fetch barang list for item form
  const { response: barangRes } = use_query({
    api_tag: "barang",
    api_method: "barangGetControllerFindAll",
    api_query: [{ limit: 200, page: 1 }],
  });
  const barangList = useMemo(() => extract_payload_with_pagination<{ id: string; nama: string }>(barangRes).items, [barangRes]);

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
      status: statusFilter !== "__all" ? (statusFilter as any) : undefined,
      metode: metodeFilter !== "__all" ? (metodeFilter as any) : undefined,
    }),
    [search, page, rowsPerPage, statusFilter, metodeFilter],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "pengadaan",
    api_method: "pengadaanGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<Pengadaan>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const createPengadaan = use_mutation({
    api_tag: "pengadaan",
    api_method: "pengadaanPostControllerCreate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Pengadaan berhasil dibuat!",
    },
  });

  const updatePengadaan = use_mutation({
    api_tag: "pengadaan",
    api_method: "pengadaanPutControllerUpdate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "Pengadaan berhasil diperbarui!",
    },
  });

  const deletePengadaan = use_mutation({
    api_tag: "pengadaan",
    api_method: "pengadaanDeleteControllerRemove",
    options: {
      call_back: () => {
        call_back();
        setConfirmOpen(false);
      },
      success_message_text: "Pengadaan berhasil dihapus!",
    },
  });

  const submitForApproval = use_mutation({
    api_tag: "approval",
    api_method: "approvalActionControllerSubmit",
    options: { call_back: () => call_back(), success_message_text: "Pengadaan berhasil diajukan untuk approval!" },
  });

  const openCreateModal = useCallback(() => {
    setSelected(null);
    setFormJudul("");
    setFormDeskripsi("");
    setFormMetode("pengadaan_langsung");
    setFormPrioritas("sedang");
    setFormItems([{ barangId: "", jumlah: 1, hargaSatuan: 0, keterangan: "" }]);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: Pengadaan) => {
    setSelected(item);
    setFormJudul(item.judul || "");
    setFormDeskripsi(item.deskripsi || "");
    setFormMetode(item.metode || "pengadaan_langsung");
    setFormPrioritas(item.prioritas || "sedang");
    if (item.items?.length) {
      setFormItems(item.items.map((i) => ({ barangId: i.barangId, jumlah: i.jumlah, hargaSatuan: i.hargaSatuan || 0, keterangan: i.keterangan || "" })));
    } else {
      setFormItems([{ barangId: "", jumlah: 1, hargaSatuan: 0, keterangan: "" }]);
    }
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
  }, []);

  const handleSave = useCallback(() => {
    const payload: any = { judul: formJudul, deskripsi: formDeskripsi || undefined, metode: formMetode, prioritas: formPrioritas, items: formItems.filter((i) => i.barangId) };
    if (selected) {
      updatePengadaan([selected.id, payload]);
    } else {
      createPengadaan([payload]);
    }
  }, [formJudul, formDeskripsi, formMetode, formPrioritas, formItems, selected, createPengadaan, updatePengadaan]);

  const addFormItem = useCallback(() => {
    setFormItems((prev) => [...prev, { barangId: "", jumlah: 1, hargaSatuan: 0, keterangan: "" }]);
  }, []);

  const removeFormItem = useCallback((idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateFormItem = useCallback((idx: number, field: string, value: any) => {
    setFormItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }, []);

  const canDelete = (p: Pengadaan) => ["draft", "revisi", "ditolak"].includes(p.status);
  const canEdit = (p: Pengadaan) => ["draft", "revisi"].includes(p.status);

  const columns: Column<Pengadaan>[] = [
    {
      id: "nomorSurat",
      label: "Nomor Surat",
      width: "18%",
      render: (_, row) => (
        <Box>
          <Typography sx={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nomorSurat}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{row.metode?.replace(/_/g, " ")}</Typography>
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
      id: "prioritas",
      label: "Prioritas",
      width: "12%",
      render: (_, row) => {
        const colorMap: Record<string, string> = { darurat: "var(--destructive)", tinggi: "#b45309", sedang: "#2563eb", rendah: "var(--muted-foreground)" };
        return (
          <Chip
            label={row.prioritas}
            size="small"
            sx={{ fontSize: "0.72rem", fontWeight: 600, color: colorMap[row.prioritas] || "var(--foreground)", backgroundColor: "transparent", border: `1px solid ${colorMap[row.prioritas] || "var(--border)"}` }}
          />
        );
      },
    },
    {
      id: "totalEstimasi",
      label: "Total Estimasi",
      width: "15%",
      render: (_, row) => <Typography sx={{ fontSize: "0.825rem", fontWeight: 500, color: "var(--foreground)" }}>{formatRupiah(row.totalEstimasi)}</Typography>,
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
          {canEdit(row) && <ActionButton variant="edit" title="Edit" icon={<EditOutlined fontSize="small" />} onClick={() => openEditModal(row)} />}
          <ActionMenuButton
            items={[
              ...(canEdit(row) ? [{ label: "Ajukan Approval", icon: <SendOutlined fontSize="small" />, onClick: () => submitForApproval([row.id]), variant: "success" as const }] : []),
              ...(canDelete(row)
                ? [
                    {
                      label: "Hapus",
                      icon: <DeleteOutlined fontSize="small" />,
                      onClick: () => {
                        setSelected(row);
                        setConfirmOpen(true);
                      },
                      variant: "danger" as const,
                    },
                  ]
                : []),
            ]}
          />
        </ActionButtonGroup>
      ),
    },
  ];

  // ── View sections ────────────────────────────────────────────────────────

  const viewSections: ModalSection[] = selected
    ? [
        {
          title: "Informasi Pengadaan",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
              {[
                ["Nomor Surat", selected.nomorSurat],
                ["Judul", selected.judul],
                ["Status", STATUS_MAP[selected.status]?.label || selected.status],
                ["Metode", selected.metode?.replace(/_/g, " ")],
                ["Prioritas", selected.prioritas],
                ["Total Estimasi", formatRupiah(selected.totalEstimasi)],
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
        ...(selected.items?.length
          ? [
              {
                title: "Item Pengadaan",
                content: (
                  <Box sx={{ mt: 1, overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Barang</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }} align="right">
                            Jumlah
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }} align="right">
                            Harga Satuan
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }} align="right">
                            Total
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selected.items!.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontSize: "0.825rem" }}>{item.barang?.nama || item.barangId}</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.825rem" }}>
                              {item.jumlah}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.825rem" }}>
                              {formatRupiah(item.hargaSatuan)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.825rem", fontWeight: 600 }}>
                              {formatRupiah(item.totalHarga)}
                            </TableCell>
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

  // ── Form sections ────────────────────────────────────────────────────────

  const formSections: ModalSection[] = [
    {
      title: selected ? "Edit Pengadaan" : "Buat Pengadaan Baru",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Judul Pengadaan *" value={formJudul} onChange={(e) => setFormJudul(e.target.value)} size="small" fullWidth />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Metode Pengadaan *" value={formMetode} onChange={(e) => setFormMetode(e.target.value)} size="small" fullWidth select>
              {METODE_OPTIONS.filter((o) => o.value !== "__all").map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Prioritas *" value={formPrioritas} onChange={(e) => setFormPrioritas(e.target.value)} size="small" fullWidth select>
              {PRIORITAS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField label="Deskripsi" value={formDeskripsi} onChange={(e) => setFormDeskripsi(e.target.value)} size="small" fullWidth multiline rows={2} />

          {/* Items */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Item Pengadaan</Typography>
              <SoftButton startIcon={<AddCircleOutline />} onClick={addFormItem} size="small">
                Tambah Item
              </SoftButton>
            </Box>
            {formItems.map((item, idx) => (
              <Box key={idx} sx={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 1fr auto", gap: 1, mb: 1, alignItems: "center" }}>
                <TextField label="Barang" value={item.barangId} onChange={(e) => updateFormItem(idx, "barangId", e.target.value)} size="small" fullWidth select>
                  {barangList.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.nama}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Qty" value={item.jumlah} onChange={(e) => updateFormItem(idx, "jumlah", Number(e.target.value))} size="small" type="number" inputProps={{ min: 1 }} />
                <TextField label="Harga Satuan" value={item.hargaSatuan || ""} onChange={(e) => updateFormItem(idx, "hargaSatuan", Number(e.target.value))} size="small" type="number" />
                <TextField label="Keterangan" value={item.keterangan} onChange={(e) => updateFormItem(idx, "keterangan", e.target.value)} size="small" />
                {formItems.length > 1 && (
                  <IconButton onClick={() => removeFormItem(idx)} color="error" size="small">
                    <RemoveCircleOutline />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      ),
    },
  ];

  const formActions: ModalAction[] = [
    { label: "Batal", onClick: closeModal, variant: "ghost" },
    { label: "Simpan", onClick: handleSave, variant: "primary", disabled: !formJudul },
  ];

  return (
    <DashboardLayout
      sectionTitle="Pengadaan"
      title="Pengadaan"
      headerTitle="Daftar Pengadaan Minyak"
      headerDescription="Kelola pengajuan, proses review, dan pelaksanaan pengadaan minyak"
      headerAction={
        <SoftButton startIcon={<AddOutlined />} onClick={openCreateModal}>
          Buat Pengadaan
        </SoftButton>
      }
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <ServerDataTable
          columns={columns}
          data={data}
          title="Data Pengadaan"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari pengadaan..."
          filters={[
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              options: STATUS_FILTER_OPTIONS,
              onChange: (v) => {
                setStatusFilter(v);
                setPage(0);
              },
            },
            {
              id: "metode",
              label: "Metode",
              value: metodeFilter,
              options: METODE_OPTIONS,
              onChange: (v) => {
                setMetodeFilter(v);
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
          emptyStateLabel="Tidak ada data pengadaan"
        />
      </Box>

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Pengadaan — ${selected?.nomorSurat || ""}`}
        maxWidth={680}
        sections={viewSections}
        actions={[{ label: "Tutup", onClick: () => setViewModalOpen(false), variant: "ghost" }]}
      />
      <Modal open={modalOpen} onClose={closeModal} title={selected ? "Edit Pengadaan" : "Buat Pengadaan Baru"} maxWidth={720} sections={formSections} actions={formActions} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selected) deletePengadaan([selected.id]);
        }}
        title="Hapus Pengadaan"
        message={`Yakin ingin menghapus "${selected?.nomorSurat}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default PengadaanPage;
