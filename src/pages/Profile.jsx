import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Star, 
  ArrowLeft, 
  Briefcase, 
  MessageSquare,
  Edit3,
  X,
  Check,
  Image,
  Camera,
  Upload,
  Loader2
} from 'lucide-react';

// Constante pour l'URL du backend
const BACKEND_URL = 'https://trouve-toi-un-job-backend.onrender.com';

// Fonction utilitaire pour gérer l'affichage correct des images (locales ou distantes)
const getImageUrl = (path) => {
  if (!path) return '';
  // Si c'est déjà une URL absolue (ex: Cloudinary, S3, ou un lien direct), on la retourne telle quelle
  if (path.startsWith('http')) return path;
  
  // Sinon, c'est un chemin local (ex: "uploads/image.jpg"), on ajoute l'URL du backend
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

export default function Profile() {
  const { token, user, setUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour l'édition et les téléversements d'images
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null); // 'avatar' ou 'cover'
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_photo: '',
    company_photo: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/users/me/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        profile_photo: response.data.profile_photo || response.data.avatar_url || '',
        company_photo: response.data.company_photo || response.data.cover_url || ''
      });
    } catch (err) {
      console.error("Erreur chargement profil:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Téléversement du fichier sélectionné vers le backend FastAPI
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldName);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await axios.post(`${BACKEND_URL}/users/me/upload-image`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Met à jour l'URL de l'image correspondante
      setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
    } catch (err) {
      console.error("Erreur d'upload :", err);
      alert("Échec du téléversement de l'image.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await axios.put(`${BACKEND_URL}/users/me/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      
      if (setUser) {
        setUser(prev => ({
          ...prev,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          profile_photo: response.data.profile_photo,
          company_photo: response.data.company_photo
        }));
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Erreur mise à jour profil:", err);
      alert("Erreur lors de la sauvegarde du profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400 animate-pulse font-medium">
        Chargement de votre profil...
      </div>
    );
  }

  const currentUser = profileData || user;
  const reviews = profileData?.reviews || [];
  const avgRating = profileData?.average_rating || 0;

  const formattedDate = currentUser?.created_at 
    ? new Date(currentUser.created_at).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
      })
    : 'Récemment';

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in transition-colors">
      
      {/* Header avec Retour & Bouton Éditer */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Modifier mon profil
        </button>
      </div>

      {/* CARTE DE PROFIL */}
      <div className="bg-white dark:bg-brand-navy rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        
        {/* PHOTO DE COUVERTURE */}
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-orange relative">
          {currentUser?.company_photo && (
            <img 
              src={getImageUrl(currentUser.company_photo)} 
              alt="Couverture" 
              className="w-full h-full object-cover opacity-90" 
            />
          )}
        </div>

        {/* DETAILS PROFIL */}
        <div className="px-6 sm:px-8 pb-8 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
            
            {/* PHOTO DE PROFIL */}
            <div className="relative inline-block">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white dark:border-brand-navy bg-gray-100 dark:bg-brand-navy-light shadow-md overflow-hidden flex items-center justify-center text-gray-400">
                {currentUser?.profile_photo ? (
                  <img 
                    src={getImageUrl(currentUser.profile_photo)} 
                    alt={currentUser.first_name || "Avatar"} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </div>

            {/* BADGE RÔLE */}
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${
                currentUser?.role === 'provider'
                  ? 'bg-brand-navy/5 dark:bg-brand-navy-light text-brand-navy dark:text-white border-brand-navy/10 dark:border-gray-700'
                  : 'bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange border-brand-orange/20 dark:border-brand-orange/30'
              }`}>
                {currentUser?.role === 'provider' ? (
                  <>
                    <Briefcase className="w-4 h-4" /> Prestataire
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" /> Recruteur
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {currentUser?.first_name || currentUser?.last_name 
                  ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
                  : 'Utilisateur'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {currentUser?.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Membre depuis <strong>{formattedDate}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center text-brand-orange">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-gray-900 dark:text-white">
                    {avgRating > 0 ? avgRating : 'N/A'}
                  </span>
                </div>
                <span>({reviews.length} avis reçu{reviews.length > 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION DES AVIS */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-orange" />
          Avis et évaluations reçus ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-brand-navy p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
            Aucun avis n'a encore été laissé sur ce profil.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="bg-white dark:bg-brand-navy p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1 text-brand-orange">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        className={`w-4 h-4 ${index < rev.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} 
                      />
                    ))}
                    <span className="ml-2 font-bold text-sm text-gray-900 dark:text-white">
                      {rev.rating}/5
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString('fr-FR') : ''}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE D'ÉDITION AVEC TÉLÉVERSEMENT DE FICHIERS */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-brand-navy w-full max-w-md rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-orange" />
                Modifier mon profil
              </h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Votre prénom"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-brand-navy-light text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-brand-navy-light text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                />
              </div>

              {/* UPLOAD PHOTO DE PROFIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-gray-400" /> Photo de profil
                </label>
                
                <div className="flex items-center gap-3">
                  {formData.profile_photo && (
                    <img 
                      src={getImageUrl(formData.profile_photo)} 
                      alt="Aperçu" 
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700" 
                    />
                  )}
                  
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-orange rounded-xl cursor-pointer bg-gray-50 dark:bg-brand-navy-light/50 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors">
                    {uploadingField === 'profile_photo' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                    ) : (
                      <Upload className="w-4 h-4 text-brand-orange" />
                    )}
                    <span>{uploadingField === 'profile_photo' ? 'Chargement...' : 'Choisir une image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'profile_photo')} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* UPLOAD PHOTO DE COUVERTURE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-gray-400" /> Photo de couverture
                </label>
                
                <div className="flex items-center gap-3">
                  {formData.company_photo && (
                    <img 
                      src={getImageUrl(formData.company_photo)} 
                      alt="Aperçu couverture" 
                      className="w-16 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" 
                    />
                  )}

                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-orange rounded-xl cursor-pointer bg-gray-50 dark:bg-brand-navy-light/50 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors">
                    {uploadingField === 'company_photo' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                    ) : (
                      <Upload className="w-4 h-4 text-brand-orange" />
                    )}
                    <span>{uploadingField === 'company_photo' ? 'Chargement...' : 'Choisir une image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'company_photo')} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={isSaving || uploadingField !== null}
                  className="flex-1 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-brand-navy-light dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}