/** src/features/createGenesisWallet.ts */

import chalk from "chalk";
import { buildWallet, syncWallet } from "../services/wallet";
import { UndeployedNetwork } from "../config/network";

// Network configuration (undeployed/local)
const config = new UndeployedNetwork();

// Hardcoded seed for genesis / faucet wallet
const GENESIS_MINT_WALLET_SEED =
  "0000000000000000000000000000000000000000000000000000000000000001";

/**
 * Initializes the genesis wallet and ensures it has balance.
 */
async function createGenesisWallet(): Promise<void> {
  // Build genesis (mint) wallet used as fund sender
  const { wallet, close } = await buildWallet(config, GENESIS_MINT_WALLET_SEED);

  try {
    // Inform user that synchronization is in progress
    console.log(chalk.gray("\n⏳ Waiting for synchronization...\n"));

    // Synchronization to network
    const balance = await syncWallet(wallet);

    console.log(
      chalk.green.bold("\n✔ Genesis wallet successfully initialized")
    );
    console.log(
      chalk.gray("💰 Balance"),
      chalk.white("→"),
      chalk.yellow.bold(`${balance.toString()} tDUST\n`)
    );
  } catch (err) {
    // Log error message
    console.error((err as Error).message);

    // Set non-zero exit code for CI / scripts
    process.exitCode = 1;
  } finally {
    // Always close wallet to release resources
    await close();
  }
}

await createGenesisWallet();
