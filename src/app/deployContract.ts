import fs from "fs";
import path from "path";

import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { nativeToken } from "@midnight-ntwrk/ledger";

import { buildWallet, createWalletProvider } from "../services/wallet";
import { loadContract } from "../services/contract";
import { setProviders } from "../services/provider";
import { waitForSync } from "../utils/waitForSync";

/**
 * Use-case deploy kontrak
 */
export async function deployContractApp(
  config: any,
  seed: string,
  contractName: string,
  privateStateStoreName: string,
  privateStateId: string
): Promise<void> {
  const { wallet, state, close } = await buildWallet(config, seed);
  try {
    let balance = state.balances[nativeToken()] ?? 0n;

    // Jika belum ada saldo, tunggu faucet
    if (balance === 0n) {
      console.log("⏳ Menunggu dana masuk ke wallet...");
      balance = await waitForSync(wallet);
    }

    // Load kontrak hasil compile
    const contractPath = path.join(process.cwd(), "contracts");
    const contractModule = await loadContract(contractPath, contractName);
    const contract = new contractModule.Contract({});

    // Setup wallet provider
    const walletProvider = createWalletProvider(wallet, state);

    // Setup provider kontrak
    const providers = await setProviders(
      privateStateStoreName,
      config,
      path.join(contractPath, "managed", contractName),
      walletProvider
    );

    console.log("🚀 Deploying contract...");

    const deployed = await deployContract(providers, {
      contract,
      privateStateId,
      initialPrivateState: {},
    });

    const address = deployed.deployTxData?.public?.contractAddress;

    if (!address) {
      throw new Error("Deployment gagal, alamat kontrak tidak ditemukan");
    }

    // Simpan metadata deployment
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

    console.log("✔ Contract deployed");
    console.log("Address:", address);
  } finally {
    await close();
  }
}
