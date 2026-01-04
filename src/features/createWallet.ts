/** src/features/createWallet.ts */

import chalk from "chalk";
import { generateSeed, buildWallet } from "../services/wallet";
import { upsertEnv } from "../utils/upsertEnv";

/**
 * Create a new wallet and save it to .env.
 */
export async function createWalletApp(config: any) {
  try {
    // Generate a new wallet seed
    const seed = generateSeed();

    // Build wallet instance from the seed
    const { state, close } = await buildWallet(config, seed);

    // Save wallet data to .env file
    upsertEnv({
      WALLET_SEED: seed,
      WALLET_ADDRESS: state.address,
      WALLET_COIN_PUBKEY: state.coinPublicKey,
    });

    console.log(chalk.green("✔ Wallet successfully created"));
    console.log(chalk.gray("💾 Saved to .env\n"));

    // Always close wallet to release resources
    await close();
  } catch (err) {
    throw err;
  }
}
