// src/indexerQuery.ts
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { StateValue } from "@midnight-ntwrk/onchain-runtime";
import * as fs from "fs";
import * as path from "path";
import { loadContract } from "../services/contract";

export async function readMessage(config: any, contractName: string) {
  console.log("Querying Hello World contract state via local indexer\n");

  // 1. Read contract address from deployment.json
  if (!fs.existsSync("deployment.json")) {
    throw new Error("deployment.json not found. Deploy the contract first.");
  }

  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
  const contractAddress: string =
    deployment.address || deployment.contractAddress;

  if (!contractAddress) {
    throw new Error("No contract address found in deployment.json");
  }

  console.log("Contract address:", contractAddress, "\n");

  // 2. Create public data provider (indexer client)
  const provider = indexerPublicDataProvider(config.indexer, config.indexerWS);

  // 4. Query latest contract state from indexer
  const state = await provider.queryContractState(contractAddress);

  if (!state) {
    console.log("No state found for this contract (yet).");
    return;
  }

  // 4️⃣ Load kontrak hasil compile
  const contractPath = path.join(process.cwd(), "contracts");
  const contractModule = await loadContract(contractPath, contractName);

  const ledger = contractModule.ledger(state.data);
  const message = Buffer.from(ledger.message).toString();

  console.log("Current message on-chain:", `"${message}"`);
}
