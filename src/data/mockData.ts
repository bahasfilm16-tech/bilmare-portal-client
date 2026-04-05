import { addDays, subDays, format } from 'date-fns';

export const currentUser = {
  id: 'u1',
  name: 'Sarah Wijaya',
  role: 'Corporate Secretary',
  company: 'PT Maju Bersama Tbk',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
  accessLevel: 'Full Access'
};

export const projectInfo = {
  id: 'p1',
  name: 'Laporan Tahunan 2024 & Laporan Keberlanjutan 2024',
  tier: 'Tier 1 (Verification and Disclosure Readiness)',
  status: 'At Risk',
  statusReason: '3 dokumen sumber belum diterima, estimasi delay 5 hari.',
  deadlineOJK: new Date('2025-04-30'),
  rupsDate: new Date('2025-05-15'),
  currentPhase: 4,
  contractValue: 185000000,
  startDate: new Date('2024-11-01'),
  scope: 'Laporan Tahunan (AR) dan Laporan Keberlanjutan (SR) 2024',
  scopeNotes: 'Tidak termasuk desain grafis dan cetak fisik.'
};

export const bilmareTeam = [
  { id: 't1', name: 'Reza Pratama', role: 'Senior Verification Analyst (Lead)', specialty: 'Financial & Governance', avatar: 'https://i.pravatar.cc/150?u=reza' },
  { id: 't2', name: 'Dina Hartono', role: 'ESG Specialist', specialty: 'Sustainability & Environment', avatar: 'https://i.pravatar.cc/150?u=dina' },
  { id: 't3', name: 'Andi Kusuma', role: 'Financial Disclosure Analyst', specialty: 'Financial Reporting', avatar: 'https://i.pravatar.cc/150?u=andi' }
];

export const phases = [
  { id: 1, name: 'Laporan Keuangan Audited Selesai', status: 'Completed', targetDate: new Date('2025-01-15'), actualDate: new Date('2025-01-14') },
  { id: 2, name: 'Pengumpulan Data Operasional & ESG', status: 'Completed', targetDate: new Date('2025-01-31'), actualDate: new Date('2025-02-05') },
  { id: 3, name: 'Penyusunan Draft Internal', status: 'Completed', targetDate: new Date('2025-02-20'), actualDate: new Date('2025-02-22') },
  { id: 4, name: 'Verifikasi & Penyusunan (Bilmare)', status: 'In Progress', targetDate: new Date('2025-03-20'), actualDate: null },
  { id: 5, name: 'Output Disclosure-Ready', status: 'Not Started', targetDate: new Date('2025-03-25'), actualDate: null },
  { id: 6, name: 'Review Direksi & Corsec', status: 'Not Started', targetDate: new Date('2025-04-05'), actualDate: null },
  { id: 7, name: 'Assurance Provider (Opsional)', status: 'Not Started', targetDate: new Date('2025-04-15'), actualDate: null },
  { id: 8, name: 'Finalisasi, Publikasi & OJK', status: 'Not Started', targetDate: new Date('2025-04-25'), actualDate: null }
];

export const activities = [
  { id: 'a1', type: 'document', description: 'Dokumen "Data Emisi GRK 2024" diterima', actor: 'Sarah Wijaya', timestamp: subDays(new Date(), 0) },
  { id: 'a2', type: 'finding', description: 'Temuan baru ditambahkan: GR-012 (Medium)', actor: 'Dina Hartono', timestamp: subDays(new Date(), 1) },
  { id: 'a3', type: 'draft', description: 'Draft Section "Tata Kelola" v2 diunggah', actor: 'Reza Pratama', timestamp: subDays(new Date(), 2) },
  { id: 'a4', type: 'deliverable', description: 'Cross-Reference Matrix siap diunduh', actor: 'Andi Kusuma', timestamp: subDays(new Date(), 3) },
  { id: 'a5', type: 'comment', description: 'Komentar baru pada draft Laporan Keberlanjutan', actor: 'Sarah Wijaya', timestamp: subDays(new Date(), 4) },
  { id: 'a6', type: 'status', description: 'Temuan GR-005 diubah menjadi Resolved', actor: 'Reza Pratama', timestamp: subDays(new Date(), 5) },
  { id: 'a7', type: 'document', description: 'Laporan Keuangan Audited 2024 diverifikasi', actor: 'Andi Kusuma', timestamp: subDays(new Date(), 6) },
  { id: 'a8', type: 'phase', description: 'Fase 3 (Penyusunan Draft Internal) selesai', actor: 'Sarah Wijaya', timestamp: subDays(new Date(), 10) }
];

