import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext'; 
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    // On englobe toute l'application avec AuthProvider
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 selection:bg-blue-100">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;