/** src/utils/waitForSync.ts */

import * as Rx from "rxjs";
import { nativeToken } from "@midnight-ntwrk/ledger";
import type { Wallet } from "@midnight-ntwrk/wallet-api";

/**
 * Wait until the wallet is fully synchronized
 * and return the native token balance.
 */
export async function waitForSync(wallet: Wallet): Promise<bigint> {
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

      // Proceed only when wallet is fully synced
      Rx.filter((state) => state.syncProgress?.synced === true),

      // Read native token balance (default to 0n)
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),

      // Limit emissions as a safety guard
      Rx.take(10)
    )
  );
}
