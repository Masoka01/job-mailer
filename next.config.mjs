/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ["firebase-admin"],
  },
};

export default nextConfig;
