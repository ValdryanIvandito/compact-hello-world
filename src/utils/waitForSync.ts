import * as Rx from "rxjs";
import { nativeToken } from "@midnight-ntwrk/ledger";
import type { Wallet } from "@midnight-ntwrk/wallet-api";

/**
 * Menunggu sinkronisasi wallet
 */
export async function waitForSync(wallet: Wallet): Promise<bigint> {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state) => {
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, sourceGap=${state.syncProgress.lag.sourceGap}, applyGap=${state.syncProgress.lag.applyGap}`
          );
        }
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.take(10),
    )
  );
}
