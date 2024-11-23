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
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'https://ai-teaching-assistant-ir98.onrender.com/api/:path*'
        }
      ]
    };
  }
}

module.exports = nextConfig