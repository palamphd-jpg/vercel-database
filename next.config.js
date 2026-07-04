/** @type {import('next').NextConfig} */
const nextConfig = {
  // exceljs reads/writes a local file on the server's disk, so this app
  // needs a persistent filesystem (local machine, VPS, Docker, etc).
  // It will NOT retain data on stateless serverless hosts like Vercel.
  serverExternalPackages: ["exceljs"],
};

module.exports = nextConfig;
