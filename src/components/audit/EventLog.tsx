'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EventLogProps {
  events: string[];
  maxHeight?: string;
}

export function EventLog({ events, maxHeight = '400px' }: EventLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const prevEventsLengthRef = useRef(events.length);

  // 检查是否滚动到底部
  const isAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 50; // 距离底部 50px 内视为到达底部
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback((smooth = true) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    const atBottom = isAtBottom();
    
    // 如果用户滚动到底部，恢复自动滚动
    if (atBottom && !isAutoScroll) {
      setIsAutoScroll(true);
    }
    // 如果用户向上滚动，暂停自动滚动
    else if (!atBottom && isAutoScroll) {
      setIsAutoScroll(false);
    }
    
    // 显示/隐藏回到底部按钮
    setShowScrollButton(!atBottom);
  }, [isAtBottom, isAutoScroll]);

  // 监听 events 变化，自动滚动
  useEffect(() => {
    // 只有当有新事件添加时才滚动
    if (events.length > prevEventsLengthRef.current && isAutoScroll) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
    prevEventsLengthRef.current = events.length;
  }, [events.length, isAutoScroll, scrollToBottom]);

  // 点击回到底部按钮
  const handleScrollToBottom = useCallback(() => {
    setIsAutoScroll(true);
    scrollToBottom(true);
  }, [scrollToBottom]);

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
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          事件日志
          <div className="ml-auto flex items-center gap-2">
            {isAutoScroll && (
              <span className="flex items-center gap-1 text-xs text-cyber-green">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                实时
              </span>
            )}
            <span className="text-xs text-muted-foreground font-normal">
              {events.length} 条
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{ maxHeight, height: maxHeight }}
          className="overflow-y-auto"
        >
          <div className="p-4 pt-0 space-y-1 font-terminal text-xs">
            {events.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                暂无事件日志
              </div>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 py-1 border-b border-border/20 last:border-0"
                >
                  <span className="text-cyber-cyan shrink-0">{'>'}</span>
                  <span className="text-foreground/90 break-all">{event}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 回到底部按钮 */}
        {showScrollButton && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-3 right-3 h-8 px-3 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/30 shadow-lg z-10"
            onClick={handleScrollToBottom}
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
              <path d="m7 13 5 5 5-5" />
              <path d="M7 6h10" />
            </svg>
            最新
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
