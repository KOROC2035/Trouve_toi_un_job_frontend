import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, LayoutDashboard, Sun, Moon, PlusCircle, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Navbar() {
  const { isAuthenticated, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- GESTION DU MODE SOMBRE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // --- GESTION DES MESSAGES NON LUS ---
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- POLLING : VÉRIFICATION DES MESSAGES NON LUS ---
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !token) return;
      try {
        const response = await axios.get('https://trouve-toi-un-job-backend.onrender.com/conversations/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Erreur unread count", error);
      }
    };

    fetchUnreadCount(); // 1er appel
    
    const intervalId = setInterval(fetchUnreadCount, 30000); // Polling
    
    window.addEventListener('new_message_received', fetchUnreadCount);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('new_message_received', fetchUnreadCount);
    };
  }, [isAuthenticated, token]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  // 🔴 C'EST ICI QUE TOUT SE JOUE :
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <nav className="bg-white dark:bg-brand-navy shadow-sm border-b border-gray-100 dark:border-brand-navy-light sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-1.5 group min-w-fit">
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-brand-orange group-hover:scale-110 transition-transform" />
            <span className="font-bold text-base sm:text-xl tracking-tight text-brand-navy dark:text-white hidden min-[380px]:block">
              TrouveToi<span className="text-brand-orange">UnJob</span>
            </span>
          </Link>

          <Link 
            to="/profile" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-navy-light transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:block">Mon Profil</span>
          </Link>

          {/* ICÔNE MESSAGE */}
          <Link to="/messages" className="relative text-gray-700 dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange transition-colors">
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-brand-navy animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* ESPACE BOUTONS */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* BOUTON DU THÈME */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-navy-light transition-colors focus:outline-none"
              title="Changer de thème"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* LIENS CONNECTÉS */}
            <Link 
              to="/dashboard" 
              className="p-2 sm:p-0 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange font-medium transition-colors"
              title="Mon Espace"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:block">Mon Espace</span>
            </Link>

            <button 
              onClick={handleLogout} 
              className="p-2 sm:p-0 flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 font-medium transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">Déconnexion</span>
            </button>
            
            {/* BOUTON POSTER UN JOB */}
            <Link 
              to="/create-job" 
              className="bg-brand-orange hover:bg-brand-orange-hover text-white p-2 sm:px-5 sm:py-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md text-sm flex items-center gap-1"
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