import type {
  ApiResponse,
  ContainerStruct,
  EnvStruct,
  ProjectDetail,
  ReportListStruct,
  VulnStruct,
} from './types';

// 通过 Next.js API 代理访问后端，认证在服务端处理
const API_PROXY = '/api/proxy';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_PROXY}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// 获取项目列表
export async function getProjects(): Promise<ApiResponse<string[]>> {
  return fetchApi<string[]>('/projects');
}

// 获取项目详情
export async function getProjectDetail(name: string): Promise<ApiResponse<ProjectDetail>> {
  return fetchApi<ProjectDetail>(`/projects/${encodeURIComponent(name)}`);
}

// 获取漏洞列表
export async function getVulns(name: string): Promise<ApiResponse<VulnStruct[]>> {
  return fetchApi<VulnStruct[]>(`/projects/${encodeURIComponent(name)}/vulns`);
}

// 获取容器列表
export async function getContainers(name: string): Promise<ApiResponse<ContainerStruct[]>> {
  return fetchApi<ContainerStruct[]>(`/projects/${encodeURIComponent(name)}/containers`);
}

// 获取事件日志
export async function getEvents(name: string, count: number = 50): Promise<ApiResponse<string[]>> {
  return fetchApi<string[]>(`/projects/${encodeURIComponent(name)}/events?count=${count}`);
}

// 获取报告列表
export async function getReports(name: string): Promise<ApiResponse<ReportListStruct>> {
  return fetchApi<ReportListStruct>(`/projects/${encodeURIComponent(name)}/reports`);
}

// 获取环境信息
export async function getEnvInfo(name: string): Promise<ApiResponse<EnvStruct>> {
  return fetchApi<EnvStruct>(`/projects/${encodeURIComponent(name)}/envinfo`);
}

// 创建项目 - 使用专用上传端点处理大文件
// onProgress: 上传进度回调，参数为 0-100 的百分比
export function createProject(
  projectName: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<ApiResponse<string>> {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/upload?projectName=${encodeURIComponent(projectName)}`);
    xhr.withCredentials = true;

    // 监听上传进度
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      } catch {
        resolve({
          success: false,
          result: null,
          error: '解析响应失败',
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        result: null,
        error: '网络请求失败',
      });
    };

    xhr.send(formData);
  });
}

// 运行项目
// @param startType - 0: 全流程审计（默认），1: 仅代码分析
export async function startProject(name: string, startType: 0 | 1 = 0): Promise<ApiResponse<string>> {
  const url = startType === 1 
    ? `/projects/${encodeURIComponent(name)}/start?startType=1`
    : `/projects/${encodeURIComponent(name)}/start`;
  return fetchApi<string>(url, {
    method: 'GET',
  });
}

// 取消项目
export async function cancelProject(name: string): Promise<ApiResponse<string>> {
  return fetchApi<string>(`/projects/${encodeURIComponent(name)}/cancel`, {
    method: 'GET',
  });
}

// 删除项目
export async function deleteProject(name: string): Promise<ApiResponse<string>> {
  return fetchApi<string>(`/projects/${encodeURIComponent(name)}/del`, {
    method: 'GET',
  });
}

// 下载报告 - 通过代理路径
function getReportDownloadUrl(projectName: string, reportId: string): string {
  return `${API_PROXY}/projects/${encodeURIComponent(projectName)}/reports/download/${encodeURIComponent(reportId)}`;
}

// 获取报告内容（用于预览）
export async function getReportContent(projectName: string, reportId: string): Promise<string> {
  const url = getReportDownloadUrl(projectName, reportId);
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`获取报告失败: ${response.status}`);
  }
  return response.text();
}

// 下载所有报告 - 通过代理路径
function getAllReportsDownloadUrl(projectName: string): string {
  return `${API_PROXY}/projects/${encodeURIComponent(projectName)}/reports/downloadAll`;
}

// 下载单个报告
export async function downloadReport(projectName: string, reportId: string, fileName?: string): Promise<void> {
  const url = getReportDownloadUrl(projectName, reportId);
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': '*/*',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Download error:', response.status, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || `下载报告失败: ${response.status}`);
    } catch {
      throw new Error(`下载报告失败: ${response.status}`);
    }
  }
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName || `report-${reportId}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// 下载所有报告
export async function downloadAllReports(projectName: string): Promise<void> {
  const url = getAllReportsDownloadUrl(projectName);
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': '*/*',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Download all error:', response.status, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || `下载报告失败: ${response.status}`);
    } catch {
      throw new Error(`下载报告失败: ${response.status}`);
    }
  }
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${projectName}-reports.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// WebSocket URL - 直连后端（Next.js 不支持 WebSocket 代理）
// 通过 URL query parameter 订阅特定项目的事件
export function getWebSocketUrl(projectName?: string): string {
  const wsBase = process.env.NEXT_PUBLIC_WS_BASE;
  if (!wsBase) {
    console.error('[WebSocket] 未配置 NEXT_PUBLIC_WS_BASE 环境变量');
    return '';
  }
  if (projectName) {
    return `${wsBase}/ws?projectName=${encodeURIComponent(projectName)}`;
  }
  return `${wsBase}/ws`;
}
