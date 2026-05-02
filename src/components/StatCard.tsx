import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'red' | 'amber';
  description?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-950', border: 'border-blue-900', icon: 'bg-blue-600', text: 'text-blue-400' },
  emerald: { bg: 'bg-emerald-950', border: 'border-emerald-900', icon: 'bg-emerald-600', text: 'text-emerald-400' },
  red: { bg: 'bg-red-950', border: 'border-red-900', icon: 'bg-red-600', text: 'text-red-400' },
  amber: { bg: 'bg-amber-950', border: 'border-amber-900', icon: 'bg-amber-600', text: 'text-amber-400' },
};

export default function StatCard({ label, value, icon: Icon, color, description }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 flex items-start gap-4`}>
      <div className={`${c.icon} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-0.5">{value}</p>
        {description && <p className={`text-xs mt-1 ${c.text}`}>{description}</p>}
      </div>
    </div>
  );
}
