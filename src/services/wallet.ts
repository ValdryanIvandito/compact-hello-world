/** src/services/wallet.ts */

import crypto from "node:crypto";
import * as Rx from "rxjs";
import { firstValueFrom } from "rxjs";

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { Transaction, nativeToken } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

import type { Wallet, WalletState } from "@midnight-ntwrk/wallet-api";

/**
 * Runtime wallet context wrapper.
 * Holds the wallet instance, its latest state, and a cleanup handler.
 */
export interface WalletContext {
  wallet: Wallet;
  state: WalletState;
  close: () => Promise<void>;
}

/**
 * Generate a new random 32-byte wallet seed (hex-encoded).
 */
export function generateSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Build and start a Midnight wallet from a seed.
 * Waits for the initial wallet state before returning.
 */
export async function buildWallet(
  config: any,
  seed: string
): Promise<WalletContext> {
  if (!seed || seed.length !== 64) {
    throw new Error("Seed wallet tidak valid");
  }

  const wallet = await WalletBuilder.build(
    config.indexer,
    config.indexerWS,
    config.proofServer,
    config.node,
    seed,
    config.zSwapNetworkId,
    config.logLevel ?? "info"
  );

  wallet.start();

  const state = await firstValueFrom(wallet.state());

  return {
    wallet,
    state,
    close: async () => wallet.close(),
  };
}

/**
 * Wait until the wallet is fully synchronized and
 * return the native token balance.
 */
export async function syncWallet(wallet: Wallet): Promise<bigint> {
  return Rx.firstValueFrom(
    // Subscribe to wallet state updates
    wallet.state().pipe(
      Rx.tap((state) => {
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, sourceGap=${state.syncProgress.lag.sourceGap}, applyGap=${state.syncProgress.lag.applyGap}`
          );
        }
      }),

      // Continue only once the wallet is fully synced
      Rx.filter((state) => state.syncProgress?.synced === true),

      // Read the native token balance (default to 0n)
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),

      // Safety guard to prevent infinite streams
      Rx.take(10)
    )
  );
}

/**
 * Wallet adapter compatible with Midnight contract deployment APIs.
 * Handles transaction balancing, proving, and submission.
 */
export function createWalletProvider(wallet: Wallet, state: WalletState) {
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,

    async balanceTx(tx: any, newCoins: any) {
      if (!tx || typeof (tx as any).serialize !== "function") {
        throw new Error("Objek transaksi tidak valid");
      }

      // Convert ledger transaction → zswap → balanced → proved → ledger
      const balanced = await wallet.balanceTransaction(
        ZswapTransaction.deserialize(
          (tx as any).serialize(getLedgerNetworkId()),
          getZswapNetworkId()
        ),
        newCoins
      );

      const proved = await wallet.proveTransaction(balanced);

      return createBalancedTx(
        Transaction.deserialize(
          proved.serialize(getZswapNetworkId()),
          getLedgerNetworkId()
        )
      );
    },

    // Submit a proved ledger transaction to the network
    submitTx(tx: any) {
      return wallet.submitTransaction(tx as any);
    },
  };
}
