import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Briefcase } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État global du formulaire
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'client' // Par défaut, on sélectionne client
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Ajout des classes dark pour le fond et les bordures de la carte
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Rejoignez notre communauté aujourd'hui.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Choix du rôle (Boutons radio style carte) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
            formData.role === 'client' 
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            <input type="radio" name="role" value="client" className="hidden" onChange={handleChange} checked={formData.role === 'client'} />
            <User className="w-6 h-6" />
            <span className="font-medium text-sm">Je recrute</span>
          </label>
          
          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
            formData.role === 'provider' 
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            <input type="radio" name="role" value="provider" className="hidden" onChange={handleChange} checked={formData.role === 'provider'} />
            <Briefcase className="w-6 h-6" />
            <span className="font-medium text-sm">Je cherche un job</span>
          </label>
        </div>

        {/* Champs de saisie (Inputs) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
            <input 
              type="text" 
              name="first_name" 
              required 
              value={formData.first_name} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <input 
              type="text" 
              name="last_name" 
              required 
              value={formData.last_name} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            required 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <input 
            type="password" 
            name="password" 
            required 
            minLength={6} 
            value={formData.password} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 mt-2 disabled:opacity-50">
          <UserPlus className="w-5 h-5" />
          {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
}