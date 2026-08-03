/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '172.26.192.1',
    '172.26.192.1:3000',
    '172.26.192.1:3001',
    'localhost:3000',
    'localhost:3001',
  ],
};

export default nextConfig;