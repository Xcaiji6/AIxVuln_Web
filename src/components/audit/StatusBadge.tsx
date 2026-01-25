'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  '未运行': { label: '未运行', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  '运行中': { label: '运行中', variant: 'default', className: 'bg-cyber-green/20 text-cyber-green border-cyber-green/50' },
  '正在运行': { label: '正在运行', variant: 'default', className: 'bg-cyber-green/20 text-cyber-green border-cyber-green/50' },
  '已完成': { label: '已完成', variant: 'default', className: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' },
  '运行结束': { label: '运行结束', variant: 'default', className: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' },
  '已取消': { label: '已取消', variant: 'secondary', className: 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/50' },
  '错误': { label: '错误', variant: 'destructive', className: 'bg-cyber-red/20 text-cyber-red border-cyber-red/50' },
  // 漏洞状态
  '待验证': { label: '待验证', variant: 'outline', className: 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/50' },
  '已确认': { label: '已确认', variant: 'default', className: 'bg-cyber-red/20 text-cyber-red border-cyber-red/50' },
  '误报': { label: '误报', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  '已修复': { label: '已修复', variant: 'default', className: 'bg-cyber-green/20 text-cyber-green border-cyber-green/50' },
};

// 漏洞类型颜色
const vulnTypeConfig: Record<string, string> = {
  'SQL注入': 'bg-cyber-red/20 text-cyber-red border-cyber-red/50',
  'XSS': 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/50',
  'RCE': 'bg-cyber-red/20 text-cyber-red border-cyber-red/50',
  '文件上传': 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/50',
  '信息泄露': 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const, className: '' };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-medium border transition-all duration-300',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export function VulnTypeBadge({ type, className }: { type: string; className?: string }) {
  const typeClassName = vulnTypeConfig[type] || 'bg-muted text-muted-foreground';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border transition-all duration-300',
        typeClassName,
        className
      )}
    >
      {type}
    </Badge>
  );
}

export function ConfidenceBadge({ confidence, className }: { confidence: string; className?: string }) {
  const confidenceConfig: Record<string, string> = {
    '高': 'bg-cyber-red/20 text-cyber-red border-cyber-red/50',
    '中': 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/50',
    '低': 'bg-cyber-green/20 text-cyber-green border-cyber-green/50',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        confidenceConfig[confidence] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {confidence}
    </Badge>
  );
}
