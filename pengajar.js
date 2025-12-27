/* ==========================================================================
   BAGIAN 1: GLOBAL STATE & INITIALIZATION
   ========================================================================== */
let catatanKelasHariIni = "";
let currentSelectedClassData = { materi: "", tugas: "" };

// Inisialisasi Tanggal Langsung
const elemenTanggal = document.getElementById('tanggal-otomatis');
if (elemenTanggal) {
    const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elemenTanggal.innerHTML = new Date().toLocaleDateString('id-ID', opsi);
}

/* ==========================================================================
   BAGIAN 2: NAVIGASI & MODAL UTILS
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

function closeAllModals() {
    document.querySelectorAll(".modal, .modal-overlay").forEach(m => m.style.display = "none");
    document.body.style.overflow = ""; 
}

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

        if (headerUserName) headerUserName.innerText = namaDepan;
        if (miniNama) miniNama.innerText = namaLengkap;

        if (miniEmail && inputEmail) {
            miniEmail.innerHTML = `<i class="fas fa-envelope"></i> ${inputEmail.value.trim() || 'email@email.com'}`;
        }
        if (miniPhone && inputWA) {
            miniPhone.innerHTML = `<i class="fab fa-whatsapp"></i> ${inputWA.value.trim() || '08xxxxxxxx'}`;
        }

        if (profileInitials) profileInitials.innerText = inisial;
        if (headerInitials) headerInitials.innerText = inisial;
        if (miniInitials) miniInitials.innerText = inisial;

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
   BAGIAN 4: PASSWORD & SECURITY
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
    const pwBaru = document.getElementById("pw-baru").value;
    const pwKonfirmasi = document.getElementById("pw-konfirmasi").value;
    const errorText = document.getElementById("password-error");
    const btnSimpan = document.querySelector(".btn-primary");

    if (pwKonfirmasi === "") {
        errorText.style.display = "none";
        return;
    }

    const isMatch = pwBaru === pwKonfirmasi;
    errorText.style.display = isMatch ? "none" : "block";
    if (btnSimpan) {
        btnSimpan.disabled = !isMatch;
        btnSimpan.style.opacity = isMatch ? "1" : "0.5";
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
   BAGIAN 5: ABSENSI, CATATAN & TOAST SANTRI
   ========================================================================== */

// Toast Otomatis Status Santri
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('select-status-santri')) {
        const row = e.target.closest('tr');
        if (!row) return;

        const namaSantri = row.cells[1].innerText;
        const status = e.target.value;

        if (status !== "") {
            let tipe = (status === "Hadir") ? "success" : (status === "Alfa" ? "error" : "info");
            showToast(`Absensi ${namaSantri}: ${status.toUpperCase()}`, tipe);
            row.style.backgroundColor = "rgba(45, 90, 63, 0.05)";
            setTimeout(() => { row.style.backgroundColor = ""; }, 1000);
        }
    }
});

function handleSimpanAbsenPengajar() {
    const statusEl = document.getElementById('statusAbsenPengajar');
    const jamDisplay = document.getElementById('jamAbsenDisplay');
    const boxJam = document.getElementById('boxJamAbsen');

    if (statusEl && statusEl.value !== "") {
        const sekarang = new Date();
        const waktuString = `${sekarang.getHours().toString().padStart(2, '0')}.${sekarang.getMinutes().toString().padStart(2, '0')}`;

        if (jamDisplay) jamDisplay.innerText = `${waktuString} - Selesai`;
        if (boxJam) boxJam.style.display = "inline-flex";

        showToast(`Absensi tercatat jam ${waktuString}`, "success");
    } else {
        showToast("Pilih status kehadiran!", "error");
    }
}

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

document.getElementById("saveNoteButton")?.addEventListener("click", () => {
    const noteInput = document.getElementById("classNoteInput");
    if (noteInput && noteInput.value.trim()) {
        catatanKelasHariIni = noteInput.value.trim();
        showToast("Catatan harian disimpan!", "success");
        closeAllModals();
    }
});

