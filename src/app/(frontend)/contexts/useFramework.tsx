'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Framework } from '@/app/(frontend)/lib/scriptUtils';

interface FrameworkContextType {
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(
  undefined
);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [selectedFramework, setSelectedFramework] = useState<Framework>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedFramework');
      return (saved as Framework) || Framework.VANILLA;
    }
    return Framework.VANILLA;
  });

  useEffect(() => {
    localStorage.setItem('selectedFramework', selectedFramework);
  }, [selectedFramework]);

  return (
    <FrameworkContext.Provider
      value={{ selectedFramework, setSelectedFramework }}
    >
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (context === undefined) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
}
