// =====================================
// FINGERPRINT.ACCESS
// Arduino Fingerprint Door Access Demo
// Browser simulation only
// =====================================

let selectedValid = true;
let scanning = false;
let autoLock = true;

let success = 0;
let failed = 0;
let logs = [];

let doorTimer = null;
let scanTimer = null;

// Mempermudah pemanggilan elemen HTML
const $ = (id) => document.getElementById(id);

// =====================================
// PILIH SIDIK JARI
// =====================================

function chooseFinger(valid) {
  if (scanning) return;

  selectedValid = valid;

  $("validChoice").classList.toggle("active", valid);
  $("invalidChoice").classList.toggle("active", !valid);

  $("scanMessage").textContent = valid
    ? "Skenario dipilih: sidik jari terdaftar. Sistem seharusnya memberikan akses."
    : "Skenario dipilih: sidik jari tidak terdaftar. Sistem harus menolak akses.";
}

// =====================================
// MENGUBAH STATUS
// =====================================

function setStatus(id, text, kind = "neutral") {
  const element = $(id);

  element.textContent = text;
  element.className = "status " + kind;
}

// =====================================
// VISUALISASI PINTU
// =====================================

function setDoor(open) {
  // Mengubah visualisasi pintu utama
  $("mainDoor").classList.toggle("open", open);

  // Mengubah ilustrasi pintu bagian hero
  $("heroDoor").classList.toggle("open", open);

  // Mengubah informasi status pintu
  $("doorStatusText").textContent = open ? "Open" : "Locked";

  $("doorStatusText").className =
    "status " + (open ? "ok" : "neutral");

  $("lockText").textContent = open ? "Unlocked" : "Locked";

  $("lockSceneText").textContent =
    "ELECTRONIC LOCK · " + (open ? "UNLOCKED" : "LOCKED");

  // Mengubah indikator pengunci
  $("lockIcon").style.color = open
    ? "var(--red)"
    : "var(--green)";

  $("lockIcon").textContent = open ? "▢" : "▣";
}

// =====================================
// SIMULASI SCAN FINGERPRINT
// =====================================

function scanFingerprint() {
  if (scanning) return;

  scanning = true;

  // Menyimpan pilihan sidik jari saat scan dimulai
  const fingerprintMatched = selectedValid;

  // Membatalkan timer pintu sebelumnya
  clearTimeout(doorTimer);

  // Mengubah tampilan scanner
  $("scanBtn").disabled = true;
  $("scanBtn").textContent = "Scanning...";

  $("scanDevice").classList.add("scanning");

  setStatus("sensorStatus", "Scanning", "wait");
  setStatus("scanStatus", "SCANNING", "wait");
  setStatus("accessBadge", "PROCESS", "wait");

  $("heroStatus").textContent = "SCANNING";

  $("resultTitle").textContent = "Memindai sidik jari...";
  $("resultDesc").textContent =
    "Mohon tunggu proses verifikasi simulasi.";

  // Proses verifikasi simulasi
  scanTimer = setTimeout(() => {
    scanning = false;

    $("scanDevice").classList.remove("scanning");

    $("scanBtn").disabled = false;
    $("scanBtn").textContent = "▥  Scan Fingerprint";

    setStatus(
      "sensorStatus",
      fingerprintMatched ? "Success" : "Failed",
      fingerprintMatched ? "ok" : "bad"
    );

    if (fingerprintMatched) {
      accessGranted();
    } else {
      accessDenied();
    }

    // Memperbarui statistik
    $("successCount").textContent = success;
    $("failedCount").textContent = failed;

    // Menambahkan aktivitas ke log
    addLog(fingerprintMatched);

  }, 1400);
}

// =====================================
// AKSES DITERIMA
// =====================================

function accessGranted() {
  success++;

  setDoor(true);

  $("heroStatus").textContent = "ACCESS GRANTED";

  setStatus("scanStatus", "MATCH FOUND", "ok");
  setStatus("accessBadge", "GRANTED", "ok");

  $("scanMessage").textContent =
    "Sidik jari cocok dengan ID 24042007 · Rizky Sayang Iqbal.";

  $("resultTitle").textContent = "Access Granted";

  $("resultDesc").textContent =
    "Identitas cocok. Pengunci dinonaktifkan sementara.";

  // Auto Lock akan mengunci pintu kembali
  if (autoLock) {
    doorTimer = setTimeout(() => {
      setDoor(false);

      $("heroStatus").textContent = "STANDBY";

      $("resultTitle").textContent =
        "Pintu Terkunci Kembali";

      $("resultDesc").textContent =
        "Auto Lock aktif: pengunci kembali ke kondisi awal.";

    }, 4500);
  }
}

