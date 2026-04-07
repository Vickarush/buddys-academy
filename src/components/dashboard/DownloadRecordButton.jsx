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
      doc.text(user?.display_name || user?.full_name || '—', margin + 22, y);
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

      // ── Certificate page (if certified) — full landscape A4 ──
      if (certification?.is_certified) {
        doc.addPage('a4', 'landscape');
        const CW = 297; // landscape width
        const CH = 210; // landscape height
        const cx = CW / 2;

        const cream = [254, 252, 245];
        const goldD = [160, 110, 10];
        const goldM = [200, 149, 42];
        const goldL = [230, 185, 80];
        const goldPale = [248, 236, 195];

        // Cream background
        doc.setFillColor(...cream);
        doc.rect(0, 0, CW, CH, 'F');

        // Outer border — thick gold
        doc.setDrawColor(...goldD);
        doc.setLineWidth(3.5);
        doc.rect(8, 8, CW - 16, CH - 16);

        // Inner border — thin gold
        doc.setDrawColor(...goldM);
        doc.setLineWidth(1);
        doc.rect(13, 13, CW - 26, CH - 26);

        // Corner ornament squares
        const corners = [[8,8],[CW-8,8],[8,CH-8],[CW-8,CH-8]];
        corners.forEach(([cx2, cy2]) => {
          doc.setFillColor(...goldM);
          doc.rect(cx2 - 4, cy2 - 4, 8, 8, 'F');
          doc.setFillColor(...cream);
          doc.rect(cx2 - 2, cy2 - 2, 4, 4, 'F');
        });

        // Top decorative band
        doc.setFillColor(...goldPale);
        doc.rect(13, 13, CW - 26, 22, 'F');
        doc.setFillColor(...goldD);
        doc.rect(13, 34, CW - 26, 1, 'F');

        // Academy name in band
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...goldD);
        doc.text('BUDDYS ACADEMY', cx, 27, { align: 'center', charSpace: 4 });

        // Decorative lines either side of title
        doc.setDrawColor(...goldM);
        doc.setLineWidth(0.5);
        doc.line(30, 27, cx - 60, 27);
        doc.line(cx + 60, 27, CW - 30, 27);

        // Bottom decorative band
        doc.setFillColor(...goldPale);
        doc.rect(13, CH - 35, CW - 26, 22, 'F');
        doc.setFillColor(...goldD);
        doc.rect(13, CH - 35, CW - 26, 1, 'F');

        // "CERTIFICATE OF ACHIEVEMENT" headline
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(...goldD);
        doc.text('CERTIFICATE OF ACHIEVEMENT', cx, 68, { align: 'center', charSpace: 2 });

        // Thin decorative rule under headline
        doc.setDrawColor(...goldL);
        doc.setLineWidth(0.8);
        const ruleLen = 110;
        doc.line(cx - ruleLen, 72, cx + ruleLen, 72);

        // "This is to certify that"
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(80, 70, 50);
        doc.text('This is to proudly certify that', cx, 88, { align: 'center' });

        // Recipient name — large & bold
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(...goldD);
        const certName = user?.display_name || user?.full_name || '';
        doc.text(certName, cx, 110, { align: 'center' });

        // Underline the name
        const nameWidth = doc.getTextWidth(certName);
        doc.setDrawColor(...goldM);
        doc.setLineWidth(0.7);
        doc.line(cx - nameWidth / 2, 113, cx + nameWidth / 2, 113);

        // Body text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(80, 70, 50);
        doc.text('has successfully completed all modules of the', cx, 126, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...goldD);
        doc.text('Buddys Academy Training Programme', cx, 136, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 90, 70);
        doc.text('and is fully authorised to handle live TaskBuddys assignments.', cx, 146, { align: 'center' });

        // Star / medal ornament row
        const stars = ['★', '✦', '★'];
        doc.setFontSize(14);
        doc.setTextColor(...goldM);
        stars.forEach((s, si) => doc.text(s, cx + (si - 1) * 14, 158, { align: 'center' }));

        // Date & ID in bottom band
        const certDate = certification.certified_at
          ? new Date(certification.certified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...goldD);
        doc.text(`Date Awarded: ${certDate}`, 30, CH - 20, { align: 'left' });
        doc.text('Authorised by Buddys Academy', CW - 30, CH - 20, { align: 'right' });

        // Centre seal placeholder circle
        doc.setDrawColor(...goldD);
        doc.setLineWidth(1.2);
        doc.circle(cx, CH - 21, 8);
        doc.setFillColor(...goldPale);
        doc.circle(cx, CH - 21, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(...goldD);
        doc.text('BA', cx, CH - 19, { align: 'center' });
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

      const filename = `buddys-academy-record-${(user?.display_name || user?.full_name || 'trainee').replace(/\s+/g, '-').toLowerCase()}.pdf`;
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