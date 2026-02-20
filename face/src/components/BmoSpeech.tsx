import './BmoSpeech.css';

export interface BmoSpeechProps {
  text?: string;
  placeholder?: string;
}

function BmoSpeech({ text = '', placeholder = '...' }: BmoSpeechProps): React.ReactElement {
  const displayText = text.trim() || placeholder;
  return (
    <div className="bmo-speech" role="region" aria-live="polite" aria-label="BMO response">
      <p className="bmo-speech__text">{displayText}</p>
    </div>
  );
}

export default BmoSpeech;
