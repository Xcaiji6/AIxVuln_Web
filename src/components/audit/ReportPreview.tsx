'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { getReportContent, downloadReport } from '@/lib/api';
import { toast } from 'sonner';

interface ReportPreviewProps {
  projectName: string;
  reportId: string;
  reportName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportPreview({
  projectName,
  reportId,
  reportName,
  open,
  onOpenChange,
}: ReportPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && reportId) {
      setLoading(true);
      setError(null);
      getReportContent(projectName, reportId)
        .then((data) => {
          setContent(data);
        })
        .catch((err) => {
          setError(err.message || '加载报告失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, projectName, reportId]);

  const handleDownload = async () => {
    try {
      await downloadReport(projectName, reportId, reportName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '下载报告失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[100vw] !w-[100vw] sm:!max-w-[90vw] sm:!w-[90vw] max-h-[100vh] sm:max-h-[92vh] h-[100vh] sm:h-auto flex flex-col sm:rounded-lg rounded-none">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-cyber-cyan pr-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
            <span className="truncate">{reportName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 border border-border/50 rounded-md bg-muted/20">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
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
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>加载中...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-cyber-red">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && content && (
            <div className="p-4">
              <Markdown content={content} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 pt-2 pb-safe">
          <Button
            variant="outline"
            size="sm"
            className="text-cyber-cyan border-cyber-cyan/50 hover:bg-cyber-cyan/10 active:bg-cyber-cyan/20"
            onClick={handleDownload}
          >
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
              className="mr-1"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            下载
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="active:bg-muted"
          >
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
