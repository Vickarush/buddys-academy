import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

export default function DownloadRecordButton({ user, modules, progress, quizResults, certification }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const margin = 20;
      let y = 0;

      const gold = [200, 149, 42];
      const dark = [20, 20, 20];
      const mid = [80, 80, 80];
      const light = [150, 150, 150];
      const green = [22, 163, 74];

      // ── Header band ──
      doc.setFillColor(...gold);
      doc.rect(0, 0, W, 42, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Buddys Academy', margin, 18);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Training Completion Record', margin, 28);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 37);
      y = 55;

      // ── Trainee info ──
      doc.setTextColor(...dark);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Trainee Details', margin, y);
      y += 7;
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      doc.line(margin, y, W - margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...mid);
      doc.text('Name:', margin, y);
      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'bold');
      doc.text(user?.full_name || '—', margin + 22, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mid);
      doc.text('Email:', margin, y);
      doc.setTextColor(...dark);
      doc.text(user?.email || '—', margin + 22, y);
      y += 14;

      // ── Module results ──
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...dark);
      doc.text('Training Modules', margin, y);
      y += 7;
      doc.setDrawColor(...gold);
      doc.line(margin, y, W - margin, y);
      y += 6;

      const trainingModules = modules.filter(m => m.order !== 9);
      const finalModule = modules.find(m => m.order === 9);

      trainingModules.forEach((mod, idx) => {
        if (y > 265) { doc.addPage(); y = 20; }
        const prog = progress.find(p => p.module_id === mod.id);
        const done = prog?.module_completed;
        const quizPassed = prog?.quiz_passed;
        const bestResult = quizResults
          .filter(r => r.module_id === mod.id)
          .sort((a, b) => b.score - a.score)[0];

        const rowBg = idx % 2 === 0 ? [250, 250, 248] : [255, 255, 255];
        doc.setFillColor(...rowBg);
        doc.roundedRect(margin, y - 4, W - margin * 2, 11, 2, 2, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...dark);
        doc.text(`${mod.order}. ${mod.title}`, margin + 3, y + 3);

        const statusText = done ? 'Completed' : 'Incomplete';
        const statusColor = done ? green : [180, 180, 180];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...statusColor);
        doc.text(statusText, W - margin - 50, y + 3);

        if (bestResult) {
          doc.setTextColor(...mid);
          doc.setFont('helvetica', 'normal');
          doc.text(`Quiz: ${bestResult.score}%`, W - margin - 20, y + 3);
        }

        y += 12;
      });

      y += 4;

      // ── Final Assessment ──
      if (finalModule) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...dark);
        doc.text('Final Assessment', margin, y);
        y += 7;
        doc.setDrawColor(...gold);
        doc.line(margin, y, W - margin, y);
        y += 7;

        const finalProg = progress.find(p => p.module_id === finalModule.id);
        const finalResults = quizResults.filter(r => r.module_id === finalModule.id).sort((a, b) => b.score - a.score);
        const best = finalResults[0];
        const passed = finalProg?.quiz_passed;
        const scoreOutOf15 = best ? Math.min(15, Math.round((best.score / 100) * 15)) : null;

        doc.setFillColor(...(passed ? [240, 253, 244] : [254, 242, 242]));
        doc.roundedRect(margin, y - 3, W - margin * 2, 22, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...dark);
        doc.text('Module 9: Final Assessment', margin + 4, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...mid);
        if (best) {
          doc.text(`Score: ${scoreOutOf15}/15 correct (${Math.min(100, best.score)}%)`, margin + 4, y + 12);
          doc.text(`Attempts: ${finalResults.length}`, margin + 80, y + 12);
        } else {
          doc.text('Not yet taken', margin + 4, y + 12);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...(passed ? green : [220, 38, 38]));
        doc.text(passed ? 'PASSED' : 'NOT PASSED', W - margin - 25, y + 8);
        y += 30;
      }

      // ── Certificate section (if certified) ──
      if (certification?.is_certified) {
        if (y > 200) { doc.addPage(); y = 20; }

        // Gold certificate box
        doc.setFillColor(...gold);
        doc.roundedRect(margin, y, W - margin * 2, 60, 4, 4, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Certificate of Completion', W / 2, y + 16, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('This certifies that', W / 2, y + 26, { align: 'center' });

        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text(user?.full_name || '', W / 2, y + 36, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('has successfully completed the Buddys Academy Training Programme', W / 2, y + 44, { align: 'center' });
        doc.text('and is authorised to handle live TaskBuddys assignments.', W / 2, y + 50, { align: 'center' });

        if (certification.certified_at) {
          const dateStr = new Date(certification.certified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          doc.setFontSize(8);
          doc.text(`Certified on ${dateStr}`, W / 2, y + 57, { align: 'center' });
        }
        y += 68;
      }

      // ── Footer ──
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(...light);
        doc.text('Buddys Academy · Confidential Training Record', margin, 290);
        doc.text(`Page ${i} of ${pageCount}`, W - margin, 290, { align: 'right' });
      }

      const filename = `buddys-academy-record-${(user?.full_name || 'trainee').replace(/\s+/g, '-').toLowerCase()}.pdf`;
      doc.save(filename);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={generating}
      variant="outline"
      size="sm"
      className="gap-2 border-primary/30 text-primary hover:bg-gold-pale"
    >
      <Download className="w-4 h-4" />
      {generating ? 'Generating...' : 'Download Record'}
    </Button>
  );
}