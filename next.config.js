/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    const BACKEND_URL = 'https://ai-teaching-assistant-ir98.onrender.com';
    
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
        basePath: false
      }
    ];
  }
}

module.exports = nextConfig