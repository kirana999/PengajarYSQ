/* ==========================================================================
   BAGIAN 1: UI ELEMENTS & GLOBAL STATE
   ========================================================================== */
const calendarDays = document.getElementById("calendar-days");
const monthYearText = document.getElementById("calendar-month-year");
const reminderModal = document.getElementById("reminderModal");
const reminderInput = document.getElementById("reminderInput");
const announcementList = document.getElementById("announcement-list");

let selectedDate = "";
let catatanKelasHariIni = "";
let currentSelectedClassData = { materi: "", tugas: "" };

/* ==========================================================================
   BAGIAN 2: FRONTEND LOGIC (NAVIGASI & MODAL)
   ========================================================================== */

// 1. HANDLING NAVIGASI SIDEBAR
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
            mainTitle.textContent = item.querySelector("span").textContent;
        }

        handleMenuLoad(targetId);
    });
});

// 2. HANDLING MODALS (FUNGSI PENUTUP TERPADU)
function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
    
    const profilOverlay = document.getElementById("profilOverlay");
    if (profilOverlay) {
        profilOverlay.style.display = "none";
        document.body.style.overflow = ""; 
    }
}

document.querySelectorAll(".close-button, .btn-batal, .close-profil-btn").forEach(btn => {
    btn.onclick = closeAllModals;
});

window.onclick = (event) => {
    if (event.target.classList.contains('modal') || event.target.id === "profilOverlay") {
        closeAllModals();
    }
    if (!event.target.closest('.user-profile-wrapper')) {
        const miniCard = document.getElementById("miniProfilCard");
        if (miniCard) miniCard.style.display = "none";
    }
};

/* ==========================================================================
   BAGIAN 3: POPUP PROFIL & HEADER SYNC
   ========================================================================== */

function openProfil() {
    const overlay = document.getElementById("profilOverlay");
    if (overlay) {
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden"; 
    }
}

function updateInitials() {
    const inputNama = document.getElementById("input-nama");
    const profileInitials = document.getElementById("profile-initials");
    const headerInitials = document.getElementById("header-initials");
    const miniInitials = document.getElementById("mini-avatar-initials");

    if (!inputNama) return;
    const nama = inputNama.value.trim();
    const inisial = nama !== "" ? nama.charAt(0).toUpperCase() : "?";

    if (profileInitials) profileInitials.innerText = inisial;
    if (headerInitials) headerInitials.innerText = inisial;
    if (miniInitials) miniInitials.innerText = inisial;
}

function handleSimpanPerubahan() {
    // Ambil elemen Input (Sumber Data)
    const inputNama = document.getElementById("input-nama");
    const inputEmail = document.getElementById("input-email");
    const inputWA = document.getElementById("input-wa");

    // Ambil elemen Tampilan (Target di Header & Mini Card)
    const headerUserName = document.getElementById("header-user-name");
    const miniNama = document.getElementById("mini-nama");
    const miniEmail = document.getElementById("mini-email");
    const miniPhone = document.getElementById("mini-phone");

    if (inputNama && inputNama.value.trim() !== "") {
        const namaLengkap = inputNama.value.trim();
        const namaDepan = namaLengkap.split(" ")[0];

        // 1. Update Nama (Header & Mini Card)
        if (headerUserName) headerUserName.innerText = namaDepan;
        if (miniNama) miniNama.innerText = namaLengkap;

        // 2. Update Email (Mini Card)
        if (miniEmail && inputEmail) {
            miniEmail.innerHTML = `<i class="fas fa-envelope"></i> ${inputEmail.value.trim()}`;
        }

        // 3. Update Nomor Telepon (Mini Card)
        if (miniPhone && inputWA) {
            miniPhone.innerHTML = `<i class="fab fa-whatsapp"></i> ${inputWA.value.trim()}`;
        }

        // Jalankan update inisial agar sinkron
        updateInitials();
        
        showToast("Profil berhasil diperbarui!", "success");
        closeAllModals(); 
    } else {
        showToast("Nama tidak boleh kosong!", "error");
    }
}

function toggleMiniProfil() {
    const card = document.getElementById("miniProfilCard");
    if (card) {
        card.style.display = (card.style.display === "block") ? "none" : "block";
    }
}

function togglePasswordFields() {
    const fields = document.getElementById("passwordFields");
    const btn = document.getElementById("btnTogglePw");

    if (fields && btn) {
        // Cek apakah kolom sedang tersembunyi
        const isHidden = fields.style.display === "none" || fields.style.display === "";

        if (isHidden) {
            // JIKA TERTUTUP: Buka kolom dan ubah teks jadi Batal
            fields.style.display = "flex"; // Pastikan CSS menggunakan flex untuk layout kolom
            btn.innerText = "Batal Ubah Password";
            btn.style.color = "#ff5252"; // Ubah warna jadi merah (opsional)
        } else {
            // JIKA TERBUKA: Tutup kolom dan kembalikan teks asli
            fields.style.display = "none";
            btn.innerText = "Ubah Password";
            btn.style.color = ""; // Kembalikan warna asli (hijau)
            
            // Bersihkan inputan demi keamanan saat dibatalkan
            document.getElementById("pw-lama").value = "";
            document.getElementById("pw-baru").value = "";
            document.getElementById("pw-konfirmasi").value = "";
            document.getElementById("password-error").style.display = "none";
        }
    }
}

