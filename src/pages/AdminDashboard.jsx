import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, ChevronRight, Search, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay }
});

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [allCerts, setAllCerts] = useState([]);
  const [allQuizResults, setAllQuizResults] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trainees');

  useEffect(() => {
    async function load() {
      const [u, mods, prog, certs, results] = await Promise.all([
        base44.entities.User.list('-created_date', 100),
        base44.entities.TrainingModule.list('order', 50),
        base44.entities.TrainingProgress.list('-created_date', 500),
        base44.entities.CertificationStatus.list('-created_date', 100),
        base44.entities.QuizResult.list('-created_date', 500),
      ]);
      setUsers(u.filter(u => u.role !== 'admin'));
      setModules(mods.filter(m => m.is_published));
      setAllProgress(prog);
      setAllCerts(certs);
      setAllQuizResults(results);
      setLoading(false);
    }
    load();
  }, []);

  const getUserProgress = (email) => {
    const prog = allProgress.filter(p => p.module_id && p.module_completed && p.user_email === email);
    return prog.length;
  };

  const getUserCert = (email) => allCerts.find(c => c.user_email === email);
  
  const getUserAvgScore = (email) => {
    const results = allQuizResults.filter(r => r.user_email === email);
    if (!results.length) return null;
    return Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  };

  const handleCertify = async (userEmail) => {
    const cert = allCerts.find(c => c.user_email === userEmail);
    if (cert) {
      await base44.entities.CertificationStatus.update(cert.id, {
        is_certified: true,
        certified_at: new Date().toISOString(),
      });
    } else {
      await base44.entities.CertificationStatus.create({
        user_email: userEmail,
        is_certified: true,
        certified_at: new Date().toISOString(),
        agreement_signed: true,
        agreement_signed_at: new Date().toISOString(),
      });
    }
    const updated = await base44.entities.CertificationStatus.list('-created_date', 100);
    setAllCerts(updated);
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const certifiedCount = allCerts.filter(c => c.is_certified).length;
  const pendingCount = allCerts.filter(c => c.agreement_signed && !c.is_certified).length;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Admin Panel</p>
        <h1 className="font-playfair text-3xl font-bold text-foreground">Buddys Academy Admin</h1>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Trainees', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Certified', value: certifiedCount, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Cert.', value: pendingCount, icon: Clock, color: 'text-primary', bg: 'bg-gold-pale' },
          { label: 'Modules', value: modules.length, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="font-playfair text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6 w-fit">
        {[['trainees', 'Trainees'], ['modules', 'Modules']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'trainees' && (
        <>
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trainees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u, i) => {
              const completed = getUserProgress(u.email);
              const cert = getUserCert(u.email);
              const avgScore = getUserAvgScore(u.email);
              const pct = modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0;
              return (
                <motion.div key={u.id} {...fadeUp(0.05 * i)}>
                  <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-pale rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-primary text-sm uppercase">{u.full_name?.[0] || '?'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cert?.is_certified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            <Award className="w-3 h-3" /> Certified
                          </span>
                        ) : cert?.agreement_signed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gold-pale text-primary px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        ) : null}
                        {!cert?.is_certified && pct === 100 && (
                          <Button size="sm" onClick={() => handleCertify(u.email)} className="bg-primary text-white text-xs h-7 px-3 rounded-lg gap-1">
                            <Shield className="w-3 h-3" /> Certify
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{completed}/{modules.length} modules</span>
                        <span>{pct}%{avgScore !== null ? ` · Avg: ${avgScore}%` : ''}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No trainees found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-3">
          {modules.map((mod, i) => {
            const completedBy = allProgress.filter(p => p.module_id === mod.id && p.module_completed).length;
            const quizPassed = allQuizResults.filter(r => r.module_id === mod.id && r.passed).length;
            return (
              <motion.div key={mod.id} {...fadeUp(0.05 * i)}>
                <Link to={`/admin/modules/${mod.id}`} className="group block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Module {mod.order}: {mod.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{completedBy} trainees completed · {quizPassed} quizzes passed</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
          <motion.div {...fadeUp(modules.length * 0.05)}>
            <Link to="/admin/modules/new" className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-5 text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm font-medium">
              + Add New Module
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}