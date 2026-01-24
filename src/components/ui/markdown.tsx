'use client';

import { useRef, useCallback } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * 代码块包装组件 - 为 <pre> 添加复制按钮
 */
function PreBlock({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    if (!preRef.current) return;

    // 获取代码内容：优先从 code 元素获取，避免复制额外空白
    const codeElement = preRef.current.querySelector('code');
    const text = codeElement?.textContent ?? preRef.current.innerText ?? '';

    try {
      await navigator.clipboard.writeText(text);
      toast.success('代码已复制到剪贴板');
    } catch {
      // 兜底：使用旧版 execCommand
      try {
        const range = document.createRange();
        range.selectNodeContents(codeElement ?? preRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        selection?.removeAllRanges();
        toast.success('代码已复制到剪贴板');
      } catch {
        toast.error('复制失败，请手动选择复制');
      }
    }
  }, []);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="复制代码"
        title="复制代码"
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md
          text-cyber-cyan/60 hover:text-cyber-cyan
          bg-transparent hover:bg-cyber-cyan/10
          opacity-0 group-hover:opacity-100 focus:opacity-100
          transition-opacity duration-150
          focus:outline-none focus:ring-1 focus:ring-cyber-cyan/50"
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
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  pre: PreBlock,
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('markdown-body', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
