'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge, VulnTypeBadge, ConfidenceBadge } from './StatusBadge';
import type { VulnStruct } from '@/lib/types';

interface VulnTableProps {
  vulns: VulnStruct[];
  maxHeight?: string;
}

// 移动端卡片组件
function VulnCard({ vuln }: { vuln: VulnStruct }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border/30 rounded-lg bg-card/30 overflow-hidden">
      <button
        className="w-full p-3 text-left active:bg-cyber-cyan/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-medium text-sm text-foreground line-clamp-2">{vuln.title}</span>
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
            className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VulnTypeBadge type={vuln.type} />
          <ConfidenceBadge confidence={vuln.confidence} />
          <StatusBadge status={vuln.status} />
        </div>
        <div className="mt-2 font-mono text-xs text-muted-foreground truncate">
          {vuln.file}
        </div>
      </button>
      {isOpen && (
        <div className="p-3 pt-0 border-t border-border/30 bg-muted/20">
          <div className="grid grid-cols-1 gap-3 text-sm pt-3">
            <div className="min-w-0">
              <div className="text-muted-foreground text-xs mb-1">函数/方法</div>
              <div className="font-mono text-xs text-cyber-cyan break-all">{vuln.function_or_method || '-'}</div>
            </div>
            <div className="min-w-0">
              <div className="text-muted-foreground text-xs mb-1">路由/端点</div>
              <div className="font-mono text-xs text-cyber-purple break-all">{vuln.route_or_endpoint || '-'}</div>
            </div>
            <div className="min-w-0">
              <div className="text-muted-foreground text-xs mb-1">参数</div>
              <div className="font-mono text-xs text-cyber-orange break-all">{vuln.params || '-'}</div>
            </div>
            <div className="min-w-0">
              <div className="text-muted-foreground text-xs mb-1">预期影响</div>
              <div className="text-xs text-cyber-red break-words">{vuln.expected_impact || '-'}</div>
            </div>
            {vuln.payload_idea && (
              <div>
                <div className="text-muted-foreground text-xs mb-1">Payload 思路</div>
                <div className="p-2 bg-muted/50 rounded-md font-mono text-xs text-foreground whitespace-pre-wrap break-all">
                  {vuln.payload_idea}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 桌面端表格行组件
function VulnRow({ vuln }: { vuln: VulnStruct }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TableRow className="hover:bg-cyber-cyan/5 transition-colors border-b border-border/30">
        <TableCell className="font-medium">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent hover:text-cyber-cyan text-left"
            onClick={() => setIsOpen(!isOpen)}
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
              className={`mr-2 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-foreground hover:text-cyber-cyan">{vuln.title}</span>
          </Button>
        </TableCell>
        <TableCell>
          <VulnTypeBadge type={vuln.type} />
        </TableCell>
        <TableCell>
          <ConfidenceBadge confidence={vuln.confidence} />
        </TableCell>
        <TableCell>
          <StatusBadge status={vuln.status} />
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px] lg:max-w-[200px]">
          {vuln.file}
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-card/50 border-b border-border/30">
          <TableCell colSpan={5} className="p-0 whitespace-normal">
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <div className="text-muted-foreground mb-1">函数/方法</div>
                  <div className="font-mono text-cyber-cyan break-all">{vuln.function_or_method || '-'}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-muted-foreground mb-1">路由/端点</div>
                  <div className="font-mono text-cyber-purple break-all">{vuln.route_or_endpoint || '-'}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-muted-foreground mb-1">参数</div>
                  <div className="font-mono text-cyber-orange break-all">{vuln.params || '-'}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-muted-foreground mb-1">预期影响</div>
                  <div className="text-cyber-red break-words">{vuln.expected_impact || '-'}</div>
                </div>
              </div>
              {vuln.payload_idea && (
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Payload 思路</div>
                  <div className="p-3 bg-muted/50 rounded-md font-mono text-xs text-foreground whitespace-pre-wrap break-all overflow-x-auto">
                    {vuln.payload_idea}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function VulnTable({ vulns, maxHeight = '600px' }: VulnTableProps) {
  if (vulns.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
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
            className="mx-auto mb-2 text-cyber-green"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <p>暂未发现漏洞</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 移动端卡片列表 */}
      <div 
        className="md:hidden overflow-y-auto rounded-md space-y-2" 
        style={{ maxHeight, height: maxHeight }}
      >
        {vulns.map((vuln, index) => (
          <VulnCard key={`${vuln.vuln_id}-${index}`} vuln={vuln} />
        ))}
      </div>
      
      {/* 桌面端表格 */}
      <div 
        className="hidden md:block overflow-y-auto rounded-md" 
        style={{ maxHeight, height: maxHeight }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-cyber-cyan">漏洞标题</TableHead>
              <TableHead className="text-cyber-cyan w-[100px]">类型</TableHead>
              <TableHead className="text-cyber-cyan w-[80px]">置信度</TableHead>
              <TableHead className="text-cyber-cyan w-[80px]">状态</TableHead>
              <TableHead className="text-cyber-cyan">文件位置</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vulns.map((vuln, index) => (
              <VulnRow key={`${vuln.vuln_id}-${index}`} vuln={vuln} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
