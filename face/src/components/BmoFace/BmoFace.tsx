import './BmoFace.css';
import BmoEyes from '../BmoEyes';
import BmoMouth from '../BmoMouth';
import BmoSpeech from '../BmoSpeech';
import ConnectionStatus from '../ConnectionStatus';
import type { ConnectionStatusType } from '../ConnectionStatus';
import type { EyeExpression } from '../BmoEyes/BmoEyes';
import type { MouthMode } from '../BmoMouth/BmoMouth';

export type { EyeExpression, MouthMode, ConnectionStatusType };

export interface BmoFaceProps {
  children?: React.ReactNode;
  eyeExpression?: EyeExpression;
  mouthMode?: MouthMode;
  mouthAnimating?: boolean;
  speechText?: string;
  connectionStatus?: ConnectionStatusType;
}

function BmoFace({
  children,
  eyeExpression = 'neutral',
  mouthMode = 'idle',
  mouthAnimating = false,
  speechText = '',
  connectionStatus = 'disconnected',
}: BmoFaceProps): React.ReactElement {
  return (
    <div className='bmo-face'>
      <ConnectionStatus status={connectionStatus} />
      <div className='bmo-face-content'>
        <BmoEyes expression={eyeExpression} />
        <BmoMouth mode={mouthMode} isAnimating={mouthAnimating} />
      </div>
      <BmoSpeech text={speechText} />
      {children}
    </div>
  );
}

export default BmoFace;
