import dotenv from "dotenv";
import { showMainMenu } from "./menu";

// Load environment variables dari file .env
dotenv.config();

/**
 * Entry point utama CLI
 */
async function main() {
  await showMainMenu();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
