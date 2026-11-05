import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const addresses = Object.values(networkInterfaces())
  .flat()
  .filter((v) => v && v.family === "IPv4" && !v.internal)
  .map((v) => v.address);
const child = spawn(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/next/dist/bin/next", import.meta.url),
    ),
    "dev",
    "--webpack",
    "--hostname",
    "0.0.0.0",
    "--port",
    "3000",
  ],
  { cwd: root, stdio: ["inherit", "pipe", "inherit"] },
);
let shown = false;
child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  if (!shown && chunk.toString().includes("Ready")) {
    shown = true;
    console.log("\nAPEX PROPERTY INTELLIGENCE — OPENEN OP JE IPAD\n");
    console.log(
      "1. Verbind je iPad en deze computer met hetzelfde wifi-netwerk.",
    );
    console.log(
      "2. Typ in Safari een van deze adressen (gebruik http, zonder s):",
    );
    for (const address of addresses) console.log(`   http://${address}:3000`);
    console.log("3. Houd dit venster open. Stoppen: Ctrl+C.\n");
    if (!addresses.length)
      console.log("Geen netwerkadres gevonden. Controleer je wifi-verbinding.");
  }
});
child.on("error", (error) => {
  console.error("Starten mislukt:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
