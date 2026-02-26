<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>VectorRM</h1>
  <p style="text-align:center;"><strong>Enterprise IT Risk Management Platform</strong></p>
  <p style="text-align:center;">
    <img src="https://img.shields.io/badge/Frontend-React_18-blue" alt="React 18" />
    <img src="https://img.shields.io/badge/Backend-Fastify-black" alt="Fastify" />
    <img src="https://img.shields.io/badge/Database-SQLite-lightgrey" alt="SQLite" />
    <img src="https://img.shields.io/badge/Node-%3E%3D18-green" alt="Node >=18" />
    <img src="https://img.shields.io/badge/License-Private-red" alt="Private License" />
  </p>
  <p>
    VectorRM is a browser-based IT Risk Management platform engineered to provide structured risk visibility, assessment discipline, and audit defensibility.
    Built using React, Fastify, and SQLite, it delivers centralized risk governance, quantitative scoring, and compliance-aligned documentation — deployable locally with Node.js.
  </p>

  <h3>System Architecture</h3>
  <h4>Frontend — Port 5173</h4>
  <ul>
    <li>React 18</li>
    <li>Vite</li>
    <li>Tailwind CSS</li>
    <li>Framer Motion</li>
    <li>React Router</li>
  </ul>

  <h4>Backend — Port 3001</h4>
  <ul>
    <li>Fastify</li>
    <li>SQL.js (SQLite)</li>
    <li>JWT Authentication</li>
    <li>RESTful API</li>
  </ul>

  <h4>Functional Capabilities</h4>
  <ul>
    <li>Risk Register</li>
    <li>Full risk lifecycle management</li>
    <li>Ownership and accountability tracking</li>
    <li>Status workflow (Open → Mitigating → Monitoring → Closed)</li>
    <li>Inherent and residual risk scoring</li>
    <li>Domain and category filtering</li>
    <li>CSV export</li>
    <li>Risk Assessment Engine</li>
    <li>5×5 Likelihood × Impact matrix</li>
    <li>Automated score calculation</li>
    <li>Residual risk computation</li>
    <li>Visual heat map</li>
    <li>Domain-based trend analysis</li>
    <li>Governance Controls</li>
    <li>JWT-based authentication</li>
    <li>Role-based access control (Admin / Viewer)</li>
    <li>User and group management</li>
    <li>Comprehensive audit trail</li>
    <li>Exportable evidence logs</li>
    <li>One-click database backup and restore</li>
  </ul>

  <h4>Compliance Alignment</h4>
  <p>VectorRM supports structured alignment with:</p>
  <ul>
    <li>ISO 27001</li>
    <li>NIST 800-53</li>
    <li>CIS Controls</li>
    <li>SOC 2</li>
  </ul>

  <h3>Technology Stack</h3>
  <h4>Backend Dependencies</h4>
  <p>Requirements:</p>
  <ul>
    <li>Node.js v18+</li>
    <li>npm</li>
  </ul>
  <p>Packages:</p>
  <ul>
    <li>fastify</li>
    <li>@fastify/cors</li>
    <li>@fastify/jwt</li>
    <li>sql.js</li>
    <li>concurrently</li>
  </ul>

  <h4>Frontend Dependencies</h4>
  <p>Requirements:</p>
  <ul>
    <li>Node.js v18+</li>
    <li>npm</li>
  </ul>
  <p>Packages:</p>
  <ul>
    <li>react</li>
    <li>react-dom</li>
    <li>react-router-dom</li>
    <li>framer-motion</li>
    <li>tailwindcss</li>
    <li>vite</li>
    <li>html2canvas</li>
    <li>jspdf</li>
  </ul>

  <h3>Installation</h3>
  <ol>
    <li>
      <strong>Start Backend</strong><br>
      <code>cd backend</code><br>
      <code>npm install</code><br>
      <code>npm start</code>
    </li>
    <li>
      <strong>Start Frontend (Separate Terminal)</strong><br>
      <code>cd frontend</code><br>
      <code>npm install</code><br>
      <code>npm run dev</code>
    </li>
  </ol>

  <p>Application available at: <a href="http://localhost:5173">http://localhost:5173</a></p>

  <h3>Default Credentials</h3>
  <table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Email</td>
      <td>admin@company.com</td>
    </tr>
    <tr>
      <td>Password</td>
      <td>Password</td>
    </tr>
    <tr>
      <td>Role</td>
      <td>Super Admin</td>
    </tr>
  </table>

  <h3>Data Model</h3>
  <ul>
    <li>Users</li>
    <li>Groups and permissions</li>
    <li>Risks and assessments</li>
    <li>Domains and categories</li>
    <li>Audit logs</li>
    <li>Control mappings</li>
    <li>Security Controls</li>
    <li>JWT token authentication</li>
    <li>Role-based authorization</li>
    <li>Activity logging for audit traceability</li>
    <li>Restricted administrative operations</li>
  </ul>

  <h3>Platform Characteristics</h3>
  <ul>
    <li>Browser-based</li>
    <li>Locally deployable</li>
  </ul>
</body>
</html>
