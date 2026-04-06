import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }
});

// ── Quiz Score Chart ──────────────────────────────────────────────
function QuizScoreChart({ modules, quizResults }) {
  const data = useMemo(() => {
    return modules.map(mod => {
      const results = quizResults.filter(r => r.module_id === mod.id);
      if (!results.length) return { name: `M${mod.order}`, score: null, passed: false };
      const best = results.sort((a, b) => b.score - a.score)[0];
      return {
        name: `M${mod.order}`,
        score: Math.min(100, best.score),
        passed: best.passed,
        fullTitle: `Module ${mod.order}: ${mod.title}`,
      };
    }).filter(d => d.score !== null);
  }, [modules, quizResults]);

  if (!data.length) return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
      Complete a quiz to see your scores here.
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-foreground mb-0.5">{d.fullTitle}</p>
        <p className={d.passed ? 'text-green-600 font-bold' : 'text-destructive font-bold'}>
          {d.score}% · {d.passed ? 'Passed' : 'Failed'}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="30%">
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={32} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
        <ReferenceLine y={70} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeWidth={1.5} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.passed ? '#16a34a' : '#f59e0b'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Activity Heatmap ──────────────────────────────────────────────
function ActivityHeatmap({ modules, progress, quizResults }) {
  // Build a status level per module: 0=locked, 1=available, 2=in-progress, 3=completed+quiz
  const cells = useMemo(() => {
    return modules.map(mod => {
      const prog = progress.find(p => p.module_id === mod.id);
      const hasQuizResult = quizResults.some(r => r.module_id === mod.id);
      let level = 0;
      if (prog?.module_completed && prog?.quiz_passed) level = 4;
      else if (prog?.module_completed) level = 3;
      else if (hasQuizResult) level = 2;
      else if (prog) level = 1;
      return { mod, level };
    });
  }, [modules, progress, quizResults]);

  const levelStyle = {
    0: { bg: 'bg-secondary', label: 'Not started' },
    1: { bg: 'bg-primary/20', label: 'Started' },
    2: { bg: 'bg-primary/45', label: 'Quiz attempted' },
    3: { bg: 'bg-primary/70', label: 'Completed' },
    4: { bg: 'bg-primary', label: 'Completed + Quiz passed' },
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {cells.map(({ mod, level }) => (
          <div key={mod.id} className="group relative">
            <div className={`w-9 h-9 rounded-lg ${levelStyle[level].bg} transition-transform group-hover:scale-110 cursor-default`} />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-foreground text-background text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                <p className="font-semibold">M{mod.order}: {mod.title}</p>
                <p className="text-background/60">{levelStyle[level].label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        {Object.entries(levelStyle).map(([lvl, { bg, label }]) => (
          <div key={lvl} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${bg}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export default function TrainingAnalytics({ modules, progress, quizResults }) {
  if (!modules.length) return null;

  const avgScore = quizResults.length
    ? Math.round(quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length)
    : null;

  const passRate = quizResults.length
    ? Math.round((quizResults.filter(r => r.passed).length / quizResults.length) * 100)
    : null;

  return (
    <motion.div {...fadeUp(0.25)} className="mt-8">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-5 h-5 text-primary" />
        <h2 className="font-playfair text-xl font-bold text-foreground">Your Analytics</h2>
      </div>

      {/* Summary pills */}
      {quizResults.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="bg-card border border-border rounded-xl px-4 py-2 text-sm">
            <span className="text-muted-foreground">Avg score </span>
            <span className="font-bold text-foreground">{avgScore}%</span>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-2 text-sm">
            <span className="text-muted-foreground">Pass rate </span>
            <span className="font-bold text-foreground">{passRate}%</span>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-2 text-sm">
            <span className="text-muted-foreground">Quizzes taken </span>
            <span className="font-bold text-foreground">{quizResults.length}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Quiz scores chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-semibold text-foreground mb-1">Quiz Scores by Module</p>
          <p className="text-xs text-muted-foreground mb-4">Best attempt per module · dashed line = pass mark (70%)</p>
          <QuizScoreChart modules={modules} quizResults={quizResults} />
        </div>

        {/* Activity heatmap */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-semibold text-foreground mb-1">Module Activity</p>
          <p className="text-xs text-muted-foreground mb-4">Hover a cell to see module details</p>
          <ActivityHeatmap modules={modules} progress={progress} quizResults={quizResults} />
        </div>
      </div>
    </motion.div>
  );
}