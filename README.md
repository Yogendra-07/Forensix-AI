FORENSIX AI
DIGITAL CYBER CRIME RECONSTRUCTOR
===========

A penetration testing tool that attacks your own database and tells you
exactly what is vulnerable and how to fix it.


HOW IT WORKS
------------
1. User logs in
2. User enters their database credentials
3. Platform runs real attacks on that database
4. Live attack log streams to the screen as it happens
5. AI analyzes what happened and generates a security report
6. User downloads the report as a PDF


ATTACKS IT RUNS
---------------
- SQL Injection (auth bypass + data extraction)
- Privilege escalation
- Sensitive data exposure scan
- Broken access control
- Error-based information leakage


WHAT THE REPORT CONTAINS
-------------------------
- Risk score (0-100)
- Every vulnerability found
- What data was exposed
- How to fix each issue
- Full attack timeline


TECH USED
---------
Backend   — Python, FastAPI, WebSockets
Database  — PostgreSQL (platform) + MySQL (attack target)
AI        — Claude API
PDF       — WeasyPrint
Auth      — JWT tokens
Frontend  — HTML, CSS, JavaScript, Chart.js


FILES
-----
backend/
  main.py          API routes
  auth.py          Login and signup
  attacker/        One file per attack module
  ai/              Claude integration and PDF generation

frontend/
  login.html       Login page
  dashboard.html   Past audits
  audit.html       Run an attack
  report.html      View the report


IMPORTANT
---------
Users can only attack databases they own.
They must confirm this before any attack runs.
Target DB credentials are never stored — used once, then discarded.
