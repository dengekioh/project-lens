/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/scrape', // 我們創造的本地假路徑
        destination: 'https://project-lens-api.onrender.com/scrape', // 真實的 A 君後端路徑
      },
    ];
  },
};

export default nextConfig;