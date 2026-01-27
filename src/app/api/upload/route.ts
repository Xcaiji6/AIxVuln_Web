import { NextRequest, NextResponse } from 'next/server';

// 服务端环境变量
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9999';

// 允许的文件类型白名单
const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-tar',
  'application/x-compressed-tar',
];

const ALLOWED_EXTENSIONS = ['.zip', '.tar.gz', '.tgz', '.tar'];

// Route segment config for large file uploads
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectName = searchParams.get('projectName');

  if (!projectName) {
    return NextResponse.json(
      { success: false, error: '缺少项目名称' },
      { status: 400 }
    );
  }

  // 验证项目名称格式（防止路径遍历）
  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    return NextResponse.json(
      { success: false, error: '项目名称只能包含字母、数字、下划线和连字符' },
      { status: 400 }
    );
  }

  const url = `${BACKEND_URL}/projects/create?projectName=${encodeURIComponent(projectName)}`;

  try {
    // Get the form data from request
    const formData = await request.formData();
    const file = formData.get('file');

    // 验证文件存在
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: '缺少文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.type) || file.type === 'application/octet-stream';

    if (!isValidExtension) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型，仅支持 .zip, .tar.gz, .tgz, .tar 格式' },
        { status: 400 }
      );
    }

    if (!isValidMimeType) {
      console.warn(`[Upload] Unexpected MIME type: ${file.type} for file: ${file.name}`);
    }

    // 转发浏览器发送的 Authorization 头
    // 注意：不要设置 Content-Type，让 fetch 自动处理 multipart/form-data 的 boundary
    const headers: HeadersInit = {};
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // 重新构建 FormData 以确保正确传输
    const newFormData = new FormData();
    newFormData.append('file', file, file.name);

    // Forward form data to backend
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: newFormData,
    });

    const data = await response.text();

    // 构建响应头
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果后端返回 401，转发 WWW-Authenticate 头触发浏览器认证弹窗
    if (response.status === 401) {
      const wwwAuth = response.headers.get('WWW-Authenticate');
      if (wwwAuth) {
        responseHeaders['WWW-Authenticate'] = wwwAuth;
      } else {
        responseHeaders['WWW-Authenticate'] = 'Basic realm="Code Audit System"';
      }
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Upload Error] Full error:', error);
    console.error('[Upload Error] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[Upload Error] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Upload Error] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { success: false, error: `上传失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
