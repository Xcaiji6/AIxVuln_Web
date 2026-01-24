# AGENTS.md

本文件为 WARP (warp.dev) 在本仓库中进行代码操作时提供指导。

## 项目概述

一个基于 Next.js 16 的 AI 驱动代码安全审计平台前端。用户上传源代码压缩包，后端启动 Docker 容器分析漏洞，结果通过 WebSocket 实时回传。

**语言**：中文界面，代码注释使用中文

## 命令

```bash
# 开发
npm run dev          # 启动开发服务器（默认：http://localhost:3000）
npm run build        # 生产构建
npm run start        # 运行生产构建
npm run lint         # ESLint 检查

# 未配置测试框架
```

## 环境配置

将 `.env.local.example` 复制为 `.env.local` 并配置：

- `NEXT_PUBLIC_API_BASE` — 后端 API 地址（默认通过 `/api/proxy/` 代理）
- `NEXT_PUBLIC_WS_BASE` — 实时更新的 WebSocket 地址
- `NEXT_PUBLIC_BACKEND_DIRECT` — 大文件上传的直连后端地址（绕过代理）
- `NEXT_PUBLIC_AUTH_HEADER` — Basic Auth 请求头（base64 编码）

`next.config.ts` 将 `/api/proxy/*` 代理到后端以避免 CORS 问题。

## 架构

### 数据流

1. **项目创建**：用户上传 `.zip` 或 `.tar.gz` → `/api/upload/route.ts` 转发到后端 → 后端解压并准备审计
2. **审计执行**：用户点击「启动审计」→ `startProject()` API 调用 → 后端启动容器
3. **实时更新**：`useWebSocket` Hook 连接后端 WebSocket → 接收事件（`VulnAdd`、`ContainerAdd`、`ReportAdd` 等）→ 状态更新触发重新渲染

### 关键目录

- `src/lib/api.ts` — 所有后端 API 调用（`getProjects`、`startProject`、`downloadReport` 等），带 Basic Auth
- `src/lib/types.ts` — TypeScript 接口定义：`VulnStruct`、`ContainerStruct`、`ProjectDetail`、`WSMessage` 等
- `src/hooks/useWebSocket.ts` — WebSocket 连接管理，自动重连，按 `WSMessageType` 处理类型化消息
- `src/components/audit/` — 业务组件：`VulnTable`、`ContainerList`、`EventLog`、`ReportList`、`UploadDialog`
- `src/components/ui/` — shadcn/ui 基础组件（Button、Dialog、Table 等）

### 页面

- `/`（`src/app/page.tsx`）— 项目列表页，含统计仪表盘
- `/projects/[name]`（`src/app/projects/[name]/page.tsx`）— 项目详情页，含漏洞表格、容器列表、事件日志、报告

### WebSocket 消息类型

`useWebSocket` Hook 处理以下消息类型（定义在 `types.ts` 中）：

- `string` — 事件日志条目
- `VulnAdd` / `VulnStatus` — 新漏洞或状态更新
- `ContainerAdd` / `ContainerRemove` — Docker 容器生命周期
- `ReportAdd` — 新的 Markdown 报告可用
- `EnvInfo` — 环境元数据（登录信息、数据库信息、路由）

### 样式

- Tailwind CSS 4，自定义「赛博」主题色（`--cyber-cyan`、`--cyber-purple` 等）
- 仅深色模式（无浅色主题）
- `globals.css` 中的自定义类：`.cyber-card`、`.cyber-glow`、`.text-gradient-cyber`
- `tw-animate-css` 用于动画

### 文件上传

大文件上传绕过 Next.js 代理以避免大小/超时限制：
- 前端调用 `/api/upload?projectName=xxx`
- 路由处理器（`src/app/api/upload/route.ts`）流式传输到 `BACKEND_DIRECT` 地址
- 最大时长：300 秒，请求体大小限制：500MB（在 `next.config.ts` 中配置）
