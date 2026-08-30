import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, List, Clock } from 'lucide-react';

export default function CreateJob() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
    category_id: '',
    availability: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories/`);
        setCategories(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: response.data[0].id }));
        }
      } catch (err) {
        setError('Impossible de charger les catégories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget)
      };

      await axios.post('https://trouve-toi-un-job-backend.onrender.com/jobs/', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la création de l'annonce.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400 animate-pulse transition-colors">Chargement de l'éditeur...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in transition-colors">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Publier une nouvelle mission</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">Détaillez votre besoin pour trouver le meilleur prestataire.</p>
      </div>

      {/* Remplacement de bg-gray-900 par brand-navy et des bordures par brand-navy-light */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-navy p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-brand-navy-light space-y-6 transition-colors">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm font-medium text-center transition-colors">
            {error}
          </div>
        )}

        {/* Titre */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            Titre de la mission
          </label>
          <input 
            type="text" 
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            // focus:ring-blue-600 remplacé par focus:ring-brand-orange
            className="w-full px-4 py-2 border border-gray-300 dark:border-brand-navy-light rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            placeholder="Ex: Développeur pour un site e-commerce"
          />
        </div>

        {/* Catégorie & Disponibilité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              <List className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              Catégorie
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-brand-navy-light rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="dark:bg-brand-navy">{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              <Clock className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              Disponibilité
            </label>
            <input 
              type="text" 
              name="availability"
              required
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-brand-navy-light rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder="Ex: Dès que possible, Temps plein..."
            />
          </div>
        </div>

        {/* Localisation & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              Lieu de la mission
            </label>
            <input 
              type="text" 
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-brand-navy-light rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder="Ex: Paris ou Remote"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              Budget estimé (€)
            </label>
            <input 
              type="number" 
              name="budget"
              required
              min="1"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-brand-navy-light rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder="Ex: 500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            Description détaillée
          </label>
          <textarea 
            name="description"
            required
            rows="6"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-brand-navy-light rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            placeholder="Décrivez précisément ce que vous attendez du prestataire..."
          />
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4 border-t border-gray-100 dark:border-brand-navy-light transition-colors">
          <button 
            type="submit" 
            disabled={isSubmitting}
            // Remplacement des couleurs du bouton par le brand-orange
            className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-3 rounded-xl transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Publication en cours...' : 'Publier la mission'}
          </button>
        </div>

      </form>
    </div>
  );
}