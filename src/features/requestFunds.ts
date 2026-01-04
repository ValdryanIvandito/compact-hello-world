/** src/features/requestFunds.ts */

import boxen from "boxen";
import chalk from "chalk";
import { nativeToken } from "@midnight-ntwrk/ledger";
import { buildWallet } from "../services/wallet";
import { waitForSync } from "../utils/waitForSync";
import type { Wallet } from "@midnight-ntwrk/wallet-api";

// Genesis (faucet) wallet seed
const GENESIS_MINT_WALLET_SEED =
  "0000000000000000000000000000000000000000000000000000000000000001";

// Amount sent to the receiver
const FAUCET_AMOUNT = 1_000_000_000_000n;

/**
 * Request funds from the genesis wallet.
 */
export async function requestFundsApp(
  config: any,
  receiverAddress: string
): Promise<void> {
  // Build genesis wallet used as fund sender
  const { wallet, close } = await buildWallet(config, GENESIS_MINT_WALLET_SEED);

  try {
    // Inform user that synchronization is in progress
    console.log(chalk.gray("\n⏳ Waiting for synchronization...\n"));

    // Wait until genesis wallet is fully synced
    const balance = await waitForSync(wallet);

    console.log(
      chalk.gray("\n💰 Genesis wallet balance"),
      chalk.white("→"),
      chalk.yellow(`${balance.toString()} tDUST`)
    );

    // Create transfer recipe (not proven, not submitted)
    const transferRecipe = await (wallet as Wallet).transferTransaction([
      {
        amount: FAUCET_AMOUNT,
        receiverAddress,
        type: nativeToken(),
      },
    ]);

    console.log(chalk.green("\n✔ Transfer recipe created"));

    // Generate transaction proof
    const transaction = await wallet.proveTransaction(transferRecipe);
    console.log(chalk.green("✔ Transaction proof generated"));

    // Submit transaction to the network
    const txHash = await wallet.submitTransaction(transaction);
    console.log(chalk.green("✔ Transaction submitted"));

    console.log(
      boxen(
        `${chalk.green.bold("REQUEST FUNDS SUCCESSFUL")}

${chalk.gray("🔗 Transaction Hash")}
${chalk.cyan("→")} ${chalk.cyan(txHash)}`,
        {
          padding: 0.5,
          margin: 0.5,
          borderStyle: "round",
          borderColor: "green",
        }
      )
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
