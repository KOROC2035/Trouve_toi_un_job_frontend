import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, DollarSign, Search, Filter } from 'lucide-react';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:8000/jobs/'),
          axios.get('http://localhost:8000/categories/')
        ]);
        setJobs(jobsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError('Impossible de charger les annonces. Le serveur est-il lancé ?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || job.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl text-gray-500 dark:text-gray-400 font-medium">Chargement des missions...</div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-xl text-center shadow-sm">{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        {/* Ajout de dark:text-white */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Missions disponibles</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Trouvez le job qui correspond à vos compétences.</p>
      </div>

      {/* --- BARRE DE RECHERCHE ET FILTRES --- */}
      {/* Ajout des couleurs sombres pour la div principale */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex flex-col sm:flex-row gap-4 transition-colors">
        
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          {/* Inputs adaptés au mode sombre */}
          <input
            type="text"
            placeholder="Rechercher un mot-clé (ex: React, Design...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="sm:w-72 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none appearance-none bg-transparent text-gray-900 dark:text-white transition-all"
          >
            <option value="" className="dark:bg-gray-900">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="dark:bg-gray-900">{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- AFFICHAGE DES RÉSULTATS --- */}
      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 transition-colors">
          Aucune mission n'est disponible dans la base de données.
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 transition-colors">
          Aucune mission ne correspond à vos critères de recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            // La carte de la mission adaptée au mode sombre
            <div key={job.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-800 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  Nouveau
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 flex-grow text-sm">
                {job.description}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                  {job.location}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                  {job.budget} €
                </div>
              </div>

              <Link 
                to={`/jobs/${job.id}`} 
                className="w-full text-center block bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-semibold py-2.5 rounded-xl transition-all"
              >
                Voir les détails
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}