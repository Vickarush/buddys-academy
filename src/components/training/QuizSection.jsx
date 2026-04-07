import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function QuizSection({ moduleId, moduleName, passMark, user, onPassed, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.QuizQuestion.filter({ module_id: moduleId })
      .then(qs => setQuestions(qs.sort((a, b) => a.order - b.order)))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleAnswer = (answerIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ]: answerIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSaving(true);
    const correct = questions.filter((q, i) => answers[i] === q.correct_answer_index).length;
    const scorePercent = Math.round((correct / questions.length) * 100);
    const passed = scorePercent >= passMark;
    setScore(scorePercent);
    setSubmitted(true);

    await base44.entities.QuizResult.create({
      user_email: user.email,
      module_id: moduleId,
      score: scorePercent,
      passed,
      answers: Object.values(answers),
    });
    setSaving(false);
    if (passed) setTimeout(() => onPassed(), 2000);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
    setScore(0);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-muted-foreground mb-4">No quiz questions for this module yet.</p>
        <Button onClick={onPassed} className="bg-primary text-white">Mark as Complete</Button>
      </div>
    );
  }

  const question = questions[currentQ];
  const passed = score >= passMark;

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground">Module Quiz</p>
            <h1 className="font-playfair text-xl font-bold text-foreground">{moduleName}</h1>
          </div>
        </div>

        {/* Results */}
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed
                ? <Award className="w-12 h-12 text-green-600" />
                : <XCircle className="w-12 h-12 text-red-500" />
              }
            </div>
            <h2 className="font-playfair text-3xl font-bold text-foreground mb-2">{score}%</h2>
            <p className={`text-lg font-semibold mb-2 ${passed ? 'text-green-600' : 'text-red-500'}`}>
              {passed ? 'Congratulations! You passed.' : 'Not quite — you need ' + passMark + '% to pass.'}
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              Pass mark: {passMark}% · You scored: {score}%
            </p>

            {/* Question review */}
            <div className="text-left space-y-4 mb-8">
              {questions.map((q, i) => {
                const correct = answers[i] === q.correct_answer_index;
                return (
                  <div key={q.id} className={`p-4 rounded-2xl border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                      {correct ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-medium text-sm text-foreground mb-2">{q.question}</p>
                        <p className="text-xs text-muted-foreground">Correct: {q.options[q.correct_answer_index]}</p>
                        {q.explanation && <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!passed && (
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            )}
            {passed && (
              <p className="text-sm text-muted-foreground">Redirecting you to the next module...</p>
            )}
          </motion.div>
        ) : (
          <>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-muted-foreground font-medium">{currentQ + 1} / {questions.length}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Question {currentQ + 1}</p>
                  <p className="font-semibold text-foreground text-lg leading-relaxed">{question.question}</p>
                </div>

                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    const selected = answers[currentQ] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-sm font-medium ${
                          selected
                            ? 'border-primary bg-gold-pale text-foreground'
                            : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-primary bg-primary' : 'border-border'
                          }`}>
                            {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          {opt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              {currentQ < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  disabled={answers[currentQ] === undefined}
                  className="bg-primary text-white gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={answers[currentQ] === undefined || saving}
                  className="bg-primary text-white"
                >
                  {saving ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}