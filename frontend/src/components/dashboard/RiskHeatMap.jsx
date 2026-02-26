import { useMemo } from 'react';

export default function RiskHeatMap({ data }) {
  const heatData = useMemo(() => {
    const grid = [];
    for (let i = 5; i >= 1; i--) {
      const row = [];
      for (let j = 1; j <= 5; j++) {
        const cell = data.find(d => d.likelihood === j && d.impact === i);
        row.push({ likelihood: j, impact: i, count: cell?.count || 0 });
      }
      grid.push(row);
    }
    return grid;
  }, [data]);

  const getColor = (likelihood, impact) => {
    const score = likelihood * impact;
    if (score >= 15) return 'bg-red-500';
    if (score >= 6) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getTextColor = (likelihood, impact) => {
    const score = likelihood * impact;
    if (score >= 15) return 'text-red-600 dark:text-red-400';
    if (score >= 6) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Heat Map</h3>
      <div className="flex gap-2">
        <div className="flex flex-col justify-around py-4">
          {[5, 4, 3, 2, 1].map(i => (
            <span key={i} className="text-xs text-gray-500 dark:text-slate-400">Impact {i}</span>
          ))}
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {heatData.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-semibold
                    ${cell.count > 0 ? getColor(cell.likelihood, cell.impact) : 'bg-gray-100 dark:bg-slate-700'}
                    ${cell.count > 0 ? 'text-white' : 'text-gray-400 dark:text-slate-500'}
                    transition-all duration-200 hover:scale-105
                  `}
                  >
                  {cell.count > 0 ? cell.count : '-'}
                </div>
              ))
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className="text-xs text-gray-500 dark:text-slate-400">L{i}</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">Likelihood →</p>
        </div>
      </div>
    </div>
  );
}
