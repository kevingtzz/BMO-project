/**
 * Socket client for BMO face <-> brain communication.
 * Default brain URL: ws://localhost:8765 (override via env REACT_APP_BRAIN_WS_URL).
 *
 * Events from brain (expected later):
 * - state: "idle" | "listening" | "thinking" | "speaking"
 * - emotion: { value: "happy" | "sad" | "surprised", duration_ms?: number }
 * - speaking_start: { duration_ms?: number }
 * - speaking_end
 * - message: { text: string }
 */

export type BrainMessage =
  | { type: 'message'; text: string }
  | { type: 'state'; value: 'idle' | 'listening' | 'thinking' | 'speaking' }
  | { type: 'speaking_end' }
  | { type: 'emotion'; value: string; duration_ms?: number }
  | Record<string, unknown>;

type Listener = () => void;
type MessageListener = (data: BrainMessage | string) => void;

const DEFAULT_WS_URL =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BRAIN_WS_URL) ||
  'ws://localhost:8765';

let ws: WebSocket | null = null;
const listeners: {
  onMessage: MessageListener | null;
  onConnect: Listener | null;
  onDisconnect: Listener | null;
} = {
  onMessage: null,
  onConnect: null,
  onDisconnect: null,
};

function getUrl(): string {
  return DEFAULT_WS_URL;
}

function connect(): void {
  if (ws?.readyState === WebSocket.OPEN) return;
  const url = getUrl();
  try {
    ws = new WebSocket(url);
    ws.onopen = () => listeners.onConnect?.();
    ws.onclose = () => listeners.onDisconnect?.();
    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as BrainMessage;
        listeners.onMessage?.(data);
      } catch {
        listeners.onMessage?.(event.data as string);
      }
    };
    ws.onerror = () => {};
  } catch {
    listeners.onDisconnect?.();
  }
}

function disconnect(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
  listeners.onDisconnect?.();
}

function onMessage(fn: MessageListener): void {
  listeners.onMessage = fn;
}
function onConnect(fn: Listener): void {
  listeners.onConnect = fn;
}
function onDisconnect(fn: Listener): void {
  listeners.onDisconnect = fn;
}

function send(data: BrainMessage | string): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(typeof data === 'string' ? data : JSON.stringify(data));
  }
}

export const socket = {
  connect,
  disconnect,
  onMessage,
  onConnect,
  onDisconnect,
  send,
  getUrl,
};

export default socket;
