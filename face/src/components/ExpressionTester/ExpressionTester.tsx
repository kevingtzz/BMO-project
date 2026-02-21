import './ExpressionTester.css';

export interface ExpressionTesterProps {
  expressionName: string;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

function ExpressionTester({
  expressionName,
  onPrev,
  onNext,
  onClose,
}: ExpressionTesterProps): React.ReactElement {
  return (
    <div className="expression-tester" role="dialog" aria-label="Ensayo de expresiones">
      <button
        type="button"
        className="expression-tester__close"
        onClick={onClose}
        aria-label="Cerrar ensayo de expresiones"
      >
        ×
      </button>
      <div className="expression-tester__title">Ensayo expresiones (contrato)</div>
      <div className="expression-tester__row">
        <button
          type="button"
          className="expression-tester__arrow"
          onClick={onPrev}
          aria-label="Expresión anterior"
        >
          ←
        </button>
        <div className="expression-tester__name">{expressionName}</div>
        <button
          type="button"
          className="expression-tester__arrow"
          onClick={onNext}
          aria-label="Siguiente expresión"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default ExpressionTester;
