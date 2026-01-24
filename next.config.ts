import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  // 注意：已移除 rewrites 配置，改用 /api/proxy/[...path]/route.ts 处理
  // 这样可以在服务端安全地注入认证信息
};

export default nextConfig;
