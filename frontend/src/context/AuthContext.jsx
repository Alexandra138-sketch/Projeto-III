import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('utilizador');
    if (u) setUtilizador(JSON.parse(u));
  }, []);

  const login = (dados, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('utilizador', JSON.stringify(dados));
    setUtilizador(dados);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilizador');
    setUtilizador(null);
  };

  return (
    <AuthContext.Provider value={{ utilizador, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);