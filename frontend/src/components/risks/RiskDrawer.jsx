import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatDate, getRiskColor, getRiskLabel } from '../../utils/utils';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function RiskDrawer({ risk, onClose, onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const { darkMode } = useTheme();

  useEffect(() => {
    loadRiskDetails();
  }, [risk.id]);

  const loadRiskDetails = async () => {
    setLoading(true);
    try {
      const result = await api.get(`/risks/${risk.id}`);
      setData(result);
      setFormData(result);
    } catch (error) {
      console.error('Failed to load risk details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/risks/${risk.id}`, formData);
      setEditing(false);
      onUpdate();
      loadRiskDetails();
    } catch (error) {
      console.error('Failed to update risk:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed right-0 top-0 h-full w-full max-w-2xl z-50 ${
          darkMode ? 'bg-slate-800' : 'bg-white'
        } shadow-2xl overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editing ? 'Edit Risk' : `Risk #${risk.id}`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {editing ? 'Modify risk details' : data?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : editing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Domain</label>
                    <input
                      type="text"
                      value={formData.domain || ''}
                      onChange={(e) => handleChange('domain', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Likelihood (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.likelihood || ''}
                      onChange={(e) => handleChange('likelihood', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Impact (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.impact || ''}
                      onChange={(e) => handleChange('impact', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Residual Likelihood</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.residual_likelihood || ''}
                      onChange={(e) => handleChange('residual_likelihood', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Residual Impact</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.residual_impact || ''}
                      onChange={(e) => handleChange('residual_impact', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Owner</label>
                    <input
                      type="text"
                      value={formData.owner || ''}
                      onChange={(e) => handleChange('owner', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="mitigating">Mitigating</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Review Date</label>
                  <input
                    type="date"
                    value={formData.review_date || ''}
                    onChange={(e) => handleChange('review_date', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Inherent Risk</p>
                    <p className={`text-2xl font-bold mt-1 risk-${getRiskColor(data.inherent_risk)}`}>
                      {data.inherent_risk} - {getRiskLabel(data.inherent_risk)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Residual Risk</p>
                    <p className={`text-2xl font-bold mt-1 risk-${getRiskColor(data.residual_risk)}`}>
                      {data.residual_risk}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                    {data.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Domain</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{data.domain}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Category</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{data.category || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Threat</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{data.threat || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Owner</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{data.owner || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">{data.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Review Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{formatDate(data.review_date)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Assessment Details</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-center">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Likelihood</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{data.likelihood}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-center">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Impact</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{data.impact}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-center">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Resid. Lik.</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{data.residual_likelihood}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-center">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Resid. Imp.</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{data.residual_impact}</p>
                    </div>
                  </div>
                </div>

                {data.auditLogs && data.auditLogs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Audit Trail</h3>
                    <div className="space-y-3">
                      {data.auditLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                          <div className="w-2 h-2 mt-2 rounded-full bg-primary-500"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{log.action}</span>
                              {log.details && <span className="text-gray-500 dark:text-slate-400"> - {log.details}</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {log.user_name} • {formatDate(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Edit Risk
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
