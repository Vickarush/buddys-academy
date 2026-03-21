import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const agreementItems = [
  'I understand the standards expected of Buddys and I commit to upholding them on every assignment.',
  'I will follow all confidentiality rules and never share client information with unauthorised persons.',
  'I will submit honest, accurate proof on every visit and never fabricate or withhold evidence.',
  'I understand that breaking any of these rules can lead to my immediate removal from the Buddys programme.',
];

export default function Certification() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [certification, setCertification] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [agreementChecked, setAgreementChecked] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
      setLoading(false);
    }
    load();
  }, []);

  const completedModules = progress.filter(p => p.module_completed).length;
  const allComplete = completedModules === modules.length && modules.length > 0;
  const allAgreementsChecked = agreementChecked.length === agreementItems.length;

  const handleAgreementToggle = (i) => {
    setAgreementChecked(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleSubmitCertification = async () => {
    setSubmitting(true);
    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
      : 0;

    const data = {
      user_email: user.email,
      agreement_signed: true,
      agreement_signed_at: new Date().toISOString(),
      final_score: avgScore,
      is_certified: false, // Admin confirms certification
    };

    if (certification) {
      await base44.entities.CertificationStatus.update(certification.id, data);
      setCertification({ ...certification, ...data });
    } else {
      const created = await base44.entities.CertificationStatus.create(data);
      setCertification(created);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Final Step</p>
        <h1 className="font-playfair text-3xl font-bold text-foreground">Certification</h1>
      </motion.div>

      {/* Status Card */}
      {certification?.is_certified ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-foreground text-background rounded-2xl p-8 text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-background mb-2">Certified Buddy</h2>
          <p className="text-background/70 mb-1">You are now authorised to handle live TaskBuddys assignments.</p>
          {certification.certified_at && (
            <p className="text-xs text-background/40 mt-2">
              Certified on {new Date(certification.certified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </motion.div>
      ) : certification?.agreement_signed ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gold-pale border border-primary/20 rounded-2xl p-6 text-center mb-8">
          <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="font-playfair text-xl font-bold text-foreground mb-2">Agreement Submitted</h2>
          <p className="text-muted-foreground text-sm">Your training is complete and your agreement has been recorded. An admin will review and confirm your certification shortly.</p>
        </motion.div>
      ) : null}

      {/* Training Checklist */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Training Requirements
        </h2>
        <div className="space-y-3">
          {modules.map(mod => {
            const p = progress.find(p => p.module_id === mod.id);
            const done = p?.module_completed;
            const quizPassed = p?.quiz_passed;
            return (
              <div key={mod.id} className={`flex items-center gap-3 p-3 rounded-xl ${done ? 'bg-green-50' : 'bg-secondary/50'}`}>
                {done
                  ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  : <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Module {mod.order}: {mod.title}</p>
                  {quizPassed && <p className="text-xs text-green-600">Quiz passed</p>}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${done ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                  {done ? 'Done' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Agreement */}
      {!certification?.agreement_signed && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Buddy Agreement
          </h2>
          <p className="text-sm text-muted-foreground mb-5">Before certification, please confirm each statement below:</p>
          <div className="space-y-4">
            {agreementItems.map((item, i) => (
              <label key={i} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                agreementChecked.includes(i) ? 'border-primary bg-gold-pale' : 'border-border hover:border-primary/30'
              }`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                  agreementChecked.includes(i) ? 'bg-primary border-primary' : 'border-border'
                }`}>
                  {agreementChecked.includes(i) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={agreementChecked.includes(i)} onChange={() => handleAgreementToggle(i)} />
                <p className="text-sm text-foreground leading-relaxed">{item}</p>
              </label>
            ))}
          </div>

          {!allComplete && (
            <div className="mt-5 flex items-center gap-2 p-3 bg-secondary rounded-xl">
              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">You must complete all training modules before submitting your certification request.</p>
            </div>
          )}

          <Button
            onClick={handleSubmitCertification}
            disabled={!allComplete || !allAgreementsChecked || submitting}
            className="w-full mt-5 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Certification Request'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}