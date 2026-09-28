import { useState, useMemo, useCallback } from "react";
import { Box, Typography, TextField, MenuItem, Chip } from "@mui/material";
import { AddOutlined, EditOutlined, DeleteOutlined, VisibilityOutlined } from "@mui/icons-material";

import { DashboardLayout } from "../../layouts";
import { ServerDataTable, Modal, ConfirmDialog, StatusChip, SoftButton, ActionButton, ActionButtonGroup, ActionMenuButton } from "../../components";
import type { Column, ModalAction, ModalSection } from "../../components";

import use_query from "@Hooks/api-use-query";
import use_mutation from "@Hooks/api-use-mutation";
import { extract_payload_with_pagination } from "@Utils/response-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Role {
  id: string;
  nama: string;
}

interface User {
  id: string;
  nama: string;
  email: string;
  status: string;
  roleId: string;
  role?: Role;
  createdAt?: string;
  [key: string]: any;
}

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

export function UserPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("__all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  const [formNama, setFormNama] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState("");
  const [formStatus, setFormStatus] = useState("aktif");

  // Fetch roles
  const { response: rolesRes } = use_query({
    api_tag: "user",
    api_method: "userGetControllerGetRoles",
    api_query: [{}],
  });
  const roleList = useMemo<Role[]>(() => extract_payload_with_pagination<Role>(rolesRes).items, [rolesRes]);

  const queryParams = useMemo(
    () => ({
      query: search || undefined,
      limit: rowsPerPage,
      page: page + 1,
      status: statusFilter !== "__all" ? (statusFilter as any) : undefined,
    }),
    [search, page, rowsPerPage, statusFilter],
  );

  const { response, is_loading, call_back } = use_query({
    api_tag: "user",
    api_method: "userGetControllerFindAll",
    api_query: [queryParams],
  });

  const { items: data, pagination } = useMemo(() => extract_payload_with_pagination<User>(response), [response]);
  const totalRows = Number(pagination?.total_datas ?? data.length) || 0;

  const createUser = use_mutation({
    api_tag: "user",
    api_method: "userPostControllerCreate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "User berhasil ditambahkan!",
    },
  });

  const updateUser = use_mutation({
    api_tag: "user",
    api_method: "userPutControllerUpdate",
    options: {
      call_back: () => {
        call_back();
        closeModal();
      },
      success_message_text: "User berhasil diperbarui!",
    },
  });

  const deleteUser = use_mutation({
    api_tag: "user",
    api_method: "userDeleteControllerRemove",
    options: {
      call_back: () => {
        call_back();
        setConfirmOpen(false);
      },
      success_message_text: "User berhasil dihapus!",
    },
  });

  const openCreateModal = useCallback(() => {
    setSelected(null);
    setFormNama("");
    setFormEmail("");
    setFormPassword("");
    setFormRoleId("");
    setFormStatus("aktif");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: User) => {
    setSelected(item);
    setFormNama(item.nama || "");
    setFormEmail(item.email || "");
    setFormPassword("");
    setFormRoleId(item.roleId || "");
    setFormStatus(item.status || "aktif");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
  }, []);

  const handleSave = useCallback(() => {
    const payload: any = { nama: formNama, email: formEmail, roleId: formRoleId, status: formStatus };
    if (formPassword) payload.password = formPassword;
    if (selected) {
      updateUser([selected.id, payload]);
    } else {
      createUser([payload]);
    }
  }, [formNama, formEmail, formPassword, formRoleId, formStatus, selected, createUser, updateUser]);

  const columns: Column<User>[] = [
    {
      id: "nama",
      label: "Nama",
      width: "22%",
      render: (_, row) => (
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{row.nama}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{row.email}</Typography>
        </Box>
      ),
    },
    {
      id: "role",
      label: "Role",
      width: "15%",
      render: (_, row) => <Chip label={row.role?.nama || "-"} size="small" sx={{ fontSize: "0.72rem" }} />,
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
                label: "Nonaktifkan",
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
          title: "Informasi User",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1 }}>
              {[
                ["Nama", selected.nama],
                ["Email", selected.email],
                ["Role", selected.role?.nama],
                ["Status", selected.status],
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
      title: selected ? "Edit User" : "Tambah User",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Nama *" value={formNama} onChange={(e) => setFormNama(e.target.value)} size="small" fullWidth />
          <TextField label="Email *" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} size="small" fullWidth type="email" />
          <TextField label={selected ? "Password (kosongkan jika tidak ubah)" : "Password *"} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} size="small" fullWidth type="password" />
          <TextField label="Role *" value={formRoleId} onChange={(e) => setFormRoleId(e.target.value)} size="small" fullWidth select>
            {roleList.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.nama}
              </MenuItem>
            ))}
          </TextField>
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
    { label: "Simpan", onClick: handleSave, variant: "primary", disabled: !formNama || !formEmail || !formRoleId || (!selected && !formPassword) },
  ];

  return (
    <DashboardLayout
      sectionTitle="Sistem"
      title="Pengguna"
      headerTitle="Manajemen Pengguna"
      headerDescription="Kelola akun pengguna sistem dan hak akses peran"
      headerAction={
        <SoftButton startIcon={<AddOutlined />} onClick={openCreateModal}>
          Tambah User
        </SoftButton>
      }
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <ServerDataTable
          columns={columns}
          data={data}
          title="Data Pengguna"
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
          onSearchSubmit={() => {}}
          searchPlaceholder="Cari pengguna..."
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
          emptyStateLabel="Tidak ada data pengguna"
        />
      </Box>

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Detail User — ${selected?.nama || ""}`} sections={viewSections} actions={[{ label: "Tutup", onClick: () => setViewModalOpen(false), variant: "ghost" }]} />
      <Modal open={modalOpen} onClose={closeModal} title={selected ? "Edit User" : "Tambah User"} sections={formSections} actions={formActions} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selected) deleteUser([selected.id]);
        }}
        title="Nonaktifkan User"
        message={`Yakin ingin menonaktifkan "${selected?.nama}"?`}
        confirmLabel="Ya, Nonaktifkan"
        cancelLabel="Batal"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default UserPage;
