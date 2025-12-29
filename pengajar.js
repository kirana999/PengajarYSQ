/* ==========================================================================
   BAGIAN 1: GLOBAL STATE & INITIALIZATION
   ========================================================================== */
let catatanKelasHariIni = "";
let currentSelectedClassData = { materi: "", tugas: "" };

// Inisialisasi Tanggal Otomatis
const setTanggalOtomatis = () => {
    const elemenTanggal = document.getElementById('tanggal-otomatis');
    if (elemenTanggal) {
        const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elemenTanggal.innerHTML = new Date().toLocaleDateString('id-ID', opsi);
    }
};
setTanggalOtomatis();

/* ==========================================================================
   BAGIAN 2: NAVIGASI & MODAL UTILS (CLOSE LOGIC)
   ========================================================================== */
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");
const mainTitle = document.getElementById("main-title");

navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = item.getAttribute("data-content-id");

        navItems.forEach((n) => n.classList.remove("active"));
        item.classList.add("active");

        sections.forEach((s) => {
            s.classList.remove("active");
            s.style.display = "none"; 
        });

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add("active");
            targetSection.style.display = "block"; 
            if (mainTitle) mainTitle.textContent = item.querySelector("span").textContent;
        }
        handleMenuLoad(targetId);
    });
});

// Fungsi Global untuk Menutup Semua Modal
function closeAllModals() {
    document.querySelectorAll(".modal, .modal-overlay, #profilOverlay, #catatanModal").forEach(m => {
        m.style.display = "none";
    });
    document.body.style.overflow = ""; 
}

// Otomatis pasang fungsi tutup ke semua tombol batal/close
document.querySelectorAll(".close-button, .btn-batal, .close-profil-btn").forEach(btn => {
    btn.onclick = closeAllModals;
});

window.onclick = (event) => {
    if (event.target.classList.contains('modal-overlay') || event.target.classList.contains('modal')) {
        closeAllModals();
    }
    if (!event.target.closest('.user-profile-wrapper') && !event.target.closest('.info-icon')) {
        const miniCard = document.getElementById("miniProfilCard");
        if (miniCard) miniCard.style.display = "none";
    }
};

/* ==========================================================================
   BAGIAN 3: POPUP PROFIL & DATA UPDATE (SIMPAN BUTTON)
   ========================================================================== */

function openProfil() {
    const overlay = document.getElementById("profilOverlay");
    if (overlay) {
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden"; 
    }
}

function toggleMiniProfil() {
    const card = document.getElementById("miniProfilCard");
    if (card) {
        card.style.display = (card.style.display === "block") ? "none" : "block";
    }
}

function handleSimpanPerubahan() {
    const inputNama = document.getElementById("input-nama");
    const inputEmail = document.getElementById("input-email");
    const inputWA = document.getElementById("input-wa");

    const headerUserName = document.getElementById("header-user-name"); 
    const miniNama = document.getElementById("mini-nama");
    const miniEmail = document.getElementById("mini-email");
    const miniPhone = document.getElementById("mini-phone");
    
    const profileInitials = document.getElementById("profile-initials");
    const headerInitials = document.getElementById("header-initials");
    const miniInitials = document.getElementById("mini-avatar-initials");

    if (inputNama && inputNama.value.trim() !== "") {
        const namaLengkap = inputNama.value.trim();
        const namaDepan = namaLengkap.split(" ")[0]; 
        const inisial = namaLengkap.charAt(0).toUpperCase();

        // Update teks nama & inisial secara real-time di UI
        if (headerUserName) headerUserName.innerText = namaDepan;
        if (miniNama) miniNama.innerText = namaLengkap;
        if (profileInitials) profileInitials.innerText = inisial;
        if (headerInitials) headerInitials.innerText = inisial;
        if (miniInitials) miniInitials.innerText = inisial;

        // Update Kontak di Mini Card
        if (miniEmail && inputEmail) {
            miniEmail.innerHTML = `<i class="fas fa-envelope"></i> ${inputEmail.value.trim() || 'email@email.com'}`;
        }
        if (miniPhone && inputWA) {
            miniPhone.innerHTML = `<i class="fab fa-whatsapp"></i> ${inputWA.value.trim() || '08xxxxxxxx'}`;
        }

        showToast("Profil berhasil diperbarui!", "success");
        closeAllModals(); 
    } else {
        showToast("Nama tidak boleh kosong!", "error");
    }
}

