/** src/features/storeMessages.ts */

import * as path from "path";
import * as fs from "fs";
import * as readline from "readline/promises";
import chalk from "chalk";
import boxen from "boxen";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { buildWallet, createWalletProvider } from "../services/wallet";
import { loadContract } from "../services/contract";
import { createMidnightProviders } from "../services/provider";
import { waitForSync } from "../utils/waitForSync";

/**
 * Store a message into the deployed smart contract.
 */
export async function storeMessage(
  config: any,
  seed: string,
  contractName: string,
  privateStateStoreName: string,
  privateStateId: string
): Promise<void> {
  console.log(chalk.cyan("\n✍️  Store message to smart contract\n"));

  // Load deployed contract address
  if (!fs.existsSync("deployment.json")) {
    console.error(
      chalk.red(
        "❌ deployment.json not found. Deploy the contract first (npm run compile)."
      )
    );
    return;
  }

  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
  const contractAddress: string =
    deployment.contractAddress || deployment.address;

  if (!contractAddress) {
    console.error(
      chalk.red(
        "❌ Contract address not found in deployment.json, please retry compile the smart contract (npm run compile)."
      )
    );
    return;
  }

  console.log(
    chalk.gray("📄 Contract address"),
    chalk.white("→"),
    chalk.cyan(contractAddress),
    "\n"
  );

  // Build wallet and wait for synchronization
  const { wallet, state, close } = await buildWallet(config, seed);

  try {
    // Inform user that synchronization is in progress
    console.log(chalk.gray("\n⏳ Waiting for synchronization...\n"));

    // Wait until wallet is fully synced
    await waitForSync(wallet);

    // Load contract
    const contractPath = path.join(process.cwd(), "contracts");
    const contractModule = await loadContract(contractPath, contractName);
    const contract = new contractModule.Contract({});

    // Setup wallet providers
    const walletProvider = createWalletProvider(wallet, state);

    // Setup Midnight network providers
    const midnightProviders = await createMidnightProviders(
      privateStateStoreName,
      config,
      path.join(contractPath, "managed", contractName),
      walletProvider
    );

    const deployedContract: any = await findDeployedContract(
      midnightProviders,
      {
        contractAddress,
        contract,
        privateStateId,
        initialPrivateState: {},
      }
    );

    // Read user input
    console.log("\n");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const message = await rl.question("Enter your message: ");
    rl.close();

    // Resolve deployed contract and send transaction
    console.log(chalk.cyan("\n🚀 Sending transaction and storing message..."));

    const tx = await deployedContract.callTx.storeMessage(message);

    console.log(
      boxen(
        `${chalk.green.bold("MESSAGE STORED SUCCESSFULLY")}

${chalk.gray("Message")}
${chalk.cyan("→")} ${chalk.cyan(`"${message}"`)}

${chalk.gray("Transaction ID")}
${chalk.cyan("→")} ${chalk.cyan(tx.public.txId)}

${chalk.gray("Block Height")}
${chalk.cyan("→")} ${chalk.cyan(tx.public.blockHeight.toString())}`,
        {
          padding: 0.5,
          margin: 0.5,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
  } catch (error) {
    console.error(error);
  } finally {
    // Always close wallet to release resources
    await close();
  }
}
