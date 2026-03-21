import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, X, Check, Play, List, FileText, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import QuizSection from '@/components/training/QuizSection';

export default function ModuleViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [mods, lessons, prog, results] = await Promise.all([
          base44.entities.TrainingModule.filter({ id: moduleId }),
          base44.entities.ModuleLesson.filter({ module_id: moduleId }),
          base44.entities.TrainingProgress.filter({ user_email: u.email, module_id: moduleId }),
          base44.entities.QuizResult.filter({ user_email: u.email, module_id: moduleId }),
        ]);
        setModule(mods[0]);
        setLessons(lessons.sort((a, b) => a.order - b.order));
        if (prog[0]) {
          setProgress(prog[0]);
          setCompletedLessons(prog[0].completed_lessons || []);
          setQuizPassed(prog[0].quiz_passed || false);
        }
        if (results.some(r => r.passed)) setQuizPassed(true);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [moduleId]);

  const currentLesson = lessons[currentLessonIdx];
  const allLessonsComplete = lessons.length > 0 && lessons.every(l => completedLessons.includes(l.id));

  const markLessonComplete = async (lessonId) => {
    if (completedLessons.includes(lessonId)) return;
    const updated = [...completedLessons, lessonId];
    setCompletedLessons(updated);
    const allDone = lessons.every(l => updated.includes(l.id));
    const data = {
      user_email: user.email,
      module_id: moduleId,
      completed_lessons: updated,
      module_completed: allDone && quizPassed,
    };
    if (progress) {
      await base44.entities.TrainingProgress.update(progress.id, data);
    } else {
      const created = await base44.entities.TrainingProgress.create(data);
      setProgress(created);
    }
  };

  const handleQuizPassed = async () => {
    setQuizPassed(true);
    const allDone = lessons.every(l => completedLessons.includes(l.id));
    const data = {
      user_email: user.email,
      module_id: moduleId,
      completed_lessons: completedLessons,
      quiz_passed: true,
      module_completed: allDone,
      completed_at: new Date().toISOString(),
    };
    if (progress) {
      await base44.entities.TrainingProgress.update(progress.id, data);
    } else {
      const created = await base44.entities.TrainingProgress.create(data);
      setProgress(created);
    }
    setShowQuiz(false);
  };

  const handleNext = () => {
    if (currentLesson) markLessonComplete(currentLesson.id);
    if (currentLessonIdx < lessons.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
    } else {
      setShowQuiz(true);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!module) {
    return <div className="p-8 text-center text-muted-foreground">Module not found.</div>;
  }

  if (showQuiz) {
    return (
      <QuizSection
        moduleId={moduleId}
        moduleName={module.title}
        passMark={module.pass_mark || 70}
        user={user}
        onPassed={handleQuizPassed}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <div className="sticky top-0 z-30 bg-card border-b border-border px-5 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/training')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Module {module.order}</p>
          <h1 className="font-semibold text-sm text-foreground truncate">{module.title}</h1>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          {currentLessonIdx + 1} / {lessons.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${lessons.length > 0 ? ((currentLessonIdx + 1) / lessons.length) * 100 : 0}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto">
        {/* Sidebar - Lesson List */}
        <aside className="hidden lg:block w-72 border-r border-border p-5 min-h-screen sticky top-16">
          <h2 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <List className="w-4 h-4" /> Lessons
          </h2>
          <div className="space-y-1.5">
            {lessons.map((l, i) => {
              const done = completedLessons.includes(l.id);
              const active = i === currentLessonIdx;
              return (
                <button
                  key={l.id}
                  onClick={() => setCurrentLessonIdx(i)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active ? 'bg-gold-pale text-primary font-medium' : done ? 'text-muted-foreground hover:bg-secondary' : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    done ? 'bg-green-100 text-green-600' : active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="truncate">{l.title}</span>
                </button>
              );
            })}
          </div>
          {allLessonsComplete && (
            <button
              onClick={() => setShowQuiz(true)}
              className={`w-full mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                quizPassed ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              {quizPassed ? 'Quiz Passed ✓' : 'Take Module Quiz'}
            </button>
          )}
        </aside>

        {/* Lesson Content */}
        <main className="flex-1 p-5 md:p-8">
          {currentLesson ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LessonContent lesson={currentLesson} />

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentLessonIdx(Math.max(0, currentLessonIdx - 1))}
                    disabled={currentLessonIdx === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-white gap-2">
                    {currentLessonIdx === lessons.length - 1 ? 'Go to Quiz' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No lessons in this module yet.</p>
              {allLessonsComplete && (
                <Button onClick={() => setShowQuiz(true)} className="mt-4 bg-primary text-white">Take Quiz</Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function LessonContent({ lesson }) {
  switch (lesson.lesson_type) {
    case 'video':
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Video Lesson</span>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>
          {lesson.video_url && (
            <div className="aspect-video bg-foreground rounded-2xl overflow-hidden mb-5">
              <iframe src={lesson.video_url} className="w-full h-full" allowFullScreen title={lesson.title} />
            </div>
          )}
          {lesson.content && <p className="text-foreground/80 leading-relaxed">{lesson.content}</p>}
        </div>
      );
    case 'checklist':
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Checklist</span>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>
          {lesson.content && <p className="text-muted-foreground mb-5 leading-relaxed">{lesson.content}</p>}
          <div className="space-y-3">
            {(lesson.checklist_items || []).map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gold-pale rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'do_dont':
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Do's & Don'ts</span>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>
          {lesson.content && <p className="text-muted-foreground mb-5">{lesson.content}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> Do
              </h3>
              <div className="space-y-2">
                {(lesson.do_items || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <X className="w-4 h-4" /> Don't
              </h3>
              <div className="space-y-2">
                {(lesson.dont_items || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {lesson.lesson_type === 'example' ? 'Real Example' : 'Lesson'}
            </span>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-5">{lesson.title}</h2>
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
            {lesson.content}
          </div>
        </div>
      );
  }
}