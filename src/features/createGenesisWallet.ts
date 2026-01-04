// src/app/requestFunds.ts

import { nativeToken } from "@midnight-ntwrk/ledger";
import { buildWallet } from "../services/wallet";
import { waitForSync } from "../utils/waitForSync";
import { UndeployedNetwork } from "../config/network";

const config = new UndeployedNetwork();

const GENESIS_MINT_WALLET_SEED =
  "0000000000000000000000000000000000000000000000000000000000000001";

/**
 * Use-case request funds
 */
async function createGenesisWallet(): Promise<void> {
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
      console.log("⏳ Menunggu sinkronisasi...");
      balance = await waitForSync(wallet);
    }
    console.log("Genesis wallet berhasil dibuat !");
    console.log("Genesis wallet balance:", balance);
  } catch (err) {
    console.error((err as Error).message);

    // Exit code non-zero agar bisa dipakai di CI / script
    process.exitCode = 1;
  } finally {
    // WAJIB: tutup wallet untuk release resource
    await close();
  }
}

await createGenesisWallet();