function updateInitials() {
    const inputNama = document.getElementById("input-nama");
    const profileInitials = document.getElementById("profile-initials");
    if (inputNama && profileInitials) {
        const nama = inputNama.value.trim();
        profileInitials.innerText = nama !== "" ? nama.charAt(0).toUpperCase() : "P";
    }
}

/* ==========================================================================
   BAGIAN 4: PASSWORD & SECURITY (DENGAN VALIDASI PW SAMA)
   ========================================================================== */

function togglePasswordFields() {
    const fields = document.getElementById("passwordFields");
    const btn = document.getElementById("btnTogglePw");

    if (fields && btn) {
        const isHidden = fields.style.display === "none" || fields.style.display === "";
        fields.style.display = isHidden ? "flex" : "none";
        btn.innerText = isHidden ? "Batal Ubah Password" : "Ubah Password";
        btn.style.color = isHidden ? "#ff5252" : "";
        
        if (!isHidden) {
            document.getElementById("pw-lama").value = "";
            document.getElementById("pw-baru").value = "";
            document.getElementById("pw-konfirmasi").value = "";
            document.getElementById("password-error").style.display = "none";
        }
    }
}

function validatePassword() {
    const pwLama = document.getElementById("pw-lama").value;
    const pwBaru = document.getElementById("pw-baru").value;
    const pwKonfirmasi = document.getElementById("pw-konfirmasi").value;
    const errorText = document.getElementById("password-error");
    const btnSimpan = document.querySelector(".btn-primary");

    let errorMessage = "";
    let isError = false;

    // 1. Cek jika PW baru sama dengan PW lama
    if (pwBaru !== "" && pwLama !== "" && pwBaru === pwLama) {
        errorMessage = "Tidak boleh memasukkan password yang sama!";
        isError = true;
    } 
    // 2. Cek jika PW konfirmasi tidak cocok
    else if (pwKonfirmasi !== "" && pwBaru !== pwKonfirmasi) {
        errorMessage = "Konfirmasi password tidak cocok!";
        isError = true;
    }

    if (isError) {
        errorText.innerText = errorMessage;
        errorText.style.display = "block";
        if (btnSimpan) {
            btnSimpan.disabled = true;
            btnSimpan.style.opacity = "0.5";
        }
    } else {
        errorText.style.display = "none";
        if (btnSimpan) {
            btnSimpan.disabled = false;
            btnSimpan.style.opacity = "1";
        }
    }
}

function toggleVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    icon.classList.replace(isPw ? "fa-eye-slash" : "fa-eye", isPw ? "fa-eye" : "fa-eye-slash");
}

/* ==========================================================================
   BAGIAN 5: ABSENSI, CATATAN & OTOMATISASI TOAST SANTRI
   ========================================================================== */

// 1. OTOMATIS TOAST SAAT STATUS SANTRI BERUBAH
// Menggunakan event delegation agar tetap jalan meski halaman berpindah-pindah
document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('select-status-santri')) {
        const row = e.target.closest('tr');
        if (!row) return;

        // Ambil nama dari kolom kedua (index 1)
        const namaSantri = row.cells[1] ? row.cells[1].innerText : "Santri";
        const status = e.target.value;

        if (status !== "") {
            // Tentukan warna toast berdasarkan status
            let tipe = "info";
            if (status === "Hadir") tipe = "success";
            if (status === "Alfa") tipe = "error";

            // Munculkan toast
            showToast(`Absensi ${namaSantri}: ${status.toUpperCase()}`, tipe);
            
            // Efek visual highlight pada baris tabel
            row.style.transition = "background-color 0.3s";
            row.style.backgroundColor = "rgba(45, 90, 63, 0.05)";
            setTimeout(() => { row.style.backgroundColor = ""; }, 1000);
        }
    }
});

// 2. FUNGSI BUKA MODAL CATATAN KELAS
function openCatatanModal() {
    const modalCatatan = document.getElementById("catatanModal");
    if (modalCatatan) {
        modalCatatan.style.display = "flex";
        const noteInput = document.getElementById("classNoteInput");
        if (noteInput) { 
            noteInput.value = catatanKelasHariIni; 
            noteInput.focus();  
        }
    }
}

