# AIxVuln - AI 代码安全审计平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

AI 驱动的代码安全审计平台前端。用户上传源代码压缩包，后端启动 Docker 容器进行漏洞分析，结果通过 WebSocket 实时回传。

> 🔗 **后端仓库**: [AIxVuln](https://github.com/m4xxxxx/AIxVuln)

## ✨ 功能特性

- 📦 **源码上传** - 支持 `.zip` / `.tar.gz` 格式，最大 500MB
- 🔍 **漏洞扫描** - AI 驱动的自动化代码安全分析
- 📡 **实时反馈** - WebSocket 实时推送扫描进度和结果
- 🐳 **容器管理** - 查看审计容器运行状态
- 📊 **报告生成** - 自动生成 Markdown 格式审计报告
- 🌙 **赛博主题** - 深色科技风界面设计

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **组件**: shadcn/ui + Radix UI
- **状态**: React Hooks + WebSocket
- **动画**: tw-animate-css

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/qqliushiyu/AIxVuln_Web.git
cd code-audit-system

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 配置后端 API 地址

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `BACKEND_URL` | 后端 API 地址 | `http://localhost:8080` |
| `NEXT_PUBLIC_WS_BASE` | WebSocket 直连地址 | `ws://localhost:8080` |

## 📁 项目结构

```
src/
├── app/
│   ├── globals.css              # 赛博主题样式
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 项目列表页
│   ├── api/upload/route.ts      # 文件上传代理
│   └── projects/[name]/
│       └── page.tsx             # 项目详情页
├── components/
│   ├── audit/                   # 业务组件
│   │   ├── VulnTable.tsx        # 漏洞表格
│   │   ├── ContainerList.tsx    # 容器列表
│   │   ├── EventLog.tsx         # 事件日志
│   │   ├── ReportList.tsx       # 报告列表
│   │   └── UploadDialog.tsx     # 上传弹窗
│   └── ui/                      # shadcn 基础组件
├── hooks/
│   └── useWebSocket.ts          # WebSocket Hook
└── lib/
    ├── api.ts                   # API 服务层
    └── types.ts                 # TypeScript 类型
```

## 📜 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run start    # 运行生产版本
npm run lint     # ESLint 检查
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。
