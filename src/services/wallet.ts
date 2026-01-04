/** src/services/wallet.ts */

import crypto from "node:crypto";
import { firstValueFrom } from "rxjs";

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

import type { Wallet, WalletState } from "@midnight-ntwrk/wallet-api";

/**
 * Context wallet runtime
 */
export interface WalletContext {
  wallet: Wallet;
  state: WalletState;
  close: () => Promise<void>;
}

/**
 * Build wallet dari seed
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
 * Adapter wallet agar kompatibel dengan deployContract
 */
export function createWalletProvider(wallet: Wallet, state: WalletState) {
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,

    async balanceTx(tx: any, newCoins: any) {
      if (!tx || typeof (tx as any).serialize !== "function") {
        throw new Error("Objek transaksi tidak valid");
      }

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

    submitTx(tx: any) {
      return wallet.submitTransaction(tx as any);
    },
  };
}

/**
 * Generate seed wallet baru
 */
export function generateSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}
