/**
 * rapor-pengajar.js
 * JS KHUSUS PENGAJAR - MANAJEMEN RAPOR YSQ
 * Menangani validasi nilai 0-100 dan kalkulasi otomatis.
 */

// 1. INISIALISASI TABEL TAHFIDZ (30 JUZ)
// Fungsi ini mengisi baris tabel secara otomatis saat script dimuat
(function initTabelTahfidz() {
    const tbody = document.getElementById('tahfidz-tbody');
    if (!tbody) return;

    let rows = "";
    for (let i = 1; i <= 30; i++) {
        rows += `
            <tr>
                <td>Juz ${i}</td>
                <td><input type="date" class="input-rapor-style-mini" style="width: auto;"></td>
                <td>
                    <input type="number" class="input-rapor-style-mini val-juz" 
                           placeholder="0" oninput="validateRange(this); hitungRataTahfidz()">
                </td>
            </tr>`;
    }
    tbody.innerHTML = rows;
})();

// 2. FUNGSI VALIDASI NILAI (0-100)
// Mencegah input nilai di luar standar penilaian YSQ
function validateRange(input) {
    const val = parseFloat(input.value);
    if (val < 0 || val > 100) {
        alert("Peringatan: Nilai harus berada di rentang 0 - 100.");
        input.value = ""; 
        
        // Update kalkulasi setelah reset
        if (input.classList.contains('val-tahsin')) hitungRataTahsin();
        if (input.classList.contains('val-juz') || input.id === 'n_uas_tahfidz') hitungRataTahfidz();
    }
}

// 3. LOGIKA HITUNG TAHSIN
// Menghitung rata-rata dari 4 komponen penilaian harian
function hitungRataTahsin() {
    const p = parseFloat(document.getElementById('n_pekanan').value) || 0;
    const t = parseFloat(document.getElementById('n_tilawah').value) || 0;
    const tr = parseFloat(document.getElementById('n_teori').value) || 0;
    const a = parseFloat(document.getElementById('n_absen').value) || 0;
    
    const total = (p + t + tr + a) / 4;
    const display = document.getElementById('total_rata_tahsin');
    
    if (display) {
        display.innerText = total.toFixed(2);
    }
}

// 4. LOGIKA HITUNG TAHFIDZ
// Menghitung rata-rata simakan juz yang terisi, lalu dirata-ratakan dengan UAS
function hitungRataTahfidz() {
    const inputsJuz = document.querySelectorAll('.val-juz');
    let totalJuz = 0;
    let count = 0;

    // Hitung rata-rata simakan harian
    inputsJuz.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) {
            totalJuz += val;
            count++;
        }
    });

    const rataSimakan = count > 0 ? (totalJuz / count) : 0;
    const displaySimakan = document.getElementById('rata_simakan');
    if (displaySimakan) displaySimakan.innerText = rataSimakan.toFixed(2);

    // Ambil UAS Tahfidz
    const uasT = parseFloat(document.getElementById('n_uas_tahfidz').value) || 0;

    // Kalkulasi Akhir: (Rata Simakan + UAS) / 2
    // Jika UAS belum ada, hanya tampilkan rata simakan
    const rataAkhir = uasT > 0 ? (rataSimakan + uasT) / 2 : rataSimakan;
    
    const displayFinal = document.getElementById('total_rata_tahfidz');
    if (displayFinal) displayFinal.innerText = rataAkhir.toFixed(2);
}

// 5. NAVIGASI TAB
// Mengatur perpindahan antar modul Tahsin dan Tahfidz
function showTab(tab) {
    const sTahsin = document.getElementById('section-tahsin');
    const sTahfidz = document.getElementById('section-rapor-tahfidz');
    const btns = document.querySelectorAll('.ysq-tab-btn');

    if (tab === 'tahsin') {
        sTahsin.classList.remove('ysq-is-hidden');
        sTahfidz.classList.add('ysq-is-hidden');
    } else {
        sTahsin.classList.add('ysq-is-hidden');
        sTahfidz.classList.remove('ysq-is-hidden');
    }

    // Update status tombol aktif
    btns.forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('onclick').includes(tab)) b.classList.add('active');
    });
}

// 6. RESET & SAVE DATA
function resetFormTahsin() {
    if (confirm("Bersihkan semua input Tahsin?")) {
        document.querySelectorAll('.val-tahsin').forEach(i => i.value = "");
        document.getElementById('catatan_progres').value = "";
        document.getElementById('total_rata_tahsin').innerText = "0.00";
    }
}

function resetFormTahfidz() {
    if (confirm("Bersihkan semua data simakan Tahfidz?")) {
        document.querySelectorAll('.val-juz').forEach(i => i.value = "");
        document.getElementById('n_uas_tahfidz').value = "";
        document.getElementById('rata_simakan').innerText = "0.00";
        document.getElementById('total_rata_tahfidz').innerText = "0.00";
    }
}

function saveData(tipe) {
    alert(`Data Rapor ${tipe} berhasil disimpan dan siap untuk difinalisasi.`);
}