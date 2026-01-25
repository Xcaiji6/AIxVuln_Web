'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProjectCard, UploadDialog } from '@/components/audit';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getProjects, getProjectDetail } from '@/lib/api';

interface ProjectInfo {
  name: string;
  status: string;
  vulnCount: number;
}

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const result = await getProjects();
      if (result.success) {
        setIsAuthenticated(true);
        // 获取每个项目的详情
        const projectList = result.result || [];
        const projectInfos = await Promise.all(
          projectList.map(async (name) => {
            const detail = await getProjectDetail(name);
            return {
              name,
              status: detail.result?.status || '未运行',
              vulnCount: detail.result?.vulnList?.length || 0,
            };
          })
        );
        setProjects(projectInfos);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 登出功能
  const handleLogout = useCallback(() => {
    window.location.href = '/api/logout';
  }, []);

  // 未认证时显示白色空白页面
  if (!isAuthenticated) {
    return <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 9999 }} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-purple flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-background md:w-6 md:h-6"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gradient-cyber truncate">AIxVuln</h1>
<p className="text-xs text-muted-foreground hidden sm:block">AI 代码安全审计</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-cyber-red"
                onClick={handleLogout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                登出
              </Button>
              <UploadDialog onSuccess={loadProjects} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="cyber-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyber-cyan"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyber-cyan">{projects.length}</p>
                <p className="text-xs text-muted-foreground">项目总数</p>
              </div>
            </div>
          </div>
          <div className="cyber-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyber-green/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyber-green"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyber-green">
                  {projects.filter((p) => p.status === '运行中' || p.status === '正在运行').length}
                </p>
                <p className="text-xs text-muted-foreground">运行中</p>
              </div>
            </div>
          </div>
          <div className="cyber-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyber-red/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyber-red"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyber-red">
                  {projects.reduce((sum, p) => sum + p.vulnCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">发现漏洞</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyber-cyan"
            >
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            项目列表
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="cyber-card rounded-lg p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-1/3 bg-muted" />
                  <Skeleton className="h-4 w-1/4 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="cyber-card rounded-lg p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-muted-foreground mb-4"
            >
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              <path d="M12 10v6" />
              <path d="m9 13 3-3 3 3" />
            </svg>
            <h3 className="text-lg font-medium mb-2">暂无项目</h3>
            <p className="text-muted-foreground text-sm mb-4">点击上方「新建项目」按钮创建你的第一个审计项目</p>
            <UploadDialog onSuccess={loadProjects} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.name}
                name={project.name}
                status={project.status}
                vulnCount={project.vulnCount}
                onDelete={loadProjects}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <p className="text-center text-xs text-muted-foreground">
            AIxVuln © {new Date().getFullYear()} - Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
