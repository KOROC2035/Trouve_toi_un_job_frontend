import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Briefcase, Camera, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';

const POPULAR_SPECIALTIES = [
  "Plombier",
  "Électricien",
  "Serveur / Serveuse",
  "Réceptionniste",
  "Cuisinier / Chef",
  "Agent de sécurité / Gardien",
  "Chauffeur / Livreur",
  "Femme / Homme de ménage",
  "Jardinier",
  "Autre (saisir ci-dessous)"
];

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // État pour l'indicatif du pays (par défaut +225)
  const [countryCode, setCountryCode] = useState('+225');

  // Formulaire textuel
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    age: '',
    location: '',
    password: '',
    role: 'client',
    specialty: '' // Ajout de la spécialité
  });

  // États pour la gestion de la spécialité personnalisée
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');

  // Fichiers et leurs prévisualisations
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const [companyPhoto, setCompanyPhoto] = useState(null);
  const [companyPreview, setCompanyPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion de la catégorie du menu déroulant
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);

    if (value !== "Autre (saisir ci-dessous)") {
      setCustomSpecialty('');
      setFormData(prev => ({ ...prev, specialty: value }));
    } else {
      setFormData(prev => ({ ...prev, specialty: customSpecialty }));
    }
  };

  // Gestion du champ de saisie libre pour la spécialité
  const handleCustomSpecialtyChange = (e) => {
    const value = e.target.value;
    setCustomSpecialty(value);
    setFormData(prev => ({ ...prev, specialty: value }));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCompanyPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyPhoto(file);
      setCompanyPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation côté client pour les prestataires
    if (formData.role === 'provider' && !profilePhoto) {
      setError("La photo de profil est obligatoire pour les prestataires.");
      setIsSubmitting(false);
      return;
    }

    // On fusionne l'indicatif et le numéro, et on retire les espaces éventuels
    const cleanPhoneNumber = formData.phone_number.replace(/\s+/g, '');
    const fullPhoneNumber = `${countryCode}${cleanPhoneNumber}`;

    // Création du FormData pour l'envoi de fichiers
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('phone_number', fullPhoneNumber);
    data.append('age', formData.age);
    data.append('location', formData.location);
    data.append('password', formData.password);
    data.append('role', formData.role);

    // Ajout de la spécialité uniquement si c'est un prestataire
    if (formData.role === 'provider') {
      data.append('specialty', formData.specialty);
    }

    if (profilePhoto) data.append('profile_photo', profilePhoto);
    if (companyPhoto && formData.role === 'client') data.append('company_photo', companyPhoto);

    try {
      await axios.post('https://trouve-toi-un-job-backend.onrender.com/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 bg-white dark:bg-brand-navy p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Rejoignez notre communauté aujourd'hui.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Choix du rôle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
            formData.role === 'client' 
              ? 'border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 text-brand-orange dark:text-brand-orange' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-brand-navy-light text-gray-600 dark:text-gray-400'
          }`}>
            <input type="radio" name="role" value="client" className="hidden" onChange={handleChange} checked={formData.role === 'client'} />
            <User className="w-6 h-6" />
            <span className="font-medium text-sm">Je recrute</span>
          </label>
          
          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
            formData.role === 'provider' 
              ? 'border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 text-brand-orange dark:text-brand-orange' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-brand-navy-light text-gray-600 dark:text-gray-400'
          }`}>
            <input type="radio" name="role" value="provider" className="hidden" onChange={handleChange} checked={formData.role === 'provider'} />
            <Briefcase className="w-6 h-6" />
            <span className="font-medium text-sm">Je cherche un job</span>
          </label>
        </div>

        {/* SECTION PHOTOS DE COUVERTURE */}
        {formData.role === 'client' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture / entreprise <span className="text-xs text-gray-400">(Optionnel)</span>
            </label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-32 flex justify-center items-center overflow-hidden hover:border-brand-orange transition-colors">
              {companyPreview ? (
                <img src={companyPreview} alt="Aperçu couverture" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Ajouter une photo de votre structure</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCompanyPhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        )}

        {/* SECTION PHOTO DE PROFIL */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Photo de profil {formData.role === 'provider' ? <span className="text-red-500">*</span> : <span className="text-xs text-gray-400">(Optionnel)</span>}
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex justify-center items-center overflow-hidden shrink-0">
              {profilePreview ? (
                <img src={profilePreview} alt="Aperçu profil" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer bg-gray-100 dark:bg-brand-navy-light hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Choisir une photo
              <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Champs Prénom et Nom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
            <input 
              type="text" 
              name="first_name" 
              required 
              value={formData.first_name} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
            />
          </div>
        </div>

        {/* Âge et Localisation */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Âge</label>
            <input 
              type="number" 
              name="age" 
              min="16"
              required 
              value={formData.age} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
              placeholder="Ex: 25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
            <input 
              type="text" 
              name="location" 
              required 
              value={formData.location} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors" 
              placeholder="Ex: Abidjan"
            />
          </div>
        </div>

        {/* SECTION SPÉCIALITÉ (Uniquement pour les prestataires) */}
        {formData.role === 'provider' && (
          <div className="p-4 bg-gray-50 dark:bg-brand-navy-light/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Quelle est votre spécialité / métier ? <span className="text-red-500">*</span>
            </label>

            {/* Menu déroulant */}
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              required={formData.role === 'provider'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-brand-navy text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
            >
              <option value="">-- Sélectionnez un métier --</option>
              {POPULAR_SPECIALTIES.map((spec, i) => (
                <option key={i} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Champ texte pour la saisie personnalisée ou précision */}
            {(selectedCategory === "Autre (saisir ci-dessous)" || selectedCategory !== '') && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {selectedCategory === "Autre (saisir ci-dessous)" 
                    ? "Indiquez votre métier précis :" 
                    : "Précisez votre spécialité (optionnel) :"}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Électricien industriel, Barman, Plombier sanitaire..."
                  value={selectedCategory === "Autre (saisir ci-dessous)" ? customSpecialty : formData.specialty}
                  onChange={(e) => {
                    if (selectedCategory === "Autre (saisir ci-dessous)") {
                      handleCustomSpecialtyChange(e);
                    } else {
                      setFormData({ ...formData, specialty: e.target.value });
                    }
                  }}
                  required={selectedCategory === "Autre (saisir ci-dessous)"}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange transition-colors placeholder-gray-400"
                />
              </div>
            )}
          </div>
        )}

        {/* TÉLÉPHONE AVEC INDICATIF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro de téléphone</label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-brand-navy-light border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-lg focus:ring-2 focus:ring-brand-orange outline-none text-gray-900 dark:text-white transition-colors cursor-pointer"
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
              name="phone_number" 
              required 
              value={formData.phone_number} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-r-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors placeholder-gray-400" 
              placeholder="07 00 00 00 00"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              name="password" 
              required 
              minLength={6} 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none bg-transparent text-gray-900 dark:text-white transition-colors placeholder-gray-400 pr-10" 
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-medium py-3 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 mt-4 disabled:opacity-50">
          <UserPlus className="w-5 h-5" />
          {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="text-brand-orange dark:text-brand-orange font-medium hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
}