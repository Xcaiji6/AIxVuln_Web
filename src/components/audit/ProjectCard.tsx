'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { deleteProject } from '@/lib/api';
import { toast } from 'sonner';

interface ProjectCardProps {
  name: string;
  status?: string;
  vulnCount?: number;
  onDelete?: () => void;
}

export function ProjectCard({ name, status = '未运行', vulnCount = 0, onDelete }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`确定要删除项目 "${name}" 吗？此操作不可恢复。`)) return;

    setIsDeleting(true);
    try {
      const result = await deleteProject(name);
      if (result.success) {
        toast.success('项目删除成功');
        onDelete?.();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const isRunning = status === '运行中' || status === '正在运行';

  return (
    <Card className="cyber-card group animate-fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-cyber-cyan transition-colors">
            <Link href={`/projects/${encodeURIComponent(name)}`} className="hover:underline">
              {name}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="cyber-card">
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-cyber-red focus:text-cyber-red focus:bg-cyber-red/10"
              >
                {isDeleting ? '删除中...' : '删除项目'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {isRunning && (
            <span className="status-indicator running" />
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
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
              className="text-cyber-red"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>
              发现 <span className="text-cyber-red font-semibold">{vulnCount}</span> 个漏洞
            </span>
          </div>
          <Link
            href={`/projects/${encodeURIComponent(name)}`}
            className="text-cyber-cyan hover:text-cyber-cyan/80 transition-colors flex items-center gap-1"
          >
            查看详情
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
