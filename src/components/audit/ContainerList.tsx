'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ContainerStruct } from '@/lib/types';

interface ContainerListProps {
  containers: ContainerStruct[];
}

export function ContainerList({ containers }: ContainerListProps) {
  if (containers.length === 0) {
    return (
      <Card className="cyber-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
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
              className="text-cyber-cyan"
            >
              <path d="M22 12.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5" />
              <path d="m18 14 4 4-4 4" />
              <path d="m22 18h-7" />
              <path d="M6 8h.01" />
              <path d="M10 8h.01" />
            </svg>
            容器列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            暂无运行中的容器
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
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
            className="text-cyber-cyan"
          >
            <path d="M22 12.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5" />
            <path d="m18 14 4 4-4 4" />
            <path d="m22 18h-7" />
            <path d="M6 8h.01" />
            <path d="M10 8h.01" />
          </svg>
          容器列表
          <Badge variant="secondary" className="ml-auto">
            {containers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-[300px] overflow-y-auto">
        <div className="space-y-2 p-4 pt-0">
            {containers.map((container) => (
              <div
                key={container.containerId}
                className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-cyber-cyan/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="status-indicator running" />
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]">
                      {container.containerId.slice(0, 12)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-cyber-purple/10 text-cyber-purple border-cyber-purple/30 truncate max-w-[120px]">
                    {container.image}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">IP: </span>
                    <span className="font-mono text-cyber-cyan">{container.containerIP}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-muted-foreground">端口: </span>
                    {container.webPort && container.webPort.length > 0 ? (
                      container.webPort.map((port) => (
                        <Button
                          key={port}
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 font-mono text-cyber-green hover:text-cyber-cyan hover:bg-cyber-cyan/10"
                          onClick={() => {
                            const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                            window.open(`http://${hostname}:${port}`, '_blank');
                          }}
                        >
                          {port}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" x2="21" y1="14" y2="3" />
                          </svg>
                        </Button>
                      ))
                    ) : (
                      <span className="font-mono text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
