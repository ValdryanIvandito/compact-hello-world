import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import * as path from "path";
import * as fs from "fs";
import * as readline from "readline/promises";
import { buildWallet, createWalletProvider } from "../services/wallet";
import { waitForSync } from "../utils/waitForSync";
import { loadContract } from "../services/contract";
import { createMidnightProviders } from "../services/provider";

/**
 * Use-case: menyimpan message ke smart contract
 */
export async function storeMessage(
  config: any,
  seed: string,
  contractName: string,
  privateStateStoreName: string,
  privateStateId: string
): Promise<void> {
  console.log("📨 Call storeMessage function...\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const message = await rl.question("Enter your message: ");

  // 1️⃣ Ambil contract address dari deployment.json
  if (!fs.existsSync("deployment.json")) {
    console.error(
      "❌ deployment.json tidak ditemukan. Jalankan deploy contract terlebih dahulu."
    );
    return;
  }

  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
  const contractAddress: string =
    deployment.contractAddress || deployment.address;

  if (!contractAddress) {
    console.error("❌ Contract address tidak valid di deployment.json");
    return;
  }

  console.log(`📄 Contract Address: ${contractAddress}\n`);
  console.log("🌙 Connecting to Midnight network...\n");

  // 2️⃣ Build wallet
  const { wallet, state, close } = await buildWallet(config, seed);

  try {
    // 3️⃣ WAJIB: tunggu wallet sync & ambil balance TERBARU
    const balance = await waitForSync(wallet);

    console.log(`💰 Wallet balance (synced): ${balance.toString()}`);

    // 4️⃣ Load kontrak hasil compile
    const contractPath = path.join(process.cwd(), "contracts");
    const contractModule = await loadContract(contractPath, contractName);
    const contract = new contractModule.Contract({});

    // 5️⃣ Setup wallet provider & providers kontrak
    const walletProvider = createWalletProvider(wallet, state);

    const midnightProviders = await createMidnightProviders(
      privateStateStoreName,
      config,
      path.join(contractPath, "managed", contractName),
      walletProvider
    );

    // 6️⃣ Resolve deployed contract instance
    const deployedContract: any = await findDeployedContract(
      midnightProviders,
      {
        contractAddress,
        contract,
        privateStateId,
        initialPrivateState: {},
      }
    );

    // 7️⃣ Panggil method storeMessage
    console.log("✍️  Calling storeMessage...");

    const tx = await deployedContract.callTx.storeMessage(message);

    console.log("✅ Message stored successfully!");
    console.log(`Message        : ${message}`);
    console.log(`Transaction ID : ${tx.public.txId}`);
    console.log(`Block height   : ${tx.public.blockHeight}\n`);
  } catch (error) {
    console.error("❌ Failed to store message:", error);
  } finally {
    // 8️⃣ WAJIB: tutup wallet
    await close();
  }
}
