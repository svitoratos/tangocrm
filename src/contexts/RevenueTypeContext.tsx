"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type RevenueType = 'gross' | 'net';

interface RevenueTypeContextType {
  revenueType: RevenueType;
  setRevenueType: (type: RevenueType) => void;
}

const RevenueTypeContext = createContext<RevenueTypeContextType | undefined>(undefined);

export const useRevenueType = () => {
  const context = useContext(RevenueTypeContext);
  if (context === undefined) {
    throw new Error('useRevenueType must be used within a RevenueTypeProvider');
  }
  return context;
};

interface RevenueTypeProviderProps {
  children: ReactNode;
}

export const RevenueTypeProvider: React.FC<RevenueTypeProviderProps> = ({ children }) => {
  const [revenueType, setRevenueType] = useState<RevenueType>('net');

  return (
    <RevenueTypeContext.Provider value={{ revenueType, setRevenueType }}>
      {children}
    </RevenueTypeContext.Provider>
  );
}; 