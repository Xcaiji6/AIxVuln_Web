'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getWebSocketUrl } from '@/lib/api';
import type {
  ContainerRemove,
  ContainerStruct,
  EnvStruct,
  ReportListStruct,
  VulnStatusUpdate,
  VulnStruct,
  WSMessage,
} from '@/lib/types';

export interface WSCallbacks {
  onEventLog?: (event: string) => void;
  onReportAdd?: (reports: ReportListStruct) => void;
  onVulnStatus?: (update: VulnStatusUpdate) => void;
  onVulnAdd?: (vuln: VulnStruct) => void;
  onContainerAdd?: (container: ContainerStruct) => void;
  onContainerRemove?: (data: ContainerRemove) => void;
  onEnvInfo?: (env: EnvStruct) => void;
  onProjectName?: (name: string) => void;
  onProjectStatus?: (status: string) => void;
}

export interface UseWebSocketOptions {
  enabled?: boolean; // 是否启用连接
  autoReconnect?: boolean; // 是否自动重连
  projectName?: string; // 订阅的项目名称
}

export function useWebSocket(
  callbacks: WSCallbacks,
  options: UseWebSocketOptions = {}
) {
  const { enabled = true, autoReconnect = true, projectName } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef(callbacks);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const shouldReconnectRef = useRef(autoReconnect);
  const projectNameRef = useRef(projectName);
  const [shouldReconnect, setShouldReconnect] = useState(0); // 用于触发重连

  // 更新 callbacks ref
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // 更新 autoReconnect ref
  useEffect(() => {
    shouldReconnectRef.current = autoReconnect;
  }, [autoReconnect]);

  // 更新 projectName ref
  useEffect(() => {
    projectNameRef.current = projectName;
  }, [projectName]);

  const connect = useCallback(() => {
    // projectName 变化时需要重新连接（订阅通过 URL 参数实现）
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // 关闭旧连接，准备重连
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = getWebSocketUrl(projectNameRef.current);
    if (!wsUrl) {
      console.error('[WebSocket] 无法连接：未配置 WebSocket 地址');
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected to:', wsUrl);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        // 自动重连 - 通过状态触发而不是直接调用
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setShouldReconnect((prev) => prev + 1);
          }, 5000);
        }
      };

      ws.onerror = () => {
        // 静默处理错误，避免控制台刷屏
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          const cbs = callbacksRef.current;
          
          // 调试日志：显示收到的消息
          console.log('[WebSocket] 收到消息:', message.type, message.data);

          switch (message.type) {
            case 'string':
              cbs.onEventLog?.(message.data as string);
              break;
            case 'ReportAdd':
              console.log('[WebSocket] 报告新增:', message.data);
              cbs.onReportAdd?.(message.data as ReportListStruct);
              break;
            case 'VulnStatus':
              console.log('[WebSocket] 漏洞状态更新:', message.data);
              cbs.onVulnStatus?.(message.data as VulnStatusUpdate);
              break;
            case 'VulnAdd':
              console.log('[WebSocket] 漏洞新增:', message.data);
              cbs.onVulnAdd?.(message.data as VulnStruct);
              break;
            case 'ContainerAdd':
              console.log('[WebSocket] 容器新增:', message.data);
              cbs.onContainerAdd?.(message.data as ContainerStruct);
              break;
            case 'ContainerRemove':
              console.log('[WebSocket] 容器移除:', message.data);
              cbs.onContainerRemove?.(message.data as ContainerRemove);
              break;
            case 'EnvInfo':
              console.log('[WebSocket] 环境信息:', message.data);
              cbs.onEnvInfo?.(message.data as EnvStruct);
              break;
            case 'projectName':
              cbs.onProjectName?.(message.data as string);
              break;
            case 'ProjectStatus':
              console.log('[WebSocket] 项目状态更新:', message.data);
              cbs.onProjectStatus?.(message.data as string);
              break;
            default:
              console.log('[WebSocket] 未知消息类型:', message.type);
          }
        } catch (e) {
          console.error('[WebSocket] 解析消息失败:', e, '原始数据:', event.data);
        }
      };

      wsRef.current = ws;
    } catch {
      // 连接失败时静默处理
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // 监听重连触发器
  useEffect(() => {
    if (shouldReconnect > 0 && enabled) {
      connect();
    }
  }, [shouldReconnect, enabled, connect]);

  // projectName 变化时重新连接（订阅通过 URL 参数实现）
  useEffect(() => {
    if (enabled && projectName && wsRef.current) {
      // 关闭旧连接并通过状态触发重连
      wsRef.current.close();
      wsRef.current = null;
      setShouldReconnect((prev) => prev + 1);
    }
  }, [projectName, enabled]);

  useEffect(() => {
    if (enabled) {
      shouldReconnectRef.current = autoReconnect;
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect, autoReconnect]);

  return { isConnected, connect, disconnect };
}
