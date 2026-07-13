import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, DollarSign, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // On récupère le token en plus de isAuthenticated
  const { isAuthenticated, token } = useContext(AuthContext);

  // États pour l'affichage de l'annonce
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour le formulaire de candidature
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`https://trouve-toi-un-job-backend.onrender.com/jobs/${id}`);
        setJob(response.data);
        // On pré-remplit le prix proposé avec le budget du client
        setProposedPrice(response.data.budget); 
      } catch (err) {
        setError("Impossible de charger les détails de cette annonce.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Fonction appelée lors de l'envoi du formulaire
  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApplyError('');

    try {
      const payload = {
        job_id: id,
        cover_message: coverMessage,
        proposed_price: parseFloat(proposedPrice)
      };

      await axios.post('https://trouve-toi-un-job-backend.onrender.com/applications/', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      // Succès !
      setApplySuccess(true);
      setShowApplyForm(false);
    } catch (err) {
      setApplyError(err.response?.data?.detail || "Une erreur est survenue lors de la candidature.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-20 animate-pulse text-gray-500 dark:text-gray-400">Chargement des détails...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">{error}</div>;
  if (!job) return <div className="text-center mt-20 dark:text-white">Annonce introuvable.</div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in transition-colors">
      <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux annonces
      </Link>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h1>
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
            job.status === 'open' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            {job.status === 'open' ? 'Ouvert aux candidatures' : job.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
            <MapPin className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            {job.location}
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
            <DollarSign className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
            Budget : {job.budget} €
          </div>
        </div>

        <div className="prose max-w-none mb-10 text-gray-600 dark:text-gray-400 whitespace-pre-wrap transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description de la mission</h3>
          {job.description}
        </div>

        {/* --- SECTION CANDIDATURE --- */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 transition-colors">
          {/* Si la candidature a réussi */}
          {applySuccess ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-6 rounded-xl flex items-center justify-center gap-3 transition-colors">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
              <span className="font-medium text-lg">Votre candidature a été envoyée avec succès !</span>
            </div>
          ) : isAuthenticated ? (
            job.status === 'open' ? (
              // Si ouvert et connecté, on affiche le bouton ou le formulaire
              <>
                {!showApplyForm ? (
                  <button 
                    onClick={() => setShowApplyForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Postuler à cette mission
                  </button>
                ) : (
                  // LE FORMULAIRE DE CANDIDATURE
                  <form onSubmit={handleApply} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in transition-colors">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Votre proposition</h4>
                    
                    {applyError && (
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm font-medium transition-colors">
                        {applyError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message de motivation (min. 10 caractères)</label>
                        <textarea 
                          required
                          minLength={10}
                          rows="4"
                          value={coverMessage}
                          onChange={(e) => setCoverMessage(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Bonjour, je suis très intéressé par votre annonce car..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre prix proposé (€)</label>
                        <input 
                          type="number" 
                          required
                          min="1"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowApplyForm(false)}
                          className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg transition-colors">
                Cette mission n'accepte plus de nouvelles candidatures.
              </div>
            )
          ) : (
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl transition-colors">
              <p className="text-blue-800 dark:text-blue-300 mb-4 font-medium">Vous devez être connecté pour postuler à cette mission.</p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}