export const documents = [
  { id: 'd1', name: 'Laporan Keuangan Audited 2024.pdf', category: 'Laporan Keuangan Audited', uploadDate: new Date('2025-01-14'), size: '4.2 MB', status: 'Verified', version: 'v1', required: true },
  { id: 'd2', name: 'Laporan Tahunan 2023.pdf', category: 'Laporan Tahunan dan Keberlanjutan Tahun Sebelumnya', uploadDate: new Date('2024-11-10'), size: '12.5 MB', status: 'Received', version: 'v1', required: true },
  { id: 'd3', name: 'Laporan Keberlanjutan 2023.pdf', category: 'Laporan Tahunan dan Keberlanjutan Tahun Sebelumnya', uploadDate: new Date('2024-11-10'), size: '8.1 MB', status: 'Received', version: 'v1', required: true },
  { id: 'd4', name: 'Data Operasional Q1-Q4 2024.xlsx', category: 'Laporan Operasional', uploadDate: new Date('2025-02-01'), size: '2.1 MB', status: 'Under Review', version: 'v2', required: true },
  { id: 'd5', name: 'Database Emisi GRK 2024.xlsx', category: 'Database ESG dan Metrik Lingkungan', uploadDate: new Date('2025-02-05'), size: '1.5 MB', status: 'Needs Clarification', version: 'v1', required: true, clarification: 'Terdapat anomali pada data emisi Scope 2 bulan Agustus. Mohon konfirmasi apakah ada perubahan metodologi perhitungan atau kesalahan input.' },
  { id: 'd6', name: 'Data Ketenagakerjaan 2024.xlsx', category: 'Database ESG dan Metrik Lingkungan', uploadDate: new Date('2025-02-04'), size: '1.2 MB', status: 'Verified', version: 'v1', required: true },
  { id: 'd7', name: 'Notulen RUPS 2023.pdf', category: 'Notulen Rapat Direksi', uploadDate: new Date('2024-12-15'), size: '3.4 MB', status: 'Verified', version: 'v1', required: false },
  { id: 'd8', name: 'Notulen Rapat Direksi Q3 2024.pdf', category: 'Notulen Rapat Direksi', uploadDate: new Date('2024-12-20'), size: '2.8 MB', status: 'Received', version: 'v1', required: false },
  { id: 'd9', name: 'Laporan Audit Internal - Kepatuhan.pdf', category: 'Laporan Audit Internal', uploadDate: new Date('2025-01-10'), size: '5.6 MB', status: 'Under Review', version: 'v1', required: false }
];

export const tasks = [
  { id: 'tk1', phaseId: 4, name: 'Review Laporan Keuangan Audited', status: 'Done', assignee: 'Andi Kusuma', dueDate: new Date('2025-02-25') },
  { id: 'tk2', phaseId: 4, name: 'Verifikasi Data ESG (Lingkungan)', status: 'Blocked by Client', assignee: 'Dina Hartono', dueDate: new Date('2025-03-05') },
  { id: 'tk3', phaseId: 4, name: 'Verifikasi Data Ketenagakerjaan', status: 'Done', assignee: 'Dina Hartono', dueDate: new Date('2025-03-02') },
  { id: 'tk4', phaseId: 4, name: 'Cross-referencing Draft AR vs Audited Financials', status: 'In Progress', assignee: 'Andi Kusuma', dueDate: new Date('2025-03-10') },
  { id: 'tk5', phaseId: 4, name: 'Review Narasi Tata Kelola', status: 'To Do', assignee: 'Reza Pratama', dueDate: new Date('2025-03-15') },
  { id: 'tk6', phaseId: 4, name: 'Penyusunan Gap Register Draft 1', status: 'In Progress', assignee: 'Reza Pratama', dueDate: new Date('2025-03-12') }
];

