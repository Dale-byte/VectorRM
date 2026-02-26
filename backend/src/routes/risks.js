import { getDb } from '../services/database.js';

export default async function riskRoutes(fastify, options) {
  const db = getDb();

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { domain, status, search, page = 1, limit = 20, sort = 'id', order = 'desc' } = request.query;
    
    let query = 'SELECT * FROM risks WHERE 1=1';
    const params = [];

    if (domain) {
      query += ' AND domain = ?';
      params.push(domain);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR threat LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const allowedSorts = ['id', 'title', 'domain', 'likelihood', 'impact', 'status', 'review_date', 'created_at'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'id';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortCol} ${sortOrder}`;

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const total = db.prepare(countQuery).get(...params).total;

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const risks = db.prepare(query).all(...params);

    return {
      data: risks.map(r => ({
        ...r,
        inherent_risk: r.likelihood * r.impact,
        residual_risk: r.residual_likelihood * r.residual_impact
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  fastify.get('/domains', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const domains = db.prepare('SELECT DISTINCT domain FROM risks ORDER BY domain').all();
    return domains.map(d => d.domain);
  });

  fastify.get('/categories', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const categories = db.prepare('SELECT DISTINCT category FROM risks WHERE category IS NOT NULL ORDER BY category').all();
    return categories.map(c => c.category);
  });

  fastify.get('/export', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const risks = db.prepare('SELECT * FROM risks ORDER BY id').all();
    return risks.map(r => ({
      ...r,
      inherent_risk: r.likelihood * r.impact,
      residual_risk: r.residual_likelihood * r.residual_impact
    }));
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const risk = db.prepare('SELECT * FROM risks WHERE id = ?').get(id);
    
    if (!risk) {
      return reply.code(404).send({ error: 'Risk not found' });
    }

    const controls = db.prepare(`
      SELECT c.* FROM controls c
      JOIN risk_controls rc ON c.id = rc.control_id
      WHERE rc.risk_id = ?
    `).all(id);

    const auditLogs = db.prepare(`
      SELECT * FROM audit_logs WHERE risk_id = ? ORDER BY timestamp DESC LIMIT 20
    `).all(id);

    return {
      ...risk,
      inherent_risk: risk.likelihood * risk.impact,
      residual_risk: risk.residual_likelihood * risk.residual_impact,
      controls,
      auditLogs
    };
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role === 'viewer') {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const { title, description, domain, category, threat, likelihood, impact, residual_likelihood, residual_impact, owner, status, review_date } = request.body;

    if (!title) {
      return reply.code(400).send({ error: 'Title is required' });
    }

    try {
      db.prepare(`
        INSERT INTO risks (title, description, domain, category, threat, likelihood, impact, residual_likelihood, residual_impact, owner, status, review_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title, 
        description || '', 
        domain || '', 
        category || '', 
        threat || '', 
        likelihood || 1, 
        impact || 1, 
        residual_likelihood || 1, 
        residual_impact || 1, 
        owner || '', 
        status || 'open', 
        review_date || null
      );

      return { success: true, message: 'Risk added successfully' };
    } catch (err) {
      console.error('Error creating risk:', err);
      return reply.code(500).send({ error: 'Failed to create risk' });
    }
  });

  fastify.put('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role === 'viewer') {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const { id } = request.params;
    const { title, description, domain, category, threat, likelihood, impact, residual_likelihood, residual_impact, owner, status, review_date } = request.body;

    const existing = db.prepare('SELECT * FROM risks WHERE id = ?').get(id);
    if (!existing) {
      return reply.code(404).send({ error: 'Risk not found' });
    }

    const changes = [];
    const fields = ['title', 'description', 'domain', 'category', 'threat', 'likelihood', 'impact', 'residual_likelihood', 'residual_impact', 'owner', 'status', 'review_date'];
    
    for (const field of fields) {
      if (request.body[field] !== undefined && request.body[field] !== existing[field]) {
        changes.push(`${field}: ${existing[field]} -> ${request.body[field]}`);
      }
    }

    db.prepare(`
      UPDATE risks SET title = ?, description = ?, domain = ?, category = ?, threat = ?, likelihood = ?, impact = ?, residual_likelihood = ?, residual_impact = ?, owner = ?, status = ?, review_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(title, description, domain, category, threat, likelihood, impact, residual_likelihood, residual_impact, owner, status, review_date, id);

    if (changes.length > 0) {
      db.prepare(`
        INSERT INTO audit_logs (risk_id, action, user_id, user_name, details)
        VALUES (?, 'updated', ?, ?, ?)
      `).run(id, request.user.id, request.user.name, changes.join(', '));
    }

    const risk = db.prepare('SELECT * FROM risks WHERE id = ?').get(id);
    return { ...risk, inherent_risk: risk.likelihood * risk.impact, residual_risk: risk.residual_likelihood * risk.residual_impact };
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const { id } = request.params;
    db.prepare('DELETE FROM audit_logs WHERE risk_id = ?').run(id);
    db.prepare('DELETE FROM risk_controls WHERE risk_id = ?').run(id);
    db.prepare('DELETE FROM risks WHERE id = ?').run(id);

    return { success: true };
  });
}
