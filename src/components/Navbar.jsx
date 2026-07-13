import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, LayoutDashboard, Sun, Moon, PlusCircle } from 'lucide-react'; // Ajout de PlusCircle
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- GESTION DU MODE SOMBRE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      {/* px-2 sur mobile pour maximiser l'espace, px-4+ sur grand écran */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO : Texte masqué sur très petits écrans (xs) pour laisser de la place aux boutons */}
          <Link to="/" className="flex items-center gap-1.5 group min-w-fit">
            <Briefcase className="w-6 h-6 sm:w-8 h-8 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-base sm:text-xl tracking-tight text-gray-900 dark:text-white hidden min-[380px]:block">
              TrouveToi<span className="text-blue-600 dark:text-blue-500">UnJob</span>
            </span>
          </Link>

          {/* ESPACE BOUTONS : gap-2 sur mobile, gap-6 sur PC */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* BOUTON DU THÈME */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              title="Changer de thème"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Lien Mon Espace : Icône seule sur mobile, texte sur PC */}
                <Link 
                  to="/dashboard" 
                  className="p-2 sm:p-0 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  title="Mon Espace"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:block">Mon Espace</span>
                </Link>

                {/* Bouton Déconnexion : Icône seule sur mobile, texte sur PC */}
                <button 
                  onClick={handleLogout} 
                  className="p-2 sm:p-0 flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 font-medium transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:block">Déconnexion</span>
                </button>
              </>
            ) : (
              /* Lien Connexion : Icône seule sur mobile, texte sur PC */
              <Link 
                to="/login" 
                className="p-2 sm:p-0 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                title="Se connecter"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:block">Se connecter</span>
              </Link>
            )}
            
            {/* BOUTON POSTER UN JOB : Devient une icône "+" sur mobile, et un bouton complet sur PC */}
            <Link 
              to="/create-job" 
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-5 sm:py-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md text-sm flex items-center gap-1"
            >
              <PlusCircle className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:block">Poster un job</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}