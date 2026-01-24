import { NextResponse } from 'next/server';

/**
 * 登出端点
 * 返回 401 状态码和 WWW-Authenticate 头，强制浏览器清除缓存的认证信息
 * 用户点击取消后会看到空白页面，刷新后重新弹出认证
 */
export async function GET() {
  // 返回一个 HTML 页面，使用 JS 清除缓存的凭证
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>已登出</title>
  <style>
    body { 
      margin: 0; 
      background: #fff; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh;
      font-family: system-ui, sans-serif;
    }
    .message {
      text-align: center;
      color: #666;
    }
    a {
      color: #0066cc;
      text-decoration: none;
      cursor: pointer;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="message">
    <p style="font-size: 18px; margin-bottom: 20px;">✅ 已登出系统</p>
    <p style="color: #999; font-size: 14px; margin-bottom: 15px;">如需完全登出，请关闭所有浏览器窗口</p>
    <p><a onclick="relogin()" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: #fff; border-radius: 4px;">重新登录</a></p>
  </div>
  <script>
    function relogin() {
      window.location.href = '/';
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'WWW-Authenticate': 'Basic realm="Code Audit System"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // 设置登出 Cookie
      'Set-Cookie': 'logged_out=true; Path=/; Max-Age=3600; SameSite=Lax',
    },
  });
}

export async function POST() {
  return GET();
}
