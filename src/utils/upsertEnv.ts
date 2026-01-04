/** src/utils/upsertEnv.ts */

import fs from "node:fs";
import path from "node:path";

/**
 * Write or update key-value pairs in the .env file.
 * - Update existing keys
 * - Append missing keys
 * - Preserve other entries
 */
export function upsertEnv(values: Record<string, string>) {
  // Resolve absolute path to .env in current working directory
  const envPath = path.resolve(process.cwd(), ".env");

  // Read existing .env content if file exists
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  for (const [key, value] of Object.entries(values)) {
    // Escape key for safe usage in RegExp
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match exact key assignment line
    const regex = new RegExp(`^${escapedKey}=.*$`, "m");

    if (regex.test(envContent)) {
      // Replace existing key value
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Append new key-value pair
      envContent += `${
        envContent.endsWith("\n") || envContent === "" ? "" : "\n"
      }${key}=${value}\n`;
    }
  }

  // Write updated content back to .env
  fs.writeFileSync(envPath, envContent, { encoding: "utf-8" });
}
