// ─── Auth Role Enum ───────────────────────────────────────────────────────────
// Sesuaikan nilai-nilai ini dengan role yang ada di sistem auth aplikasi kamu.
// EJenisActor digunakan oleh auth-init-signal.ts dan sidebar navigation.
export enum EJenisActor {
  PEGAWAI = "Pegawai",
  ADMIN = "Admin",
  // TODO: Tambahkan atau sesuaikan role sesuai kebutuhan aplikasi
  // Contoh:
  // MANAGER = "Manager",
  // SUPERADMIN = "SuperAdmin",
}

// ─── Tambahkan enum lainnya di bawah ini ─────────────────────────────────────
// Contoh:
// export enum EStatus {
//   AKTIF = "AKTIF",
//   NONAKTIF = "NONAKTIF",
// }
