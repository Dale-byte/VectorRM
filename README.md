<h1> VectorRM </h1>
<p align="center"> <strong>Enterprise IT Risk Management Platform</strong> </p> <p align="center"> <img src="https://img.shields.io/badge/Frontend-React_18-blue" /> <img src="https://img.shields.io/badge/Backend-Fastify-black" /> <img src="https://img.shields.io/badge/Database-SQLite-lightgrey" /> <img src="https://img.shields.io/badge/Node-%3E%3D18-green" /> <img src="https://img.shields.io/badge/License-Private-red" /> </p>

<h2> Executive Summary

VectorRM is a browser-based IT Risk Management platform engineered to provide structured risk visibility, assessment discipline, and audit defensibility.

Built using React, Fastify, and SQLite, it delivers centralized risk governance, quantitative scoring, and compliance-aligned documentation — deployable locally with Node.js. </h2>

System Architecture
<br> Frontend — Port 5173
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router

<br> Backend — Port 3001
- Fastify
- SQL.js (SQLite)
- JWT Authentication
- RESTful API

Functional Capabilities
- Risk Register
- Full risk lifecycle management
- Ownership and accountability tracking
- Status workflow (Open → Mitigating → Monitoring → Closed)
- Inherent and residual risk scoring
- Domain and category filtering
- CSV export
- Risk Assessment Engine
- 5×5 Likelihood × Impact matrix
- Automated score calculation
- Residual risk computation
- Visual heat map
- Domain-based trend analysis
- Governance Controls
- JWT-based authentication
- Role-based access control (Admin / Viewer)
- User and group management
- Comprehensive audit trail
- Exportable evidence logs
- One-click database backup and restore
- Compliance Alignment
- VectorRM supports structured alignment with:
    ISO 27001
    NIST 800-53
    CIS Controls
    SOC 2

<br> Technology Stack:
Backend Dependencies

Requirements

Node.js v18+

npm

Packages

fastify
@fastify/cors
@fastify/jwt
sql.js
concurrently
Frontend Dependencies

Requirements

Node.js v18+

npm

Packages

react
react-dom
react-router-dom
framer-motion
tailwindcss
vite
html2canvas
jspdf
Installation
1. Start Backend
cd backend
npm install
npm start
2. Start Frontend (Separate Terminal)
cd frontend
npm install
npm run dev

Application available at:

http://localhost:5173
Default Credentials
Field	Value
Email	admin@company.com

Password	Password
Role	Super Admin
Data Model

The SQLite database stores:

Users

Groups and permissions

Risks and assessments

Domains and categories

Audit logs

Control mappings

Security Controls

JWT token authentication

Role-based authorization

Activity logging for audit traceability

Restricted administrative operations

Platform Characteristics

Browser-based

Locally deployable

Minimal external dependencies

Requires only Node.js

<p align="center"> <strong>VectorRM</strong><br> Structured Risk Governance. Operational Clarity. Audit Readiness. </p>