export const gapFindings = [
  { id: 'GR-001', riskLevel: 'High', report: 'AR', section: 'Tinjauan Keuangan, hal. 8', description: 'Inkonsistensi angka pendapatan', type: 'Inkonsistensi Data', status: 'Open', dateFound: new Date('2025-02-26'), detail: 'Laporan Tahunan hal.8 menyebutkan pendapatan Rp 4,18 triliun, sedangkan Laporan Keuangan Audited hal.12 menyebutkan Rp 4,2 triliun.', recommendation: 'Revisi angka di Laporan Tahunan agar sesuai dengan Laporan Keuangan Audited (Rp 4,2 triliun).' },
  { id: 'GR-002', riskLevel: 'High', report: 'SR', section: 'Kinerja Lingkungan, hal. 24', description: 'Baseline emisi karbon 2022 tidak terdokumentasi', type: 'Time-Series Break', status: 'Open', dateFound: new Date('2025-02-28'), detail: 'Laporan Keberlanjutan menyebutkan penurunan emisi 15% dari baseline 2022, namun data absolut emisi 2022 tidak ditemukan di laporan tahun sebelumnya maupun database internal.', recommendation: 'Sediakan data absolut emisi 2022 beserta metodologi perhitungannya, atau ubah narasi klaim.' },
  { id: 'GR-003', riskLevel: 'Medium', report: 'AR', section: 'Profil Perusahaan, hal. 47', description: 'Klaim "pemimpin pasar di segmen retail banking" tanpa sumber', type: 'Klaim Tanpa Sumber', status: 'In Resolution', dateFound: new Date('2025-03-01'), detail: 'Terdapat klaim sebagai pemimpin pasar, namun tidak ada referensi data pihak ketiga (misal: riset pasar, data OJK) yang mendukung klaim ini.', recommendation: 'Tambahkan footnote referensi sumber data, atau lunakkan klaim menjadi "salah satu pemain utama".' },
  { id: 'GR-004', riskLevel: 'Low', report: 'SR', section: 'Ketenagakerjaan, hal. 30', description: 'Definisi "Turnover Rate" berubah dari tahun lalu', type: 'Definisi Metrik Berubah', status: 'Resolved', dateFound: new Date('2025-02-25'), detail: 'Tahun lalu turnover dihitung dari total karyawan tetap. Tahun ini dihitung dari total karyawan (tetap + kontrak).', recommendation: 'Tambahkan catatan kaki yang menjelaskan perubahan definisi dan sajikan ulang (restate) data tahun lalu menggunakan definisi baru agar sebanding.' },
  { id: 'GR-005', riskLevel: 'Medium', report: 'AR', section: 'Tata Kelola, hal. 60', description: 'Cakupan komite audit tidak jelas', type: 'Cakupan Tidak Jelas', status: 'Client Acknowledged', dateFound: new Date('2025-03-02'), detail: 'Penjelasan mengenai frekuensi rapat komite audit tidak menyebutkan apakah memenuhi syarat minimal OJK.', recommendation: 'Tambahkan kalimat eksplisit mengenai jumlah rapat yang diadakan selama 2024 dan konfirmasi kepatuhan terhadap regulasi OJK.' },
  { id: 'GR-006', riskLevel: 'High', report: 'SR', section: 'K3, hal. 35', description: 'Data Zero Accident tidak konsisten dengan laporan internal', type: 'Inkonsistensi Data', status: 'Open', dateFound: new Date('2025-03-05'), detail: 'Draft SR mengklaim Zero Accident, namun Laporan Audit Internal Kepatuhan mencatat 2 insiden minor di Q3.', recommendation: 'Klarifikasi definisi "Accident" yang digunakan di SR. Jika insiden minor tidak dihitung, jelaskan definisinya. Jika salah, revisi klaim.' },
  { id: 'GR-007', riskLevel: 'Low', report: 'AR', section: 'Tanggung Jawab Sosial, hal. 80', description: 'Typo pada nama program CSR', type: 'Inkonsistensi Data', status: 'Resolved', dateFound: new Date('2025-02-20'), detail: 'Tertulis "Maju Bersama Cerdas", seharusnya "Maju Bersama Pintar" sesuai dokumen legal.', recommendation: 'Perbaiki typo.' },
  { id: 'GR-008', riskLevel: 'Medium', report: 'SR', section: 'Pengelolaan Limbah, hal. 40', description: 'Volume limbah B3 turun drastis tanpa penjelasan', type: 'Time-Series Break', status: 'Open', dateFound: new Date('2025-03-06'), detail: 'Volume limbah B3 turun 60% YoY, namun tidak ada penjelasan inisiatif apa yang menyebabkan penurunan ini.', recommendation: 'Tambahkan narasi yang menjelaskan alasan operasional di balik penurunan drastis ini agar tidak dianggap sebagai kesalahan data.' },
  { id: 'GR-009', riskLevel: 'Medium', report: 'AR', section: 'Analisis MD&A, hal. 25', description: 'Proyeksi pertumbuhan tidak sejalan dengan kondisi makro', type: 'Klaim Tanpa Sumber', status: 'In Resolution', dateFound: new Date('2025-03-04'), detail: 'Proyeksi pertumbuhan kredit 20% di 2025 tidak didukung oleh analisis makroekonomi di halaman sebelumnya.', recommendation: 'Tambahkan justifikasi mengapa target tersebut realistis di tengah kondisi makro yang menantang.' },
  { id: 'GR-010', riskLevel: 'High', report: 'AR', section: 'Remunerasi Direksi, hal. 70', description: 'Total remunerasi tidak match dengan catatan laporan keuangan', type: 'Inkonsistensi Data', status: 'Client Acknowledged', dateFound: new Date('2025-03-07'), detail: 'Total remunerasi di tabel tata kelola Rp 15 M, di catatan atas laporan keuangan Rp 15.5 M.', recommendation: 'Rekonsiliasi angka dengan tim finance dan gunakan angka dari Laporan Keuangan Audited.' },
  { id: 'GR-011', riskLevel: 'Low', report: 'SR', section: 'Pelatihan Karyawan, hal. 32', description: 'Rata-rata jam pelatihan tidak di-breakdown per gender', type: 'Cakupan Tidak Jelas', status: 'Resolved', dateFound: new Date('2025-02-22'), detail: 'Standar GRI mensyaratkan breakdown per gender dan kategori karyawan.', recommendation: 'Tambahkan tabel breakdown sesuai standar GRI.' },
  { id: 'GR-012', riskLevel: 'Medium', report: 'AR', section: 'Manajemen Risiko, hal. 55', description: 'Risiko siber belum dimasukkan sebagai risiko utama', type: 'Cakupan Tidak Jelas', status: 'Open', dateFound: new Date('2025-03-08'), detail: 'Mengingat insiden industri baru-baru ini, regulator mengharapkan risiko siber dibahas secara komprehensif.', recommendation: 'Tambahkan sub-section khusus mengenai risiko keamanan siber dan mitigasinya.' }
];

