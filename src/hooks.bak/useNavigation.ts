import { useState, useCallback } from 'react';

interface UseNavigationReturn {
  history: string[];
  activePanel: string;
  canGoBack: boolean;
  navigate: (panel: string) => void;
  back: () => void;
}

export function useNavigation(initialPanel: string): UseNavigationReturn {
  const [history, setHistory] = useState<string[]>([initialPanel]);

  const activePanel = history[history.length - 1];
  const canGoBack = history.length > 1;

  const navigate = useCallback((panel: string) => {
    setHistory((h) => [...h, panel]);
  }, []);

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  return { history, activePanel, canGoBack, navigate, back };
}
