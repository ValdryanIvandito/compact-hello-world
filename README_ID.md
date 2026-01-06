# Midnight Starter Kit Hello-World

**Midnight Starter Kit Hello-World** adalah starter kit untuk developer yang ingin mempelajari dan bereksperimen dengan **blockchain Midnight Network**.

Proyek ini ditujukan untuk:

- Developer junior yang membutuhkan titik awal yang jelas
- Developer berpengalaman yang menginginkan setup lokal yang sederhana
- Siapa pun yang tertarik memahami dasar-dasar Midnight Network

Fokus proyek ini adalah pada **alur end-to-end paling sederhana**:

- Local undeployed network
- Setup wallet & faucet
- Smart contract Compact
- Interaksi contract melalui CLI

---

## ✨ Apa yang Akan Dipelajari

- Menjalankan Midnight local network (node, indexer, proof server)
- Membuat genesis wallet (faucet)
- Membuat dan mendanai wallet pengguna
- Menulis dan mengompilasi smart contract Compact
- Deploy smart contract
- Menyimpan dan membaca message on-chain melalui indexer
- Membangun CLI yang bersih dan developer-friendly

---

## 🧩 Fitur CLI

Aplikasi CLI menyediakan fitur:

- 🔄 Refresh wallet
- 🆕 Create wallet
- 💰 Request funds (faucet)
- 🚀 Deploy contract
- 📝 Store message
- 📖 Read message
- ❌ Exit

Antarmuka dibuat sederhana dan fokus pada produktivitas developer.

---

## 🛠️ Prasyarat

### Wajib

- Node.js >= 20
- npm
- Docker Desktop

### Pengguna Windows (Penting)

Pengguna Windows **wajib menggunakan WSL2 (disarankan Ubuntu)**.

Setup yang dibutuhkan:

- Windows 10 / 11
- WSL2 dengan Ubuntu
- Docker Desktop dengan integrasi WSL diaktifkan

Hal ini diperlukan karena Midnight local network berjalan menggunakan container berbasis Linux.

---

## 🚀 Cara Memulai

### 1️⃣ Install Dependency

```bash
npm install
```

---

### 2️⃣ Inisialisasi Local Network & Genesis Wallet

Perintah ini akan:

- Build Docker image
- Menjalankan container (node, indexer, proof server)
- Membuat genesis wallet sebagai faucet

```bash
npm run genesis
```

> Langkah ini hanya perlu dijalankan sekali untuk setup awal.

---

### 3️⃣ Menjalankan Kembali Local Network

Jika container sudah ada:

```bash
docker compose up -d
```

---

### 4️⃣ Kompilasi Smart Contract

Kompilasi smart contract Compact contoh:

```bash
npm run compile
```

---

### 5️⃣ Menjalankan Aplikasi CLI

Jalankan aplikasi CLI interaktif:

```bash
npm run start
```

---

## 📜 Smart Contract

Proyek ini menyertakan smart contract Compact yang sangat sederhana untuk:

- Menyimpan message
- Membaca message melalui indexer

Tujuannya adalah menjaga kurva belajar tetap rendah dan praktis.

---

## 📁 Struktur Proyek

```
src/
├── cli/              # Entry dan menu CLI
├── features/         # Implementasi use-case
├── services/         # Service wallet dan provider
├── utils/            # Helper dan utilitas
├── config/           # Konfigurasi network
contracts/
├── hello-world.compact
```

---

## 📚 Referensi

- https://docs.midnight.network/getting-started
- https://github.com/midnightntwrk/create-mn-app
- https://github.com/bricktowers/midnight-local-network

---

## ⚠️ Catatan

- Proyek ini ditujukan untuk pembelajaran dan eksperimen
- Tidak ditujukan untuk penggunaan production
- Wallet seed disimpan secara lokal (.env) untuk kemudahan
- Selalu amankan key pada aplikasi nyata

---

## 📄 Lisensi

MIT License
