// src/app/requestFunds.ts

import { nativeToken } from "@midnight-ntwrk/ledger";
import { buildWallet } from "../services/wallet";
import { waitForSync } from "../utils/waitForSync";

import type { Wallet } from "@midnight-ntwrk/wallet-api";

const GENESIS_MINT_WALLET_SEED =
  "0000000000000000000000000000000000000000000000000000000000000001";

const FAUCET_AMOUNT = 1_000_000_000_000n;

/**
 * Use-case request funds
 */
export async function requestFundsApp(
  config: any,
  receiverAddress: string
): Promise<void> {
  if (!receiverAddress) {
    console.log(
      "❌ Wallet address tidak ditemukan. Buat wallet terlebih dahulu."
    );
    return;
  }

  // Build wallet faucet (genesis / mint wallet)
  // Wallet ini bertindak sebagai pengirim dana
  const { wallet, state, close } = await buildWallet(
    config,
    GENESIS_MINT_WALLET_SEED
  );

  try {
    let balance = state.balances[nativeToken()] ?? 0n;

    // Jika belum ada saldo, tunggu faucet
    if (balance === 0n) {
      console.log("⏳ Menunggu dana masuk ke wallet...");
      balance = await waitForSync(wallet);
    }

    console.log("Genesis wallet balance:", balance);

    // 1️⃣ Buat transfer recipe (belum prove, belum submit)
    const transferRecipe = await (wallet as Wallet).transferTransaction([
      {
        amount: FAUCET_AMOUNT,
        receiverAddress,
        type: nativeToken(),
      },
    ]);

    console.log("✔ Transfer recipe berhasil dibuat");

    // 2️⃣ Generate proof transaksi
    const transaction = await wallet.proveTransaction(transferRecipe);
    console.log("✔ Transaction proof generated");

    // 3️⃣ Submit transaksi ke node
    const txHash = await wallet.submitTransaction(transaction);
    console.log("✔ Transaction submitted");
    console.log("TxHash:", txHash);
  } catch (err) {
    console.error("❌ Error saat request funds:", (err as Error).message);

    // Exit code non-zero agar bisa dipakai di CI / script
    process.exitCode = 1;
  } finally {
    // WAJIB: tutup wallet untuk release resource
    await close();
  }
}
