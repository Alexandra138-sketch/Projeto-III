import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  // Enquanto true, ainda não terminámos de verificar o localStorage
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('utilizador');
    if (u) setUtilizador(JSON.parse(u));
    setCarregando(false); // só agora sabemos se há sessão ou não
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

  const atualizarUtilizador = (dadosParciais) => {
    setUtilizador((prev) => {
      const atualizado = { ...prev, ...dadosParciais };
      localStorage.setItem('utilizador', JSON.stringify(atualizado));
      return atualizado;
    });
  };

  return (
    <AuthContext.Provider value={{ utilizador, carregando, login, logout, atualizarUtilizador }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);