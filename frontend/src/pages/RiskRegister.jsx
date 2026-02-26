import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, getRiskColor, getRiskLabel, exportToCSV } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function RiskRegister() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'super_admin';
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ domain: '', status: '', search: '' });
  const [sort, setSort] = useState({ field: 'id', order: 'desc' });
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRisk, setEditRisk] = useState({});
  const [newRisk, setNewRisk] = useState({
    title: '', description: '', domain: '', category: '', likelihood: 3, impact: 3, owner: '', status: 'open', review_date: ''
  });

  const loadRisks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.domain) params.append('domain', filters.domain);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('sort', sort.field);
      params.append('order', sort.order);

      const result = await api.get(`/risks?${params}`);
      setRisks(result.data);
      setPagination(prev => ({ ...prev, ...result.pagination }));
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sort]);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.domain, filters.status, filters.search]);

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = async () => {
    const data = await api.get('/risks/export');
    exportToCSV(data, 'risk-register.csv');
  };

  const handleAddRisk = async () => {
    try {
      const result = await api.post('/risks', newRisk);
      setShowAddRisk(false);
      setNewRisk({ title: '', description: '', domain: '', category: '', likelihood: 3, impact: 3, owner: '', status: 'open', review_date: '' });
      loadRisks();
      if (result.success) {
        setToast({ type: 'success', message: 'Risk added successfully' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Failed to add risk:', error);
      setToast({ type: 'error', message: error.message || 'Failed to add risk' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEditRisk = async () => {
    try {
      await api.put(`/risks/${selectedRisk.id}`, editRisk);
      setIsEditing(false);
      setSelectedRisk(null);
      loadRisks();
      setToast({ type: 'success', message: 'Risk updated successfully' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to update risk:', error);
      setToast({ type: 'error', message: error.message || 'Failed to update risk' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteRisk = async () => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this risk?',
      onConfirm: async () => {
        try {
          await api.delete(`/risks/${selectedRisk.id}`);
          setSelectedRisk(null);
          loadRisks();
          setToast({ type: 'success', message: 'Risk deleted successfully' });
          setTimeout(() => setToast(null), 3000);
        } catch (error) {
          console.error('Failed to delete risk:', error);
          setToast({ type: 'error', message: error.message || 'Failed to delete risk' });
          setTimeout(() => setToast(null), 3000);
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'mitigating': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'monitoring': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getInherentRisk = (likelihood, impact) => {
    return likelihood * impact;
  };

  const getResidualRisk = (likelihood, impact) => {
    return likelihood * impact;
  };

  const getRiskCellColor = (score) => {
    if (score >= 15) return 'bg-red-500 text-white';
    if (score >= 10) return 'bg-orange-500 text-white';
    if (score >= 5) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${
              toast.type === 'success' ? 'bg-primary-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
            onClick={() => confirmDialog.onCancel()}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-gray-900 dark:text-white text-lg mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={confirmDialog.onCancel}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Risk Register</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage and track your organization's risks</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          {canEdit && (
          <button
            onClick={() => setShowAddRisk(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Risk
          </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search risks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filters.domain}
            onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Domains</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Application">Application</option>
            <option value="Data">Data</option>
            <option value="Cloud">Cloud</option>
            <option value="People">People</option>
            <option value="Process">Process</option>
            <option value="Vendor">Vendor</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="mitigating">Mitigating</option>
            <option value="monitoring">Monitoring</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Inherent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Residual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Review Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {risks.map((risk) => (
                  <motion.tr
                    key={risk.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    onClick={() => setSelectedRisk(risk)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">#{risk.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">{risk.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{risk.domain}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                        {getRiskLabel(risk.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getRiskCellColor(getInherentRisk(risk.likelihood, risk.impact))}`}>
                        {getInherentRisk(risk.likelihood, risk.impact)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getRiskCellColor(getResidualRisk(risk.residual_likelihood, risk.residual_impact))}`}>
                        {getResidualRisk(risk.residual_likelihood, risk.residual_impact)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{risk.owner}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{formatDate(risk.review_date)}</td>
                  </motion.tr>
                ))}
                {risks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                      No risks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddRisk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddRisk(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Risk</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newRisk.title}
                    onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={newRisk.description}
                    onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Domain</label>
                    <input
                      type="text"
                      value={newRisk.domain}
                      onChange={(e) => setNewRisk({ ...newRisk, domain: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={newRisk.category}
                      onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Likelihood (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRisk.likelihood}
                      onChange={(e) => setNewRisk({ ...newRisk, likelihood: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Impact (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRisk.impact}
                      onChange={(e) => setNewRisk({ ...newRisk, impact: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Owner</label>
                    <input
                      type="text"
                      value={newRisk.owner}
                      onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={newRisk.status}
                      onChange={(e) => setNewRisk({ ...newRisk, status: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Review Date</label>
                  <input
                    type="date"
                    value={newRisk.review_date}
                    onChange={(e) => setNewRisk({ ...newRisk, review_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddRisk(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRisk}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                  >
                    Add Risk
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRisk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRisk(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editRisk.title}
                      onChange={(e) => setEditRisk({ ...editRisk, title: e.target.value })}
                      className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-slate-600 focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedRisk.title}</h3>
                  )}
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">ID: #{selectedRisk.id}</p>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditRisk({}); }}
                        className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditRisk}
                        className="px-3 py-1 rounded-lg bg-primary-500 text-white text-sm"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {canEdit && (
                      <>
                      <button
                        onClick={() => { setIsEditing(true); setEditRisk({ ...selectedRisk }); }}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleDeleteRisk}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      </>
                      )}
                      <button
                        onClick={handleDeleteRisk}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setSelectedRisk(null); setIsEditing(false); setEditRisk({}); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Description</h4>
                  {isEditing ? (
                    <textarea
                      value={editRisk.description || ''}
                      onChange={(e) => setEditRisk({ ...editRisk, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{selectedRisk.description || 'No description provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Domain</h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editRisk.domain || ''}
                        onChange={(e) => setEditRisk({ ...editRisk, domain: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{selectedRisk.domain}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Category</h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editRisk.category || ''}
                        onChange={(e) => setEditRisk({ ...editRisk, category: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{selectedRisk.category || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Status</h4>
                    {isEditing ? (
                      <select
                        value={editRisk.status || 'open'}
                        onChange={(e) => setEditRisk({ ...editRisk, status: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                      >
                        <option value="open">Open</option>
                        <option value="mitigating">Mitigating</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="closed">Closed</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRisk.status)}`}>
                        {getRiskLabel(selectedRisk.status)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Owner</h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editRisk.owner || ''}
                        onChange={(e) => setEditRisk({ ...editRisk, owner: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{selectedRisk.owner || 'Unassigned'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Inherent Risk</h4>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">L:</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editRisk.likelihood || 1}
                            onChange={(e) => setEditRisk({ ...editRisk, likelihood: parseInt(e.target.value) })}
                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                          />
                          <label className="text-xs text-gray-500">I:</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editRisk.impact || 1}
                            onChange={(e) => setEditRisk({ ...editRisk, impact: parseInt(e.target.value) })}
                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold ${getRiskCellColor((editRisk.likelihood || 1) * (editRisk.impact || 1))}`}>
                          {(editRisk.likelihood || 1) * (editRisk.impact || 1)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${getRiskCellColor(selectedRisk.likelihood * selectedRisk.impact)} px-3 py-1 rounded-lg`}>
                          {selectedRisk.likelihood * selectedRisk.impact}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          <p>Likelihood: {selectedRisk.likelihood}</p>
                          <p>Impact: {selectedRisk.impact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Residual Risk</h4>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">L:</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editRisk.residual_likelihood || 1}
                            onChange={(e) => setEditRisk({ ...editRisk, residual_likelihood: parseInt(e.target.value) })}
                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                          />
                          <label className="text-xs text-gray-500">I:</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editRisk.residual_impact || 1}
                            onChange={(e) => setEditRisk({ ...editRisk, residual_impact: parseInt(e.target.value) })}
                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold ${getRiskCellColor((editRisk.residual_likelihood || 1) * (editRisk.residual_impact || 1))}`}>
                          {(editRisk.residual_likelihood || 1) * (editRisk.residual_impact || 1)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${getRiskCellColor(selectedRisk.residual_likelihood * selectedRisk.residual_impact)} px-3 py-1 rounded-lg`}>
                          {selectedRisk.residual_likelihood * selectedRisk.residual_impact}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          <p>Likelihood: {selectedRisk.residual_likelihood}</p>
                          <p>Impact: {selectedRisk.residual_impact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Review Date</h4>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editRisk.review_date || ''}
                        onChange={(e) => setEditRisk({ ...editRisk, review_date: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedRisk.review_date)}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Created</h4>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedRisk.created_at)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
