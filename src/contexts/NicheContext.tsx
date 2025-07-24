'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface NicheContextType {
  currentNiche: string;
  setCurrentNiche: (niche: string) => void;
}

const NicheContext = createContext<NicheContextType | undefined>(undefined);

export const useNiche = () => {
  const context = useContext(NicheContext);
  if (!context) {
    throw new Error('useNiche must be used within a NicheProvider');
  }
  return context;
};

interface NicheProviderProps {
  children: React.ReactNode;
}

// Component that uses useSearchParams - must be wrapped in Suspense
const NicheDetector: React.FC<{ onNicheDetected: (niche: string) => void }> = ({ onNicheDetected }) => {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  
  // Set client flag to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Detect niche from URL parameters
  useEffect(() => {
    if (!isClient) return; // Don't run on server
    
    const detectNiche = () => {
      const nicheParam = searchParams?.get('niche');
      
      // Handle both singular and plural forms
      const nicheMap: { [key: string]: string } = {
        'creator': 'creators',
        'creators': 'creators',
        'podcaster': 'podcasters', 
        'podcasters': 'podcasters',
        'freelancer': 'freelancers',
        'freelancers': 'freelancers',
        'coach': 'coaches',
        'coaches': 'coaches'
      };
      
      if (nicheParam && nicheMap[nicheParam]) {
        return nicheMap[nicheParam];
      }
      
      return 'creators'; // default
    };
    
    const niche = detectNiche();
    onNicheDetected(niche);
  }, [searchParams, isClient, onNicheDetected]);
  
  return null; // This component doesn't render anything
};

export const NicheProvider: React.FC<NicheProviderProps> = ({ children }) => {
  const [currentNiche, setCurrentNiche] = useState<string>('creators');
  
  const handleNicheDetected = (niche: string) => {
    setCurrentNiche(niche);
  };
  
  return (
    <NicheContext.Provider value={{ currentNiche, setCurrentNiche }}>
      <Suspense fallback={null}>
        <NicheDetector onNicheDetected={handleNicheDetected} />
      </Suspense>
      {children}
    </NicheContext.Provider>
  );
}; 