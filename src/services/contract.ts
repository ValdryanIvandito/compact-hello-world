// src/services/contract.ts
import * as fs from "fs";
import * as path from "path";

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

  if (!fs.existsSync(contractModulePath)) {
    throw new Error(`Compiled contract not found: ${contractModulePath}`);
  }

  const contractModule = await import(contractModulePath);

  if (!contractModule.Contract || !contractModule.ledger) {
    throw new Error("Invalid compiled contract module");
  }

  return contractModule;
}
