import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, MapPin, Briefcase, User, Filter, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const POPULAR_SPECIALTIES = [
  "Tous les métiers",
  "Plombier",
  "Électricien",
  "Serveur / Serveuse",
  "Réceptionniste",
  "Cuisinier / Chef",
  "Développeur Web",
  "Chauffeur / Livreur",
  "Femme / Homme de ménage",
  "Graphiste / Designer"
];

export default function ProvidersSearch() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  // États pour les filtres
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  // Fonction pour charger les prestataires filtrés
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialty && specialty !== "Tous les métiers") params.specialty = specialty;
      if (location) params.location = location;
      if (minAge) params.min_age = minAge;
      if (maxAge) params.max_age = maxAge;

      const response = await axios.get('https://trouve-toi-un-job-backend.onrender.com/providers', { params });
      setProviders(response.data);
    } catch (error) {
      console.error("Erreur lors de la recherche des prestataires :", error);
    } finally {
      setLoading(false);
    }
  }, [specialty, location, minAge, maxAge]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleResetFilters = () => {
    setSpecialty('');
    setLocation('');
    setMinAge('');
    setMaxAge('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Titre */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trouver un prestataire</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Recherchez parmi les meilleurs talents disponibles selon vos critères.
        </p>
      </div>

      {/* BARRE DE FILTRES */}
      <div className="bg-white dark:bg-brand-navy p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 space-y-4 transition-colors">
        <div className="flex items-center gap-2 text-brand-orange font-semibold mb-2">
          <Filter className="w-5 h-5" />
          <span>Filtres de recherche</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Métier / Spécialité */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Spécialité / Métier
            </label>
            <div className="relative">
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-brand-navy-light border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange transition-colors text-sm"
              >
                {POPULAR_SPECIALTIES.map((spec, index) => (
                  <option key={index} value={spec === "Tous les métiers" ? "" : spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Ville / Localisation
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Abidjan, Cocody..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-brand-navy-light border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange transition-colors text-sm"
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Âge Min & Max */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tranche d'âge
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min="16"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-brand-navy-light border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange text-sm transition-colors"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-brand-navy-light border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange text-sm transition-colors"
              />
            </div>
          </div>

          {/* Bouton de réinitialisation */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 px-4 bg-gray-100 dark:bg-brand-navy-light hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* RÉSULTATS */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Chargement des candidats...
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-brand-navy rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aucun prestataire trouvé</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Essayer d'élargir vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white dark:bg-brand-navy rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {provider.profile_photo ? (
                    <img
                      src={`http://127.0.0.1:8000${provider.profile_photo}`}
                      alt={`${provider.first_name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-brand-orange shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange flex justify-center items-center font-bold text-xl shrink-0">
                      {provider.first_name?.[0]}
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                      {provider.first_name} {provider.last_name}
                    </h3>
                    <span className="inline-block bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange text-xs px-2.5 py-1 rounded-full font-medium mt-1">
                      {provider.specialty || 'Prestataire'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{provider.location || 'Non renseignée'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{provider.age} ans</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/messages?user=${provider.id}`)}
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-medium py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Contacter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}