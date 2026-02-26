import { getDb, saveDatabase } from '../services/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isAdmin = (role) => role === 'admin' || role === 'super_admin';

export default async function metaRoutes(fastify, options) {
  const db = getDb();

  fastify.get('/domains', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const domains = db.prepare('SELECT * FROM domains ORDER BY name').all();
    return domains;
  });

  fastify.post('/domains', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { name, description } = request.body;
    if (!name) {
      return reply.code(400).send({ error: 'Domain name is required' });
    }
    try {
      const result = db.prepare('INSERT INTO domains (name, description) VALUES (?, ?)').run(name, description || '');
      db.prepare('INSERT INTO audit_logs (action, user_name, details) VALUES (?, ?, ?)').run(
        'domain_created', 
        request.user.name, 
        `Created domain: ${name}`
      );
      return { id: result.lastInsertRowid, name, description: description || '' };
    } catch (err) {
      return reply.code(400).send({ error: 'Domain already exists or invalid data' });
    }
  });

  fastify.put('/domains/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { id } = request.params;
    const { name, description } = request.body;
    db.prepare('UPDATE domains SET name = ?, description = ? WHERE id = ?').run(name, description || '', id);
    db.prepare('INSERT INTO audit_logs (action, user_name, details) VALUES (?, ?, ?)').run(
      'domain_updated', 
      request.user.name, 
      `Updated domain ID: ${id} - ${name}`
    );
    return { id: parseInt(id), name, description: description || '' };
  });

  fastify.delete('/domains/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { id } = request.params;
    const domain = db.prepare('SELECT name FROM domains WHERE id = ?').get(id);
    db.prepare('DELETE FROM categories WHERE domain_id = ?').run(id);
    db.prepare('DELETE FROM domains WHERE id = ?').run(id);
    db.prepare('INSERT INTO audit_logs (action, user_name, details) VALUES (?, ?, ?)').run(
      'domain_deleted', 
      request.user.name, 
      `Deleted domain: ${domain?.name || 'ID: ' + id}`
    );
    return { success: true };
  });

  fastify.get('/categories', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const categories = db.prepare(`
      SELECT c.*, d.name as domain_name 
      FROM categories c 
      LEFT JOIN domains d ON c.domain_id = d.id 
      ORDER BY c.name
    `).all();
    return categories;
  });

  fastify.post('/categories', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { name, domain_id, description } = request.body;
    if (!name || !domain_id) {
      return reply.code(400).send({ error: 'Category name and domain are required' });
    }
    try {
      const result = db.prepare('INSERT INTO categories (name, domain_id, description) VALUES (?, ?, ?)').run(name, domain_id, description || '');
      db.prepare('INSERT INTO audit_logs (action, user_name, details) VALUES (?, ?, ?)').run(
        'category_created', 
        request.user.name, 
        `Created category: ${name}`
      );
      return { id: result.lastInsertRowid, name, domain_id, description: description || '' };
    } catch (err) {
      return reply.code(400).send({ error: 'Category already exists or invalid data' });
    }
  });

  fastify.put('/categories/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { id } = request.params;
    const { name, domain_id, description } = request.body;
    db.prepare('UPDATE categories SET name = ?, domain_id = ?, description = ? WHERE id = ?').run(name, domain_id, description || '', id);
    db.prepare('INSERT INTO audit_logs (action, user_name, details) VALUES (?, ?, ?)').run(
      'category_updated', 
      request.user.name, 
      `Updated category ID: ${id} - ${name}`
    );
    return { id: parseInt(id), name, domain_id, description: description || '' };
  });

  fastify.delete('/categories/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { id } = request.params;
    const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    db.prepare('INSERT INTO audit_logs (action, user_name, details) VALUES (?, ?, ?)').run(
      'category_deleted', 
      request.user.name, 
      `Deleted category: ${category?.name || 'ID: ' + id}`
    );
    return { success: true };
  });

  fastify.get('/audit-logs', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { page = 1, limit = 50, type, days = 90 } = request.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const cutoffStr = cutoffDate.toISOString();
    
    let query = 'SELECT al.*, r.title as risk_title FROM audit_logs al LEFT JOIN risks r ON al.risk_id = r.id WHERE al.timestamp >= ?';
    const params = [cutoffStr];
    
    if (type && type !== 'all') {
      if (type === 'risks') {
        query += ' AND al.risk_id IS NOT NULL';
      } else if (type === 'users') {
        query += ' AND (al.action LIKE "%user%" OR al.action = "created" OR al.action = "updated" OR al.action = "deleted")';
      } else if (type === 'groups') {
        query += ' AND al.action LIKE "%group%"';
      } else if (type === 'controls') {
        query += ' AND al.action LIKE "%control%"';
      }
    }
    
    query += ' ORDER BY al.timestamp DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const logs = db.prepare(query).all(...params);
    return logs;
  });

  fastify.get('/audit-logs/export', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    const { days = 30 } = request.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const cutoffStr = cutoffDate.toISOString();
    
    const logs = db.prepare(`
      SELECT al.*, r.title as risk_title 
      FROM audit_logs al 
      LEFT JOIN risks r ON al.risk_id = r.id 
      WHERE al.timestamp >= ?
      ORDER BY al.timestamp DESC
    `).all(cutoffStr);
    
    const txtContent = logs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      return `[${timestamp}] ${log.action} - User: ${log.user_name || 'System'} | ${log.details || ''}${log.risk_title ? ` | Risk: ${log.risk_title}` : ''}`;
    }).join('\n');
    
    reply.header('Content-Type', 'text/plain');
    reply.header('Content-Disposition', `attachment; filename="audit-trail-${new Date().toISOString().split('T')[0]}.txt"`);
    return txtContent;
  });

  fastify.get('/backup', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    
    const dbPath = path.join(__dirname, '../../db/risks.db');
    const data = fs.readFileSync(dbPath);
    
    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="vectorm-backup-${new Date().toISOString().split('T')[0]}.db"`);
    return data;
  });
}
