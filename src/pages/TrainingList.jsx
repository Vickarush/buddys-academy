import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Play, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function TrainingList() {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [mods, prog, results] = await Promise.all([
          base44.entities.TrainingModule.list('order', 50),
          base44.entities.TrainingProgress.filter({ user_email: u.email }),
          base44.entities.QuizResult.filter({ user_email: u.email }),
        ]);
        setModules(mods.filter(m => m.is_published));
        setProgress(prog);
        setQuizResults(results);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const getModuleStatus = (mod, idx) => {
    const p = progress.find(p => p.module_id === mod.id);
    if (p?.module_completed) return 'completed';
    if (p) return 'in_progress';
    if (idx === 0) return 'available';
    const prev = modules[idx - 1];
    const prevProg = progress.find(p => p.module_id === prev?.id);
    if (prevProg?.module_completed) return 'available';
    return 'locked';
  };

  const getQuizScore = (modId) => {
    const results = quizResults.filter(r => r.module_id === modId);
    if (!results.length) return null;
    return results.sort((a, b) => b.score - a.score)[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const completedCount = progress.filter(p => p.module_completed).length;
  const totalModules = modules.length;

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Your Training Path</p>
        <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Training Modules</h1>
        <p className="text-muted-foreground text-sm">{completedCount} of {totalModules} modules completed</p>
      </motion.div>

      {/* Progress bar */}
      <motion.div {...fadeUp(0.1)} className="bg-card border border-border rounded-2xl p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalModules > 0 ? (completedCount / totalModules) * 100 : 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Module List */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden sm:block" />
        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const status = getModuleStatus(mod, idx);
            const quiz = getQuizScore(mod.id);
            const locked = status === 'locked';
            return (
              <motion.div key={mod.id} {...fadeUp(0.15 + idx * 0.05)} className="sm:pl-12 relative">
                {/* Timeline dot */}
                <div className={`hidden sm:flex absolute left-3 top-5 w-4 h-4 rounded-full items-center justify-center -translate-x-1/2 z-10 ${
                  status === 'completed' ? 'bg-green-500' : status === 'available' || status === 'in_progress' ? 'bg-primary' : 'bg-border'
                }`}>
                  {status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                </div>

                {locked ? (
                  <div className="bg-card border border-border rounded-2xl p-5 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Module {mod.order}</span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Locked</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">{mod.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to={`/training/${mod.id}`} className="group block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        status === 'completed' ? 'bg-green-50' : 'bg-gold-pale'
                      }`}>
                        {status === 'completed'
                          ? <CheckCircle className="w-6 h-6 text-green-600" />
                          : <Play className="w-5 h-5 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Module {mod.order}</span>
                          {status === 'completed' && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Completed</span>}
                          {status === 'in_progress' && <span className="text-xs text-primary bg-gold-pale px-2 py-0.5 rounded-full">In Progress</span>}
                          {quiz?.passed && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Quiz: {quiz.score}%</span>}
                        </div>
                        <h3 className="font-semibold text-foreground text-sm truncate">{mod.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />{mod.estimated_minutes || 15} min
                          </span>
                          {mod.pass_mark && <span className="text-xs text-muted-foreground">Pass: {mod.pass_mark}%</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {modules.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Training modules are being prepared. Check back soon.</p>
        </div>
      )}
    </div>
  );
}