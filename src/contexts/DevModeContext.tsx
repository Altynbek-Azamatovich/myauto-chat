import { createContext, useContext, useState, ReactNode } from 'react';

interface DevModeContextType {
  isDevMode: boolean;
  enableDevMode: () => void;
  disableDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false);

  const enableDevMode = () => setIsDevMode(true);
  const disableDevMode = () => setIsDevMode(false);

  return (
    <DevModeContext.Provider value={{ isDevMode, enableDevMode, disableDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
}
