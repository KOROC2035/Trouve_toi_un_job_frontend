import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, CheckCircle, Star, Flag, Briefcase, Clock, XCircle, ArrowLeft } from 'lucide-react'; // <-- Ajout de ArrowLeft

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  
  // États partagés
  const [loading, setLoading] = useState(true);

  // États pour le Client
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // États pour le Prestataire
  const [myApplications, setMyApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'client' || user?.role === 'admin') {
          const response = await axios.get('http://localhost:8000/users/me/jobs', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMyJobs(response.data);
        } 
        else if (user?.role === 'provider') {
          const [appsResponse, jobsResponse] = await Promise.all([
            axios.get('http://localhost:8000/users/me/applications', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:8000/jobs/')
          ]);
          setMyApplications(appsResponse.data);
          setAllJobs(jobsResponse.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'espace");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, token]);

  // --- FONCTIONS CLIENT ---
  const viewApplications = async (job) => {
    setSelectedJob(job);
    setShowReviewForm(false);
    try {
      const response = await axios.get(`http://localhost:8000/jobs/${job.id}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (err) {
      alert("Erreur lors de la récupération des candidatures");
    }
  };

  const handleAccept = async (appId) => {
    if (!window.confirm("Accepter ce prestataire et démarrer la mission ?")) return;
    try {
      await axios.patch(`http://localhost:8000/applications/${appId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Candidature acceptée ! La mission est maintenant en cours.");
      
      const response = await axios.get('http://localhost:8000/users/me/jobs', { headers: { Authorization: `Bearer ${token}` } });
      setMyJobs(response.data);
      viewApplications({ ...selectedJob, status: 'in_progress' });
    } catch (err) {
      alert("Erreur lors de l'acceptation.");
    }
  };

  const handleCompleteAndReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    const acceptedApp = applications.find(app => app.status === 'accepted');
    
    if (!acceptedApp) {
      alert("Erreur : Aucun prestataire n'a été accepté pour cette mission.");
      setIsSubmittingReview(false);
      return;
    }

    try {
      await axios.patch(`http://localhost:8000/jobs/${selectedJob.id}`, { status: 'completed' }, { headers: { Authorization: `Bearer ${token}` } });
      await axios.post('http://localhost:8000/reviews/', {
        job_id: selectedJob.id, reviewee_id: acceptedApp.provider_id, rating: parseInt(rating), comment: comment
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("Mission terminée avec succès !");
      setShowReviewForm(false);
      
      const response = await axios.get('http://localhost:8000/users/me/jobs', { headers: { Authorization: `Bearer ${token}` } });
      setMyJobs(response.data);
      viewApplications({ ...selectedJob, status: 'completed' });
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la clôture.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400 animate-pulse">Chargement de votre espace...</div>;

  // ==========================================
  // AFFICHAGE : DASHBOARD PRESTATAIRE
  // ==========================================
  if (user?.role === 'provider') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in transition-colors">
        
        {/* NOUVEAU : Bouton retour à l'accueil */}
        <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h2 className="text-3xl font-bold flex items-center gap-2 mb-8 text-gray-900 dark:text-white">
          <Briefcase className="text-blue-600 dark:text-blue-500 w-8 h-8" /> Mes Candidatures
        </h2>

        {myApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 transition-colors">
            Vous n'avez postulé à aucune mission pour le moment.
            <Link to="/" className="block mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Parcourir les missions disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myApplications.map(app => {
              const job = allJobs.find(j => j.id === app.job_id);
              return (
                <div key={app.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {job ? job.title : "Mission introuvable"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">"{app.cover_message}"</p>
                    <div className="flex gap-4 text-sm font-medium">
                      <span className="text-gray-500 dark:text-gray-500">Prix proposé : {app.proposed_price} €</span>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-semibold whitespace-nowrap
                    ${app.status === 'accepted' 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' 
                      : app.status === 'rejected' 
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' 
                      : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/50'}
                  `}>
                    {app.status === 'accepted' ? <CheckCircle className="w-5 h-5" /> : 
                     app.status === 'rejected' ? <XCircle className="w-5 h-5" /> : 
                     <Clock className="w-5 h-5" />}
                    
                    {app.status === 'accepted' ? 'Mission obtenue !' : 
                     app.status === 'rejected' ? 'Candidature refusée' : 
                     'En attente de réponse'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // AFFICHAGE : DASHBOARD CLIENT
  // ==========================================
  return (
    <div className="animate-fade-in transition-colors">
      
      {/* NOUVEAU : Bouton retour à l'accueil */}
      <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à l'accueil
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche : Mes Annonces */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
            <LayoutDashboard className="text-blue-600 dark:text-blue-500" /> Mes missions
          </h2>
          {myJobs.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm">Vous n'avez pas encore posté de mission.</div>
          ) : (
            myJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => viewApplications(job)} 
                className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm 
                  ${selectedJob?.id === job.id 
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600 dark:ring-blue-500' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700/50'
                  }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                <div className="flex items-center gap-2 mt-3 text-sm font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${job.status === 'open' ? 'bg-green-500' : job.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                  <span className={job.status === 'open' ? 'text-green-700 dark:text-green-400' : job.status === 'in_progress' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                    {job.status === 'open' ? 'Ouvert' : job.status === 'in_progress' ? 'En cours' : 'Terminé'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Colonne de droite : Détails & Candidatures */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  Gestion : {selectedJob.title}
                </h2>
                
                {/* Bouton pour clôturer */}
                {selectedJob.status === 'in_progress' && !showReviewForm && (
                  <button onClick={() => setShowReviewForm(true)} className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Terminer la mission
                  </button>
                )}
              </div>

              {/* FORMULAIRE DE CLÔTURE ET AVIS */}
              {showReviewForm && (
                <form onSubmit={handleCompleteAndReview} className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-fade-in transition-colors">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500 fill-current" /> Évaluer le prestataire
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Note (sur 5)</label>
                      <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                        <option value="5" className="dark:bg-gray-900">⭐⭐⭐⭐⭐ Parfait !</option>
                        <option value="4" className="dark:bg-gray-900">⭐⭐⭐⭐ Très bien</option>
                        <option value="3" className="dark:bg-gray-900">⭐⭐⭐ Bien</option>
                        <option value="2" className="dark:bg-gray-900">⭐⭐ Moyen</option>
                        <option value="1" className="dark:bg-gray-900">⭐ Décevant</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Un mot sur son travail ?</label>
                      <textarea required value={comment} onChange={(e) => setComment(e.target.value)} rows="3" className="w-full px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="Super travail, très professionnel..." />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={isSubmittingReview} className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                        {isSubmittingReview ? 'Validation...' : 'Valider la fin de mission'}
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2.5 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium rounded-lg transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {/* LISTE DES CANDIDATURES */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Candidatures reçues ({applications.length})</h3>
              
              {applications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">Aucune candidature reçue pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <div key={app.id} className={`p-5 border rounded-xl transition-colors ${
                      app.status === 'accepted' 
                        ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/10' 
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/30 shadow-sm'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Proposition : {app.proposed_price} €</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{app.cover_message}"</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          app.status === 'accepted' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : app.status === 'rejected' 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500'
                        }`}>
                          {app.status === 'accepted' ? '✓ Prestataire validé' : app.status === 'rejected' ? 'Refusé' : 'En attente'}
                        </span>
                      </div>
                      
                      {/* Bouton Accepter uniquement si le job est ouvert et la candidature en attente */}
                      {selectedJob.status === 'open' && app.status === 'pending' && (
                        <button 
                          onClick={() => handleAccept(app.id)}
                          className="mt-3 w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Accepter ce prestataire
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
              <Users className="w-12 h-12 mb-3 opacity-20 dark:opacity-40" />
              <p className="font-medium text-gray-500 dark:text-gray-400">Sélectionnez une mission</p>
              <p className="text-sm">Pour gérer vos candidatures et finaliser vos contrats.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}