import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import BmoFace from './components/BmoFace';
import ColorCalibration from './components/ColorCalibration';
import BrainInput from './components/BrainInput';
import ExpressionTester from './components/ExpressionTester/ExpressionTester';
import type {
  ConnectionStatusType,
  EyeExpression,
  MouthMode,
} from './components/BmoFace/BmoFace';
import socket from './services/socket';
import type { BrainMessage } from './services/socket';
import {
  FACE_PRESET_ALIASES,
  FACE_CONTRACT_VERSION,
  FACE_PRESETS,
  type FacePresetDefinition,
} from './contracts/faceContract';

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
  const [expressionTesterOpen, setExpressionTesterOpen] = useState(false);
  const [expressionIndex, setExpressionIndex] = useState(0);
  const currentMessageIdRef = useRef<string | null>(null);
  const lastStableFaceRef = useRef<{ eyes: EyeExpression; mouth: MouthMode }>({
    eyes: 'neutral',
    mouth: 'idle',
  });

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

  const applyFace = useCallback(
    (eyes: EyeExpression, mouth: MouthMode, remember = true): void => {
      setEyeExpression(eyes);
      setMouthMode(mouth);
      setMouthAnimating(false);
      if (remember) lastStableFaceRef.current = { eyes, mouth };
    },
    []
  );

  const applyPreset = useCallback(
    (raw: string): boolean => {
      const key = raw.trim().toLowerCase().replace(/[\s/]+/g, '_');
      const preset = FACE_PRESET_ALIASES[key];
      if (!preset) return false;
      const presetDef = FACE_PRESETS[preset] as FacePresetDefinition | undefined;
      if (!presetDef) return false;
      if (presetDef.kind === 'keep_previous') {
        const prev = lastStableFaceRef.current ?? presetDef.fallback;
        applyFace(prev.eyes, prev.mouth, false);
        return true;
      }
      applyFace(presetDef.eyes, presetDef.mouth, true);
      return true;
    },
    [applyFace]
  );

  const expressionKeys = Object.keys(FACE_PRESETS);
  const activeExpressionKey = expressionKeys[expressionIndex] ?? 'neutral_idle';

  const formatExpressionName = useCallback((value: string): string => {
    return value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, []);

  const applyExpressionByIndex = useCallback(
    (nextIndex: number): void => {
      if (expressionKeys.length === 0) return;
      const wrapped = (nextIndex + expressionKeys.length) % expressionKeys.length;
      setExpressionIndex(wrapped);
      applyPreset(expressionKeys[wrapped]);
    },
    [applyPreset, expressionKeys]
  );

  useEffect(() => {
    if (!expressionTesterOpen) return;
    applyPreset(activeExpressionKey);
  }, [activeExpressionKey, applyPreset, expressionTesterOpen]);

  useEffect(() => {
    if (calibrationOpen || inputOpen || expressionTesterOpen) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'c' || e.key === 'C') {
        setCalibrationOpen((open) => !open);
      }
      if (e.key === 'i' || e.key === 'I') {
        setInputOpen((open) => !open);
      }
      if (e.key === 'e' || e.key === 'E') {
        setExpressionTesterOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [calibrationOpen, expressionTesterOpen, inputOpen]);

  useEffect(() => {
    socket.onConnect(() => {
      setConnectionStatus('connected');
      applyFace('neutral', 'idle', true);
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
        msg.type === 'message_start' &&
        'id' in msg &&
        typeof msg.id === 'string'
      ) {
        currentMessageIdRef.current = msg.id;
        setSpeechText('');
      }
      if (
        'type' in msg &&
        msg.type === 'message_chunk' &&
        'id' in msg &&
        'text' in msg &&
        typeof msg.text === 'string'
      ) {
        if (currentMessageIdRef.current === (msg as { id: string }).id) {
          setSpeechText((prev) => prev + msg.text);
        }
      }
      if (
        'type' in msg &&
        msg.type === 'message_end' &&
        'id' in msg &&
        typeof (msg as { id: string }).id === 'string'
      ) {
        if (currentMessageIdRef.current === (msg as { id: string }).id) {
          currentMessageIdRef.current = null;
        }
      }
      if (
        'type' in msg &&
        msg.type === 'message' &&
        'text' in msg &&
        msg.text != null
      ) {
        currentMessageIdRef.current = null;
        setSpeechText(String(msg.text));
      }
      if ('type' in msg && msg.type === 'state' && 'value' in msg) {
        const v = msg.value;
        if (v === 'speaking') {
          setMouthMode('speaking');
          setMouthAnimating(true);
        } else {
          setMouthMode(v === 'thinking' ? 'thinking' : lastStableFaceRef.current.mouth);
          setMouthAnimating(false);
        }
      }
      if ('type' in msg && msg.type === 'speaking_end') {
        setMouthAnimating(false);
        setMouthMode(lastStableFaceRef.current.mouth);
      }
      if (
        'type' in msg &&
        msg.type === 'contract_info' &&
        'version' in msg &&
        typeof msg.version === 'string'
      ) {
        if (msg.version !== FACE_CONTRACT_VERSION) {
          console.warn(
            '[BMO face] contract version mismatch:',
            'brain=',
            msg.version,
            'face=',
            FACE_CONTRACT_VERSION
          );
        } else {
          console.log('[BMO face] contract version ok:', msg.version);
        }
      }
      if (
        'type' in msg &&
        msg.type === 'emotion' &&
        'value' in msg &&
        msg.value
      ) {
        const emotion = String(msg.value);
        const applied = applyPreset(emotion);
        if (!applied) {
          const legacy = emotion as EyeExpression;
          setEyeExpression(legacy);
          if (legacy === 'sleeping') {
            setMouthMode('sleeping');
          }
        }
        if ('duration_ms' in msg && typeof msg.duration_ms === 'number') {
          const ms = msg.duration_ms;
          setTimeout(() => {
            applyFace('neutral', 'idle', true);
          }, ms);
        }
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [applyFace, applyPreset]);

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
      {expressionTesterOpen && (
        <ExpressionTester
          expressionName={formatExpressionName(activeExpressionKey)}
          onPrev={() => applyExpressionByIndex(expressionIndex - 1)}
          onNext={() => applyExpressionByIndex(expressionIndex + 1)}
          onClose={() => setExpressionTesterOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
