import { NextResponse } from 'next/server';

/**
 * Next.js Middleware - 统一添加安全响应头
 */
export function middleware() {
  const response = NextResponse.next();

  // 防止点击劫持
  response.headers.set('X-Frame-Options', 'DENY');

  // 防止 MIME 类型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS 保护（现代浏览器已内置，但作为额外防护）
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 引用来源策略
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 权限策略 - 限制敏感功能
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // 内容安全策略
  // 注意：根据实际需求调整，当前配置允许内联样式和脚本（为兼容 Next.js）
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js 需要 unsafe-inline 和 unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind CSS 需要 unsafe-inline
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' ws: wss:", // 允许 WebSocket 连接
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // HSTS - 强制 HTTPS（仅在生产环境启用）
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

// 配置 middleware 匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，排除：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
