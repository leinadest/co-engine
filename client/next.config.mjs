/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'cdn.discordapp.com' },
    ],
  },
};

export default nextConfig;
