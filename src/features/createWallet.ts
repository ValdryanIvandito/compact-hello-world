import chalk from "chalk";
import ora from "ora";
import { generateSeed, buildWallet } from "../services/wallet";
import { upsertEnv } from "../utils/upsertEnv";

/**
 * Use-case: membuat wallet baru
 */
export async function createWalletApp(config: any) {
  const spinner = ora("Generating wallet...").start();

  try {
    // Generate seed wallet baru
    const seed = generateSeed();

    // Build wallet dari seed
    const { state, close } = await buildWallet(config, seed);

    spinner.succeed("Wallet berhasil dibuat");

    // Simpan data wallet ke file .env
    upsertEnv({
      WALLET_SEED: seed,
      WALLET_ADDRESS: state.address,
      WALLET_COIN_PUBKEY: state.coinPublicKey,
    });

    console.log(chalk.green("✔ Saved to .env\n"));

    await close();
  } catch (err) {
    spinner.fail("Gagal membuat wallet");
    throw err;
  }
}