// 3. LOGIKA TOMBOL SIMPAN CATATAN
const btnSimpanCatatan = document.getElementById("saveNoteButton");
if (btnSimpanCatatan) {
    btnSimpanCatatan.onclick = function() {
        const noteInput = document.getElementById("classNoteInput");
        if (noteInput && noteInput.value.trim() !== "") {
            catatanKelasHariIni = noteInput.value.trim();
            showToast("Catatan harian berhasil disimpan!", "success");
            closeAllModals(); // Menutup modal catatan
        } else {
            showToast("Harap isi catatan materi terlebih dahulu!", "error");
        }
    };
}

// 4. LOGIKA ABSENSI PENGAJAR (JAM OTOMATIS)
function handleSimpanAbsenPengajar() {
    const statusEl = document.getElementById('statusAbsenPengajar');
    const jamDisplay = document.getElementById('jamAbsenDisplay');
    const boxJam = document.getElementById('boxJamAbsen');

    if (statusEl && statusEl.value !== "") {
        const sekarang = new Date();
        const jam = sekarang.getHours().toString().padStart(2, '0');
        const menit = sekarang.getMinutes().toString().padStart(2, '0');
        const waktuString = `${jam}.${menit}`;

        if (jamDisplay) jamDisplay.innerText = `${waktuString} - Selesai`;
        if (boxJam) boxJam.style.setProperty('display', 'inline-flex', 'important');

        showToast(`Absensi pengajar tercatat jam ${waktuString}`, "success");
    } else {
        showToast("Pilih status kehadiran pengajar!", "error");
    }
}

const btnSimpanAbsen = document.getElementById('simpanAbsenPengajar');
if (btnSimpanAbsen) btnSimpanAbsen.onclick = handleSimpanAbsenPengajar;


/* ==========================================================================
   BAGIAN 6: UTILS & TOAST SYSTEM
   ========================================================================== */

function showToast(message, type = "success") {
    // Pastikan ID ini sesuai dengan yang ada di HTML kamu
    const toast = document.getElementById("toastNotification"); 
    if (!toast) return;

    // Set konten berdasarkan tipe
    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-exclamation-circle";
    if (type === "info") icon = "fa-info-circle";

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;

    // Reset class dan tampilkan
    toast.className = `toast show ${type}`;

    // Hilangkan setelah 3 detik
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Fungsi pembantu navigasi
function handleMenuLoad(targetId) {
    if (targetId === "absensi-content") {
        const tglInput = document.getElementById("tanggalAbsensiPengajar");
        if (tglInput && !tglInput.value) {
            tglInput.value = new Date().toISOString().split("T")[0];
        }
    }
}

/* ==========================================================================
   BAGIAN 7: LOGIKA FUNGSIONAL MODAL (MATERI & TUGAS)
   ========================================================================== */

/**
 * 1. Fungsi Membuka Modal Materi
 * Dipanggil melalui: onclick="openMateriModal()"
 */
function openMateriModal() {
    const modal = document.getElementById('modalBuatMateri');
    if (modal) {
        // Menggunakan flex agar konten modal berada tepat di tengah (sesuai CSS overlay)
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden'; 
    } else {
        console.error("ID 'modalBuatMateri' tidak ditemukan.");
    }
}

/**
 * 2. Fungsi Membuka Modal Tugas
 * Dipanggil melalui: onclick="openTaskModal()"
 */
function openTaskModal() {
    const modal = document.getElementById('modalBuatTugas');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
    } else {
        console.error("ID 'modalBuatTugas' tidak ditemukan.");
    }
}

/**
 * 3. Fungsi Menutup Modal Materi
 */
function closeMateriModal() {
    const modal = document.getElementById('modalBuatMateri');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
}

/**
 * 4. Fungsi Menutup Modal Tugas
 */
