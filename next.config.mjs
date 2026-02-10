/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp', 'prisma', '@prisma/client']
};

export default nextConfig;
