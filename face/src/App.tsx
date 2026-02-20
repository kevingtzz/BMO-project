import { useState, useEffect, useCallback } from 'react';
import './App.css';
import BmoFace from './components/BmoFace';
import ColorCalibration from './components/ColorCalibration';
import BrainInput from './components/BrainInput';
import type {
  ConnectionStatusType,
  EyeExpression,
  MouthMode,
} from './components/BmoFace/BmoFace';
import socket from './services/socket';
import type { BrainMessage } from './services/socket';

const STORAGE_KEY = 'bmo-face-bg-rgb';
const DEFAULT_R = 190;
const DEFAULT_G = 243;
const DEFAULT_B = 137;

function loadRgb(): { r: number; g: number; b: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { r?: number; g?: number; b?: number };
      if (
        typeof parsed.r === 'number' &&
        typeof parsed.g === 'number' &&
        typeof parsed.b === 'number'
      ) {
        return {
          r: Math.max(0, Math.min(255, parsed.r)),
          g: Math.max(0, Math.min(255, parsed.g)),
          b: Math.max(0, Math.min(255, parsed.b)),
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { r: DEFAULT_R, g: DEFAULT_G, b: DEFAULT_B };
}

function App(): React.ReactElement {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatusType>('disconnected');
  const [speechText, setSpeechText] = useState('');
  const [eyeExpression, setEyeExpression] =
    useState<EyeExpression>('sleeping');
  const [mouthMode, setMouthMode] = useState<MouthMode>('sleeping');
  const [mouthAnimating, setMouthAnimating] = useState(false);
  const [rgb, setRgb] = useState(loadRgb);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);

  const backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const setR = useCallback((v: number) => {
    setRgb((prev) => {
      const next = { ...prev, r: v };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const setG = useCallback((v: number) => {
    setRgb((prev) => {
      const next = { ...prev, g: v };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const setB = useCallback((v: number) => {
    setRgb((prev) => {
      const next = { ...prev, b: v };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (calibrationOpen || inputOpen) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'c' || e.key === 'C') {
        setCalibrationOpen((open) => !open);
      }
      if (e.key === 'i' || e.key === 'I') {
        setInputOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [calibrationOpen, inputOpen]);

  useEffect(() => {
    const tryFullscreen = (): void => {
      const doc = document.documentElement;
      if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
    };
    tryFullscreen();
    const onFirstInteraction = (): void => {
      tryFullscreen();
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
    };
    document.addEventListener('click', onFirstInteraction, { once: true });
    document.addEventListener('keydown', onFirstInteraction, { once: true });
  }, []);

  useEffect(() => {
    socket.onConnect(() => {
      setConnectionStatus('connected');
      setEyeExpression('neutral');
      setMouthMode('idle');
    });
    socket.onDisconnect(() => {
      setConnectionStatus('disconnected');
      setMouthAnimating(false);
      setEyeExpression('sleeping');
      setMouthMode('sleeping');
    });
    socket.onMessage((data: BrainMessage | string) => {
      if (!data || typeof data !== 'object') return;
      const msg = data as BrainMessage;
      if (
        'type' in msg &&
        msg.type === 'message' &&
        'text' in msg &&
        msg.text != null
      )
        setSpeechText(String(msg.text));
      if ('type' in msg && msg.type === 'state' && 'value' in msg) {
        const v = msg.value;
        if (v === 'speaking') {
          setMouthMode('speaking');
          setMouthAnimating(true);
        } else {
          setMouthMode(v === 'thinking' ? 'thinking' : 'idle');
          setMouthAnimating(false);
        }
      }
      if ('type' in msg && msg.type === 'speaking_end') {
        setMouthAnimating(false);
        setMouthMode('idle');
      }
      if (
        'type' in msg &&
        msg.type === 'emotion' &&
        'value' in msg &&
        msg.value
      ) {
        const emotion = msg.value as EyeExpression;
        setEyeExpression(emotion);
        if (emotion === 'sleeping') {
          setMouthMode('sleeping');
        }
        if ('duration_ms' in msg && typeof msg.duration_ms === 'number') {
          const ms = msg.duration_ms;
          setTimeout(() => {
            setEyeExpression('neutral');
            if (emotion === 'sleeping') setMouthMode('idle');
          }, ms);
        }
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setConnectionStatus('connecting');
    socket.connect();
  }, []);

  return (
    <div className="App">
      <BmoFace
        connectionStatus={connectionStatus}
        speechText={speechText}
        eyeExpression={eyeExpression}
        mouthMode={mouthMode}
        mouthAnimating={mouthAnimating}
        backgroundColor={backgroundColor}
      />
      {calibrationOpen && (
        <ColorCalibration
          r={rgb.r}
          g={rgb.g}
          b={rgb.b}
          onR={setR}
          onG={setG}
          onB={setB}
          onClose={() => setCalibrationOpen(false)}
        />
      )}
      {inputOpen && (
        <BrainInput onClose={() => setInputOpen(false)} />
      )}
    </div>
  );
}

export default App;