function closeTaskModal() {
    const modal = document.getElementById('modalBuatTugas');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * 5. Logika Penutupan Global (Klik Overlay)
 */
window.onclick = function(event) {
    const modalMateri = document.getElementById('modalBuatMateri');
    const modalTugas = document.getElementById('modalBuatTugas');

    if (event.target === modalMateri) {
        closeMateriModal();
    }
    if (event.target === modalTugas) {
        closeTaskModal();
    }
};

/* ==========================================================================
   LOGIKA INTERAKSI TABEL (DYNAMIC DETAIL VIEW)
   ========================================================================== */

/* ==========================================================================
   BAGIAN: MODAL CONTROL
   ========================================================================== */

function openMateriModal() {
    const el = document.getElementById('modalBuatMateri');
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function openTaskModal() {
    const el = document.getElementById('modalBuatTugas');
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function openStatusSantriModal() {
    const el = document.getElementById('modalStatusSantri');
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeAllModals() {
    document.querySelectorAll('.sqm-modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

// Menutup modal jika area luar (overlay) diklik
window.onclick = function(event) {
    if (event.target.classList.contains('sqm-modal-overlay')) {
        closeAllModals();
    }
};

/* ==========================================================================
   BAGIAN: INTERAKSI TABEL
   ========================================================================== */

function toggleRow(row) {
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('expandable-row')) {
        const isVisible = nextRow.style.display === 'table-row';
        
        // Tutup semua baris yang terbuka agar fokus pada satu baris
        document.querySelectorAll('.expandable-row').forEach(r => r.style.display = 'none');
        document.querySelectorAll('.main-row').forEach(r => r.classList.remove('active'));

        if (!isVisible) {
            nextRow.style.display = 'table-row';
            row.classList.add('active');
        }
    }
}

/* ==========================================================================
   BAGIAN: NOTIFIKASI SIMPAN
   ========================================================================== */

function handleSimpanMateri() {
    alert("Materi baru berhasil disimpan!");
    closeAllModals();
}

/* ==========================================================================
   BAGIAN: AKSI TABEL STATUS SANTRI (PERIKSA & HUBUNGI)
   ========================================================================== */

/**
 * 1. ALUR PERIKSA (Buka Modal Penilaian)
 */
function openReviewModal(nama, tipeFile, linkFile) {
    const modal = document.getElementById('modalReviewTugas');
    const labelNama = document.getElementById('reviewNamaSantri');
    const previewBox = document.getElementById('previewKontenSantri');
    
    labelNama.innerText = "Nama Santri: " + nama;
    previewBox.innerHTML = ""; // Bersihkan preview sebelumnya

    if (tipeFile === 'link') {
        // Jika berupa Link Google Drive
        previewBox.innerHTML = `
            <i class="fab fa-google-drive fa-3x" style="color: #1da1f2; margin-bottom: 10px;"></i>
            <p style="font-weight: 600;">Google Drive Document</p>
            <a href="${linkFile}" target="_blank" class="sqm-btn-base sqm-btn-gold" style="text-decoration:none; margin-top:10px;">
                <i class="fas fa-external-link-alt"></i> Buka di Tab Baru
            </a>
        `;
    } else if (tipeFile === 'pdf' || tipeFile === 'doc') {
        // Jika berupa Dokumen (PDF/Word)
        previewBox.innerHTML = `
            <i class="fas fa-file-pdf fa-3x" style="color: #e74c3c; margin-bottom: 10px;"></i>
            <p style="font-weight: 600;">tugas_hafalan.pdf</p>
            <a href="${linkFile}" download class="sqm-btn-base sqm-btn-outline" style="margin-top:10px;">
                <i class="fas fa-download"></i> Download File
            </a>
        `;
    } else {
        // Default: Audio (seperti sebelumnya)
        previewBox.innerHTML = `
            <i class="fas fa-file-audio fa-3x" style="color: var(--sqm-accent); margin-bottom: 10px;"></i>
            <p style="font-weight: 600;">rekaman_makharij.mp3</p>
            <button class="sqm-btn-base sqm-btn-outline"><i class="fas fa-play"></i> Putar</button>
        `;
    }

    modal.style.display = 'flex';
}

function closeReviewModal() {
    const modal = document.getElementById('modalReviewTugas');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function simpanPenilaian() {
    const nilai = document.getElementById('inputNilai').value;
    if (nilai === "") {
        showToast("Mohon masukkan nilai terlebih dahulu!", "error");
        return;
    }
    showToast("Penilaian berhasil disimpan ke Rapor!", "success");
    closeReviewModal();
}

/**
 * 2. ALUR HUBUNGI (Kirim WhatsApp Otomatis)
 */
function hubungiSantri(nama) {
    const nomorWA = "628123456789"; // Simulasi: Diambil dari data santri
    const pesan = encodeURIComponent(
        `Assalamu'alaikum Ibu/Bapak, mengingatkan kembali bahwa ananda *${nama}* belum mengumpulkan tugas materi Makharijul Huruf. Mohon bantuannya untuk diingatkan. Terima kasih.`
    );
    
    // Konfirmasi sebelum membuka WA
    if (confirm(`Hubungi ${nama} melalui WhatsApp?`)) {
        window.open(`https://api.whatsapp.com/send?phone=${nomorWA}&text=${pesan}`, '_blank');
    }
}