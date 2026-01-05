# Midnight Starter Kit Hello-World

**Midnight Starter Kit Hello-World** is a starter kit for developers who want to learn and experiment with the **Midnight Network** blockchain.

This project is designed for:
- Junior developers who want a clear starting point
- Experienced developers who want a minimal, local-first setup
- Anyone interested in understanding Midnight Network fundamentals

The focus is on the **simplest end-to-end workflow**:
- Local undeployed network
- Wallet & faucet setup
- Compact smart contract
- Contract interaction via CLI

---

## ✨ What You Will Learn

- Running a Midnight local network (node, indexer, proof server)
- Creating a genesis wallet (faucet)
- Creating and funding user wallets
- Writing and compiling Compact smart contracts
- Deploying contracts
- Storing and reading on-chain messages via the indexer
- Building a clean developer-focused CLI

---

## 🧩 CLI Features

The CLI application provides:

- 🔄 Refresh wallet
- 🆕 Create wallet
- 💰 Request funds (faucet)
- 🚀 Deploy contract
- 📝 Store message
- 📖 Read message
- ❌ Exit

The interface is intentionally simple and developer-oriented.

---

## 🛠️ Prerequisites

### Required
- Node.js >= 20
- npm
- Docker Desktop

### Windows Users (Important)
Windows users **must use WSL2 (Ubuntu recommended)**.

Required setup:
- Windows 10 / 11
- WSL2 with Ubuntu
- Docker Desktop with WSL integration enabled

This is required because the Midnight local network runs Linux-based containers.

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Initialize Local Network & Genesis Wallet

This command will:
- Build Docker images
- Start containers (node, indexer, proof server)
- Create a genesis wallet acting as a faucet

```bash
npm run genesis
```

> This step is only required once for initial setup.

---

### 3️⃣ Run Local Network Again (Later)

If containers already exist:

```bash
docker compose up -d
```

---

### 4️⃣ Compile Smart Contract

Compile the example Compact smart contract:

```bash
npm run compile
```

---

### 5️⃣ Run the CLI Application

Start the interactive CLI:

```bash
npm run start
```

---

## 📜 Smart Contract

This project includes a minimal Compact contract that:
- Stores a message
- Allows reading the message via the indexer

The goal is to keep the learning curve low and practical.

---

## 📁 Project Structure

```
src/
├── cli/              # CLI entry and menu
├── features/         # Use-case implementations
├── services/         # Wallet and provider services
├── utils/            # Utility helpers
├── config/           # Network configuration
contracts/
├── hello-world.compact
```

---

## 📚 References

This project is inspired by official Midnight and Brick Towers resources:

- https://docs.midnight.network/getting-started
- https://github.com/midnightntwrk/create-mn-app
- https://github.com/bricktowers/midnight-local-network

---

## ⚠️ Notes

- This project is for learning and experimentation
- Not intended for production use
- Wallet seeds are stored locally (.env) for simplicity
- Always secure keys in real applications

---

## 📄 License

MIT License
