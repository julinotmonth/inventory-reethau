import { useState } from 'react';
import type { Language, AuthState } from './types';
import { Navbar } from './components/public/Navbar';
import { HeroSection } from './components/public/HeroSection';
import { VisionSection } from './components/public/VisionSection';
import { ProductCarousel } from './components/public/ProductCarousel';
import { Footer } from './components/public/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [lang, setLang] = useState<Language>('IDN');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    username: '',
    role: 'Super Admin',
    assignedSite: 'global',
  });

  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  const handleLoginSuccess = (newAuth: AuthState) => {
    setAuth(newAuth);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      username: '',
      role: 'Super Admin',
      assignedSite: 'global',
    });
    setCurrentView('public');
  };

  if (currentView === 'admin' && auth.isAuthenticated) {
    return (
      <AdminDashboard
        auth={auth}
        onLogout={handleLogout}
        onGoToPublicSite={() => setCurrentView('public')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1D', color: '#FFFFFF' }}>
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isAuthenticated={auth.isAuthenticated}
        onOpenAdminDashboard={() => setCurrentView('admin')}
      />

      <HeroSection lang={lang} onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />
      <VisionSection lang={lang} />
      <ProductCarousel lang={lang} />
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;