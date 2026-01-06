/** src/cli/menu.ts */

import chalk from "chalk";
import dotenv from "dotenv";
import inquirer from "inquirer";

import { walletInfo } from "../features/walletInfo";
import { UndeployedNetwork } from "../config/network";
import { createWalletApp } from "../features/createWallet";
import { requestFundsApp } from "../features/requestFunds";
import { deployContractApp } from "../features/deployContract";
import { storeMessage } from "../features/storeMessage";
import { readMessage } from "../features/readMessage";
import { pause } from "../utils/pause";

// Network and contract configuration
const network = new UndeployedNetwork();
const contractName = "hello-world";
const privStateStoreName = "hello-world-state";
const privStateId = "helloWorldState";

/**
 * Main CLI menu loop
 */
export async function showMainMenu() {
  // Continuous CLI loop
  while (true) {
    // Reload environment variables on each iteration
    dotenv.config({ override: true });

    const walletSeed = process.env.WALLET_SEED;
    const walletAddress = process.env.WALLET_ADDRESS;
    const walletCoinPubKey = process.env.WALLET_COIN_PUBKEY;

    // Display wallet info if wallet exists
    if (walletSeed && walletAddress && walletCoinPubKey) {
      await walletInfo(network, walletSeed);
    } else {
      console.log(
        chalk.red("\n⚠️  Wallet not found. Please create a wallet first.")
      );
    }

    // Main menu header
    console.log(chalk.cyan.bold("\n🧩 MENU"));

    // Prompt user for action
    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "What do you want to do:",
        choices: [
          { name: "🔄 Refresh wallet", value: "refresh" },
          { name: "🆕 Create new wallet", value: "create" },
          { name: "💰 Request funds (Faucet)", value: "request" },
          { name: "🚀 Deploy contract", value: "deploy" },
          { name: "📝 Store message", value: "store" },
          { name: "📖 Read message (Public)", value: "read" },
          { name: "❌ Exit", value: "exit" },
        ],
      },
    ]);

    switch (action) {
      case "refresh":
        continue;

      case "create":
        await createWalletApp(network);
        await pause();
        continue;

      case "request":
        if (walletSeed && walletAddress && walletCoinPubKey) {
          await requestFundsApp(network, walletAddress);
        }
        await pause();
        continue;

      case "deploy":
        if (walletSeed && walletAddress && walletCoinPubKey) {
          await deployContractApp(
            network,
            walletSeed,
            contractName,
            privStateStoreName,
            privStateId
          );
        }
        await pause();
        continue;

      case "store":
        if (walletSeed && walletAddress && walletCoinPubKey) {
          await storeMessage(
            network,
            walletSeed,
            contractName,
            privStateStoreName,
            privStateId
          );
        }
        await pause();
        continue;

      case "read":
        if (walletSeed && walletAddress && walletCoinPubKey) {
          await readMessage(network, contractName);
        }
        await pause();
        continue;

      case "exit":
      default:
        console.log(chalk.cyan.bold("\n👋 GOODBYE  \n"));
        process.exit(0);
    }
  }
}
