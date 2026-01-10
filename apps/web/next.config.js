/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@teachy/ui", "@teachy/db", "@teachy/firebase"],
};

module.exports = nextConfig;
