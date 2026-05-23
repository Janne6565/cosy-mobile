import { useEffect, useRef } from 'react';
import { IMessage, StompSubscription } from '@stomp/stompjs';
import { useWebSocket } from './useWebSocket';

/**
 * Subscribe to a STOMP topic. Automatically unsubscribes on unmount or topic change.
 * The callback receives parsed JSON from message.body.
 */
export function useSubscription<T = any>(
  topic: string | null,
  onMessage: (data: T) => void,
) {
  const { connected, subscribe } = useWebSocket();
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    if (!topic || !connected) return;

    const sub = subscribe(topic, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as T;
        callbackRef.current(data);
      } catch (e) {
        console.warn('[ws] Failed to parse message on', topic, e);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [topic, connected, subscribe]);
}