// =====================================
// AKSES DITOLAK
// =====================================

function accessDenied() {
  failed++;

  // Pintu tetap terkunci
  setDoor(false);

  $("heroStatus").textContent = "ACCESS DENIED";

  setStatus("scanStatus", "NO MATCH", "bad");
  setStatus("accessBadge", "DENIED", "bad");

  $("scanMessage").textContent =
    "Tidak ada kecocokan. Coba gunakan skenario sidik jari terdaftar.";

  $("resultTitle").textContent = "Access Denied";

  $("resultDesc").textContent =
    "Identitas tidak dikenal. Pintu tetap terkunci.";
}

// =====================================
// LOG AKTIVITAS
// =====================================

function addLog(valid) {
  const time = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const activity = {
    time: time,
    id: valid ? "24042007" : "—",
    name: valid ? "Rizky Sayang Iqbal" : "Tidak dikenal",
    valid: valid,
    door: valid ? "Open" : "Locked"
  };

  logs.unshift(activity);

  renderLogs();
}

// =====================================
// MENAMPILKAN LOG
// =====================================

function renderLogs() {
  const logBody = $("logBody");

  if (logs.length === 0) {
    logBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">
          Belum ada aktivitas. Jalankan simulasi untuk membuat log.
        </td>
      </tr>
    `;

    return;
  }

  logBody.innerHTML = logs.map((item, index) => `
    <tr>
      <td>${logs.length - index}</td>
      <td>${item.time}</td>
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>
        <span class="status ${item.valid ? "ok" : "bad"}">
          ${item.valid ? "Granted" : "Denied"}
        </span>
      </td>
      <td>${item.door}</td>
    </tr>
  `).join("");
}

// =====================================
// HAPUS LOG
// =====================================

function clearLogs() {
  logs = [];
  renderLogs();
}

// =====================================
// AUTO LOCK
// =====================================

function toggleAutoLock() {
  autoLock = !autoLock;

  $("autoLockBtn").textContent =
    "Auto Lock: " + (autoLock ? "ON" : "OFF");

  $("autoLockBtn").style.borderColor =
    autoLock ? "var(--green)" : "var(--border)";

  // Jika Auto Lock dinyalakan saat pintu terbuka,
  // pintu akan dikunci kembali setelah 4,5 detik.
  if (autoLock && $("mainDoor").classList.contains("open")) {
    clearTimeout(doorTimer);

    doorTimer = setTimeout(() => {
      setDoor(false);

      $("heroStatus").textContent = "STANDBY";

      $("resultTitle").textContent =
        "Pintu Terkunci Kembali";

      $("resultDesc").textContent =
        "Auto Lock aktif: pengunci kembali ke kondisi awal.";

    }, 4500);
  }

  // Jika Auto Lock dimatikan, batalkan timer pintu.
  if (!autoLock) {
    clearTimeout(doorTimer);
  }
}

// =====================================
// RESET SISTEM
// =====================================

function resetSystem() {
  // Membatalkan semua proses yang sedang berjalan
  clearTimeout(doorTimer);
  clearTimeout(scanTimer);

  scanning = false;
  selectedValid = true;

  // Mengembalikan pilihan sidik jari
  $("validChoice").classList.add("active");
  $("invalidChoice").classList.remove("active");

  // Menghentikan animasi scanner
  $("scanDevice").classList.remove("scanning");

  // Mengaktifkan kembali tombol scan
  $("scanBtn").disabled = false;
  $("scanBtn").textContent = "▥  Scan Fingerprint";

  // Mengembalikan status sensor
  setStatus("sensorStatus", "Ready", "neutral");
  setStatus("scanStatus", "SENSOR READY", "neutral");
  setStatus("accessBadge", "STANDBY", "neutral");

  // Mengembalikan pesan
  $("scanMessage").textContent =
    "Letakkan jari simulasi pada sensor, kemudian tekan tombol scan.";

  $("resultTitle").textContent = "Sistem Siaga";

  $("resultDesc").textContent =
    "Pintu terkunci menunggu autentikasi.";

  $("heroStatus").textContent = "STANDBY";

  // Mengunci pintu kembali
  setDoor(false);
}

// =====================================
// EVENT LISTENERS
// =====================================

$("validChoice").addEventListener("click", () => {
  chooseFinger(true);
});

$("invalidChoice").addEventListener("click", () => {
  chooseFinger(false);
});

$("scanBtn").addEventListener("click", scanFingerprint);

$("resetBtn").addEventListener("click", resetSystem);

$("autoLockBtn").addEventListener("click", toggleAutoLock);

$("clearLogBtn").addEventListener("click", clearLogs);

// =====================================
// INISIALISASI SISTEM
// =====================================

setDoor(false);
renderLogs();