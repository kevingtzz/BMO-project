import './BmoEyes.css';
import neutralEyesSvg from '../../assets/eyes/eyes_neutral_dots.svg';
import eyesDotBlushingSvg from '../../assets/eyes/eyes_dot_blushing.svg';
import eyesSleepingUSvg from '../../assets/eyes/eyes_sleeping_u.svg';
import eyesAngryVSvg from '../../assets/eyes/eyes_angry_v.svg';
import eyesAmazedSparklingSvg from '../../assets/eyes/eyes_amazed_sparkling.svg';
import eyesAmazedStarsSvg from '../../assets/eyes/eyes_amazed_stars.svg';
import eyesDizzySpiralSvg from '../../assets/eyes/eyes_dizzy_spiral.svg';
import eyesSparkleCuteSvg from '../../assets/eyes/eyes_sparkle_cute.svg';
import eyesLovePixelSvg from '../../assets/eyes/eyes_love_pixel.svg';
import eyesErrorSvg from '../../assets/eyes/eyes_error.svg';
import eyesSystemSvg from '../../assets/eyes/eyes_system.svg';
import eyesConcernedSvg from '../../assets/eyes/eyes_concerned.svg';
import eyesSquintingThinSvg from '../../assets/eyes/eyes_squinting_thin.svg';

export type EyeExpression =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'surprised'
  | 'thinking'
  | 'angry'
  | 'closed'
  | 'sleeping'
  | 'concerned'
  | 'affection'
  | 'alert'
  | 'error'
  | 'confused'
  | 'playful'
  | 'excited'
  | 'love'
  | 'system_mode';

const EYE_SVGS: Record<EyeExpression, string> = {
  neutral: neutralEyesSvg,
  happy: eyesDotBlushingSvg,
  sad: neutralEyesSvg,
  surprised: eyesAmazedSparklingSvg,
  thinking: eyesSleepingUSvg,
  angry: eyesAngryVSvg,
  closed: eyesSquintingThinSvg,
  sleeping: eyesSleepingUSvg,
  concerned: eyesConcernedSvg,
  affection: eyesDotBlushingSvg,
  alert: eyesAngryVSvg,
  error: eyesErrorSvg,
  confused: eyesDizzySpiralSvg,
  playful: eyesSparkleCuteSvg,
  excited: eyesAmazedStarsSvg,
  love: eyesLovePixelSvg,
  system_mode: eyesSystemSvg,
};

export interface BmoEyesProps {
  expression?: EyeExpression;
}

interface VisualTune {
  scale: number;
  x: number;
  y: number;
}

const DEFAULT_TUNE: VisualTune = { scale: 1, x: 0, y: 0 };

// Per-expression visual calibration (size + position).
const EYE_TUNE: Partial<Record<EyeExpression, VisualTune>> = {
  neutral: { scale: 1, x: 0, y: 50 },
  happy: { scale: 1, x: 0, y: 40 },
  sad: { scale: 1, x: 0, y: 50 },
  surprised: { scale: 1.5, x: 0, y: 0 },
  thinking: { scale: 1, x: 0, y: 0 },
  angry: { scale: 1, x: 0, y: 0 },
  closed: { scale: 1, x: 0, y: 0 },
  sleeping: { scale: 1, x: 0, y: 40 },
  concerned: { scale: 1, x: 0, y: 0 },
  affection: { scale: 1, x: 0, y: 40 },
  alert: { scale: 1, x: 0, y: 0 },
  error: { scale: 1, x: 0, y: 0 },
  confused: { scale: 1, x: 0, y: 0 },
  playful: { scale: 1, x: 0, y: 30 },
  excited: { scale: 1, x: 0, y: 0 },
  love: { scale: 1.5, x: 0, y: 20 },
  system_mode: { scale: 1, x: 0, y: 30 },
};

function BmoEyes({ expression = 'neutral' }: BmoEyesProps): React.ReactElement {
  const svg = EYE_SVGS[expression] ?? EYE_SVGS.neutral;
  const tune = EYE_TUNE[expression] ?? DEFAULT_TUNE;
  const transform = `translate(${tune.x}px, ${tune.y}px) scale(${tune.scale})`;
  return (
    <div className='bmo-eyes' aria-hidden>
      <img className='bmo-eyes__svg' src={svg} alt='' style={{ transform }} />
    </div>
  );
}

export default BmoEyes;
export { EYE_SVGS };
