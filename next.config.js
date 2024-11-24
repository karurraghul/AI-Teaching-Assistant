/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  },
  eslint:{
    ignoreDuringBuilds:true,
  },

  async rewrites() {
    const BACKEND_URL = 'https://ai-teaching-assistant-ir98.onrender.com';
    
    return [
      {
        source: '/api/:path*',  // Keep as /api since that's what your routes use
        destination: `${BACKEND_URL}/api/:path*`,
      }
    ];
  }
}

module.exports = nextConfig