/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ETHERSCAN_API_KEY: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
    NEXT_PUBLIC_BSCSCAN_API_KEY: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY,
    NEXT_PUBLIC_POLYGONSCAN_API_KEY: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
  },
}

module.exports = nextConfig
