import React, { useState } from 'react';
import { WifiOff, Wifi, ShieldCheck } from 'lucide-react';
import { Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';

export const ConnectionInterruptionScreen: React.FC = () => {
  const { go, notify } = useApp();
  const [reconnecting, setReconnecting] = useState(false);

  const handleReconnect = () => {
    setReconnecting(true);
    setTimeout(() => {
      setReconnecting(false);
      notify('Connection restored! Resuming examination session.');
      go('Main examination');
    }, 1200);
  };

  return (
    <div className="center-state">
      <div className="connection-icon">
        <WifiOff size={32} />
      </div>
      <Badge tone="orange">CONNECTION INTERRUPTED</Badge>
      <h1>You're temporarily offline</h1>
      <p>
        Your connection to the examination server was interrupted. Don't close the application.
        Previously acknowledged answers remain saved on the server.
      </p>

      <div className="connection-status">
        <div>
          <WifiOff size={17} />
          <span>Network connection</span>
          <Badge tone="orange">Disconnected</Badge>
        </div>
        <div>
          <ShieldCheck size={17} />
          <span>Last acknowledged save</span>
          <b>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</b>
        </div>
      </div>

      <Button onClick={handleReconnect} disabled={reconnecting}>
        <Wifi size={15} /> {reconnecting ? 'Reconnecting...' : 'Try reconnecting'}
      </Button>

      <small className="muted">
        In production, reconnecting must fetch the authoritative exam state from the server.
      </small>
    </div>
  );
};
