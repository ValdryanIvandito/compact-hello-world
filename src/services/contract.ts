/** src/services/contract.ts */

import * as fs from "fs";
import * as path from "path";

/**
 * Dynamically loads a compiled Midnight contract module.
 */
export async function loadContract(
  contractPath: string,
  contractName: string
): Promise<any> {
  const contractModulePath = path.join(
    contractPath,
    "managed",
    contractName,
    "contract",
    "index.cjs"
  );

  // Ensure the compiled contract file exists
  if (!fs.existsSync(contractModulePath)) {
    throw new Error(`Compiled contract not found: ${contractModulePath}`);
  }

  // Dynamically import the compiled contract module
  const contractModule = await import(contractModulePath);

  // Validate required exports from Midnight compiled contracts
  if (!contractModule.Contract || !contractModule.ledger) {
    throw new Error("Invalid compiled contract module");
  }

  return contractModule;
}