export const crossReferenceClaims = [
  { id: 'CR-001', claim: 'Pendapatan meningkat 23% menjadi Rp 4,2 triliun pada 2024.', report: 'AR, hal. 8', category: 'Finansial', sourceDoc: 'Laporan Keuangan Audited 2024', sourcePage: '12', verificationDate: new Date('2025-02-26'), verifier: 'Andi Kusuma', status: 'Inconsistent', currentYearValue: 'Rp 4,18 triliun (Draft)', lastYearValue: 'Rp 3,4 triliun', lastYearSource: 'AR 2023' },
  { id: 'CR-002', claim: 'Laba bersih mencapai Rp 850 miliar.', report: 'AR, hal. 9', category: 'Finansial', sourceDoc: 'Laporan Keuangan Audited 2024', sourcePage: '13', verificationDate: new Date('2025-02-26'), verifier: 'Andi Kusuma', status: 'Consistent', currentYearValue: 'Rp 850 miliar', lastYearValue: 'Rp 720 miliar', lastYearSource: 'AR 2023' },
  { id: 'CR-003', claim: 'Total karyawan mencapai 1.500 orang.', report: 'SR, hal. 15', category: 'ESG', sourceDoc: 'Data Ketenagakerjaan 2024.xlsx', sourcePage: 'Sheet 1', verificationDate: new Date('2025-03-02'), verifier: 'Dina Hartono', status: 'Consistent', currentYearValue: '1.500', lastYearValue: '1.450', lastYearSource: 'SR 2023' },
  { id: 'CR-004', claim: 'Emisi GRK Scope 1 turun 5%.', report: 'SR, hal. 20', category: 'ESG', sourceDoc: 'Database Emisi GRK 2024.xlsx', sourcePage: 'Sheet 2', verificationDate: new Date('2025-03-05'), verifier: 'Dina Hartono', status: 'Unverified', currentYearValue: 'Turun 5%', lastYearValue: 'Naik 2%', lastYearSource: 'SR 2023' },
  { id: 'CR-005', claim: 'Terdapat 5 anggota Dewan Komisaris.', report: 'AR, hal. 40', category: 'Tata Kelola', sourceDoc: 'Notulen RUPS 2023.pdf', sourcePage: '5', verificationDate: new Date('2025-02-28'), verifier: 'Reza Pratama', status: 'Consistent', currentYearValue: '5', lastYearValue: '5', lastYearSource: 'AR 2023' },
  { id: 'CR-006', claim: 'NPL Gross terjaga di level 2.1%.', report: 'AR, hal. 15', category: 'Operasional', sourceDoc: 'Data Operasional Q1-Q4 2024.xlsx', sourcePage: 'Sheet 3', verificationDate: new Date('2025-03-01'), verifier: 'Andi Kusuma', status: 'Consistent', currentYearValue: '2.1%', lastYearValue: '2.3%', lastYearSource: 'AR 2023' },
  { id: 'CR-007', claim: 'Penyaluran kredit UMKM mencapai 30% dari total portofolio.', report: 'AR, hal. 18', category: 'Strategis', sourceDoc: 'Data Operasional Q1-Q4 2024.xlsx', sourcePage: 'Sheet 4', verificationDate: new Date('2025-03-01'), verifier: 'Andi Kusuma', status: 'Inconsistent', currentYearValue: '30% (Draft)', lastYearValue: '28%', lastYearSource: 'AR 2023' },
  { id: 'CR-008', claim: 'Zero Accident selama tahun 2024.', report: 'SR, hal. 35', category: 'ESG', sourceDoc: 'Laporan Audit Internal - Kepatuhan.pdf', sourcePage: '10', verificationDate: new Date('2025-03-05'), verifier: 'Dina Hartono', status: 'Inconsistent', currentYearValue: '0', lastYearValue: '0', lastYearSource: 'SR 2023' },
  { id: 'CR-009', claim: 'Dana CSR yang disalurkan sebesar Rp 10 miliar.', report: 'SR, hal. 45', category: 'ESG', sourceDoc: 'Laporan Keuangan Audited 2024', sourcePage: '45', verificationDate: new Date('2025-02-27'), verifier: 'Andi Kusuma', status: 'Consistent', currentYearValue: 'Rp 10 miliar', lastYearValue: 'Rp 8 miliar', lastYearSource: 'SR 2023' },
  { id: 'CR-010', claim: 'Rapat Direksi diadakan sebanyak 12 kali.', report: 'AR, hal. 50', category: 'Tata Kelola', sourceDoc: 'Notulen Rapat Direksi Q3 2024.pdf', sourcePage: 'Multiple', verificationDate: new Date('2025-03-03'), verifier: 'Reza Pratama', status: 'Unverified', currentYearValue: '12', lastYearValue: '12', lastYearSource: 'AR 2023' },
  { id: 'CR-011', claim: 'Rasio kecukupan modal (CAR) sebesar 22%.', report: 'AR, hal. 20', category: 'Finansial', sourceDoc: 'Laporan Keuangan Audited 2024', sourcePage: '15', verificationDate: new Date('2025-02-26'), verifier: 'Andi Kusuma', status: 'Consistent', currentYearValue: '22%', lastYearValue: '21.5%', lastYearSource: 'AR 2023' },
  { id: 'CR-012', claim: 'Penggunaan energi terbarukan mencapai 15%.', report: 'SR, hal. 22', category: 'ESG', sourceDoc: 'Database Emisi GRK 2024.xlsx', sourcePage: 'Sheet 3', verificationDate: new Date('2025-03-06'), verifier: 'Dina Hartono', status: 'Unverified', currentYearValue: '15%', lastYearValue: '10%', lastYearSource: 'SR 2023' },
  { id: 'CR-013', claim: 'Tingkat kepuasan pelanggan mencapai 95%.', report: 'AR, hal. 30', category: 'Operasional', sourceDoc: 'Laporan Operasional', sourcePage: 'N/A', verificationDate: new Date('2025-03-07'), verifier: 'Reza Pratama', status: 'Inconsistent', currentYearValue: '95%', lastYearValue: '92%', lastYearSource: 'AR 2023' },
  { id: 'CR-014', claim: 'Tidak ada denda terkait pelanggaran lingkungan.', report: 'SR, hal. 50', category: 'Tata Kelola', sourceDoc: 'Laporan Audit Internal - Kepatuhan.pdf', sourcePage: '12', verificationDate: new Date('2025-03-04'), verifier: 'Reza Pratama', status: 'Consistent', currentYearValue: '0', lastYearValue: '0', lastYearSource: 'SR 2023' },
  { id: 'CR-015', claim: 'Peluncuran 3 produk digital baru.', report: 'AR, hal. 22', category: 'Strategis', sourceDoc: 'Data Operasional Q1-Q4 2024.xlsx', sourcePage: 'Sheet 5', verificationDate: new Date('2025-03-01'), verifier: 'Andi Kusuma', status: 'Consistent', currentYearValue: '3', lastYearValue: '2', lastYearSource: 'AR 2023' }
];

