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

function BmoEyes({ expression = 'neutral' }: BmoEyesProps): React.ReactElement {
  const svg = EYE_SVGS[expression] ?? EYE_SVGS.neutral;
  return (
    <div className='bmo-eyes' aria-hidden>
      <img className='bmo-eyes__svg' src={svg} alt='' />
    </div>
  );
}

export default BmoEyes;
export { EYE_SVGS };
