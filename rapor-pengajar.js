const API = "/api";
const token = localStorage.getItem("token");

/* ================= ELEMENT ================= */
const selectKelas = document.getElementById("selectKelas");
const selectSantri = document.getElementById("selectSantri");

let selectedSantri = null;

/* ================= LOAD AWAL ================= */
document.addEventListener("DOMContentLoaded", () => {
    loadKelasPengajar();
    setTanggal();
});

function setTanggal() {
    const el = document.getElementById("tanggal-otomatis");
    if (el) {
        el.textContent = new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
}

/* ================= LOAD KELAS & SANTRI ================= */
async function loadKelasPengajar() {
    try {
        const res = await fetch(`${API}/kelas/pengajar/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        selectKelas.innerHTML = `<option value="">--- Pilih Kelas ---</option>`;
        data.forEach(k => {
            selectKelas.innerHTML += `<option value="${k.id_kelas}">${k.nama_kelas}</option>`;
        });
    } catch (err) {
        console.error("Gagal memuat kelas:", err);
    }
}

selectKelas.addEventListener("change", async () => {
    const idKelas = selectKelas.value;
    if (!idKelas) return;

    const res = await fetch(`${API}/kelas/pengajar/detail/${idKelas}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    selectSantri.innerHTML = `<option value="">--- Pilih Santri ---</option>`;
    data.santri.forEach(s => {
        selectSantri.innerHTML += `<option value="${s.id_santri}">${s.nama}</option>`;
    });
});

selectSantri.addEventListener("change", () => {
    selectedSantri = selectSantri.value;
});

/* ================= TAB SYSTEM ================= */
window.showTab = function (tab) {
    document.getElementById("section-tahsin").classList.toggle("ysq-is-hidden", tab !== "tahsin");
    document.getElementById("section-rapor-tahfidz").classList.toggle("ysq-is-hidden", tab === "tahsin");

    const btns = document.querySelectorAll(".ysq-tab-btn");
    btns[0].classList.toggle("active", tab === "tahsin");
    btns[1].classList.toggle("active", tab !== "tahsin");
};

/* ================= LOGIKA PREDIKAT ================= */
function getPredikat(nilai) {
    if (nilai >= 90) return "Mumtaz";
    if (nilai >= 80) return "Jayyid Jiddan";
    if (nilai >= 70) return "Jayyid";
    if (nilai >= 60) return "Maqbul";
    return "Dhaif";
}

/* ================= HITUNG TAHSIN ================= */
window.hitungRataTahsin = function () {
    const vals = document.querySelectorAll(".val-tahsin");
    let total = 0, count = 0;

    vals.forEach(v => {
        if (v.value !== "") {
            total += Number(v.value);
            count++;
        }
    });

    const rata = count ? (total / count) : 0;
    document.getElementById("total_rata_tahsin").textContent = rata.toFixed(2);
};

/* ================= TAHFIDZ : TAMBAH JUZ ================= */
window.tambahKeDaftar = function () {
    const inputJuz = document.getElementById("quick_juz");
    const inputNilai = document.getElementById("quick_nilai");
    const listBody = document.getElementById("tahfidz-list-body");

    const juz = inputJuz.value;
    const nilai = inputNilai.value;

    if (!juz || !nilai) {
        alert("Juz dan nilai wajib diisi");
        return;
    }

    const existing = [...listBody.querySelectorAll("tr")].some(tr => tr.dataset?.juz === juz);
    if (existing) {
        alert(`Juz ${juz} sudah dimasukkan`);
        return;
    }

    const empty = document.getElementById("empty-row");
    if (empty) empty.remove();

    const tr = document.createElement("tr");
    tr.dataset.juz = juz;
    tr.innerHTML = `
        <td>Juz ${juz}</td>
        <td>${nilai}</td>
        <td>
            <button type="button" class="btn-delete-row" onclick="hapusBarisDaftar(this)">
                <i class="fas fa-trash-alt"></i>
            </button>
            <input type="hidden" class="nilai-simakan-hidden" value="${nilai}">
        </td>
    `;

    listBody.appendChild(tr);
    inputJuz.value = "";
    inputNilai.value = "";
    inputJuz.focus();
    hitungRataTahfidz();
};

/* ================= HAPUS BARIS ================= */
window.hapusBarisDaftar = function (btn) {
    btn.closest("tr").remove();
    const listBody = document.getElementById("tahfidz-list-body");
    if (listBody.children.length === 0) {
        listBody.innerHTML = `
            <tr id="empty-row">
                <td colspan="3" class="empty-msg">Belum ada data juz yang ditambahkan.</td>
            </tr>`;
    }
    hitungRataTahfidz();
};

/* ================= HITUNG TAHFIDZ & PREDIKAT ================= */
window.hitungRataTahfidz = function () {
    const nilaiEls = document.querySelectorAll(".nilai-simakan-hidden");
    const elRata = document.getElementById("rata_simakan");
    const elAkhir = document.getElementById("total_rata_tahfidz");
    const elPredikat = document.getElementById("predikat_tahfidz");
    const uas = Number(document.getElementById("n_uas_tahfidz").value || 0);

    let total = 0;
    nilaiEls.forEach(n => total += Number(n.value));

    const rataSimakan = nilaiEls.length ? total / nilaiEls.length : 0;
    elRata.textContent = rataSimakan.toFixed(2);

    const nilaiAkhir = (nilaiEls.length > 0) ? (uas > 0 ? (rataSimakan + uas) / 2 : rataSimakan) : 0;
    elAkhir.textContent = nilaiAkhir.toFixed(2);

    // Update Predikat Otomatis
    if (elPredikat) {
        elPredikat.textContent = nilaiAkhir > 0 ? getPredikat(nilaiAkhir) : "-";
    }
};

/* ================= SAVE DATA ================= */
window.saveData = async function (jenis) {
    if (!selectedSantri) {
        alert("Pilih santri terlebih dahulu");
        return;
    }

    // Ambil Periode sesuai Tab yang aktif
    const periodeTahsin = document.getElementById("periode_tahsin").value;
    const periodeTahfidz = document.getElementById("periode_tahfidz").value;
    
    if ((jenis === "Tahsin" && !periodeTahsin) || (jenis === "Tahfidz" && !periodeTahfidz)) {
        alert("Pilih periode semester terlebih dahulu");
        return;
    }

    try {
        if (jenis === "Tahsin") await executeSaveTahsin(periodeTahsin);
        else await executeSaveTahfidz(periodeTahfidz);

        alert(`Rapor ${jenis} berhasil disimpan`);
        location.reload();
    } catch (err) {
        alert(err || "Terjadi kesalahan saat menyimpan");
    }
};

async function executeSaveTahsin(periode) {
    const body = {
        id_santri: Number(selectedSantri),
        periode: periode,
        nilai_pekanan: Number(document.getElementById("n_pekanan").value),
        ujian_tilawah: Number(document.getElementById("n_tilawah").value),
        nilai_teori: Number(document.getElementById("n_teori").value),
        nilai_presensi: Number(document.getElementById("n_absen").value),
        catatan: document.getElementById("catatan_progres").value
    };

    const res = await fetch(`${API}/rapor/tahsin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw (await res.json()).message;
}

async function executeSaveTahfidz(periode) {
    const headerRes = await fetch(`${API}/rapor/tahfidz`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_santri: Number(selectedSantri), periode })
    });

    const header = await headerRes.json();
    if (!headerRes.ok) throw header.message;

    const idRapor = header.id_rapor;
    const rows = document.querySelectorAll("#tahfidz-list-body tr[data-juz]");
    
    for (const row of rows) {
        const juz = row.dataset.juz;
        const nilai = row.querySelector(".nilai-simakan-hidden").value;
        await fetch(`${API}/rapor/tahfidz/simakan`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id_rapor: idRapor, juz: Number(juz), nilai: Number(nilai) })
        });
    }

    await fetch(`${API}/rapor/tahfidz/final`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            id_rapor: idRapor,
            nilai_ujian_akhir: Number(document.getElementById("n_uas_tahfidz").value)
        })
    });
}

window.resetFormTahsin = () => location.reload();
window.resetFormTahfidz = () => location.reload();