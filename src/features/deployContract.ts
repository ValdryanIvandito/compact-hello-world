/** src/features/deployContract.ts */

import fs from "fs";
import path from "path";
import boxen from "boxen";
import chalk from "chalk";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { buildWallet, createWalletProvider } from "../services/wallet";
import { loadContract } from "../services/contract";
import { createMidnightProviders } from "../services/provider";
import { waitForSync } from "../utils/waitForSync";

/**
 * Deploy a smart contract to midnight network.
 */
export async function deployContractApp(
  config: any,
  seed: string,
  contractName: string,
  privateStateStoreName: string,
  privateStateId: string
): Promise<void> {
  // Build wallet used for deployment
  const { wallet, state, close } = await buildWallet(config, seed);
  try {
    // Inform user that synchronization is in progress
    console.log(chalk.gray("\n⏳ Waiting for synchronization...\n"));

    // Ensure wallet is fully synchronized
    const balance = await waitForSync(wallet);

    if (balance === 0n) {
      console.error(
        chalk.red(
          "❌ Not sufficient funds, please request fund first using faucet."
        )
      );
      return;
    }

    // Load compiled contract artifacts
    const contractPath = path.join(process.cwd(), "contracts");
    const contractModule = await loadContract(contractPath, contractName);
    const contract = new contractModule.Contract({});

    // Create wallet provider
    const walletProvider = createWalletProvider(wallet, state);

    // Create Midnight contract providers
    const midnightProviders = await createMidnightProviders(
      privateStateStoreName,
      config,
      path.join(contractPath, "managed", contractName),
      walletProvider
    );

    console.log(chalk.cyan("\n🚀 Deploying contract..."));

    // Deploy contract to the network
    const deployed = await deployContract(midnightProviders, {
      contract,
      privateStateId,
      initialPrivateState: {},
    });

    // Extract deployed contract address
    const address = deployed.deployTxData?.public?.contractAddress;

    if (!address) {
      console.error(
        chalk.red(
          "❌ Failed to extract contract address, please retry compile the smart contract (npm run compile)."
        )
      );
      return;
    }

    // Save deployment metadata
    fs.writeFileSync(
      "deployment.json",
      JSON.stringify(
        {
          contractAddress: address,
          deployedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    // Render deployment result inside a box
    console.log(
      boxen(
        `${chalk.green.bold("CONTRACT DEPLOYED SUCCESSFULLY")}

${chalk.gray("Contract Address")}
${chalk.cyan("→")} ${chalk.cyan(address)}`,
        {
          padding: 0.5,
          margin: 0.5,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
  } finally {
    await close();
  }
}
