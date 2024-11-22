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
<<<<<<< HEAD

=======
>>>>>>> 021853d1a7ee66ba60c11c4d1c7d646a8489f333
  async rewrites() {
    if (process.env.VERCEL) {
      return {
        beforeFiles: [
          {
            source: '/api/:path*',
            destination: '/api/:path*',  // This will route to your FastAPI backend on Vercel
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
