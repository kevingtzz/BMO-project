import './ColorCalibration.css';

export interface ColorCalibrationProps {
  r: number;
  g: number;
  b: number;
  onR: (v: number) => void;
  onG: (v: number) => void;
  onB: (v: number) => void;
  onClose: () => void;
}

function ColorCalibration({
  r,
  g,
  b,
  onR,
  onG,
  onB,
  onClose,
}: ColorCalibrationProps): React.ReactElement {
  return (
    <div className="color-calibration" role="group" aria-label="Calibración de color RGB">
      <button
        type="button"
        className="color-calibration__close"
        onClick={onClose}
        aria-label="Cerrar calibración"
      >
        ×
      </button>
      <div className="color-calibration__title">Calibración pantalla</div>
      <div className="color-calibration__values">
        <span className="color-calibration__label">R</span>
        <input
          type="range"
          min={0}
          max={255}
          value={r}
          onChange={(e) => onR(Number(e.target.value))}
          className="color-calibration__slider color-calibration__slider--r"
          aria-label="Rojo"
        />
        <span className="color-calibration__value">{r}</span>
      </div>
      <div className="color-calibration__values">
        <span className="color-calibration__label">G</span>
        <input
          type="range"
          min={0}
          max={255}
          value={g}
          onChange={(e) => onG(Number(e.target.value))}
          className="color-calibration__slider color-calibration__slider--g"
          aria-label="Verde"
        />
        <span className="color-calibration__value">{g}</span>
      </div>
      <div className="color-calibration__values">
        <span className="color-calibration__label">B</span>
        <input
          type="range"
          min={0}
          max={255}
          value={b}
          onChange={(e) => onB(Number(e.target.value))}
          className="color-calibration__slider color-calibration__slider--b"
          aria-label="Azul"
        />
        <span className="color-calibration__value">{b}</span>
      </div>
      <div className="color-calibration__rgb">
        rgb({r}, {g}, {b})
      </div>
    </div>
  );
}

export default ColorCalibration;
