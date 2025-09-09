/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Skip TS type errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors
  },
};

export default nextConfig;

