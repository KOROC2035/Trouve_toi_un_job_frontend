import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Création du contexte
export const AuthContext = createContext();

// Création du composant Provider qui va englober notre application
export function AuthProvider({ children }) {
  // On initialise l'état avec le token s'il existe déjà dans le navigateur
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null); // Nouvel état pour stocker les infos utilisateur

  // 1. On déplace les fonctions login et logout au-dessus pour pouvoir les utiliser dans le useEffect
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null); // <-- CORRECTION : On vide aussi les données de l'utilisateur !
  };

  // 2. Le useEffect vient après
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get('https://trouve-toi-un-job-backend.onrender.com/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (err) {
          logout(); // Si le token est invalide ou expiré
        }
      }
    };
    fetchUser();
  }, [token]); // Note: si ton linter se plaint, tu peux ignorer l'avertissement ici pour l'instant

  // Valeurs et fonctions qui seront accessibles partout dans l'application
  const contextValue = {
    token,
    user,
    isAuthenticated: !!token, // Transforme le token en booléen (vrai/faux)
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}