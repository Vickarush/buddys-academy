import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, ChevronRight, CheckCircle, Clock, Lock, Play, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import DownloadRecordButton from '@/components/dashboard/DownloadRecordButton';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [certification, setCertification] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [mods, prog, cert, results] = await Promise.all([
          base44.entities.TrainingModule.list('order', 50),
          base44.entities.TrainingProgress.filter({ user_email: u.email }),
          base44.entities.CertificationStatus.filter({ user_email: u.email }),
          base44.entities.QuizResult.filter({ user_email: u.email }),
        ]);
        setModules(mods.filter(m => m.is_published));
        setProgress(prog);
        setCertification(cert[0] || null);
        setQuizResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rawCompleted = progress.filter(p => p.module_completed).length;
  const totalModules = modules.length;
  const completedCount = Math.min(rawCompleted, totalModules);
  const percentage = totalModules > 0 ? Math.min(100, Math.round((completedCount / totalModules) * 100)) : 0;

  const getModuleStatus = (mod) => {
    const p = progress.find(p => p.module_id === mod.id);
    if (p?.module_completed) return 'completed';
    if (p) return 'in_progress';
    // First module always unlocked, others need previous completion
    const idx = modules.indexOf(mod);
    if (idx === 0) return 'available';
    const prev = modules[idx - 1];
    const prevProgress = progress.find(p => p.module_id === prev?.id);
    if (prevProgress?.module_completed) return 'available';
    return 'locked';
  };

  const nextModule = modules.find(m => {
    const s = getModuleStatus(m);
    return s === 'available' || s === 'in_progress';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
            <h1 className="font-playfair text-3xl font-bold text-foreground">
              {user?.full_name || 'Buddy'} 👋
            </h1>
            {certification?.is_certified && (
              <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold px-4 py-1.5 rounded-full">
                <Award className="w-4 h-4" />
                Certified Buddy
              </div>
            )}
          </div>
          {completedCount > 0 && (
            <div className="mt-1">
              <DownloadRecordButton
                user={user}
                modules={modules}
                progress={progress}
                quizResults={quizResults}
                certification={certification}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div {...fadeUp(0.1)} className="bg-foreground text-background rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-background/60 text-sm mb-1">Training Progress</p>
              <p className="font-playfair text-4xl font-bold text-background">{percentage}%</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-background/50">{completedCount} of {totalModules} modules completed</p>
          {nextModule && (
            <Link to={`/training/${nextModule.id}`}>
              <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg">
                Continue Training <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
          {completedCount === totalModules && totalModules > 0 && !certification?.is_certified && (
            <Link to="/certification">
              <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg">
                Complete Certification <Award className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div {...fadeUp(0.15)} className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-green-600' },
          { label: 'In Progress', value: modules.filter(m => getModuleStatus(m) === 'in_progress').length, icon: Clock, color: 'text-primary' },
          { label: 'Locked', value: modules.filter(m => getModuleStatus(m) === 'locked').length, icon: Lock, color: 'text-muted-foreground' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className="font-playfair text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Module List */}
      <motion.div {...fadeUp(0.2)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-foreground">Training Modules</h2>
          <Link to="/training" className="text-sm text-primary font-medium hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {modules.slice(0, 6).map((mod, i) => {
            const status = getModuleStatus(mod);
            const prog = progress.find(p => p.module_id === mod.id);
            return (
              <motion.div key={mod.id} {...fadeUp(0.2 + i * 0.05)}>
                {status === 'locked' ? (
                  <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 opacity-50">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">Module {mod.order}: {mod.title}</p>
                      <p className="text-xs text-muted-foreground">Complete previous module to unlock</p>
                    </div>
                  </div>
                ) : (
                  <Link to={`/training/${mod.id}`} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      status === 'completed' ? 'bg-green-100' : 'bg-gold-pale'
                    }`}>
                      {status === 'completed'
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <Play className="w-4 h-4 text-primary" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">Module {mod.order}: {mod.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In progress' : `${mod.estimated_minutes || 15} min`}
                        {prog?.quiz_passed && ' · Quiz passed'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}