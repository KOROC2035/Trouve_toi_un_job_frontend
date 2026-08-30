import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  // État pour l'indicatif du pays (par défaut +225)
  const [countryCode, setCountryCode] = useState('+225');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Contexte d'authentification
  const { login } = useContext(AuthContext); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Nettoyage et fusion de l'indicatif avec le numéro
    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
    const fullPhoneNumber = `${countryCode}${cleanPhoneNumber}`;

    try {
      const formData = new URLSearchParams();
      // On envoie le numéro complet fusionné sous la clé 'username'
      formData.append('username', fullPhoneNumber);
      formData.append('password', password);

      const response = await axios.post('https://trouve-toi-un-job-backend.onrender.com/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Sauvegarde du token via le contexte
      login(response.data.access_token);
      
      navigate('/');
      
    } catch (err) {
      setError('Numéro de téléphone ou mot de passe incorrect.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white dark:bg-brand-navy p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bon retour !</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Connectez-vous pour accéder à votre espace.</p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Champ Téléphone avec Indicatif */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numéro de téléphone
          </label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-brand-navy-light border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-lg focus:ring-2 focus:ring-brand-orange outline-none text-gray-900 dark:text-white transition-colors cursor-pointer text-sm"
            >
              <option value="+225">🇨🇮 +225</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+221">🇸🇳 +221</option>
              <option value="+228">🇹🇬 +228</option>
              <option value="+226">🇧🇫 +226</option>
              <option value="+237">🇨🇲 +237</option>
              <option value="+241">🇬🇦 +241</option>
            </select>
            <input 
              type="tel" 
              required 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-r-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors placeholder-gray-400"
              placeholder="07 00 00 00 00"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe
          </label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-all placeholder-gray-400"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Se connecter
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-brand-orange dark:text-brand-orange font-medium hover:underline">
          S'inscrire
        </Link>
      </div>
    </div>
  );
}