import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Page imports
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TrainingList from './pages/TrainingList';
import ModuleViewer from './pages/ModuleViewer';
import Certification from './pages/Certification';
import AdminDashboard from './pages/AdminDashboard';
import AdminModuleEditor from './pages/AdminModuleEditor';
import AppLayout from './components/layout/AppLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-off-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-playfair font-bold">B</span>
          </div>
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Authenticated app routes with layout */}
      <Route element={<AppLayout user={user} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/training" element={<TrainingList />} />
        <Route path="/training/:moduleId" element={<ModuleViewer />} />
        <Route path="/certification" element={<Certification />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/modules/:moduleId" element={<AdminModuleEditor />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App