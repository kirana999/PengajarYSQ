/* ==========================================================================
   BAGIAN 1: GLOBAL CONFIGURATION (KONFIGURASI UMUM)
   ========================================================================== */
const BASE_URL = "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

// Elements untuk Kalender & Reminder
const calendarDays = document.getElementById("calendar-days");
const monthYearText = document.getElementById("calendar-month-year");
const reminderModal = document.getElementById("reminderModal");
const reminderInput = document.getElementById("reminderInput");
const announcementList = document.getElementById("announcement-list");
let selectedDate = "";

// Global Variables
let catatanKelasHariIni = "";
let currentSelectedClassData = {
    materi: "",
    tugas: ""
};

/* ==========================================================================
   BAGIAN 2: FRONTEND LOGIC (NAVIGASI, MODAL, & UI)
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

        // Sembunyikan SEMUA section secara fisik agar tidak bertumpuk
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

        if (typeof handleMenuLoad === "function") {
            handleMenuLoad(targetId);
        }
    });
});

// 2. HANDLING MODALS (FUNGSI UMUM)
document.querySelectorAll(".close-button, .btn-batal").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
    };
});

window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

// 3. LOGIKA KALENDER & INPUT REMINDER
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

    // A. TAMBAHKAN NAMA HARI TERLEBIH DAHULU
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    dayNames.forEach(name => {
        const dayNameEl = document.createElement("div");
        dayNameEl.innerText = name;
        dayNameEl.classList.add("day-name"); // Sesuai dengan CSS yang kita buat
        calendarDays.appendChild(dayNameEl);
    });

    // B. TAMBAHKAN OFFSET (KOTAK KOSONG) UNTUK AWAL BULAN
    for (let i = 0; i < firstDay; i++) {
        calendarDays.appendChild(document.createElement("div"));
    }

    // C. TAMBAHKAN ANGKA TANGGAL
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

// 4. POPUP PENGUMUMAN DAN ANIMASINYA
function saveReminder() {
    const text = reminderInput.value.trim();
    if (text) {
        const item = document.createElement("div");
        item.className = "announcement-item";
        
        // Gunakan dataset agar data tersimpan aman saat dikloning untuk animasi
        item.dataset.date = selectedDate;
        item.dataset.text = text;

        // Struktur HTML: Ikon Siaran memiliki fungsi onclick untuk detail
        item.innerHTML = `
            <div class="broadcast-icon" title="Lihat Detail">
                <i class="fas fa-bullhorn"></i>
            </div>
            <strong style="font-size: 11px; color: #666;">${selectedDate}</strong>
            <p>${text}</p>
        `;

        // Tambahkan event listener khusus pada ikon
        const icon = item.querySelector('.broadcast-icon');
        icon.onclick = (e) => {
            e.stopPropagation(); // Mencegah bubbling
            showAnnouncementDetail(selectedDate, text);
        };
        
        const muted = announcementList.querySelector(".muted-note");
        if (muted) muted.remove();
        
        // Cek wrapper animasi
        const wrapper = announcementList.querySelector(".announcement-scroll-wrapper");
        if (wrapper) {
            wrapper.prepend(item);
        } else {
            announcementList.prepend(item);
        }

        reminderInput.value = "";
        reminderModal.style.display = "none";
        
        updateAnnouncementAnimation();
        showToast("Pengumuman ditambahkan!");
    }
}
        // 1. Fungsi Detail Popup
function showAnnouncementDetail(date, text) {
    const modal = document.getElementById("detailAnnouncementModal");
    if (modal) {
        document.getElementById("detail-date").innerText = "Tanggal: " + date;
        document.getElementById("detail-text").innerText = text;
        modal.style.display = "flex";
    }
}

// 2. Fungsi Animasi Berputar (Hanya aktif jika item > 2)
function updateAnnouncementAnimation() {
    const list = document.getElementById("announcement-list");
    const items = list.querySelectorAll(".announcement-item:not(.clone)");
    
    if (items.length > 2) {
        let wrapper = list.querySelector(".announcement-scroll-wrapper");
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.className = "announcement-scroll-wrapper";
            while (list.firstChild) wrapper.appendChild(list.firstChild);
            list.appendChild(wrapper);
        }
        
        const oldClones = wrapper.querySelectorAll(".clone");
        oldClones.forEach(c => c.remove());

        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add("clone");
            
            // Pasang kembali event klik pada ikon di dalam kloning
            const cloneIcon = clone.querySelector('.broadcast-icon');
            cloneIcon.onclick = (e) => {
                e.stopPropagation();
                showAnnouncementDetail(item.dataset.date, item.dataset.text);
            };
            
            wrapper.appendChild(clone);
        });

        const speed = items.length * 6;
        wrapper.style.animation = `scrollAnnouncements ${speed}s linear infinite`;

    }
}
document.getElementById("saveReminderBtn")?.addEventListener("click", saveReminder);

// A. Fungsi untuk membuka detail pengumuman
function showAnnouncementDetail(date, text) {
    const modal = document.getElementById("detailAnnouncementModal");
    if (modal) {
        document.getElementById("detail-date").innerText = "Tanggal: " + date;
        document.getElementById("detail-text").innerText = text;
        modal.style.display = "flex";
    }
}

// B. Fungsi untuk mengelola animasi berputar
function updateAnnouncementAnimation() {
    const list = document.getElementById("announcement-list");
    // Ambil hanya item asli, bukan clone hasil animasi sebelumnya
    const items = list.querySelectorAll(".announcement-item:not(.clone)");
    
    if (items.length > 1) {
        let wrapper = list.querySelector(".announcement-scroll-wrapper");
        
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.className = "announcement-scroll-wrapper";
            while (list.firstChild) wrapper.appendChild(list.firstChild);
            list.appendChild(wrapper);
        }
        
        // Bersihkan kloning lama agar tidak memenuhi memori
        const oldClones = wrapper.querySelectorAll(".clone");
        oldClones.forEach(c => c.remove());

        // Buat kloning untuk efek putaran tanpa putus
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add("clone");
            // Pasang ulang event klik pada elemen kloning
            clone.onclick = () => showAnnouncementDetail(item.dataset.date, item.dataset.text);
            wrapper.appendChild(clone);
        });

        // Tentukan durasi: 6 detik per item (makin banyak makin lambat/nyaman)
        const duration = items.length * 6;
        wrapper.style.animation = `scrollAnnouncements ${duration}s linear infinite`;
    }
}

// 5. TOAST NOTIFICATION (STANDAR)
function showToast(message, type = "success") {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = "toast"; }, 3000);
}

// 6. HANDLING MODAL CATATAN HARIAN
const btnTambahCatatan = document.querySelector(".btn-tambah-catatan");
const modalCatatan = document.getElementById("catatanModal");
const btnSaveNote = document.getElementById("saveNoteButton");
const noteInput = document.getElementById("classNoteInput");

// Fungsi buka modal
function openCatatanModal() {
    if (modalCatatan) {
        modalCatatan.style.display = "flex";
        noteInput.value = ""; 
        noteInput.focus(); 
    }
}

// Fungsi tutup modal
function closeCatatanModal() {
    if (modalCatatan) {
        modalCatatan.style.display = "none";
    }
}

// Listener Simpan Catatan
btnSaveNote?.addEventListener("click", () => {
    const materi = noteInput.value.trim();
    if (materi) {
        catatanKelasHariIni = materi;
        
        // Munculkan toast dulu
        showToast("Catatan harian berhasil disimpan!", "success");
        
        // Tutup modal
        closeCatatanModal();
    } else {
        showToast("Harap isi catatan materi terlebih dahulu!", "error");
    }
});

/* ==========================================================================
   BAGIAN 3: JADWAL & ABSENSI LOGIC
   ========================================================================== */

