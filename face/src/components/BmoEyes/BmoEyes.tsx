import './BmoEyes.css';

export type EyeExpression =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'surprised'
  | 'thinking'
  | 'angry'
  | 'closed'
  | 'sleeping';

const EYE_EXPRESSIONS: Record<EyeExpression, string> = {
  neutral: 'bmo-eyes--neutral',
  happy: 'bmo-eyes--happy',
  sad: 'bmo-eyes--sad',
  surprised: 'bmo-eyes--surprised',
  thinking: 'bmo-eyes--thinking',
  angry: 'bmo-eyes--angry',
  closed: 'bmo-eyes--closed',
  sleeping: 'bmo-eyes--sleeping',
};

export interface BmoEyesProps {
  expression?: EyeExpression;
}

function BmoEyes({ expression = 'neutral' }: BmoEyesProps): React.ReactElement {
  const className = EYE_EXPRESSIONS[expression] ?? EYE_EXPRESSIONS.neutral;
  return (
    <div className={`bmo-eyes ${className}`} aria-hidden>
      <div className="bmo-eyes__left" />
      <div className="bmo-eyes__right" />
    </div>
  );
}

export default BmoEyes;
export { EYE_EXPRESSIONS };
