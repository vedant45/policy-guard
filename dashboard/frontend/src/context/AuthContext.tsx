import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

interface AuthContextType {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const Auth = createContext<AuthContextType>({
  token: null,
  email: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("pg_token")
  );
  const [email, setEmail] = useState<string | null>(
    localStorage.getItem("pg_email")
  );

  const login = (t: string, e: string) => {
    setToken(t);
    setEmail(e);
    localStorage.setItem("pg_token", t);
    localStorage.setItem("pg_email", e);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("pg_token");
    localStorage.removeItem("pg_email");
  };

  return (
    <Auth.Provider value={{ token, email, login, logout }}>
      {children}
    </Auth.Provider>
  );
}

export const useAuth = () => useContext(Auth);