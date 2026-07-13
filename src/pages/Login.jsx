import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // On récupère la fonction login depuis notre contexte
  const { login } = useContext(AuthContext); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('https://trouve-toi-un-job-backend.onrender.com/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // On utilise la fonction du contexte pour sauvegarder le token !
      login(response.data.access_token);
      
      navigate('/');
      
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    // Ajout de dark:bg-gray-900, dark:border-gray-800 et transition-colors
    <div className="max-w-md mx-auto mt-16 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors">
      <div className="text-center mb-8">
        {/* Adaptation du titre et du sous-titre */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bon retour !</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Connectez-vous pour accéder à votre espace.</p>
      </div>

      {/* Affichage des erreurs éventuelles */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Inputs : Fond transparent, bordures sombres, texte adaptatif
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Se connecter
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Pas encore de compte ?{' '}
        {/* Lien adapté avec dark:text-blue-400 pour un meilleur contraste */}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
          S'inscrire
        </Link>
      </div>
    </div>
  );
}