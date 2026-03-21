import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAppStateResult {
  appState: AppStateStatus | undefined;
  isActive: boolean;
}

export function useAppState(): UseAppStateResult {
  const [appState, setAppState] = useState<AppStateStatus | undefined>(
    AppState.currentState
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appState,
    isActive: appState === 'active',
  };
}
