import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function CompleteProfileModal({ onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both your first and last name.');
      return;
    }
    setSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    await base44.auth.updateMe({ full_name: fullName });
    onComplete(fullName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Icon */}
        <div className="w-14 h-14 bg-gold-pale rounded-2xl flex items-center justify-center mx-auto mb-5">
          <User className="w-7 h-7 text-primary" />
        </div>

        <h2 className="font-playfair text-2xl font-bold text-foreground text-center mb-1">
          Welcome to Buddys Academy!
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Please enter your full name — this will appear on your certificate once you complete the programme.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              First Name
            </label>
            <Input
              placeholder="e.g. Jane"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Last Name
            </label>
            <Input
              placeholder="e.g. Smith"
              value={lastName}
              onChange={e => { setLastName(e.target.value); setError(''); }}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={saving}
            className="w-full py-3 font-bold rounded-xl mt-2"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}