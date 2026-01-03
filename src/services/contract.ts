// src/services/contract.ts

// import * as fs from "fs";
// import * as path from "path";

// export interface LoadedContract<TContract = any, TLedger = any> {
//   contract: TContract;
//   ledgerData: TLedger;
// }

// export async function loadContract<TContract = any, TLedger = any>(
//   contractPath: string,
//   contractName: string,
//   constructorArgs: Record<string, any> = {},
//   state?: any
// ): Promise<LoadedContract<TContract, TLedger>> {
//   const contractModulePath = path.join(
//     contractPath,
//     "managed",
//     contractName,
//     "contract",
//     "index.cjs"
//   );

//   if (!fs.existsSync(contractModulePath)) {
//     throw new Error(
//       [
//         `Compiled contract not found.`,
//         `Expected file: ${contractModulePath}`,
//         `Have you run: npm run compile ?`,
//       ].join("\n")
//     );
//   }

//   const contractModule = await import(contractModulePath);

//   if (!contractModule.Contract) {
//     throw new Error(
//       `Invalid contract module: "Contract" export not found in ${contractModulePath}`
//     );
//   }

//   if (!contractModule.ledger) {
//     throw new Error(
//       `Invalid contract module: "ledger" export not found in ${contractModulePath}`
//     );
//   }

//   return {
//     contract: new contractModule.Contract(constructorArgs),
//     ledgerData: contractModule.ledger(state.data),
//   };
// }

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
