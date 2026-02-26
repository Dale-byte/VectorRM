export function getRiskColor(score) {
  if (score >= 15) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

export function getRiskLabel(score) {
  if (score >= 15) return 'Critical';
  if (score >= 6) return 'Medium';
  return 'Low';
}

export function calculateInherentRisk(likelihood, impact) {
  return likelihood * impact;
}

export function calculateResidualRisk(residualLikelihood, residualImpact) {
  return residualLikelihood * residualImpact;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function exportToCSV(data, filename = 'risks.csv') {
  if (!data || data.length === 0) return;

  const headers = ['ID', 'Title', 'Domain', 'Status', 'Inherent', 'Residual', 'Owner', 'Review Date'];

  const rows = [
    headers.join(','),
    ...data.map(row => [
      row.id,
      `"${(row.title || '').replace(/"/g, '""')}"`,
      row.domain || '',
      row.status || '',
      (row.likelihood || 0) * (row.impact || 0),
      (row.residual_likelihood || 0) * (row.residual_impact || 0),
      row.owner || '',
      row.review_date || ''
    ].join(','))
  ];

  const csvContent = rows.join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
