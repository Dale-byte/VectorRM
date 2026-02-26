export default function RiskTrending({ data }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risks by Domain</h3>
      <div className="space-y-4">
        {data.map((domain, index) => (
          <div key={domain.domain} className="flex items-center gap-4">
            <span className="w-28 text-sm font-medium text-gray-600 dark:text-slate-400 truncate">
              {domain.domain}
            </span>
            <div className="flex-1 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${(domain.high / domain.count) * 100}%` }}
              ></div>
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${(domain.medium / domain.count) * 100}%` }}
              ></div>
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(domain.low / domain.count) * 100}%` }}
              ></div>
            </div>
            <span className="w-8 text-right text-sm font-semibold text-gray-900 dark:text-white">
              {domain.count}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-500 dark:text-slate-400">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs text-gray-500 dark:text-slate-400">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500 dark:text-slate-400">Low</span>
        </div>
      </div>
    </div>
  );
}
