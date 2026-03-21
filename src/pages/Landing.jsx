import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Camera, FileText, AlertTriangle, Lock, Users, Award, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
});

const learnCards = [
  { icon: Shield, title: 'Professional Conduct', desc: 'Dress code, punctuality, calm behaviour, and how to represent TaskBuddys with dignity.' },
  { icon: Camera, title: 'Proof Collection', desc: 'How to take clear photos, record videos, and document evidence properly on every visit.' },
  { icon: FileText, title: 'Reporting Standards', desc: 'Writing factual, accurate updates that clients and admin can rely on without question.' },
  { icon: AlertTriangle, title: 'Safety & Escalation', desc: 'What to do when something feels wrong, and how to escalate correctly and quickly.' },
  { icon: Lock, title: 'Confidentiality', desc: 'Understanding what you must never share, accept, or do outside of your instructions.' },
  { icon: Users, title: 'Real Assignment Examples', desc: 'Walkthroughs of actual assignment types including property checks, wellness visits, and more.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-off-white font-inter">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-off-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-playfair font-bold text-sm">B</span>
            </div>
            <span className="font-playfair font-bold text-lg text-foreground">Buddys Academy</span>
          </div>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white transition-all">
              Log In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-5 text-center bg-gradient-to-b from-off-white via-gold-pale/30 to-off-white">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Award className="w-3.5 h-3.5" />
            For Approved Buddys Only
          </motion.div>
          <motion.h1 {...fadeUp(0.2)} className="font-playfair text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4">
            Welcome to<br />
            <span className="text-primary">Buddys Academy</span>
          </motion.h1>
          <motion.p {...fadeUp(0.3)} className="font-inter text-xl font-medium text-muted-foreground mb-3">
            Train. Learn. Get Certified.
          </motion.p>
          <motion.p {...fadeUp(0.4)} className="text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            This is where approved Buddys learn the standards, expectations, and reporting process required to represent TaskBuddys on the ground in Nigeria.
          </motion.p>
          <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                Start Training <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-2 border-foreground/20 text-foreground font-semibold px-8 py-3 rounded-xl hover:border-primary hover:text-primary transition-all">
                Log In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 px-5 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp(0)} className="w-12 h-0.5 bg-primary mx-auto mb-6" />
          <motion.h2 {...fadeUp(0.1)} className="font-playfair text-3xl md:text-4xl font-bold mb-6">
            Why This Training Matters
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-lg text-background/75 leading-relaxed max-w-3xl mx-auto">
            Nigerians living abroad rely on Buddys for truthful, respectful, proof-based support on the ground. When a client asks us to check on their property, their family, or their investment — they are trusting us with something deeply personal. Buddys are the face of TaskBuddys, and this training ensures every Buddy understands exactly what that responsibility means.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: '100%', label: 'Completion Required' },
              { stat: 'Pass Mark', label: 'Required for Certification' },
              { stat: 'Zero', label: 'Tolerance for Dishonesty' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="font-playfair text-2xl font-bold text-primary mb-1">{item.stat}</div>
                <div className="text-sm text-background/60">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What You Will Learn */}
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <div className="w-12 h-0.5 bg-primary mx-auto mb-5" />
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">What You Will Learn</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Eight structured modules covering everything a certified Buddy needs to know.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {learnCards.map((card, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-10 h-10 bg-gold-pale rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="py-20 px-5 bg-gradient-to-br from-gold-pale/40 via-off-white to-gold-pale/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp(0)}>
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Award className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-5">
            Earn Your Certification
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            Buddys must complete all training modules and pass every assessment before they are permitted to handle live assignments. Certification is not a formality — it is proof that you are ready to represent TaskBuddys with professionalism and integrity.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {['Complete All Modules', 'Pass All Quizzes', 'Sign the Agreement'].map((step, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-4">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{step}</span>
              </div>
            ))}
          </motion.div>
          <motion.div {...fadeUp(0.4)}>
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-3 rounded-xl shadow-lg shadow-primary/20">
                Begin Your Training
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background/60 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-playfair font-bold text-xs">B</span>
            </div>
            <span className="font-playfair font-bold text-sm text-background/80">Buddys Academy</span>
          </div>
          <p className="text-xs text-center">© 2026 TaskBuddys. All rights reserved. For approved Buddys only.</p>
        </div>
      </footer>
    </div>
  );
}