// 容器信息结构
export interface ContainerStruct {
  containerId: string;
  containerIP: string;
  image: string;
  webPort: string[];
}

// 漏洞信息结构
export interface VulnStruct {
  confidence: string;
  expected_impact: string;
  file: string;
  function_or_method: string;
  params: string;
  payload_idea: string;
  route_or_endpoint: string;
  status: string;
  title: string;
  type: string;
  vuln_id: string;
}

// 报告列表结构
export interface ReportListStruct {
  [reportId: string]: string;
}

// 登录信息
export interface LoginInfo {
  username?: string;
  password?: string;
  loginURL?: string;
  credentials?: string;
}

// 数据库信息
export interface DbInfo {
  username?: string;
  password?: string;
  Host?: string;
  Base?: string;
}

// 环境信息结构
export interface EnvStruct {
  containerId?: string;
  loginInfo?: LoginInfo;
  dbInfo?: DbInfo;
  routeInfo?: string[];
}

// 项目详情
export interface ProjectDetail {
  projectName: string;
  containerList: ContainerStruct[];
  eventLog: string[];
  vulnList: VulnStruct[];
  reportList: ReportListStruct;
  status: string;
  startTime: string;
  endTime: string;
  EnvInfo: EnvStruct;
}

// API 响应结构
export interface ApiResponse<T> {
  success: boolean;
  result: T | null;
  error: string | null;
}

// WebSocket 消息类型
export type WSMessageType =
  | 'string'
  | 'ReportAdd'
  | 'VulnStatus'
  | 'VulnAdd'
  | 'ContainerAdd'
  | 'ContainerRemove'
  | 'EnvInfo'
  | 'projectName';

// WebSocket 消息结构
export interface WSMessage {
  type: WSMessageType;
  data: unknown;
}

// 漏洞状态更新
export interface VulnStatusUpdate {
  status: string;
  vuln_id: string;
}

// 容器删除
export interface ContainerRemove {
  containerId: string;
}
