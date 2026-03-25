import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, CheckCircle, XCircle, RotateCcw, HelpCircle, Clock, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const FINAL_MODULE_ORDER = 9;
const PASS_SCORE = 12; // out of 15
const TOTAL_QUESTIONS = 15;
const PASS_PERCENT = 80;

export default function FinalAssessment({ module, user, onPassed }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro'); // 'intro' | 'quiz' | 'result'
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const startAssessment = async () => {
    setLoading(true);
    const qs = await base44.entities.QuizQuestion.filter({ module_id: module.id });
    setQuestions(qs.sort((a, b) => a.order - b.order));
    setAnswers({});
    setCurrentQ(0);
    setLoading(false);
    setPhase('quiz');
  };

  const handleAnswer = (idx) => {
    if (answers[currentQ] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      // Submit
      setSaving(true);
      const countedCorrect = questions.filter((q, i) => answers[i] === q.correct_answer_index).length;
      const correct = Math.min(countedCorrect, TOTAL_QUESTIONS);
      const scorePercent = Math.min(100, Math.round((correct / TOTAL_QUESTIONS) * 100));
      const didPass = correct >= PASS_SCORE;
      setScore(correct);
      setPassed(didPass);

      // Save to QuizResult
      await base44.entities.QuizResult.create({
        user_email: user.email,
        module_id: module.id,
        score: scorePercent,
        passed: didPass,
        answers: Object.values(answers),
      });

      // Save to TrainingProgress
      const existing = await base44.entities.TrainingProgress.filter({ user_email: user.email, module_id: module.id });
      const data = {
        user_email: user.email,
        module_id: module.id,
        completed_lessons: [],
        quiz_passed: didPass,
        module_completed: didPass,
        completed_at: didPass ? new Date().toISOString() : undefined,
      };
      if (existing[0]) {
        await base44.entities.TrainingProgress.update(existing[0].id, data);
      } else {
        await base44.entities.TrainingProgress.create(data);
      }

      setSaving(false);
      setPhase('result');
      if (didPass && onPassed) setTimeout(() => onPassed(), 500);
    }
  };

  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-foreground text-background p-5 md:p-10 flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-lg">
          {/* Icon + heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-background leading-tight mb-1">Final Assessment</h1>
            <p className="text-sm text-background/50">Module 9 of 9</p>
          </div>

          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: HelpCircle, label: '15 Questions' },
              { icon: Award, label: 'Pass mark: 80%' },
              { icon: Clock, label: '30 minutes' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-background/60 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Body text */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 space-y-4">
            <p className="text-sm text-background/80 leading-relaxed">
              This assessment tests everything you have learned across all 8 training modules. Read each scenario carefully and choose the best response. You need to score 80% or above (12 out of 15) to pass and unlock your certification.
            </p>
            <p className="text-sm text-background/60 leading-relaxed">
              <span className="text-primary font-semibold">Important:</span> You may retake this assessment once per day if you do not pass. Take your time — there is no time limit.
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-3 mb-8">
            {[
              'All 8 training modules completed',
              'Score 80% or above to pass',
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-background/70">{req}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={startAssessment}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-sm gap-2"
          >
            {loading ? 'Loading...' : <>Begin Final Assessment <ChevronRight className="w-4 h-4" /></>}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (phase === 'quiz' && questions.length > 0) {
    const question = questions[currentQ];
    const selected = answers[currentQ];

    return (
      <div className="min-h-screen bg-foreground text-background p-5 md:p-10 flex flex-col">
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8 pt-2">
            <span className="text-sm text-background/50 font-medium whitespace-nowrap">Question {currentQ + 1} of {questions.length}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
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
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              {/* Question */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Scenario</p>
                <p className="text-base font-medium text-background leading-relaxed">{question.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isAnswered = selected !== undefined;
                  const isCorrect = i === question.correct_answer_index;

                  let cardClass = 'border-white/15 bg-white/5 text-background/80 hover:border-primary/50 hover:bg-white/10';
                  if (isAnswered) {
                    if (isSelected && isCorrect) cardClass = 'border-green-500 bg-green-500/15 text-background';
                    else if (isSelected && !isCorrect) cardClass = 'border-red-500 bg-red-500/15 text-background';
                    else if (isCorrect) cardClass = 'border-green-500/40 bg-green-500/5 text-background/60';
                    else cardClass = 'border-white/10 bg-white/5 text-background/40';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ${cardClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isAnswered && isCorrect ? 'border-green-500 bg-green-500' :
                          isAnswered && isSelected ? 'border-red-500 bg-red-500' :
                          isSelected ? 'border-primary bg-primary' : 'border-white/30'
                        }`}>
                          {isAnswered && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-end mt-8">
            <Button
              onClick={handleNext}
              disabled={selected === undefined || saving}
              className="bg-primary hover:bg-primary/90 text-white gap-2 px-6"
            >
              {saving ? 'Saving...' : currentQ < questions.length - 1 ? <>Next Question <ChevronRight className="w-4 h-4" /></> : 'Submit Assessment'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-foreground text-background p-5 md:p-10 flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-lg text-center">
          {passed ? (
            <>
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-playfair text-3xl font-bold text-background mb-2">Final Assessment Passed!</h2>
              <p className="text-background/60 text-sm mb-1">You scored <span className="text-primary font-bold">{score} out of {TOTAL_QUESTIONS}</span></p>
              <p className="text-background/40 text-xs mb-8">Pass mark: 80% · Your score: {Math.min(100, Math.round((score / TOTAL_QUESTIONS) * 100))}%</p>
              <Button
                onClick={() => navigate('/certification')}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl gap-2"
              >
                Claim Your Certificate <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-background/40" />
              </div>
              <h2 className="font-playfair text-3xl font-bold text-background mb-2">Not quite this time</h2>
              <p className="text-background/60 text-sm mb-1">You scored <span className="font-bold text-background">{score} out of {TOTAL_QUESTIONS}</span> — you need {PASS_SCORE} to pass (80%)</p>
              <p className="text-background/40 text-xs mb-8">You can retake this assessment tomorrow.</p>
              <Button
                onClick={() => navigate('/training')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl"
              >
                Back to Training
              </Button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}