'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<{
  isLoggedIn: boolean | undefined;
  setIsLoggedIn: (value: boolean) => void;
}>({
  isLoggedIn: undefined,
  setIsLoggedIn: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 