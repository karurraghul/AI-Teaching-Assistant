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
    if (process.env.VERCEL) {
      return {
        beforeFiles: [
          {
            source: '/api/:path*',
            destination: 'https://ai-teaching-assistant-ir98.onrender.com/api/:path*',  // This will route to your FastAPI backend on Vercel
          },
        ],
      };
    }
    // Local development
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  }
}

module.exports = nextConfig
