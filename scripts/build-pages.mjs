import { spawnSync } from "node:child_process";
const env = {
  ...process.env,
  NEXT_PUBLIC_BASE_PATH: "/dubai-vastgoed-dashboard",
};
for (const args of [
  ["node_modules/next/dist/bin/next", "build", "--webpack"],
  ["scripts/build-offline.mjs"],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