/**
 * Fungsi untuk validasi kecocokan password secara real-time
 */
function validatePassword() {
    const pwBaru = document.getElementById("pw-baru").value;
    const pwKonfirmasi = document.getElementById("pw-konfirmasi").value;
    const errorText = document.getElementById("password-error");
    const btnSimpan = document.querySelector(".modal-left .btn-primary");

    // Jika konfirmasi masih kosong, jangan tampilkan error dulu
    if (pwKonfirmasi === "") {
        errorText.style.display = "none";
        if (btnSimpan) btnSimpan.disabled = false;
        return;
    }

    if (pwBaru !== pwKonfirmasi) {
        errorText.style.display = "block";
        if (btnSimpan) {
            btnSimpan.disabled = true;
            btnSimpan.style.opacity = "0.5";
            btnSimpan.style.cursor = "not-allowed";
        }
    } else {
        errorText.style.display = "none";
        if (btnSimpan) {
            btnSimpan.disabled = false;
            btnSimpan.style.opacity = "1";
            btnSimpan.style.cursor = "pointer";
        }
    }
}

/**
 * Fungsi untuk melihat/sembunyikan password (Toggle Eye)
 */
function toggleVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

/* ==========================================================================
   BAGIAN 4: KALENDER & PENGUMUMAN
   ========================================================================== */

function generateCalendar() {
    if (!calendarDays || !monthYearText) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    monthYearText.innerText = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarDays.innerHTML = "";
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    dayNames.forEach(name => {
        const el = document.createElement("div");
        el.innerText = name; el.classList.add("day-name");
        calendarDays.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) calendarDays.appendChild(document.createElement("div"));

    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement("div");
        dayEl.innerText = d;
        if (d === today) dayEl.classList.add("today");
        dayEl.onclick = () => {
            selectedDate = `${d} ${monthYearText.innerText}`;
            const dateTextEl = document.getElementById("selected-date-text");
            if (dateTextEl) dateTextEl.innerText = `Tanggal: ${selectedDate}`;
            if (reminderModal) reminderModal.style.display = "flex";
        };
        calendarDays.appendChild(dayEl);
    }
}

function saveReminder() {
    const text = reminderInput.value.trim();
    if (!text) return showToast("Teks tidak boleh kosong!", "error");

    const item = document.createElement("div");
    item.className = "announcement-item";
    item.dataset.date = selectedDate;
    item.dataset.text = text;

    item.innerHTML = `
        <div class="note-content">
            <small style="color:#888">${selectedDate}</small>
            <p style="margin:5px 0; font-weight:500">${text}</p>
        </div>
        <div class="delete-announcement" onclick="deleteReminder(this)" style="color:#ff5252; cursor:pointer">
            <i class="fas fa-trash-alt"></i>
        </div>
    `;

    document.getElementById("announcement-list").prepend(item);
    updateAnnouncementUI();

    reminderInput.value = "";
    closeAllModals(); 
    showToast("Catatan ditambahkan!", "success");
}

function updateAnnouncementUI() {
    const items = document.querySelectorAll("#announcement-list .announcement-item");
    const count = items.length;
    const countDisplay = document.getElementById("note-count");
    const summaryBox = document.getElementById("announcement-summary-box");

    if (countDisplay) countDisplay.innerText = count;

    if (count > 0) {
        if (summaryBox) summaryBox.classList.add("has-data");
    } else {
        if (summaryBox) summaryBox.classList.remove("has-data");
    }
}

function openNoteListModal() {
    const modal = document.getElementById("noteListModal");
    const displayArea = document.getElementById("full-note-list");
    const dataRecords = document.querySelectorAll("#announcement-list .announcement-item");

    displayArea.innerHTML = ""; 

    if (dataRecords.length === 0) {
        displayArea.innerHTML = `<div style="text-align:center; padding:40px; color:#999">
            <i class="fas fa-folder-open" style="font-size:40px; margin-bottom:10px"></i>
            <p>Belum ada catatan untuk saat ini.</p>
        </div>`;
    } else {
        dataRecords.forEach(item => {
            const clone = item.cloneNode(true);
            clone.querySelector('.delete-announcement').onclick = () => {
                item.remove(); 
                openNoteListModal(); 
                updateAnnouncementUI(); 
            };
            displayArea.appendChild(clone);
        });
    }

    modal.style.display = "flex";
}

function closeNoteListModal() {
    const modal = document.getElementById("noteListModal");
    if (modal) modal.style.display = "none";
}

