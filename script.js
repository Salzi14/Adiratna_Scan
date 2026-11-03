let selectedValid = true;
let selectedUser = 1;

const users = {
  1: 'Raja Salman',
  2: 'Aisyah Cantik',
  3: 'Iqbal Fakboy',
  4: 'Rizky ❤️ Karim'
};

let scanning = false;
let autoLock = true;
let success = 0;
let failed = 0;
let logs = [];
let doorTimer = null;
let scanTimer = null;

// Buat fungsi $ terlebih dahulu
const $ = (id) => document.getElementById(id);

// Baru pasang event listener
[1, 2, 3, 4].forEach(id => {
  $('userChoice' + id).addEventListener('click', () => {
    chooseFinger(true, id);
  });
});

$('invalidChoice').addEventListener('click', () => {
  chooseFinger(false);
});

$('scanBtn').addEventListener('click', scanFingerprint);
$('resetBtn').addEventListener('click', resetSystem);
$('autoLockBtn').addEventListener('click', toggleAutoLock);
$('clearLogBtn').addEventListener('click', clearLogs);

// =====================================
// PILIH SIDIK JARI
// =====================================

function chooseFinger(valid, userId = selectedUser) {
  if (scanning) return;

  selectedValid = valid;

  if (valid) selectedUser = userId;

  [1, 2, 3, 4].forEach(id => {
    $('userChoice' + id).classList.toggle(
      'active',
      valid && selectedUser === id
    );
  });

  $('invalidChoice').classList.toggle('active', !valid);

  $('selectedUserLabel').textContent = valid
    ? `ID 0${selectedUser} · ${users[selectedUser]}`
    : 'Tidak dikenal';

  $('scanMessage').textContent = valid
    ? `Skenario dipilih: ${users[selectedUser]}.`
    : 'Sidik jari tidak dikenal.';
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
  $('mainDoor').classList.toggle('open', open);
  $('heroDoor').classList.toggle('open', open);

  $('doorStatusText').textContent = open ? 'Open' : 'Locked';
  $('doorStatusText').className =
    'status ' + (open ? 'ok' : 'neutral');

  $('lockText').textContent = open ? 'Unlocked' : 'Locked';
  $('lockSceneText').textContent =
    'ELECTRONIC LOCK · ' + (open ? 'UNLOCKED' : 'LOCKED');

  $('lockIcon').style.color =
    open ? 'var(--red)' : 'var(--green)';

  $('lockIcon').textContent = open ? '▢' : '▣';
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
  scanTimer = null;
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

  }, 2600);
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
  "Sidik jari cocok dengan ID 0" + selectedUser + " · " + users[selectedUser] + ".";

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
  id: valid ? "ID " + String(selectedUser).padStart(2, "0") : "—",
  name: valid ? users[selectedUser] : "Tidak dikenal",
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

  $('autoLockBtn').textContent = 'Auto Lock: ' + (autoLock ? 'ON' : 'OFF');
  $('autoLockBtn').style.borderColor =
    autoLock ? 'var(--green)' : 'var(--border)';

  clearTimeout(doorTimer);
  doorTimer = null;

  // Jika Auto Lock aktif dan pintu masih terbuka
  if (autoLock && $('mainDoor').classList.contains('open')) {
    doorTimer = setTimeout(() => {
      setDoor(false);
      doorTimer = null;

      $('heroStatus').textContent = 'STANDBY';
      $('resultTitle').textContent = 'Pintu Terkunci Kembali';
      $('resultDesc').textContent = 'Auto Lock aktif: pengunci kembali ke kondisi awal.';
    }, 4500);
  }
}

  // Jika Auto Lock dimatikan, batalkan timer pintu.
  if (!autoLock) {
    clearTimeout(doorTimer);
  }

// =====================================
// RESET SISTEM
// =====================================

function resetSystem() {
  clearTimeout(doorTimer);
  clearTimeout(scanTimer);

  doorTimer = null;
  scanTimer = null;

  scanning = false;
  selectedValid = true;
  selectedUser = 1;

  success = 0;
  failed = 0;

  autoLock = true;
  $('autoLockBtn').textContent = 'Auto Lock: ON';
  $('autoLockBtn').style.borderColor = 'var(--green)';

  [1,2,3,4].forEach(id => {
    $('userChoice'+id).classList.toggle('active', id === 1);
  });

  $('invalidChoice').classList.remove('active');

  $('scanDevice').classList.remove('scanning');
  $('scanBtn').disabled = false;
  $('scanBtn').textContent = '▥  Scan Fingerprint';

  setStatus('arduinoStatus', 'Simulated', 'neutral');
  setStatus('sensorStatus', 'Ready', 'neutral');
  setStatus('scanStatus', 'SENSOR READY', 'neutral');
  setStatus('accessBadge', 'STANDBY', 'neutral');

  $('successCount').textContent = '0';
  $('failedCount').textContent = '0';

  $('selectedUserLabel').textContent = 'ID 01 · Salzi';
  $('scanMessage').textContent = 'Pilih salah satu pengguna, kemudian tekan tombol scan.';

  $('resultTitle').textContent = 'Sistem Siaga';
  $('resultDesc').textContent = 'Pintu terkunci menunggu autentikasi.';

  $('heroStatus').textContent = 'STANDBY';

  setDoor(false);
  renderLogs();
}

// =====================================

// =====================================
// INISIALISASI SISTEM
// =====================================

setDoor(false);
renderLogs();

if ("serial" in navigator) {
  alert("Web Serial tersedia!");
} else {
  alert("Web Serial tidak tersedia!");
}