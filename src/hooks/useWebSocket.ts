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
}

export interface UseWebSocketOptions {
  enabled?: boolean; // 是否启用连接
  autoReconnect?: boolean; // 是否自动重连
}

export function useWebSocket(
  callbacks: WSCallbacks,
  options: UseWebSocketOptions = {}
) {
  const { enabled = true, autoReconnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef(callbacks);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const shouldReconnectRef = useRef(autoReconnect);

  // 更新 callbacks ref
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // 更新 autoReconnect ref
  useEffect(() => {
    shouldReconnectRef.current = autoReconnect;
  }, [autoReconnect]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWebSocketUrl();
    if (!wsUrl) {
      console.error('[WebSocket] 无法连接：未配置 WebSocket 地址');
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        // 自动重连
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
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

          switch (message.type) {
            case 'string':
              cbs.onEventLog?.(message.data as string);
              break;
            case 'ReportAdd':
              cbs.onReportAdd?.(message.data as ReportListStruct);
              break;
            case 'VulnStatus':
              cbs.onVulnStatus?.(message.data as VulnStatusUpdate);
              break;
            case 'VulnAdd':
              cbs.onVulnAdd?.(message.data as VulnStruct);
              break;
            case 'ContainerAdd':
              cbs.onContainerAdd?.(message.data as ContainerStruct);
              break;
            case 'ContainerRemove':
              cbs.onContainerRemove?.(message.data as ContainerRemove);
              break;
            case 'EnvInfo':
              cbs.onEnvInfo?.(message.data as EnvStruct);
              break;
            case 'projectName':
              cbs.onProjectName?.(message.data as string);
              break;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
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
