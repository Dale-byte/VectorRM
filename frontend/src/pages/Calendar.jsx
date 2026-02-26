import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Calendar() {
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const result = await api.get('/risks?limit=1000');
      const risksData = result?.data || result || [];
      setRisks(risksData.filter(r => r.review_date));
    } catch (error) {
      console.error('Failed to load risks:', error);
      setRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, date: new Date(year, month, i) });
    }
    
    return days;
  };

  const getRisksForDate = (date) => {
    if (!date || !risks) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return risks.filter(r => r.review_date === dateStr);
  };

  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const days = getDaysInMonth(currentDate);
  const selectedRisks = selectedDate ? getRisksForDate(selectedDate) : [];
  const upcomingRisks = (risks || [])
    .filter(r => r.review_date && new Date(r.review_date) >= new Date())
    .sort((a, b) => new Date(a.review_date) - new Date(b.review_date))
    .slice(0, 6);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Risk review dates and upcoming assessments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getMonthName(currentDate)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                {day}
              </div>
            ))}
            
            {days.map((item, index) => {
              const dayRisks = getRisksForDate(item.date);
              const isToday = item.date && 
                item.date.getDate() === today.getDate() && 
                item.date.getMonth() === today.getMonth() && 
                item.date.getFullYear() === today.getFullYear();
              const isSelected = selectedDate && item.date && 
                item.date.getTime() === selectedDate.getTime();

              return (
                <button
                  key={index}
                  onClick={() => item.date && setSelectedDate(item.date)}
                  disabled={!item.date}
                  className={`
                    aspect-square p-1 rounded-lg flex flex-col items-center justify-start transition-all
                    ${!item.date ? 'invisible' : ''}
                    ${isToday ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800' : ''}
                    ${isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                  `}>
                    {item.day}
                  </span>
                  {dayRisks.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1 w-full items-center">
                      {dayRisks.slice(0, 4).map((risk, i) => {
                        const riskVal = risk.inherent_risk || risk.likelihood * risk.impact;
                        return (
                          <div 
                            key={i} 
                            className={`w-8 h-1.5 rounded-full ${
                              riskVal >= 15 ? 'bg-red-500' :
                              riskVal >= 6 ? 'bg-orange-400' : 'bg-green-500'
                            }`}
                          />
                        );
                      })}
                      {dayRisks.length > 4 && (
                        <span className="text-[8px] text-gray-500">+{dayRisks.length - 4}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDate 
              ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              : 'Select a date'}
          </h3>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : selectedRisks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-slate-400">No reviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedRisks.map((risk) => (
                <motion.div
                  key={risk.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate('/risks')}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{risk.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{risk.domain} • {risk.owner}</p>
                    </div>
                    <span className={`risk-badge risk-${(risk.inherent_risk || risk.likelihood * risk.impact) >= 15 ? 'high' : (risk.inherent_risk || risk.likelihood * risk.impact) >= 6 ? 'medium' : 'low'}`}>
                      {risk.inherent_risk || risk.likelihood * risk.impact}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingRisks.map((risk) => (
              <div 
                key={risk.id} 
                onClick={() => navigate('/risks')}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`risk-badge risk-${(risk.inherent_risk || risk.likelihood * risk.impact) >= 15 ? 'high' : (risk.inherent_risk || risk.likelihood * risk.impact) >= 6 ? 'medium' : 'low'}`}>
                    Risk #{risk.id}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(risk.review_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{risk.title}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{risk.domain}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
