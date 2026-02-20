import { useState, useEffect } from 'react';
import './App.css';
import BmoFace from './components/BmoFace';
import type {
  ConnectionStatusType,
  EyeExpression,
  MouthMode,
} from './components/BmoFace/BmoFace';
import socket from './services/socket';
import type { BrainMessage } from './services/socket';

function App(): React.ReactElement {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatusType>('disconnected');
  const [speechText, setSpeechText] = useState('');
  const [eyeExpression, setEyeExpression] =
    useState<EyeExpression>('sleeping');
  const [mouthMode, setMouthMode] = useState<MouthMode>('sleeping');
  const [mouthAnimating, setMouthAnimating] = useState(false);

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
    <div className='App'>
      <BmoFace
        connectionStatus={connectionStatus}
        speechText={speechText}
        eyeExpression={eyeExpression}
        mouthMode={mouthMode}
        mouthAnimating={mouthAnimating}
      />
    </div>
  );
}

export default App;
