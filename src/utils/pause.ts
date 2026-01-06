import * as readline from "readline/promises";

/**
 * Pause CLI execution until user confirms.
 */
export async function pause(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const answer = (await rl.question("\nType 'Y' to continue: "))
      .trim()
      .toUpperCase();

    if (answer === "Y") {
      rl.close();
      return;
    }
  }
}
