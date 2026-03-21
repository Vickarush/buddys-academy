import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Save, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminModuleEditor() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const isNew = moduleId === 'new';

  const [module, setModule] = useState({ title: '', description: '', order: 1, is_published: false, is_locked: false, pass_mark: 70, estimated_minutes: 15 });
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [activeSection, setActiveSection] = useState('module');

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const [mods, lessonData, qData] = await Promise.all([
        base44.entities.TrainingModule.filter({ id: moduleId }),
        base44.entities.ModuleLesson.filter({ module_id: moduleId }),
        base44.entities.QuizQuestion.filter({ module_id: moduleId }),
      ]);
      if (mods[0]) setModule(mods[0]);
      setLessons(lessonData.sort((a, b) => a.order - b.order));
      setQuestions(qData.sort((a, b) => a.order - b.order));
      setLoading(false);
    }
    load();
  }, [moduleId, isNew]);

  const saveModule = async () => {
    setSaving(true);
    if (isNew) {
      const created = await base44.entities.TrainingModule.create(module);
      navigate(`/admin/modules/${created.id}`, { replace: true });
    } else {
      await base44.entities.TrainingModule.update(module.id, module);
    }
    setSaving(false);
  };

  const addLesson = async () => {
    const newLesson = { module_id: moduleId, title: 'New Lesson', lesson_type: 'text', content: '', order: lessons.length + 1 };
    const created = await base44.entities.ModuleLesson.create(newLesson);
    setLessons([...lessons, created]);
  };

  const updateLesson = (id, field, value) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const saveLesson = async (lesson) => {
    await base44.entities.ModuleLesson.update(lesson.id, lesson);
  };

  const deleteLesson = async (id) => {
    await base44.entities.ModuleLesson.delete(id);
    setLessons(lessons.filter(l => l.id !== id));
  };

  const addQuestion = async () => {
    const newQ = { module_id: moduleId, question: 'New question?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct_answer_index: 0, order: questions.length + 1 };
    const created = await base44.entities.QuizQuestion.create(newQ);
    setQuestions([...questions, created]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const saveQuestion = async (q) => {
    await base44.entities.QuizQuestion.update(q.id, q);
  };

  const deleteQuestion = async (id) => {
    await base44.entities.QuizQuestion.delete(id);
    setQuestions(questions.filter(q => q.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin')} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground">Admin · Modules</p>
          <h1 className="font-playfair text-2xl font-bold text-foreground">{isNew ? 'New Module' : module.title}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6 w-fit">
        {['module', 'lessons', 'quiz'].map(tab => (
          <button key={tab} onClick={() => setActiveSection(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeSection === tab ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'module' ? 'Settings' : tab === 'lessons' ? `Lessons (${lessons.length})` : `Quiz (${questions.length})`}
          </button>
        ))}
      </div>

      {/* Module Settings */}
      {activeSection === 'module' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Module Title</label>
                <Input value={module.title} onChange={e => setModule({ ...module, title: e.target.value })} placeholder="e.g. Professional Conduct" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Order</label>
                <Input type="number" value={module.order} onChange={e => setModule({ ...module, order: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Est. Duration (min)</label>
                <Input type="number" value={module.estimated_minutes} onChange={e => setModule({ ...module, estimated_minutes: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Pass Mark (%)</label>
                <Input type="number" value={module.pass_mark} onChange={e => setModule({ ...module, pass_mark: parseInt(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
              <Textarea value={module.description} onChange={e => setModule({ ...module, description: e.target.value })} rows={3} placeholder="Brief overview of this module..." />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => setModule({ ...module, is_published: !module.is_published })} className={`w-10 h-5 rounded-full transition-all ${module.is_published ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-0.5 ${module.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-foreground flex items-center gap-1">
                  {module.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {module.is_published ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>
          </div>
          <Button onClick={saveModule} disabled={saving} className="bg-primary text-white gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Module'}
          </Button>
        </motion.div>
      )}

      {/* Lessons */}
      {activeSection === 'lessons' && !isNew && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Lesson {i + 1}</span>
                <button onClick={() => deleteLesson(lesson.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Title</label>
                  <Input value={lesson.title} onChange={e => updateLesson(lesson.id, 'title', e.target.value)} onBlur={() => saveLesson(lesson)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Type</label>
                  <Select value={lesson.lesson_type} onValueChange={v => { updateLesson(lesson.id, 'lesson_type', v); saveLesson({ ...lesson, lesson_type: v }); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="do_dont">Do's & Don'ts</SelectItem>
                      <SelectItem value="example">Real Example</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {lesson.lesson_type === 'video' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Video URL</label>
                  <Input value={lesson.video_url || ''} onChange={e => updateLesson(lesson.id, 'video_url', e.target.value)} onBlur={() => saveLesson(lesson)} placeholder="YouTube embed URL..." />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Content</label>
                <Textarea value={lesson.content || ''} onChange={e => updateLesson(lesson.id, 'content', e.target.value)} onBlur={() => saveLesson(lesson)} rows={4} placeholder="Lesson content..." />
              </div>
            </div>
          ))}
          <Button onClick={addLesson} variant="outline" className="w-full border-dashed gap-2">
            <Plus className="w-4 h-4" /> Add Lesson
          </Button>
        </motion.div>
      )}

      {/* Quiz */}
      {activeSection === 'quiz' && !isNew && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Question {i + 1}</span>
                <button onClick={() => deleteQuestion(q.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Question</label>
                <Textarea value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)} onBlur={() => saveQuestion(q)} rows={2} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Options (click ★ to mark correct)</label>
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => { updateQuestion(q.id, 'correct_answer_index', oi); saveQuestion({ ...q, correct_answer_index: oi }); }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.correct_answer_index === oi ? 'border-primary bg-primary text-white' : 'border-border'}`}
                    >
                      {q.correct_answer_index === oi && <span className="text-xs">✓</span>}
                    </button>
                    <Input
                      value={opt}
                      onChange={e => {
                        const newOpts = [...q.options];
                        newOpts[oi] = e.target.value;
                        updateQuestion(q.id, 'options', newOpts);
                      }}
                      onBlur={() => saveQuestion(q)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Explanation (optional)</label>
                <Input value={q.explanation || ''} onChange={e => updateQuestion(q.id, 'explanation', e.target.value)} onBlur={() => saveQuestion(q)} placeholder="Why is this the correct answer?" />
              </div>
            </div>
          ))}
          <Button onClick={addQuestion} variant="outline" className="w-full border-dashed gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </motion.div>
      )}

      {isNew && activeSection !== 'module' && (
        <div className="text-center py-10 text-muted-foreground text-sm">Save the module settings first to add lessons and quiz questions.</div>
      )}
    </div>
  );
}