'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { USE_MOCK_DATA, getMockProfile } from './mock-toggle';

interface MockProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  company_id: string | null;
  company_role: string | null;
  is_active: boolean;
}

interface MockAuthContextType {
  profile: MockProfile | null;
  loading: boolean;
  signIn: (role: string) => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a stored mock role
    const storedRole = localStorage.getItem('mock_user_role');
    if (storedRole && USE_MOCK_DATA) {
      const mockProfile = getMockProfile(storedRole);
      setProfile(mockProfile);
    }
    setLoading(false);
  }, []);

  const signIn = (role: string) => {
    if (USE_MOCK_DATA) {
      const mockProfile = getMockProfile(role);
      setProfile(mockProfile);
      localStorage.setItem('mock_user_role', role);
    }
  };

  const signOut = () => {
    setProfile(null);
    localStorage.removeItem('mock_user_role');
  };

  return (
    <MockAuthContext.Provider value={{ profile, loading, signIn, signOut }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}