export const draftSections = [
  { id: 's1', report: 'AR', name: 'Profil Perusahaan', status: 'Approved', readiness: 'High', content: 'PT Maju Bersama Tbk adalah perusahaan jasa keuangan terkemuka di Indonesia. Didirikan pada tahun 1990, perusahaan terus berinovasi memberikan layanan terbaik bagi nasabah.' },
  { id: 's2', report: 'AR', name: 'Tinjauan Keuangan', status: 'Needs Client Input', readiness: 'Low', content: 'Pada tahun 2024, perusahaan mencatatkan pendapatan sebesar Rp 4,18 triliun, meningkat dibandingkan tahun sebelumnya. Laba bersih mencapai Rp 850 miliar.' },
  { id: 's3', report: 'AR', name: 'Tata Kelola Perusahaan', status: 'Under Review', readiness: 'Medium', content: 'Perusahaan berkomitmen menerapkan prinsip Good Corporate Governance (GCG) secara konsisten. Dewan Komisaris dan Direksi secara rutin mengadakan rapat evaluasi.' },
  { id: 's4', report: 'SR', name: 'Kinerja Lingkungan', status: 'Needs Client Input', readiness: 'Low', content: 'Kami terus berupaya mengurangi jejak karbon. Pada tahun 2024, emisi GRK Scope 1 dan 2 berhasil diturunkan sebesar 15% dibandingkan baseline tahun 2022.' },
  { id: 's5', report: 'SR', name: 'Ketenagakerjaan & K3', status: 'Under Review', readiness: 'Medium', content: 'Kesehatan dan keselamatan kerja adalah prioritas utama. Kami mencatatkan Zero Accident selama tahun 2024 di seluruh area operasional.' },
  { id: 's6', report: 'SR', name: 'Tanggung Jawab Sosial', status: 'Approved', readiness: 'High', content: 'Program CSR "Maju Bersama Pintar" telah menjangkau lebih dari 10.000 siswa di seluruh Indonesia dengan total penyaluran dana sebesar Rp 10 miliar.' }
];

