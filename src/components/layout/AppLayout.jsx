import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Award, Settings, LogOut,
  Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Outlet } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/training', label: 'My Training', icon: BookOpen },
  { path: '/certification', label: 'Certification', icon: Award },
];

const adminNavItems = [
  { path: '/admin', label: 'Admin Panel', icon: Settings },
];

export default function AppLayout({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const allItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <div className="min-h-screen bg-background font-inter flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-foreground text-background fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-playfair font-bold">B</span>
            </div>
            <div>
              <div className="font-playfair font-bold text-background text-sm leading-tight">Buddys Academy</div>
              <div className="text-xs text-background/50 leading-tight">Training Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {allItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-background/60 hover:text-background hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-xs font-bold uppercase">{user?.full_name?.[0] || 'B'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-background truncate">{user?.full_name || 'Buddy'}</div>
              <div className="text-xs text-background/40 capitalize">{user?.role || 'trainee'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/60 hover:text-background hover:bg-white/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-foreground text-background px-5 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-playfair font-bold text-xs">B</span>
          </div>
          <span className="font-playfair font-bold text-sm text-background">Buddys Academy</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="text-background/70 hover:text-background">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-foreground z-50 md:hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-white font-playfair font-bold text-xs">B</span>
                  </div>
                  <span className="font-playfair font-bold text-sm text-background">Buddys Academy</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-background/60 hover:text-background">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {allItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-primary text-white' : 'text-background/60 hover:text-background hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary text-xs font-bold uppercase">{user?.full_name?.[0] || 'B'}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-background">{user?.full_name}</div>
                    <div className="text-xs text-background/40 capitalize">{user?.role}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/60 hover:text-background hover:bg-white/10">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}