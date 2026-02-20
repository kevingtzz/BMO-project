import './ConnectionStatus.css';

export type ConnectionStatusType = 'connecting' | 'connected' | 'disconnected';

const STATUS_LABELS: Record<ConnectionStatusType, string> = {
  connecting: 'Conectando…',
  connected: 'Conectado',
  disconnected: 'Desconectado',
};

export interface ConnectionStatusProps {
  status?: ConnectionStatusType;
}

function ConnectionStatus({ status = 'disconnected' }: ConnectionStatusProps): React.ReactElement {
  const label = STATUS_LABELS[status] ?? STATUS_LABELS.disconnected;
  return (
    <div className="connection-status" data-status={status} aria-live="polite">
      <span className="connection-status__dot" aria-hidden />
      <span className="connection-status__label">{label}</span>
    </div>
  );
}

export default ConnectionStatus;
export { STATUS_LABELS };
