import { getDb } from '../services/database.js';

export default async function dashboardRoutes(fastify, options) {
  const db = getDb();

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const totalRisks = db.prepare('SELECT COUNT(*) as count FROM risks').get().count;
    const openRisks = db.prepare("SELECT COUNT(*) as count FROM risks WHERE status = 'open'").get().count;
    const mitigatingRisks = db.prepare("SELECT COUNT(*) as count FROM risks WHERE status = 'mitigating'").get().count;
    const monitoringRisks = db.prepare("SELECT COUNT(*) as count FROM risks WHERE status = 'monitoring'").get().count;
    const closedRisks = db.prepare("SELECT COUNT(*) as count FROM risks WHERE status = 'closed'").get().count;

    const highRisks = db.prepare('SELECT COUNT(*) as count FROM risks WHERE likelihood * impact >= 15').get().count;
    const mediumRisks = db.prepare('SELECT COUNT(*) as count FROM risks WHERE likelihood * impact >= 6 AND likelihood * impact < 15').get().count;
    const lowRisks = db.prepare('SELECT COUNT(*) as count FROM risks WHERE likelihood * impact < 6').get().count;

    const byDomain = db.prepare(`
      SELECT domain, COUNT(*) as count,
        SUM(CASE WHEN likelihood * impact >= 15 THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN likelihood * impact >= 6 AND likelihood * impact < 15 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN likelihood * impact < 6 THEN 1 ELSE 0 END) as low
      FROM risks GROUP BY domain ORDER BY count DESC
    `).all();

    const risksByCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM risks WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC
    `).all();

    const upcomingReviews = db.prepare(`
      SELECT id, title, domain, review_date FROM risks 
      WHERE review_date IS NOT NULL AND review_date <= date('now', '+30 days')
      ORDER BY review_date LIMIT 5
    `).all();

    const controlGap = Math.round((highRisks / totalRisks) * 100) || 0;

    const attackSurface = [
      { name: 'Endpoints', count: db.prepare("SELECT COUNT(*) as count FROM risks WHERE domain = 'Infrastructure'").get().count },
      { name: 'Applications', count: db.prepare("SELECT COUNT(*) as count FROM risks WHERE domain = 'Application'").get().count },
      { name: 'Cloud', count: db.prepare("SELECT COUNT(*) as count FROM risks WHERE domain = 'Cloud'").get().count },
      { name: 'Network', count: db.prepare("SELECT COUNT(*) as count FROM risks WHERE domain = 'Network'").get().count },
      { name: 'People', count: db.prepare("SELECT COUNT(*) as count FROM risks WHERE domain = 'People'").get().count },
      { name: 'Vendors', count: db.prepare("SELECT COUNT(*) as count FROM risks WHERE domain = 'Vendor'").get().count }
    ];

    const heatMap = [];
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 5; j++) {
        const count = db.prepare('SELECT COUNT(*) as count FROM risks WHERE likelihood = ? AND impact = ?').get(i, j).count;
        if (count > 0) {
          heatMap.push({ likelihood: i, impact: j, count });
        }
      }
    }

    return {
      summary: {
        totalRisks,
        openRisks,
        mitigatingRisks,
        monitoringRisks,
        closedRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        controlGap
      },
      byDomain,
      risksByCategory,
      upcomingReviews,
      attackSurface,
      heatMap
    };
  });
}
