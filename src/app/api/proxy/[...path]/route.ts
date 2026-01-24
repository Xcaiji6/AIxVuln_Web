import { NextRequest, NextResponse } from 'next/server';

// 服务端环境变量
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9999';

export const dynamic = 'force-dynamic';

/**
 * 通用 API 代理
 * 转发浏览器的 Authorization 头，利用浏览器原生 Basic Auth
 */
async function proxyRequest(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}${path}${search}`;

  // 获取认证头和登出状态
  const authHeader = request.headers.get('Authorization');
  const loggedOut = request.cookies.get('logged_out')?.value;
  
  // 如果已登出且没有提供凭证，返回 401 触发浏览器认证弹窗
  if (loggedOut === 'true' && !authHeader) {
    return new NextResponse(JSON.stringify({ success: false, error: '未登录' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Code Audit System"',
      },
    });
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 转发浏览器发送的 Authorization 头
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // 对于有请求体的方法，转发请求体
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        fetchOptions.body = await request.text();
      }
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.text();

    // 如果后端返回 401，转发 WWW-Authenticate 头触发浏览器认证弹窗
    const responseHeaders: HeadersInit = {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    };
    
    if (response.status === 401) {
      const wwwAuth = response.headers.get('WWW-Authenticate');
      if (wwwAuth) {
        responseHeaders['WWW-Authenticate'] = wwwAuth;
      } else {
        responseHeaders['WWW-Authenticate'] = 'Basic realm="Code Audit System"';
      }
    } else if (response.ok) {
      // 认证成功，清除登出标记
      responseHeaders['Set-Cookie'] = 'logged_out=; Path=/; Max-Age=0';
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      { success: false, error: '后端服务请求失败' },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
