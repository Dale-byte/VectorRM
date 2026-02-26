export default function ControlGap({ percentage }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (p) => {
    if (p >= 70) return '#ef4444';
    if (p >= 40) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="12"
            fill="none"
            className="dark:stroke-slate-700"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getColor(percentage)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
          <span className="text-xs text-gray-500 dark:text-slate-400">Control Gap</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-4 text-center">
        Percentage of high-severity risks without adequate controls
      </p>
    </div>
  );
}
