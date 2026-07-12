/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ["firebase-admin", "nodemailer"],
  },
};

export default nextConfig;