function deleteReminder(btn) {
    if (confirm("Hapus catatan ini?")) {
        btn.closest(".announcement-item").remove();
        updateAnnouncementUI();
        showToast("Catatan dihapus", "info");
    }
}

/* ==========================================================================
   BAGIAN 5: ABSENSI & JADWAL
   ========================================================================== */

function openCatatanModal() {
    const modalCatatan = document.getElementById("catatanModal");
    if (modalCatatan) {
        modalCatatan.style.display = "flex";
        const noteInput = document.getElementById("classNoteInput");
        if (noteInput) { noteInput.value = ""; noteInput.focus(); }
    }
}

document.getElementById("saveNoteButton")?.addEventListener("click", () => {
    const noteInput = document.getElementById("classNoteInput");
    if (noteInput && noteInput.value.trim()) {
        catatanKelasHariIni = noteInput.value.trim();
        showToast("Catatan harian disimpan!");
        closeAllModals();
    }
});

document.getElementById('simpanAbsenPengajar')?.addEventListener('click', function() {
    const statusEl = document.getElementById('statusAbsenPengajar');
    const jamDisplay = document.getElementById('jamAbsenDisplay');
    if (statusEl && statusEl.value !== "" && jamDisplay) {
        const sekarang = new Date();
        jamDisplay.innerText = `${sekarang.getHours().toString().padStart(2, '0')}.${sekarang.getMinutes().toString().padStart(2, '0')} - Selesai`;
    }
});

/**
 * 3. LOGIKA MODAL TUGAS (POPUP TUGAS)
 */
// Fungsi untuk membuka Modal Buat Tugas
function openModalTugas() {
    const modal = document.getElementById("modalTugas");
    modal.style.display = "flex";
    // Tambahkan class agar body tidak bisa di-scroll saat modal buka (opsional)
    document.body.style.overflow = "hidden";
}

// Fungsi untuk menutup Modal Buat Tugas
function closeModalTugas() {
    const modal = document.getElementById("modalTugas");
    modal.style.display = "none";
    // Kembalikan scroll body
    document.body.style.overflow = "auto";
}

// Fungsi untuk menangani pengiriman tugas
function handleKirimTugas() {
    const deskripsi = document.getElementById("modalTugasDesc").value;
    const link = document.getElementById("modalTugasLink").value;
    const file = document.getElementById("modalTugasFile").files[0];

    // Validasi sederhana: Deskripsi wajib diisi sesuai aturan bisnis
    if (!deskripsi.trim()) {
        alert("Mohon isi deskripsi atau instruksi tugas terlebih dahulu.");
        return;
    }

    // Simulasi proses simpan
    console.log("Mengirim Tugas...", { deskripsi, link, file });
    
    // Tampilkan notifikasi sukses (jika ada fungsi toast)
    if (typeof showToast === "function") {
        showToast("Tugas berhasil dikirim ke kelas!");
    } else {
        alert("Tugas berhasil dikirim ke kelas!");
    }

    // Tutup modal dan reset form
    closeModalTugas();
    document.getElementById("modalTugasDesc").value = "";
    document.getElementById("modalTugasLink").value = "";
    document.getElementById("modalTugasFile").value = "";
}

// Menutup modal secara otomatis jika pengguna mengklik area di luar kotak modal
window.onclick = function(event) {
    const modal = document.getElementById("modalTugas");
    if (event.target == modal) {
        closeModalTugas();
    }
}

/* ==========================================================================
   BAGIAN 6: UTILS & INITIALIZATION
   ========================================================================== */

function showToast(message, type = "success") {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => { 
        toast.className = "toast"; 
    }, 3000);
}

function handleMenuLoad(targetId) {
    if (targetId === "dashboard-content") {
        if (typeof generateCalendar === "function") generateCalendar();
    }
    
    if (targetId === "absensi-content") {
        const tglInput = document.getElementById("tanggalAbsensiPengajar");
        if (tglInput && !tglInput.value) {
            tglInput.value = new Date().toISOString().split("T")[0];
        }
    }
}

// FUNGSI TANGGAL OTOMATIS
function updateTanggal() {
    const opsi = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const hariIni = new Date().toLocaleDateString('id-ID', opsi);
    const elemenTanggal = document.getElementById('tanggal-otomatis');
    
    if (elemenTanggal) {
        elemenTanggal.innerHTML = hariIni;
    }
}

// --- EKSEKUSI SAAT HALAMAN DIMUAT ---
updateTanggal(); // Jalankan tanggal otomatis
if (typeof generateCalendar === "function") generateCalendar();
if (typeof updateAnnouncementUI === "function") updateAnnouncementUI();

const saveBtn = document.getElementById("saveReminderBtn");
if (saveBtn) {
    saveBtn.onclick = saveReminder;
}

// HANDLING CLICK LUAR MODAL
const originalWindowOnClick = window.onclick;
window.onclick = (event) => {
    if (originalWindowOnClick) originalWindowOnClick(event);
    
    if (event.target.id === "modalTugas") {
        closeModalTugas();
    }
};