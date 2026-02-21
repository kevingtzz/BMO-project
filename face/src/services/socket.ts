/**
 * Socket client for BMO face <-> brain communication.
 * Default brain URL: ws://localhost:8765 (override via env REACT_APP_BRAIN_WS_URL).
 *
 * Message contract (brain -> face):
 * - message_start: { type: 'message_start', id: string }
 * - message_chunk: { type: 'message_chunk', id: string, index: number, text: string }
 * - message_end: { type: 'message_end', id: string }
 * - message: { type: 'message', text: string } (legacy, full text)
 * - state: { type: 'state', value: 'idle' | 'listening' | 'thinking' | 'speaking' }
 * - speaking_end: { type: 'speaking_end' }
 * - contract_info: { type: 'contract_info', version: string }
 * - emotion: { type: 'emotion', value: string, duration_ms?: number }
 */

export type BrainMessage =
  | { type: 'message_start'; id: string }
  | { type: 'message_chunk'; id: string; index: number; text: string }
  | { type: 'message_end'; id: string }
  | { type: 'message'; text: string }
  | { type: 'state'; value: 'idle' | 'listening' | 'thinking' | 'speaking' }
  | { type: 'speaking_end' }
  | { type: 'contract_info'; version: string }
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

const LOG_PREFIX = '[BMO face]';

function getUrl(): string {
  return DEFAULT_WS_URL;
}

function connect(): void {
  if (ws?.readyState === WebSocket.OPEN) {
    console.log(LOG_PREFIX, 'connect: already connected');
    return;
  }
  const url = getUrl();
  console.log(LOG_PREFIX, 'connect: connecting to', url);
  try {
    ws = new WebSocket(url);
    ws.onopen = () => {
      console.log(LOG_PREFIX, 'connected to brain');
      listeners.onConnect?.();
    };
    ws.onclose = (event) => {
      console.log(LOG_PREFIX, 'disconnected from brain', { code: event.code, reason: event.reason || '—' });
      listeners.onDisconnect?.();
    };
    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as BrainMessage;
        console.log(LOG_PREFIX, 'message received:', data);
        listeners.onMessage?.(data);
      } catch {
        console.log(LOG_PREFIX, 'message received (raw):', event.data);
        listeners.onMessage?.(event.data as string);
      }
    };
    ws.onerror = () => {
      console.warn(LOG_PREFIX, 'WebSocket error');
    };
  } catch (err) {
    console.error(LOG_PREFIX, 'connect failed:', err);
    listeners.onDisconnect?.();
  }
}

function disconnect(): void {
  if (ws) {
    console.log(LOG_PREFIX, 'disconnect: closing connection');
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
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    console.log(LOG_PREFIX, 'message sent:', typeof data === 'string' ? data : (data as BrainMessage));
    ws.send(payload);
  } else {
    console.warn(LOG_PREFIX, 'send: not connected, message dropped');
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
