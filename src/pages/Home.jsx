import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  DollarSign, 
  Search, 
  Filter, 
  Briefcase, 
  User, 
  Users, 
  MessageSquare,
  Calendar
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  // Mode actif : 'jobs' (Trouver une mission) ou 'providers' (Trouver un prestataire)
  const [searchMode, setSearchMode] = useState('jobs');

  // --- DONNÉES ET ÉTATS POUR LES JOBS ---
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [minSalary, setMinSalary] = useState('');

  // --- DONNÉES ET ÉTATS POUR LES PRESTATAIRES ---
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [errorProviders, setErrorProviders] = useState(null);

  const [providerSpecialty, setProviderSpecialty] = useState('');
  const [providerLocation, setProviderLocation] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  // 1. Chargement des jobs et catégories au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, categoriesResponse] = await Promise.all([
          axios.get('https://trouve-toi-un-job-backend.onrender.com/jobs/'),
          axios.get('https://trouve-toi-un-job-backend.onrender.com/categories/')
        ]);
        setJobs(jobsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setErrorJobs('Impossible de charger les annonces. Le serveur est-il lancé ?');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchData();
  }, []);

  // 2. Chargement / filtrage des prestataires côté API Backend (FastAPI)
  const fetchProviders = useCallback(async () => {
    setLoadingProviders(true);
    setErrorProviders(null);
    try {
      const params = {};
      if (providerSpecialty) params.specialty = providerSpecialty;
      if (providerLocation) params.location = providerLocation;
      if (minAge) params.min_age = minAge;
      if (maxAge) params.max_age = maxAge;

      const response = await axios.get('https://trouve-toi-un-job-backend.onrender.com/providers', { params });
      setProviders(response.data);
    } catch (err) {
      setErrorProviders('Impossible de charger la liste des prestataires.');
    } finally {
      setLoadingProviders(false);
    }
  }, [providerSpecialty, providerLocation, minAge, maxAge]);

  // Déclencher la recherche de prestataires au changement des filtres prestataires ou de l'onglet
  useEffect(() => {
    if (searchMode === 'providers') {
      fetchProviders();
    }
  }, [searchMode, fetchProviders]);

  // Logique de filtrage des jobs (Frontend)
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || String(job.category_id) === String(selectedCategory);
    const matchesLocation = jobLocation === '' || (job.location && job.location.toLowerCase().includes(jobLocation.toLowerCase()));
    const matchesJobType = jobType === '' || job.job_type === jobType;
    const matchesSalary = minSalary === '' || (job.budget && job.budget >= Number(minSalary));

    return matchesSearch && matchesCategory && matchesLocation && matchesJobType && matchesSalary;
  });

  return (
    <div className="animate-fade-in">
      {/* --- ENTÊTE ET CHOIX D'ONGLET --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {searchMode === 'jobs' ? 'Missions disponibles' : 'Trouver un prestataire'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {searchMode === 'jobs' 
              ? 'Trouvez le job qui correspond à vos compétences.' 
              : 'Recherchez et contactez les meilleurs profils qualifiés pour vos projets.'}
          </p>
        </div>

        {/* COMMUTATEUR (TOGGLE) ONGLET */}
        <div className="inline-flex p-1.5 bg-gray-100 dark:bg-brand-navy-light rounded-2xl border border-gray-200 dark:border-gray-700/50">
          <button
            onClick={() => setSearchMode('jobs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              searchMode === 'jobs'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Chercher une mission
          </button>
          <button
            onClick={() => setSearchMode('providers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              searchMode === 'providers'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Chercher un prestataire
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1 : RECHERCHE DE MISSIONS / JOBS                                      */}
      {/* ========================================================================= */}
      {searchMode === 'jobs' && (
        <>
          {/* BARRE DE FILTRES JOBS */}
          <div className="bg-white dark:bg-brand-navy p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 transition-colors">
            
            {/* Mot-clé */}
            <div className="relative lg:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Mot-clé (React, Design...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
            </div>

            {/* Catégorie */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none appearance-none bg-transparent text-gray-900 dark:text-white transition-all text-sm"
              >
                <option value="" className="dark:bg-brand-navy">Toutes catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="dark:bg-brand-navy">{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Lieu */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                list="cities"
                placeholder="Lieu ou Ville..."
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
              <datalist id="cities">
                <option value="Abidjan" />
                <option value="Bouaké" />
                <option value="Daloa" />
                <option value="Yamoussoukro" />
                <option value="San-Pédro" />
                <option value="Korhogo" />
              </datalist>
            </div>

            {/* Type de Job */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none appearance-none bg-transparent text-gray-900 dark:text-white transition-all text-sm"
              >
                <option value="" className="dark:bg-brand-navy">Type de contrat</option>
                <option value="Temps plein" className="dark:bg-brand-navy">À temps plein</option>
                <option value="Temps partiel" className="dark:bg-brand-navy">À temps partiel</option>
                <option value="Freelance" className="dark:bg-brand-navy">Freelance</option>
                <option value="Stage" className="dark:bg-brand-navy">Stage</option>
                <option value="Job de vacances" className="dark:bg-brand-navy">Job de vacances</option>
              </select>
            </div>

            {/* Budget minimum */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="number"
                placeholder="Budget min. (FCFA/€)"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* RÉSULTATS JOBS */}
          {loadingJobs ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-xl text-gray-500 dark:text-gray-400 font-medium">Chargement des missions...</div>
            </div>
          ) : errorJobs ? (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-xl text-center shadow-sm">{errorJobs}</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white dark:bg-brand-navy p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
              Aucune mission n'est disponible dans la base de données.
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-gray-50 dark:bg-brand-navy/50 p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              Aucune mission ne correspond à vos critères de recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-brand-navy p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all hover:border-brand-orange/30 dark:hover:border-brand-orange/50 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-brand-orange transition-colors">
                        {job.title}
                      </h2>
                      
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                        job.is_available !== false 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {job.is_available !== false ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-sm">
                      {job.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {job.location || 'Non précisé'}
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {job.job_type || 'Non précisé'}
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {job.budget ? `${job.budget} FCFA` : 'À débattre'}
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/jobs/${job.id}`} 
                    className="w-full text-center block bg-brand-orange/10 dark:bg-brand-orange/20 hover:bg-brand-orange hover:text-white text-brand-orange dark:text-brand-orange font-semibold py-2.5 rounded-xl transition-all"
                  >
                    Voir les détails
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2 : RECHERCHE DE PRESTATAIRES (POUR LES RECRUTEURS)                */}
      {/* ========================================================================= */}
      {searchMode === 'providers' && (
        <>
          {/* BARRE DE FILTRES PRESTATAIRES */}
          <div className="bg-white dark:bg-brand-navy p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors">
            
            {/* Spécialité / Métier */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Spécialité (ex: Plombier, React...)"
                value={providerSpecialty}
                onChange={(e) => setProviderSpecialty(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
            </div>

            {/* Ville / Localisation */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                list="cities"
                placeholder="Ville (ex: Abidjan, Daloa...)"
                value={providerLocation}
                onChange={(e) => setProviderLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
            </div>

            {/* Âge Min / Max */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Âge min"
                min="16"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-1/2 px-3 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
              <input
                type="number"
                placeholder="Âge max"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-1/2 px-3 py-3 border border-gray-200 dark:border-brand-navy-light rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
            </div>

            {/* Bouton Réinitialiser */}
            <div>
              <button
                onClick={() => {
                  setProviderSpecialty('');
                  setProviderLocation('');
                  setMinAge('');
                  setMaxAge('');
                }}
                className="w-full h-full py-3 px-4 bg-gray-100 dark:bg-brand-navy-light hover:bg-gray-200 dark:hover:bg-brand-navy-hover text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors text-sm"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* RÉSULTATS PRESTATAIRES */}
          {loadingProviders ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-xl text-gray-500 dark:text-gray-400 font-medium">Recherche des prestataires...</div>
            </div>
          ) : errorProviders ? (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-xl text-center shadow-sm">{errorProviders}</div>
          ) : providers.length === 0 ? (
            <div className="bg-gray-50 dark:bg-brand-navy/50 p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              Aucun prestataire ne correspond à vos critères.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white dark:bg-brand-navy rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Profil */}
                    <div className="flex items-center gap-4 mb-4">
                      {provider.profile_photo ? (
                        <img
                          src={
                            provider.profile_photo.startsWith('http')
                              ? provider.profile_photo 
                              : `http://127.0.0.1:8000${provider.profile_photo.startsWith('/') ? '' : '/'}${provider.profile_photo}`
                          }
                          alt={`${provider.first_name}`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-brand-orange shrink-0"
                          onError={(e) => {
                            // URL ui-avatars mise à jour avec la couleur orange de la marque (FF6600)
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${provider.first_name}+${provider.last_name}&background=FF6600&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange flex justify-center items-center font-bold text-lg shrink-0">
                          {provider.first_name?.[0]?.toUpperCase() || 'P'}
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                          {provider.first_name} {provider.last_name}
                        </h3>
                        <span className="inline-block bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange text-xs px-2.5 py-0.5 rounded-full font-medium mt-1">
                          {provider.specialty || 'Prestataire'}
                        </span>
                      </div>
                    </div>

                    {/* Informations prestataire */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{provider.location || 'Localisation non précisée'}</span>
                      </div>
                      {provider.age && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{provider.age} ans</span>
                        </div>
                      )}
                      {provider.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          {provider.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bouton Contacter */}
                  <button
                    onClick={() => navigate(`/messages?user=${provider.id}`)}
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contacter
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}