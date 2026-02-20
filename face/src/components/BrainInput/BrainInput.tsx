import { useState, useRef, useEffect } from 'react';
import './BrainInput.css';
import socket from '../../services/socket';

export interface BrainInputProps {
  onClose: () => void;
}

function BrainInput({ onClose }: BrainInputProps): React.ReactElement {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (): void => {
    const text = value.trim();
    if (!text) return;
    socket.send({ type: 'input', text });
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="brain-input" role="dialog" aria-label="Enviar mensaje al brain">
      <button
        type="button"
        className="brain-input__close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>
      <div className="brain-input__title">Enviar al brain (pruebas)</div>
      <div className="brain-input__row">
        <input
          ref={inputRef}
          type="text"
          className="brain-input__field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mensaje..."
          aria-label="Mensaje"
        />
        <button
          type="button"
          className="brain-input__send"
          onClick={handleSend}
          disabled={!value.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default BrainInput;
