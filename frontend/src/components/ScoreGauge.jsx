import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function ScoreGauge({ score, label, accent = '#2563eb', icon }) {
  const data = [{ name: label, value: score }];
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-green-600';
    if (val >= 60) return 'text-blue-600';
    if (val >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 animate-slide-up hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="text-slate-400">{icon}</div>}
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">{label}</p>
        </div>
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score || 0}
          <span className="text-lg text-slate-400">/100</span>
        </div>
      </div>
      <div className="h-40 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="75%"
            outerRadius="100%"
            startAngle={225}
            endAngle={-45}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar 
              dataKey="value" 
              fill={accent} 
              cornerRadius={15}
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score || 0}%
            </div>
          </div>
        </div>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${score || 0}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}dd)`
          }}
        />
      </div>
    </div>
  );
}

