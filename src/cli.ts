import * as readline from "readline/promises";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { WebSocket } from "ws";
import * as path from "path";
import * as fs from "fs";
import * as Rx from "rxjs";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Undeployed
setNetworkId(NetworkId.Undeployed);

// Local Midnight Network (Docker)
const UNDEPLOYED_CONFIG = {
  indexer: "http://127.0.0.1:8088/api/v1/graphql",
  indexerWS: "ws://127.0.0.1:8088/api/v1/graphql/ws",
  node: "http://127.0.0.1:9944",
  proofServer: "http://127.0.0.1:6300",
};

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Hello World Contract CLI\n");

  try {
    // Check for deployment file
    if (!fs.existsSync("deployment.json")) {
      console.error("No deployment.json found! Run npm run deploy first.");
      process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
    console.log(`Contract: ${deployment.contractAddress}\n`);

    // Get wallet seed
    const walletSeed = await rl.question("Enter your wallet seed: ");

    console.log("\nConnecting to Midnight network...");

    // Additional logic follows...
    // Build wallet
    const wallet = await WalletBuilder.buildFromSeed(
      UNDEPLOYED_CONFIG.indexer,
      UNDEPLOYED_CONFIG.indexerWS,
      UNDEPLOYED_CONFIG.proofServer,
      UNDEPLOYED_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      "info"
    );

    wallet.start();

    // Wait for sync
    await Rx.firstValueFrom(
      wallet.state().pipe(Rx.filter((s) => s.syncProgress?.synced === true))
    );

    // Load contract
    const contractPath = path.join(process.cwd(), "contracts");
    const contractModulePath = path.join(
      contractPath,
      "managed",
      "hello-world",
      "contract",
      "index.cjs"
    );
    const HelloWorldModule = await import(contractModulePath);
    const contractInstance = new HelloWorldModule.Contract({});

    // Create wallet provider
    const walletState = await Rx.firstValueFrom(wallet.state());

    const walletProvider = {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx(tx: any, newCoins: any) {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(
              tx.serialize(getLedgerNetworkId()),
              getZswapNetworkId()
            ),
            newCoins
          )
          .then((tx) => wallet.proveTransaction(tx))
          .then((zswapTx) =>
            Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId()
            )
          )
          .then(createBalancedTx);
      },
      submitTx(tx: any) {
        return wallet.submitTransaction(tx);
      },
    };

    // Configure providers
    const zkConfigPath = path.join(contractPath, "managed", "hello-world");
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: "hello-world-state",
      }),
      publicDataProvider: indexerPublicDataProvider(
        UNDEPLOYED_CONFIG.indexer,
        UNDEPLOYED_CONFIG.indexerWS
      ),
      zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
      proofProvider: httpClientProofProvider(UNDEPLOYED_CONFIG.proofServer),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };

    // Connect to contract
    const deployed: any = await findDeployedContract(providers, {
      contractAddress: deployment.contractAddress,
      contract: contractInstance,
      privateStateId: "helloWorldState",
      initialPrivateState: {},
    });

    console.log("Connected to contract\n");

    // Main menu loop
    let running = true;
    while (running) {
      console.log("--- Menu ---");
      console.log("1. Store message");
      console.log("2. Read current message");
      console.log("3. Exit");

      const choice = await rl.question("\nYour choice: ");

      switch (choice) {
        case "1":
          console.log("\nStoring custom message...");
          const customMessage = await rl.question("Enter your message: ");
          try {
            const tx = await deployed.callTx.storeMessage(customMessage);
            console.log("Success!");
            console.log(`Message: "${customMessage}"`);
            console.log(`Transaction ID: ${tx.public.txId}`);
            console.log(`Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error("Failed to store message:", error);
          }
          break;

        case "2":
          console.log("\nReading message from blockchain...");
          try {
            const state = await providers.publicDataProvider.queryContractState(
              deployment.contractAddress
            );
            if (state) {
              const ledger = HelloWorldModule.ledger(state.data);
              const message = Buffer.from(ledger.message).toString();
              console.log(`Current message: "${message}"\n`);
            } else {
              console.log("No message found\n");
            }
          } catch (error) {
            console.error("Failed to read message:", error);
          }
          break;

        case "3":
          running = false;
          console.log("\nGoodbye!");
          break;

        default:
          console.log("Invalid choice. Please enter 1, 2, or 3.\n");
      }
    }

    // Clean up
    await wallet.close();
  } catch (error) {
    console.error("\nError:", error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
