/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
        remotePatterns: [{
          protocol: 'https',
          hostname: 'cdn.multiversx.com',
        }],
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
};

export default nextConfig;
