import './BmoMouth.css';

export type MouthMode = 'idle' | 'speaking' | 'smile' | 'surprised' | 'thinking' | 'sleeping';

const MOUTH_MODES: Record<MouthMode, string> = {
  idle: 'bmo-mouth--idle',
  speaking: 'bmo-mouth--speaking',
  smile: 'bmo-mouth--smile',
  surprised: 'bmo-mouth--surprised',
  thinking: 'bmo-mouth--thinking',
  sleeping: 'bmo-mouth--sleeping',
};

export interface BmoMouthProps {
  mode?: MouthMode;
  isAnimating?: boolean;
}

function BmoMouth({ mode = 'idle', isAnimating = false }: BmoMouthProps): React.ReactElement {
  const className = MOUTH_MODES[mode] ?? MOUTH_MODES.idle;
  return (
    <div
      className={`bmo-mouth ${className} ${isAnimating ? 'bmo-mouth--animating' : ''}`}
      aria-hidden
      role="img"
      aria-label={mode === 'speaking' ? 'Speaking' : 'Mouth'}
    >
      <div className="bmo-mouth__shape" />
    </div>
  );
}

export default BmoMouth;
export { MOUTH_MODES };
