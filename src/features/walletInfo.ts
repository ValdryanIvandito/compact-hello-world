// src/app/walletInfo.ts

import chalk from "chalk";
import fs from "fs";
import path from "path";
import { nativeToken } from "@midnight-ntwrk/ledger";
// import { syncWallet } from "@midnight-ntwrk/midnight-js-testing";
import { buildWallet } from "../services/wallet";
import { waitForSync } from "../utils/waitForSync";

/**
 * Menampilkan informasi wallet terupdate
 */
export async function walletInfo(config: any) {
  console.log(chalk.cyan.bold("\n📌 Wallet Information"));

  // Build wallet untuk membaca state on-chain
  const { wallet, state, close } = await buildWallet(
    config,
    process.env.WALLET_SEED!
  );

  try {
    let balance = state.balances[nativeToken()] ?? 0n;

    // Jika belum ada saldo, tunggu faucet
    if (balance === 0n) {
      console.log("⏳ Menunggu sinkronisasi wallet...");
      balance = await waitForSync(wallet);
      // balance = await syncWallet(wallet, 10000);
    }

    console.log(chalk.gray("Address       : "), chalk.green(state.address));
    console.log(
      chalk.gray("Balance       : "),
      chalk.yellow(balance.toString(), "tDUST")
    );

    // Menampilkan semua asset di wallet
    console.log(chalk.gray("Assets        :"));
    for (const [asset, amount] of Object.entries(state.balances)) {
      console.log(`  - ${asset}: ${amount.toString()}`);
    }

    console.log(chalk.gray("Coin PubKey   : "), state.coinPublicKey);

    // Cek apakah ada kontrak yang sudah di-deploy
    const deploymentPath = path.join(process.cwd(), "deployment.json");
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
      console.log(chalk.gray("Contract Addr : "), deployment.contractAddress);
    } else {
      console.log(
        chalk.gray("Contract Addr : "),
        chalk.yellow("Belum ada kontrak")
      );
    }
  } finally {
    await close();
  }
}
