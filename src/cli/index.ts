/** src/cli/index.ts */

import dotenv from "dotenv";
import { showMainMenu } from "./menu";

// Load environment variables from .env file
dotenv.config();

/**
 * Main CLI entry point
 */
async function main() {
  // Start the interactive main menu
  await showMainMenu();
}

// Global error handler for CLI execution
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