export const draftComments = [
  { id: 'c1', sectionId: 's2', author: 'Andi Kusuma', text: 'Angka pendapatan di sini (Rp 4,18 T) berbeda dengan Laporan Keuangan Audited (Rp 4,2 T). Mohon konfirmasi.', status: 'Open', timestamp: new Date('2025-03-08T10:00:00') },
  { id: 'c2', sectionId: 's4', author: 'Dina Hartono', text: 'Data baseline emisi 2022 belum kami terima. Mohon dilampirkan agar klaim penurunan 15% dapat diverifikasi.', status: 'Open', timestamp: new Date('2025-03-07T14:30:00') },
  { id: 'c3', sectionId: 's5', author: 'Reza Pratama', text: 'Klaim Zero Accident bertentangan dengan temuan Audit Internal yang mencatat 2 insiden minor. Perlu penyesuaian narasi.', status: 'Open', timestamp: new Date('2025-03-06T09:15:00') },
  { id: 'c4', sectionId: 's3', author: 'Reza Pratama', text: 'Mohon tambahkan detail jumlah rapat Komite Audit selama tahun 2024.', status: 'Resolved', timestamp: new Date('2025-03-05T11:20:00') },
  { id: 'c5', sectionId: 's1', author: 'Sarah Wijaya', text: 'Sudah saya tambahkan visi misi terbaru sesuai RUPS terakhir.', status: 'Resolved', timestamp: new Date('2025-03-04T16:45:00') }
];

export const deliverables = [
  { id: 'del1', name: 'Draft Laporan Tahunan 2024 — Verified', description: 'Draft final Laporan Tahunan yang telah diverifikasi dan siap untuk layout.', status: 'Ready for Download', dateAvailable: new Date('2025-03-09') },
  { id: 'del2', name: 'Draft Laporan Keberlanjutan 2024 — Verified', description: 'Draft final Laporan Keberlanjutan sesuai standar GRI.', status: 'In Preparation', dateAvailable: null },
  { id: 'del3', name: 'Cross-Reference Matrix (Excel)', description: 'Matriks keterlacakan seluruh klaim material ke dokumen sumber.', status: 'Ready for Download', dateAvailable: new Date('2025-03-08') },
  { id: 'del4', name: 'Disclosure Risk and Gap Register Final', description: 'Daftar lengkap temuan risiko pengungkapan dan status resolusinya.', status: 'In Preparation', dateAvailable: null },
  { id: 'del5', name: 'Time-Series Database 2022-2024 (Excel)', description: 'Database metrik historis 3 tahun terakhir.', status: 'Ready for Download', dateAvailable: new Date('2025-03-05') },
  { id: 'del6', name: 'IR FAQ Databook', description: 'Panduan Q&A untuk Investor Relations.', status: 'Ready for Download', dateAvailable: new Date('2025-03-07') },
  { id: 'del7', name: 'Review Notes with Senior Sign-off', description: 'Catatan review internal Bilmare dengan persetujuan partner.', status: 'Pending', dateAvailable: null },
  { id: 'del8', name: 'Assurance Readiness Summary', description: 'Ringkasan kesiapan laporan untuk diaudit oleh pihak ketiga.', status: 'In Preparation', dateAvailable: null }
];