// 1. JADWAL EXPANDABLE
function toggleDetail(row) {
    const detailRow = row.nextElementSibling;
    const isActive = detailRow.classList.contains('active');
    document.querySelectorAll('.detail-row').forEach(r => r.classList.remove('active'));
    if (!isActive) {
        detailRow.classList.add('active');
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
window.toggleDetail = toggleDetail;

// 2. FILE UPLOAD HANDLING
function handleFileUpload(input, containerId) {
    const container = document.getElementById(containerId);
    if (input.files && input.files[0]) {
        container.querySelector('.input-wrapper').style.display = 'none';
        container.querySelector('.file-preview').style.display = 'flex';
        container.querySelector('.file-name').innerText = input.files[0].name;
        showToast("File dipilih: " + input.files[0].name, "info");
    }
}
window.handleFileUpload = handleFileUpload;

function resetInput(containerId) {
    const container = document.getElementById(containerId);
    container.querySelector('.hidden-file-input').value = "";
    container.querySelector('.input-wrapper').style.display = 'flex';
    container.querySelector('.file-preview').style.display = 'none';
}
window.resetInput = resetInput;

// 3. FUNGSI UPDATE JAM ABSEN PENGAJAR
document.getElementById('simpanAbsenPengajar')?.addEventListener('click', function() {
    // SINKRONISASI ID: Sesuaikan dengan statusAbsenPengajar di HTML
    const statusEl = document.getElementById('statusAbsenPengajar');
    const jamDisplay = document.getElementById('jamAbsenDisplay');
    
    if (statusEl && statusEl.value !== "" && jamDisplay) {
        const sekarang = new Date();
        const jam = sekarang.getHours().toString().padStart(2, '0');
        const menit = sekarang.getMinutes().toString().padStart(2, '0');
        const waktuSelesai = new Date(sekarang.getTime() + 30 * 60000);
        
        jamDisplay.innerText = `${jam}.${menit} - ${waktuSelesai.getHours().toString().padStart(2, '0')}.${waktuSelesai.getMinutes().toString().padStart(2, '0')}`;
    }
});

// 4. LOGIKA TOAST STACKABLE (POJOK KANAN ATAS)
function showStackableToast(nama, status) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    // Tentukan warna spesifik untuk tiap status
    let color = "#275238"; // Default Hijau (Hadir)
    
    if (status === "Izin") {
        color = "#dbc08d"; // Gold/Kuning untuk Izin
    } else if (status === "Sakit") {
        color = "#ff9800"; // Oranye untuk Sakit (Biar beda dengan Izin)
    } else if (status === "Tidak Hadir" || status === "Alfa") {
        color = "#d32f2f"; // Merah untuk Tanpa Keterangan
    } else if (status === "Mustamiah") {
        color = "#3498db"; // Biru untuk Mustamiah
    }

    toast.style.borderLeftColor = color;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-title" style="color: ${color}">Status Diperbarui</span>
            <span class="toast-body"><strong>${nama}</strong>: ${status}</span>
        </div>
        <div class="toast-progress" style="background: ${color}"></div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 5. DETEKSI PERUBAHAN STATUS SANTRI (LANGSUNG TOAST)
document.getElementById('absensiSantriBody')?.addEventListener('change', function(e) {
    if (e.target.classList.contains('select-status-santri')) {
        const row = e.target.closest('tr');
        const namaSantri = row.cells[1].innerText;
        const statusBaru = e.target.value;

        showStackableToast(namaSantri, statusBaru);
    }
});

// 6. RIWAYAT ABSENSI
document.getElementById("btnViewRiwayat")?.addEventListener("click", () => {
    const absensiRows = document.querySelectorAll("#absensiBody tr");
    const riwayatBody = document.getElementById("riwayatBody");
    const tglInput = document.getElementById("tanggalAbsensiPengajar").value;

    if (absensiRows.length > 0 && riwayatBody) {
        riwayatBody.innerHTML = "";
        let countHadir = 0;
        let countIzin = 0;

        absensiRows.forEach((row, index) => {
            const nama = row.cells[1].innerText;
            const status = row.querySelector(".table-select").value;
            const catatan = row.querySelector(".table-input").value || "-";
            
            if (status === "Hadir") countHadir++;
            if (status === "Izin" || status === "Sakit") countIzin++;

            let badgeClass = status === "Hadir" ? "badge-hadir" : (status === "Tidak Hadir" || status === "Alfa" ? "badge-tidak" : "badge-izin");

            riwayatBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${nama}</strong></td>
                    <td>${tglInput}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td>${catatan}</td>
                    <td>${catatanKelasHariIni || "Belum ada materi"}</td>
                </tr>`;
        });

        if(document.getElementById("statTotalHadir")) document.getElementById("statTotalHadir").innerText = countHadir;
        if(document.getElementById("statTotalIzin")) document.getElementById("statTotalIzin").innerText = countIzin;

        sections.forEach(s => { s.classList.remove("active"); s.style.display = "none"; });
        const target = document.getElementById("riwayat-kehadiran-content");
        target.classList.add("active");
        target.style.display = "block";
        mainTitle.textContent = "Riwayat Kehadiran";
    } else {
        showToast("Belum ada data untuk ditampilkan", "error");
    }
});

document.getElementById("btnKembali")?.addEventListener("click", () => {
    sections.forEach(s => { s.classList.remove("active"); s.style.display = "none"; });
    const target = document.getElementById("absensi-content");
    target.classList.add("active");
    target.style.display = "block";
    mainTitle.textContent = "Absensi";
});

// 7. TOMBOL SIMPAN ABSENSI (SEKARANG LANGSUNG SELESAI TANPA POPUP)
document.getElementById("btnSimpanAbsensi")?.addEventListener("click", () => {
    showToast("Seluruh data absensi berhasil disimpan ke sistem!", "success");
});

/* ==========================================================================
   BAGIAN 4: INITIAL EXECUTION
   ========================================================================== */
generateCalendar();

async function handleMenuLoad(targetId) {
    if (targetId === "dashboard-content") generateCalendar();
    if (targetId === "absensi-content") {
        const tglInput = document.getElementById("tanggalAbsensiPengajar");
        if (tglInput && !tglInput.value) tglInput.value = new Date().toISOString().split("T")[0];
    }
}

async function handleMenuLoad(targetId) {
    if (targetId === "dashboard-content") {
        generateCalendar();
        // Pastikan animasi dihitung ulang saat pindah menu kembali ke dashboard
        setTimeout(updateAnnouncementAnimation, 100); 
    }
    if (targetId === "absensi-content") {
        const tglInput = document.getElementById("tanggalAbsensiPengajar");
        if (tglInput && !tglInput.value) tglInput.value = new Date().toISOString().split("T")[0];
    }
}