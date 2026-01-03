import inquirer from "inquirer";
import chalk from "chalk";
import dotenv from "dotenv";
import { UndeployedNetwork } from "../config/network";
import { createWalletApp } from "../app/createWallet";
import { deployContractApp } from "../app/deployContract";
import { requestFundsApp } from "../app/requestFunds";
import { walletInfo } from "../app/walletInfo";
import { storeMessage } from "../app/storeMessage";
import { readMessage } from "../app/readMessage";

const network = new UndeployedNetwork();
const contractName = "hello-world";
const privStateStoreName = "hello-world-state";
const privStateId = "helloWorldState";

/**
 * Menu utama CLI
 */
export async function showMainMenu() {
  // Loop utama CLI
  while (true) {
    // Reload .env setiap loop
    dotenv.config({ override: true });

    const walletExist =
      !!process.env.WALLET_SEED &&
      !!process.env.WALLET_ADDRESS &&
      !!process.env.WALLET_COIN_PUBKEY;

    // Jika wallet ada, tampilkan info wallet
    if (walletExist) {
      await walletInfo(network);
    } else {
      console.log(
        chalk.yellow("\n⚠️  Wallet belum ditemukan, silahkan buat wallet baru.")
      );
    }

    // Menu utama
    console.log(chalk.cyan.bold("\n🧩 Menu"));

    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "What do you want to do:",
        choices: [
          { name: "🔄 Refresh wallet", value: "refresh" },
          { name: "🆕 Create new wallet", value: "create" },
          { name: "💰 Request funds", value: "request" },
          { name: "🚀 Deploy contract", value: "deploy" },
          { name: "📝 Store message", value: "store" },
          { name: "📖 Read message", value: "read" },
          { name: "❌ Exit", value: "exit" },
        ],
      },
    ]);

    switch (action) {
      case "refresh":
        continue;

      case "create":
        await createWalletApp(network);
        break;

      case "request":
        await requestFundsApp(
          network,
          process.env.WALLET_ADDRESS ? process.env.WALLET_ADDRESS : ""
        );
        break;

      case "deploy":
        if (!process.env.WALLET_SEED) {
          console.log(
            chalk.red(
              "❌ Wallet belum ada. Silakan buat wallet terlebih dahulu."
            )
          );
        } else {
          await deployContractApp(
            network,
            process.env.WALLET_SEED,
            contractName,
            privStateStoreName,
            privStateId
          );
        }
        break;

      case "store":
        if (!process.env.WALLET_SEED) {
          console.log(
            chalk.red(
              "❌ Wallet belum ada. Silakan buat wallet terlebih dahulu."
            )
          );
        } else {
          await storeMessage(
            network,
            process.env.WALLET_SEED,
            contractName,
            privStateStoreName,
            privStateId
          );
        }
        break;

      case "read":
        await readMessage(network, contractName);
        break;

      case "exit":
      default:
        console.log(chalk.gray("Goodbye 👋 \n"));
        process.exit(0);
    }

    console.log(
      "-----------------------------------------------------------------------------------\n"
    );
  }
}