export const timeSeriesMetrics = [
  { id: 'm1', name: 'Pendapatan Operasional', definition: 'Total pendapatan dari kegiatan operasional utama.', unit: 'Rp Miliar', methodology: 'PSAK 72', yearEffective: 2020, data: { '2022': 3100, '2023': 3400, '2024': 4200 }, category: 'Finansial' },
  { id: 'm2', name: 'Laba Bersih', definition: 'Laba tahun berjalan yang dapat diatribusikan kepada pemilik entitas induk.', unit: 'Rp Miliar', methodology: 'PSAK', yearEffective: 2020, data: { '2022': 650, '2023': 720, '2024': 850 }, category: 'Finansial' },
  { id: 'm3', name: 'Total Karyawan', definition: 'Jumlah karyawan tetap dan kontrak per 31 Desember.', unit: 'Orang', methodology: 'Headcount', yearEffective: 2022, data: { '2022': 1350, '2023': 1450, '2024': 1500 }, category: 'ESG' },
  { id: 'm4', name: 'Emisi GRK Scope 1', definition: 'Emisi langsung dari sumber yang dimiliki atau dikendalikan perusahaan.', unit: 'tCO2e', methodology: 'GHG Protocol', yearEffective: 2022, data: { '2022': 12500, '2023': 12750, '2024': 12112 }, category: 'ESG' },
  { id: 'm5', name: 'Emisi GRK Scope 2', definition: 'Emisi tidak langsung dari konsumsi energi listrik yang dibeli.', unit: 'tCO2e', methodology: 'GHG Protocol', yearEffective: 2022, data: { '2022': 8400, '2023': 8200, '2024': 7800 }, category: 'ESG' },
  { id: 'm6', name: 'NPL Gross', definition: 'Rasio kredit bermasalah terhadap total kredit.', unit: '%', methodology: 'Ketentuan OJK', yearEffective: 2020, data: { '2022': 2.5, '2023': 2.3, '2024': 2.1 }, category: 'Operasional' },
  { id: 'm7', name: 'Porsi Kredit UMKM', definition: 'Persentase kredit UMKM terhadap total portofolio kredit.', unit: '%', methodology: 'Internal', yearEffective: 2021, data: { '2022': 25, '2023': 28, '2024': 30 }, category: 'Strategis' },
  { id: 'm8', name: 'Jumlah Insiden K3', definition: 'Total insiden kecelakaan kerja yang mengakibatkan hilangnya hari kerja.', unit: 'Kejadian', methodology: 'Standar Kemenaker', yearEffective: 2020, data: { '2022': 2, '2023': 0, '2024': 0 }, category: 'ESG' },
  { id: 'm9', name: 'Dana CSR', definition: 'Total dana yang disalurkan untuk program Tanggung Jawab Sosial dan Lingkungan.', unit: 'Rp Miliar', methodology: 'Internal', yearEffective: 2020, data: { '2022': 7.5, '2023': 8.0, '2024': 10.0 }, category: 'ESG' },
  { id: 'm10', name: 'Rasio Kecukupan Modal (CAR)', definition: 'Rasio modal terhadap aset tertimbang menurut risiko.', unit: '%', methodology: 'Ketentuan OJK', yearEffective: 2020, data: { '2022': 20.5, '2023': 21.5, '2024': 22.0 }, category: 'Finansial' }
];

export const faqs = [
  { id: 'FAQ-001', category: 'Finansial', question: 'Apa pendorong utama pertumbuhan pendapatan 23% di tahun 2024?', answer: 'Pertumbuhan didorong oleh ekspansi kredit di segmen UMKM dan peningkatan fee-based income dari layanan digital baru.', reference: 'AR hal. 15, 22', sensitivity: 'Normal', status: 'Verified' },
  { id: 'FAQ-002', category: 'ESG', question: 'Mengapa target emisi net-zero perusahaan baru dicanangkan untuk 2060, bukan 2050?', answer: 'Kami menyelaraskan target dengan komitmen nasional (NDC) Indonesia. Transisi energi di sektor kami membutuhkan kesiapan infrastruktur nasional yang memadai.', reference: 'SR hal. 18', sensitivity: 'Sensitive', status: 'Verified' },
  { id: 'FAQ-003', category: 'Tata Kelola', question: 'Apakah ada pergantian direksi yang direncanakan pada RUPS mendatang?', answer: 'Susunan direksi saat ini masih dalam masa jabatan aktif. Keputusan pergantian sepenuhnya merupakan wewenang pemegang saham pada RUPS.', reference: 'AR hal. 45', sensitivity: 'Sensitive', status: 'Draft' },
  { id: 'FAQ-004', category: 'Operasional', question: 'Bagaimana strategi perusahaan menjaga NPL di tengah kenaikan suku bunga?', answer: 'Kami menerapkan restrukturisasi selektif dan memperketat kriteria underwriting untuk sektor-sektor rentan.', reference: 'AR hal. 28', sensitivity: 'Normal', status: 'Verified' },
  { id: 'FAQ-005', category: 'Strategis', question: 'Berapa target pertumbuhan kredit untuk tahun 2025?', answer: 'Kami memproyeksikan pertumbuhan kredit yang moderat di kisaran 10-12%, sejalan dengan proyeksi pertumbuhan ekonomi nasional.', reference: 'AR hal. 25', sensitivity: 'Normal', status: 'Needs Update' },
  { id: 'FAQ-006', category: 'ESG', question: 'Bagaimana perusahaan memastikan tidak ada greenwashing dalam laporan keberlanjutan ini?', answer: 'Laporan ini disusun berdasarkan standar GRI dan telah melalui proses verifikasi independen oleh Bilmare untuk memastikan akurasi dan keterlacakan data.', reference: 'SR hal. 5', sensitivity: 'Sensitive', status: 'Verified' },
  { id: 'FAQ-007', category: 'Finansial', question: 'Mengapa rasio dividen (dividend payout ratio) tahun ini lebih rendah dari tahun lalu?', answer: 'Perusahaan menahan sebagian laba untuk memperkuat permodalan guna mendukung rencana ekspansi digital di tahun 2025.', reference: 'AR hal. 10', sensitivity: 'Normal', status: 'Verified' },
  { id: 'FAQ-008', category: 'Operasional', question: 'Berapa persentase transaksi yang kini dilakukan melalui kanal digital?', answer: 'Hingga akhir 2024, 85% transaksi nasabah telah beralih ke kanal digital, meningkat dari 75% di tahun sebelumnya.', reference: 'AR hal. 32', sensitivity: 'Normal', status: 'Verified' },
  { id: 'FAQ-009', category: 'Tata Kelola', question: 'Bagaimana perusahaan memitigasi risiko serangan siber?', answer: 'Kami telah mengalokasikan capex IT yang signifikan untuk peningkatan sistem keamanan, melakukan penetration testing berkala, dan memperoleh sertifikasi ISO 27001.', reference: 'AR hal. 55', sensitivity: 'Normal', status: 'Draft' },
  { id: 'FAQ-010', category: 'ESG', question: 'Apa fokus utama program CSR perusahaan tahun depan?', answer: 'Fokus kami tetap pada literasi keuangan dan pendidikan melalui program "Maju Bersama Pintar", dengan target menjangkau daerah 3T.', reference: 'SR hal. 46', sensitivity: 'Normal', status: 'Verified' },
  { id: 'FAQ-011', category: 'Strategis', question: 'Apakah ada rencana akuisisi bank digital dalam waktu dekat?', answer: 'Saat ini kami fokus pada pengembangan kapabilitas digital internal. Namun, kami selalu terbuka terhadap peluang inorganik yang dapat memberikan nilai tambah.', reference: 'N/A', sensitivity: 'Sensitive', status: 'Verified' },
  { id: 'FAQ-012', category: 'Finansial', question: 'Bagaimana dampak fluktuasi nilai tukar rupiah terhadap kinerja keuangan?', answer: 'Dampak langsung relatif minimal karena sebagian besar aset dan liabilitas kami berdenominasi rupiah. Kami juga melakukan hedging untuk kewajiban valas.', reference: 'AR hal. 60', sensitivity: 'Normal', status: 'Verified' }
];

