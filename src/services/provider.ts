/** src/services/provider.ts */

import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import type { BalancedTransaction } from "@midnight-ntwrk/midnight-js-types";

export interface MidnightNetworkConfig {
  indexer: string;
  indexerWS: string;
  proofServer: string;
}

export interface MidnightWalletProvider {
  coinPublicKey: string;
  encryptionPublicKey: string;
  balanceTx: (tx: unknown, newCoins: unknown) => Promise<BalancedTransaction>;
  submitTx: (tx: unknown) => Promise<string>;
}

/**
 * Creates and wires all required providers for interacting with
 * a Midnight smart contract.
 *
 * Includes:
 * - Private contract state storage
 * - Public ledger data access via indexer
 * - Zero-knowledge configuration (compiled Compact artifacts)
 * - Proof server connection
 * - Wallet integration for balancing and submitting transactions
 */
export async function createMidnightProviders(
  privateStateStoreName: string,
  config: MidnightNetworkConfig,
  zkConfigPath: string,
  walletProvider: MidnightWalletProvider
) {
  return {
    // Contract private state persistence (local LevelDB)
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName,
    }),

    // Access to public ledger data via indexer (HTTP + WebSocket)
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS
    ),

    // Zero-knowledge circuit configuration from compiled Compact output
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),

    // Proof generation and submission service
    proofProvider: httpClientProofProvider(config.proofServer),

    // Wallet used for balancing and submitting transactions
    walletProvider,

    // Alias for SDK compatibility with older APIs
    midnightProvider: walletProvider,
  };
}
