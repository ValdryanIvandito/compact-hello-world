/** src/features/readMessage.ts */

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import boxen from "boxen";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { loadContract } from "../services/contract";

/**
 * Read the latest on-chain message from the deployed contract.
 */
export async function readMessage(config: any, contractName: string) {
  console.log(chalk.gray("\n🔍 Querying contract state via indexer...\n"));

  /**
   * Check if contract address exist
   */
  if (!fs.existsSync("deployment.json")) {
    console.error(
      chalk.red(
        "❌ deployment.json not found. Compile and deploy the contract."
      )
    );
    return;
  }

  const { contractAddress } = JSON.parse(
    fs.readFileSync("deployment.json", "utf-8")
  );

  if (!contractAddress) {
    console.error(
      chalk.red(
        "❌ Contract address not found in deployment.json, please retry compile and deploy the contract."
      )
    );
    return;
  }

  console.log(
    chalk.gray("📍 Contract address"),
    chalk.white("→"),
    chalk.cyan(contractAddress),
    "\n"
  );

  // Create indexer public data provider
  const provider = indexerPublicDataProvider(config.indexer, config.indexerWS);

  // Query latest contract state from indexer
  const state = await provider.queryContractState(contractAddress);

  if (!state) {
    console.log(chalk.red("⚠️  No contract state found yet."));
    return;
  }

  // Load compiled contract artifacts
  const contractPath = path.join(process.cwd(), "contracts");
  const contractModule = await loadContract(contractPath, contractName);

  // Decode on-chain message from ledger state
  const ledger = contractModule.ledger(state.data);
  const message = Buffer.from(ledger.message).toString();

  // Render message result inside a box
  console.log(
    boxen(
      `${chalk.green.bold("ON-CHAIN MESSAGE")}

${chalk.cyan(`"${message}"`)}`,
      {
        padding: 0.5,
        margin: 0.5,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );
}