export const messages = [
  { id: 'msg1', sender: 'Reza Pratama', avatar: 'https://i.pravatar.cc/150?u=reza', text: 'Halo Bu Sarah, kami sudah mengunggah draft Gap Register awal. Ada beberapa temuan High Risk terkait inkonsistensi data keuangan.', timestamp: new Date('2025-03-08T09:00:00'), isBilmare: true },
  { id: 'msg2', sender: 'Sarah Wijaya', avatar: 'https://i.pravatar.cc/150?u=sarah', text: 'Baik Pak Reza, saya akan review bersama tim finance siang ini.', timestamp: new Date('2025-03-08T09:15:00'), isBilmare: false },
  { id: 'msg3', sender: 'Dina Hartono', avatar: 'https://i.pravatar.cc/150?u=dina', text: 'Tolong lihat temuan GR-002 terkait baseline emisi 2022. Kami butuh data historisnya untuk memvalidasi klaim penurunan 15%.', timestamp: new Date('2025-03-08T10:30:00'), isBilmare: true, link: '/gap-register?id=GR-002' },
  { id: 'msg4', sender: 'Sarah Wijaya', avatar: 'https://i.pravatar.cc/150?u=sarah', text: 'Data emisi 2022 sedang dicari oleh tim HSE. Sepertinya dulu dihitung manual. Saya update besok ya.', timestamp: new Date('2025-03-08T11:00:00'), isBilmare: false },
  { id: 'msg5', sender: 'Andi Kusuma', avatar: 'https://i.pravatar.cc/150?u=andi', text: 'Cross-Reference Matrix sudah kami update dengan data terbaru dari Laporan Operasional Q4.', timestamp: new Date('2025-03-09T08:45:00'), isBilmare: true }
];

export const users = [
  { id: 'u1', name: 'Sarah Wijaya', title: 'Corporate Secretary', email: 'sarah.w@majubersama.com', role: 'Full Access', status: 'Active', lastAccess: new Date('2025-03-09T10:00:00') },
  { id: 'u2', name: 'Budi Santoso', title: 'CFO', email: 'budi.s@majubersama.com', role: 'Full Access', status: 'Active', lastAccess: new Date('2025-03-08T15:30:00') },
  { id: 'u3', name: 'Anita Rahman', title: 'IR Manager', email: 'anita.r@majubersama.com', role: 'Review Only', status: 'Active', lastAccess: new Date('2025-03-09T09:15:00') },
  { id: 'u4', name: 'Kevin Wijaya', title: 'Finance Staff', email: 'kevin.w@majubersama.com', role: 'Document Submitter', status: 'Active', lastAccess: new Date('2025-03-07T11:00:00') },
  { id: 'u5', name: 'Linda Kusuma', title: 'HSE Manager', email: 'linda.k@majubersama.com', role: 'Document Submitter', status: 'Inactive', lastAccess: new Date('2025-02-15T14:00:00') }
];
