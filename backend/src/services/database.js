import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../db/risks.db');

let db;
let SQL;

export async function initDatabase() {
  console.log('Initializing database...');
  try {
    if (!SQL) {
      console.log('Loading SQL.js...');
      SQL = await initSqlJs();
    }

    console.log('Database path:', dbPath);
    if (fs.existsSync(dbPath)) {
      console.log('Loading existing database...');
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      console.log('Creating new database...');
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'viewer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        permissions TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS user_groups (
        user_id INTEGER,
        group_id INTEGER,
        PRIMARY KEY (user_id, group_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS risks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        domain TEXT NOT NULL,
        category TEXT,
        threat TEXT,
        likelihood INTEGER DEFAULT 1,
        impact INTEGER DEFAULT 1,
        residual_likelihood INTEGER DEFAULT 1,
        residual_impact INTEGER DEFAULT 1,
        owner TEXT,
        status TEXT DEFAULT 'open',
        review_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        risk_id INTEGER,
        action TEXT NOT NULL,
        user_id INTEGER,
        user_name TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (risk_id) REFERENCES risks(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS controls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        domain TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS risk_controls (
        risk_id INTEGER,
        control_id INTEGER,
        PRIMARY KEY (risk_id, control_id),
        FOREIGN KEY (risk_id) REFERENCES risks(id),
        FOREIGN KEY (control_id) REFERENCES controls(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS domains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        domain_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (domain_id) REFERENCES domains(id)
      )
    `);

    saveDatabase();

    const userResult = db.exec('SELECT COUNT(*) as count FROM users');
    const userCount = userResult.length > 0 ? userResult[0].values[0][0] : 0;
    console.log('User count:', userCount);
    
    if (userCount === 0) {
      console.log('Creating default admin...');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Password';
      const adminName = process.env.ADMIN_NAME || 'System Admin';
      db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [adminEmail, adminPassword, adminName, 'super_admin']);
      saveDatabase();
    }

    const groupResult = db.exec('SELECT COUNT(*) as count FROM groups');
    const groupCount = groupResult.length > 0 ? groupResult[0].values[0][0] : 0;
    console.log('Group count:', groupCount);
    
    if (groupCount === 0) {
      console.log('Creating default admin group...');
      db.run('INSERT INTO groups (name, description, permissions) VALUES (?, ?, ?)', ['Admin', 'Full admin rights', '["read","write","admin","export","reports","controls"]']);
      saveDatabase();
    }

    const riskCount = db.exec('SELECT COUNT(*) as count FROM risks')[0]?.values[0][0] || 0;
  if (riskCount === 0) {
    const sampleRisks = [
      ['Ransomware Attack', 'Potential ransomware infection across enterprise systems', 'Infrastructure', 'Cybersecurity', 'Malware', 4, 5, 2, 3, 'John Smith', 'open', '2026-03-15'],
      ['Data Breach - Customer Data', 'Unauthorized access to customer PII', 'Data', 'Compliance', 'Hacker', 3, 5, 1, 4, 'Sarah Johnson', 'mitigating', '2026-03-20'],
      ['Cloud Misconfiguration', 'Improperly configured cloud resources exposing data', 'Cloud', 'Configuration', 'Misconfiguration', 3, 4, 2, 2, 'Mike Chen', 'open', '2026-04-01'],
      ['Phishing Campaign Success', 'Employee falls victim to phishing attack', 'People', 'Social Engineering', 'Phishing', 4, 3, 2, 2, 'Lisa Brown', 'mitigating', '2026-03-10'],
      ['Third-Party Vendor Risk', 'Vendor security breach affects supply chain', 'Vendor', 'Supply Chain', 'Vendor Compromise', 3, 4, 2, 3, 'David Lee', 'open', '2026-04-15'],
      ['Insider Threat - Data Exfiltration', 'Malicious insider attempting to exfiltrate data', 'People', 'Insider Threat', 'Insider', 2, 5, 1, 4, 'John Smith', 'monitoring', '2026-03-25'],
      ['API Security Vulnerability', 'Exposed API endpoints without proper authentication', 'Application', 'API Security', 'Exploit', 3, 4, 1, 3, 'Mike Chen', 'mitigating', '2026-03-30'],
      ['Backup System Failure', 'Backup system fails during restore test', 'Infrastructure', 'Availability', 'System Failure', 2, 4, 1, 2, 'Sarah Johnson', 'open', '2026-04-05'],
      ['Compliance Violation - SOX', 'Non-compliance with SOX financial reporting', 'Process', 'Compliance', 'Audit Finding', 2, 5, 1, 3, 'Lisa Brown', 'monitoring', '2026-03-18'],
      ['DDoS Attack', 'Distributed denial of service attack on public-facing services', 'Infrastructure', 'Cybersecurity', 'DDoS', 3, 4, 2, 2, 'David Lee', 'mitigating', '2026-04-10'],
      ['Unpatched System Vulnerability', 'Critical vulnerability in unpatched server', 'Infrastructure', 'Patch Management', 'Exploit', 4, 4, 1, 2, 'Mike Chen', 'mitigating', '2026-03-12'],
      ['Lost Laptop - Unencrypted', 'Lost laptop with unencrypted sensitive data', 'People', 'Data Loss', 'Physical Theft', 3, 3, 1, 1, 'John Smith', 'closed', '2026-02-28']
    ];

    for (const risk of sampleRisks) {
      db.run(`INSERT INTO risks (title, description, domain, category, threat, likelihood, impact, residual_likelihood, residual_impact, owner, status, review_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, risk);
    }

    const sampleControls = [
      ['Endpoint Protection', 'Antivirus and anti-malware on all endpoints', 'Infrastructure', 'active'],
      ['MFA Enforcement', 'Multi-factor authentication for all users', 'Identity', 'active'],
      ['Data Encryption', 'Encryption at rest and in transit', 'Data', 'active'],
      ['Security Awareness Training', 'Annual phishing and security training', 'People', 'active'],
      ['Vulnerability Scanning', 'Weekly vulnerability scans', 'Infrastructure', 'active'],
      ['Incident Response Plan', 'Documented IR procedures', 'Process', 'active'],
      ['Access Review', 'Quarterly access reviews', 'Identity', 'active'],
      ['Backup & Recovery', 'Daily backups with monthly restore tests', 'Infrastructure', 'active']
    ];

    for (const control of sampleControls) {
      db.run('INSERT INTO controls (name, description, domain, status) VALUES (?, ?, ?, ?)', control);
    }

    for (let i = 1; i <= 12; i++) {
      db.run('INSERT INTO audit_logs (risk_id, action, user_name, details) VALUES (?, ?, ?, ?)', [i, 'created', 'System Admin', 'Risk register entry created']);
    }

    const groupCount = db.exec('SELECT COUNT(*) as count FROM groups')[0]?.values[0][0] || 0;
    if (groupCount === 0) {
      console.log('Creating default admin group...');
      db.run('INSERT INTO groups (name, description, permissions) VALUES (?, ?, ?)', ['Admin', 'Full admin rights', '["read","write","admin","export","reports","controls"]']);
    }

      const userCount = db.exec('SELECT COUNT(*) as count FROM users')[0]?.values[0][0] || 0;
      if (userCount > 0) {
        db.run('INSERT INTO user_groups (user_id, group_id) VALUES (1, 1)');
        db.run('INSERT INTO user_groups (user_id, group_id) VALUES (2, 2)');
        db.run('INSERT INTO user_groups (user_id, group_id) VALUES (3, 3)');
        db.run('INSERT INTO user_groups (user_id, group_id) VALUES (4, 1)');
        db.run('INSERT INTO user_groups (user_id, group_id) VALUES (4, 2)');
      }
    }

    const domainCount = db.exec('SELECT COUNT(*) as count FROM domains')[0]?.values[0][0] || 0;
    if (domainCount === 0) {
      const sampleDomains = [
        ['Infrastructure', 'IT infrastructure and hardware'],
        ['Data', 'Data security and privacy'],
        ['Cloud', 'Cloud services and configurations'],
        ['People', 'Human resource risks'],
        ['Vendor', 'Third-party vendor risks'],
        ['Application', 'Application security'],
        ['Process', 'Business process risks']
      ];
      for (const domain of sampleDomains) {
        db.run('INSERT INTO domains (name, description) VALUES (?, ?)', domain);
      }

      const sampleCategories = [
        ['Cybersecurity', 1, 'Cybersecurity threats and vulnerabilities'],
        ['Compliance', 2, 'Regulatory compliance'],
        ['Configuration', 3, 'System configuration issues'],
        ['Social Engineering', 4, 'Phishing and social attacks'],
        ['Supply Chain', 5, 'Vendor and supply chain risks'],
        ['API Security', 6, 'API vulnerabilities'],
        ['Availability', 1, 'System availability and uptime'],
        ['Data Loss', 4, 'Data loss prevention']
      ];
        for (const cat of sampleCategories) {
          db.run('INSERT INTO categories (name, domain_id, description) VALUES (?, ?, ?)', cat);
        }
      }
    } catch (err) {
      console.error('Database init error:', err);
      throw err;
    }

    saveDatabase();
    console.log('Database initialized successfully');
  }

  export function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = dirname(dbPath);
  if (!fs.existsSync(dir)) {
    console.log('Creating db directory...');
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log('Saving database to:', dbPath);
  fs.writeFileSync(dbPath, buffer);
}

export function getDb() {
  return {
    prepare: (sql) => ({
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          if (row.permissions && typeof row.permissions === 'string') {
            try { row.permissions = JSON.parse(row.permissions); } catch(e) {}
          }
          return row;
        }
        stmt.free();
        return undefined;
      },
      all: (...params) => {
        const results = [];
        const stmt = db.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          const row = stmt.getAsObject();
          if (row.permissions && typeof row.permissions === 'string') {
            try { row.permissions = JSON.parse(row.permissions); } catch(e) {}
          }
          results.push(row);
        }
        stmt.free();
        return results;
      },
      run: (...params) => {
        db.run(sql, params);
        saveDatabase();
        return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] };
      }
    }),
    exec: (sql) => {
      db.run(sql);
      saveDatabase();
    }
  };
}
