import { networkInterfaces } from "node:os";

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  devIndicators: false,
  // Permit the actual local computer addresses used by Safari on the same wifi.
  // Do not enable arbitrary origins or a public wildcard for the dev server.
  allowedDevOrigins: [
    "127.0.0.1",
    ...Object.values(networkInterfaces())
      .flat()
      .filter((v) => v && v.family === "IPv4" && !v.internal)
      .map((v) => v.address),
  ],
};

export default config;
