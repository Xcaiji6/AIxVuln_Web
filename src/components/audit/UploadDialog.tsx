'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { createProject } from '@/lib/api';
import { toast } from 'sonner';

interface UploadDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function UploadDialog({ onSuccess, children }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectNamePattern = /^[a-zA-Z0-9_-]+$/;

  // 从文件名提取项目名称（去除后缀，清理非法字符）
  const extractProjectName = (fileName: string): string => {
    let name = fileName;
    // 去除 .tar.gz 或 .zip 后缀
    if (name.endsWith('.tar.gz')) {
      name = name.slice(0, -7);
    } else if (name.endsWith('.zip')) {
      name = name.slice(0, -4);
    }
    // 只保留合法字符（字母、数字、下划线、连字符）
    return name.replace(/[^a-zA-Z0-9_-]/g, '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'zip' || selectedFile.name.endsWith('.tar.gz')) {
        setFile(selectedFile);
        // 如果项目名称为空，自动填充文件名
        if (!projectName) {
          const autoName = extractProjectName(selectedFile.name);
          if (autoName) {
            setProjectName(autoName);
          }
        }
      } else {
        toast.error('仅支持 .zip 或 .tar.gz 格式的文件');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!projectName) {
      toast.error('请输入项目名称');
      return;
    }
    if (!projectNamePattern.test(projectName)) {
      toast.error('项目名称只能包含字母、数字、下划线和连字符');
      return;
    }
    if (!file) {
      toast.error('请选择源码文件');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await createProject(projectName, file);
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        toast.success('项目创建成功');
        setOpen(false);
        setProjectName('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onSuccess?.();
      } else {
        toast.error(result.error || '创建失败');
      }
    } catch {
      clearInterval(progressInterval);
      toast.error('创建失败');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'zip' || droppedFile.name.endsWith('.tar.gz')) {
        setFile(droppedFile);
        // 如果项目名称为空，自动填充文件名
        if (!projectName) {
          const autoName = extractProjectName(droppedFile.name);
          if (autoName) {
            setProjectName(autoName);
          }
        }
      } else {
        toast.error('仅支持 .zip 或 .tar.gz 格式的文件');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-cyber-cyan text-background hover:bg-cyber-cyan/90">
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
              className="mr-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            新建项目
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="cyber-card border-cyber-cyan/30 sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-cyber">新建审计项目</DialogTitle>
          <DialogDescription className="text-sm">
            上传源码文件（支持 .zip 或 .tar.gz 格式）开始安全审计
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-foreground">
              项目名称
            </Label>
            <Input
              id="projectName"
              placeholder="输入项目名称（仅支持字母、数字、下划线和连字符）"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-muted/50 border-border focus:border-cyber-cyan"
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">源码文件</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                file
                  ? 'border-cyber-green bg-cyber-green/5'
                  : 'border-border hover:border-cyber-cyan/50 active:border-cyber-cyan/50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".zip,.tar.gz"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {file ? (
                <div className="space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-cyber-green"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="m9 15 2 2 4-4" />
                  </svg>
                  <p className="text-sm text-foreground font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-cyber-red hover:text-cyber-red/80"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isUploading}
                  >
                    移除文件
                  </Button>
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-muted-foreground mb-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    拖拽文件到此处或点击上传
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 .zip 或 .tar.gz 格式
                  </p>
                </div>
              )}
            </div>
          </div>
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>上传中...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            取消
          </Button>
          <Button
            className="bg-cyber-cyan text-background hover:bg-cyber-cyan/90"
            onClick={handleSubmit}
            disabled={isUploading || !projectName || !file}
          >
            {isUploading ? '创建中...' : '创建项目'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