/* ===========================================
// Fungsi Utama Update Jam Absensi Pengajar
============================================== */
function handleSimpanAbsenPengajar() {
    const statusEl = document.getElementById('statusAbsenPengajar');
    const jamDisplay = document.getElementById('jamAbsenDisplay');
    const boxJam = document.getElementById('boxJamAbsen');

    if (statusEl && statusEl.value !== "") {
        // Ambil waktu sistem saat ini
        const sekarang = new Date();
        const jam = sekarang.getHours().toString().padStart(2, '0');
        const menit = sekarang.getMinutes().toString().padStart(2, '0');
        const waktuString = `${jam}.${menit}`;

        // Update teks jam
        if (jamDisplay) {
            jamDisplay.innerText = `${waktuString} - Selesai`;
        }

        // Munculkan box jam (Ubah display dari none ke inline-flex)
        if (boxJam) {
            boxJam.style.setProperty('display', 'inline-flex', 'important');
        }

        showToast(`Absensi pengajar berhasil dicatat jam ${waktuString}`, "success");
    } else {
        showToast("Pilih status kehadiran terlebih dahulu!", "error");
    }
}

// 1. Event Listener Manual (Tanpa DOMContentLoaded)
// Pastikan tombol di HTML kamu punya ID "simpanAbsenPengajar"
const btnSimpanAbsen = document.getElementById('simpanAbsenPengajar');
if (btnSimpanAbsen) {
    btnSimpanAbsen.onclick = handleSimpanAbsenPengajar;
}

// 2. Toast Otomatis Status Santri
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('select-status-santri')) {
        const row = e.target.closest('tr');
        if (!row) return;

        const namaSantri = row.cells[1].innerText;
        const status = e.target.value;

        if (status !== "") {
            let tipe = (status === "Hadir") ? "success" : (status === "Alfa" ? "error" : "info");
            showToast(`Absensi ${namaSantri}: ${status.toUpperCase()}`, tipe);
            row.style.backgroundColor = "rgba(45, 90, 63, 0.05)";
            setTimeout(() => { row.style.backgroundColor = ""; }, 1000);
        }
    }
});

/* ==========================================================================
   LOGIKA HALAMAN MATERI AJAR (TANPA DOM CONTENT LOADED)
   ========================================================================== */

/**
 * 1. Fungsi Toggle Detail Materi
 * Membuka/menutup baris detail berdasarkan baris yang diklik
 */
function toggleRow(row) {
    // Mencari elemen tr berikutnya (baris detail)
    const detailRow = row.nextElementSibling;

    if (detailRow && detailRow.classList.contains('expandable-row')) {
        
        // Cek status display saat ini
        const isOpen = detailRow.style.display === 'table-row';

        // Tutup semua baris detail lain agar rapi (Accordion Mode)
        document.querySelectorAll('.expandable-row').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.main-row').forEach(el => {
            el.classList.remove('active');
        });

        // Jalankan logika buka-tutup
        if (!isOpen) {
            detailRow.style.display = 'table-row';
            row.classList.add('active');
        } else {
            detailRow.style.display = 'none';
            row.classList.remove('active');
        }
    }
}

/**
 * 2. Fungsi Tanggal Otomatis
 * Langsung dijalankan tanpa menunggu event listener
 */
function setTanggalOtomatis() {
    const tanggalBox = document.getElementById('tanggal-otomatis');
    if (tanggalBox) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        tanggalBox.innerText = new Date().toLocaleDateString('id-ID', options);
    }
}

// Panggil fungsi tanggal segera setelah file JS terbaca
setTanggalOtomatis();



/* ==========================================================================
   BAGIAN 6: UTILS
   ========================================================================== */

function showToast(message, type = "success") {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function handleMenuLoad(targetId) {
    if (targetId === "absensi-content") {
        const tglInput = document.getElementById("tanggalAbsensiPengajar");
        if (tglInput && !tglInput.value) {
            tglInput.value = new Date().toISOString().split("T")[0];
        }
    }
}