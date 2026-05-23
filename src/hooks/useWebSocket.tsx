import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { useAppSelector } from '../redux/hooks';
import { selectActiveInstance, selectIdentityToken } from '../redux/selectors/instanceSelectors';

interface WebSocketContextValue {
  connected: boolean;
  subscribe: (topic: string, callback: (message: IMessage) => void) => StompSubscription | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  subscribe: () => null,
});

export function useWebSocket() {
  return useContext(WebSocketContext);
}

function buildWsUrl(baseUrl: string, token: string): string {
  const wsBase = baseUrl.replace(/^http/, 'ws');
  return `${wsBase}/ws/websocket?authToken=${encodeURIComponent(token)}`;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const instance = useAppSelector(selectActiveInstance);
  const token = useAppSelector(
    instance ? selectIdentityToken(instance.id) : () => null,
  );
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!instance?.baseUrl || !token) {
      // No connection possible without instance + token
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const brokerURL = buildWsUrl(instance.baseUrl, token);

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
      },
      onStompError: (frame) => {
        console.warn('[ws] STOMP error:', frame.headers?.message);
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [instance?.id, instance?.baseUrl, token]);

  const subscribe = useCallback(
    (topic: string, callback: (message: IMessage) => void): StompSubscription | null => {
      const client = clientRef.current;
      if (!client?.connected) return null;
      return client.subscribe(topic, callback);
    },
    [connected], // re-create when connected state changes so consumers can re-subscribe
  );

  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}
