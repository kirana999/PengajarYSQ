/**
 * laporan-pengajar.js
 * BAGIAN 1: DATA MANAGEMENT (Tempat Backend Terhubung)
 */

// Teman Anda cukup mengupdate isi array ini dari Database/API
let dataRekapRapor = [
    { nama: "Ahmad Fauzan", tahsin: 92.50, tahfidz: "30, 29", absen: "100%", status: "Selesai", kategori: "Anak" },
    { nama: "Zaidan Ali", tahsin: 85.00, tahfidz: "30", absen: "95%", status: "Selesai", kategori: "Anak" },
    { nama: "Fathir Muhammad", tahsin: 0, tahfidz: "-", absen: "98%", status: "Belum Selesai", kategori: "Dewasa" },
    { nama: "Siti Aminah", tahsin: 88.00, tahfidz: "30, 29, 28", absen: "100%", status: "Selesai", kategori: "Anak" },
    { nama: "Budi Santoso", tahsin: 0, tahfidz: "-", absen: "75%", status: "Belum Selesai", kategori: "Dewasa" }
];

/**
 * BAGIAN 2: LOGIKA TAMPILAN (UI LOGIC)
 * Jangan diubah kecuali ingin mengganti desain/layout
 */

// 1. RENDER TABEL & STATISTIK
function renderLaporanTable(kategoriFilter) {
    const tbody = document.getElementById('laporan-tbody');
    if (!tbody) return;

    let rows = "";
    let stats = { total: 0, done: 0, pending: 0 };

    // Filter data berdasarkan kategori
    const filteredData = dataRekapRapor.filter(item => item.kategori === kategoriFilter);

    filteredData.forEach(s => {
        stats.total++;
        const isDone = s.status === "Selesai";
        isDone ? stats.done++ : stats.pending++;

        const badgeClass = isDone ? "status-done" : "status-pending";
        const nilaiTahsin = s.tahsin > 0 ? s.tahsin.toFixed(2) : '-';

        rows += `
            <tr>
                <td style="text-align: left; font-weight: 500;">${s.nama}</td>
                <td><strong style="color: #2d5a3f;">${nilaiTahsin}</strong></td>
                <td>${s.tahfidz}</td>
                <td>${s.absen}</td>
                <td style="text-align: right; padding-right: 25px;">
                    <span class="badge-status ${badgeClass}">${s.status}</span>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rows || '<tr><td colspan="5">Tidak ada data untuk kategori ini.</td></tr>';

    // Update Kartu Statistik
    document.getElementById('stat-total-santri').innerText = stats.total;
    document.getElementById('stat-done').innerText = stats.done;
    document.getElementById('stat-pending').innerText = stats.pending;
}

// 2. FUNGSI UPDATE PERIODE (Triggered by Dropdown)
function updatePeriode() {
    const filterKategori = document.getElementById('filter-kategori').value;
    const periodeInfo = document.getElementById('periode-info');
    
    periodeInfo.innerText = (filterKategori === "Anak") 
        ? "Periode: Semester (Laporan Per 6 Bulan)" 
        : "Periode: Tahunan (Laporan Per 1 Tahun)";

    renderLaporanTable(filterKategori);
}

/**
 * BAGIAN 3: SISTEM EKSPOR EXCEL
 * Menggunakan Library SheetJS
 */
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert("Gagal: Library Excel tidak terdeteksi!");
        return;
    }

    const kategori = document.getElementById('filter-kategori').value;
    const table = document.getElementById("tabel-laporan-utama");
    const ws = XLSX.utils.table_to_sheet(table);

    // Styling Lebar Kolom Excel
    ws['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Laporan");
    
    XLSX.writeFile(wb, `YSQ_Laporan_${kategori}_${new Date().getTime()}.xlsx`);
}

/**
 * BAGIAN 4: INISIALISASI
 */
window.onload = function() {
    // Set Tanggal
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateDisplay = document.getElementById('text-tanggal');
    if (dateDisplay) dateDisplay.innerText = new Date().toLocaleDateString('id-ID', options);
    
    updatePeriode(); // Jalankan tampilan awal
};