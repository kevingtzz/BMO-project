import './BmoMouth.css';
import neutralMouthSvg from '../../assets/mouth/mouth_neutral_smile.svg';
import mouthHappyOpenSvg from '../../assets/mouth/mouth_happy_open.svg';
import mouthFrownSmallSvg from '../../assets/mouth/mouth_frown_small.svg';
import mouthSurprisedSvg from '../../assets/mouth/mouth_surprised.svg';
import mouthSurprisedSmallPixelSvg from '../../assets/mouth/mouth_surprised_small_pixel.svg';
import mouthPoutingSmallSvg from '../../assets/mouth/mouth_pouting_small.svg';
import mouthConfusedSvg from '../../assets/mouth/mouth_confused.svg';
import mouthWCatCuteSvg from '../../assets/mouth/mouth_w_cat_cute.svg';
import mouthShoutingBigSvg from '../../assets/mouth/mouth_shouting_big.svg';
import mouthExitedOpenSvg from '../../assets/mouth/mouth_exited_open.svg';
import mouthErrorSvg from '../../assets/mouth/mouth_error.svg';
import mouthSystemSvg from '../../assets/mouth/mouth_system.svg';

export type MouthMode =
  | 'idle'
  | 'speaking'
  | 'smile'
  | 'surprised'
  | 'thinking'
  | 'sleeping'
  | 'happy'
  | 'sad'
  | 'concerned'
  | 'affection'
  | 'alert'
  | 'error'
  | 'confused'
  | 'playful'
  | 'excited'
  | 'love'
  | 'system_mode';

const MOUTH_SVGS: Partial<Record<MouthMode, string>> = {
  idle: neutralMouthSvg,
  smile: mouthWCatCuteSvg,
  surprised: mouthSurprisedSvg,
  thinking: neutralMouthSvg,
  sleeping: mouthFrownSmallSvg,
  happy: mouthHappyOpenSvg,
  sad: mouthFrownSmallSvg,
  concerned: mouthPoutingSmallSvg,
  affection: mouthWCatCuteSvg,
  alert: mouthShoutingBigSvg,
  error: mouthErrorSvg,
  confused: mouthConfusedSvg,
  playful: mouthWCatCuteSvg,
  excited: mouthExitedOpenSvg,
  love: mouthSurprisedSmallPixelSvg,
  system_mode: mouthSystemSvg,
};

export interface BmoMouthProps {
  mode?: MouthMode;
  isAnimating?: boolean;
}

function BmoMouth({
  mode = 'idle',
  isAnimating = false,
}: BmoMouthProps): React.ReactElement {
  const svg = MOUTH_SVGS[mode];
  return (
    <div
      className={`bmo-mouth ${isAnimating ? 'bmo-mouth--animating' : ''}`}
      aria-hidden
      role='img'
      aria-label={mode === 'speaking' ? 'Speaking' : 'Mouth'}
    >
      {svg ? (
        <img className='bmo-mouth__svg' src={svg} alt='' />
      ) : (
        <div className='bmo-mouth__shape' />
      )}
    </div>
  );
}

export default BmoMouth;
export { MOUTH_SVGS };
