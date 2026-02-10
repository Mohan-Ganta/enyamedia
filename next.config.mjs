/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp'],
  outputFileTracingExcludes: {
    '/api/**/*': ['./public/uploads/**/*', './node_modules/sharp/**/*'],
  }
};

export default nextConfig;
