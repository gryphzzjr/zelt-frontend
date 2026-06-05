import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

// Ajuste com a URL do seu servidor FastAPI
const API_URL = 'http://127.0.0.1:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem('zelt_user');
    const token = localStorage.getItem('zelt_token');

    console.log(token)
    console.log(recoveredUser)

    // Certifique-se de que a checagem valida os DOIS
    if (recoveredUser && token) {
      try {
        setUser(JSON.parse(recoveredUser));
      } catch (e) {
        console.error("Erro ao dar parse no usuário:", e);
        // Se o json estiver corrompido, limpa para evitar loops
        localStorage.removeItem('zelt_user');
      }
    }

    // Esse loading PRECISA rodar por fora do if,
    // senão ele nunca libera a tela se o usuário não estiver logado!
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao realizar login');
      }

      const data = await response.json();

      const token = data.access;
      const userData = data.user;

      if (!token) {
        throw new Error("Token não encontrado na resposta do servidor.");
      }

      // Salva no LocalStorage
      localStorage.setItem('zelt_user', JSON.stringify(userData));
      localStorage.setItem('zelt_token', token);

      setUser(userData);
    } catch (error) {
      console.error("Erro na autenticação:", error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('zelt_user');
    localStorage.removeItem('zelt_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
