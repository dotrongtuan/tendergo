import { useState } from 'react';

import { useAppBootstrap } from '../hooks/useAppBootstrap';
import { AppNavigator } from '../navigation/AppNavigator';
import { AppBootstrapErrorScreen } from './AppBootstrapErrorScreen';
import { AppLoadingScreen } from './AppLoadingScreen';
import { AppProviders } from './AppProviders';

export function AppRoot() {
  const [bootstrapNonce, setBootstrapNonce] = useState(0);

  return (
    <AppProviders>
      <BootstrapGate key={bootstrapNonce} onRetry={() => setBootstrapNonce((value) => value + 1)} />
    </AppProviders>
  );
}

interface BootstrapGateProps {
  onRetry: () => void;
}

function BootstrapGate({ onRetry }: BootstrapGateProps) {
  const { isReady, error } = useAppBootstrap();

  if (error) {
    return <AppBootstrapErrorScreen message={error.message} onRetry={onRetry} />;
  }

  if (!isReady) {
    return <AppLoadingScreen />;
  }

  return <AppNavigator />;
}
