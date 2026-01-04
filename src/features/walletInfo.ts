/** src/app/walletInfo.ts */

import boxen from "boxen";
import chalk from "chalk";
import { buildWallet } from "../services/wallet";
import { waitForSync } from "../utils/waitForSync";

/**
 * Display current wallet information.
 */
export async function walletInfo(config: any, walletSeed: string) {
  /**
   * Initialize wallet instance and providers.
   */
  const { wallet, state, close } = await buildWallet(config, walletSeed);

  try {
    // Inform user that synchronization is in progress
    console.log(chalk.gray("\n⏳ Waiting for wallet synchronization...\n"));

    /**
     * Wait until wallet is fully synchronized
     * before reading on-chain data.
     */
    const balance = await waitForSync(wallet);

    // Build boxed CLI content
    const content = `
      ${chalk.cyan.bold("🔍 WALLET INFORMATION")}

      ${chalk.gray("📬 Wallet Address")}
      ${chalk.green.bold("→")} ${chalk.green(state.address)}

      ${chalk.gray("🔑 Coin Public Key")}
      ${chalk.yellow("→")} ${chalk.yellow(state.coinPublicKey)}

      ${chalk.gray("💰 Balance")}
      ${chalk.yellow.bold("→")} ${chalk.yellow.bold(
      `${balance.toString()} tDUST`
    )}
    `.trim();

    // Render wallet information inside a styled box
    console.log(
      boxen(content, {
        padding: 0.5,
        margin: 0.5,
        borderStyle: "round",
        borderColor: "cyan",
      })
    );
  } finally {
    // Always close wallet to release resources
    await close();
  }
}
