/* ═══════════════════════════════════════════════════
   FORENSIX AI — LIVE SIMULATION ENGINE
   File: js/simulation.js
   ═══════════════════════════════════════════════════ */

/* ── Canvas setup ────────────────────────────────── */
const canvas = document.getElementById('netCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ── Network nodes ───────────────────────────────── */
const nodes = [
  { x:0.50, y:0.50, label:'CORE SERVER',  type:'target',   compromised:false },
  { x:0.15, y:0.22, label:'FIREWALL',     type:'defense',  compromised:false },
  { x:0.85, y:0.22, label:'WEB SERVER',   type:'server',   compromised:false },
  { x:0.15, y:0.78, label:'DB SERVER',    type:'server',   compromised:false },
  { x:0.85, y:0.78, label:'MAIL SERVER',  type:'server',   compromised:false },
  { x:0.36, y:0.10, label:'CDN NODE',     type:'neutral',  compromised:false },
  { x:0.64, y:0.90, label:'BACKUP',       type:'neutral',  compromised:false },
  { x:0.04, y:0.50, label:'ATTACKER',     type:'attacker', compromised:false },
];

const edges = [[7,1],[1,0],[1,2],[1,3],[0,2],[0,3],[0,4],[2,5],[3,6]];

/* ── Scenario log sets ───────────────────────────── */
const scenarios = {
  sqli: [
    [['Initiating passive OSINT scan on target domain','info'],
     ['Google dorking: exposed /admin/config.bak found','warn'],
     ['Enumerating subdomains via SecurityTrails','ok']],
    [['Nmap scan: nmap -sV -O 192.168.1.100','info'],
     ['Open ports: 80/HTTP 443/HTTPS 3306/MySQL','warn'],
     ['Nikto: Apache 2.4.49 vulnerable (CVE-2021-41773)','err']],
    [["SQL Injection on /api/search?q=' OR 1=1--",'err'],
     ['Auth bypass SUCCESSFUL — session token captured','err'],
     ['Uploading PHP webshell to /uploads/shell.php','err']],
    [['Shell active: www-data @ 192.168.1.100','err'],
     ['Privesc via SUID python3 — root obtained','err'],
     ['Lateral movement: SSH bruteforce on .101-.105','err']],
    [['DB dump: mysqldump -u root customers > dump.sql','err'],
     ['Archiving: tar czf data.tar.gz dump.sql /etc/passwd','err'],
     ['Exfiltrating 4.7GB via DNS tunneling to C2','err']],
    [['Rootkit installed: /lib/x86_64-linux-gnu/libhax.so','err'],
     ['Backdoor user added: adduser --system sysupdate','err'],
     ['Logs wiped: echo "" > /var/log/auth.log && history -c','warn']],
  ],
  ransomware: [
    [['Scanning RDP endpoints on port 3389','info'],
     ['Password spray against AD accounts','warn'],
     ['Credential stuffing via leaked combo list','warn']],
    [['RDP brute-force successful: admin/Winter2023!','err'],
     ['Session established on 10.0.0.5 (Win Server 2019)','err'],
     ['Disabling Windows Defender via PowerShell','err']],
    [['Downloading LockBit 3.0 payload from C2','err'],
     ['Deploying ransomware to network shares','err'],
     ['Killing backup processes: vssadmin delete shadows','err']],
    [['Encrypting files with AES-256 + RSA-2048','err'],
     ['Lateral movement via PSExec to 14 servers','err'],
     ['Domain controller compromised — krbtgt reset','err']],
    [['Exfiltrating data before encryption (double extortion)','err'],
     ['Uploading 140GB to Tor-based leak site','err'],
     ['Ransom note dropped: README_LOCK.txt','err']],
    [['All 14 servers encrypted. Downtime initiated.','err'],
     ['Ransom demand: $2.4M in Monero','err'],
     ['Attacker exits — all traces removed','warn']],
  ],
  ddos: [
    [['Scanning for amplification vectors','info'],
     ['DNS open resolvers enumerated: 47,000 found','warn'],
     ['NTP monlist amplification factor: 556x','warn']],
    [['Botnet C2 activated — 600K nodes online','err'],
     ['Target identified: 203.0.113.50 (API gateway)','info'],
     ['Attack vectors selected: UDP flood + HTTP flood','warn']],
    [['Launching volumetric flood: 800 Gbps UDP','err'],
     ['Launching HTTP/2 rapid reset flood','err'],
     ['SYN cookies overwhelmed — connections dropping','err']],
    [['Target API response time: 45,000ms (timeout)','err'],
     ['CDN absorbing 60% — origin still overloaded','warn'],
     ['Service degraded — error rate: 94%','err']],
    [['Customer data unaffected — availability attack only','warn'],
     ['Competitor intelligence gathered during outage','warn'],
     ['4.5 hours downtime — $2.1M revenue lost','err']],
    [['Attack ceases — botnet stands down','ok'],
     ['DDoS mitigation vendor engaged post-incident','info'],
     ['Anycast routing implemented — lesson learned','ok']],
  ],
  apt: [
    [['Spear-phishing email crafted targeting CFO','warn'],
     ['LinkedIn footprinting: 12 employees identified','warn'],
     ['Typosquatted domain registered: acme-corp.net','err']],
    [['Phishing email sent with malicious OAuth link','err'],
     ['CFO clicks — OAuth token captured via C2','err'],
     ['M365 access granted — no MFA on legacy auth','err']],
    [['Accessing email, OneDrive, Teams silently','err'],
     ['Downloading M&A documents and financial reports','err'],
     ['Establishing persistent access via registered OAuth app','err']],
    [['Lateral movement to Azure AD via token theft','err'],
     ['Global admin role escalated silently','err'],
     ['3 new backdoor accounts created','err']],
    [['Exfiltrating IP via encrypted HTTPS to Azure Blob','err'],
     ['140GB of sensitive data transferred over 72hrs','err'],
     ['Data sold on dark web forum — $850K','err']],
    [['Persistence via scheduled tasks + OAuth apps','err'],
     ['C2 beacon every 5min — blends with legit traffic','warn'],
     ['Dwell time: 210 days before detection','err']],
  ]
};

let currentScenario = 'sqli';
let packets = [], simRunning = false, simInterval = null;
let phaseIdx = 0, logIdx = 0, simTick = 0;
let metrics  = { packets:0, hosts:0, data:0, conf:0 };
let logLines = [];

/* ── Scenario switcher ───────────────────────────── */
function setScenario(name) {
  if (simRunning) stopSim();
  currentScenario = name;
  document.querySelectorAll('.sel-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  logLines = [];
  renderTerm();
  nodes.forEach(n => n.compromised = false);
  metrics = { packets:0, hosts:0, data:0, conf:0 };
  updateMetrics();
  for (let i=0;i<6;i++) document.getElementById('ph'+i).classList.remove('active','done');
}

/* ── Terminal helpers ────────────────────────────── */
function renderTerm() {
  const el = document.getElementById('termContent');
  if (!logLines.length) {
    el.innerHTML = '<span class="log-line"><span class="log-muted">System ready. Select a scenario and launch simulation...</span></span>';
    return;
  }
  el.innerHTML = logLines.map(l =>
    `<span class="log-line"><span class="log-time">[${l.ts}]</span> <span class="log-${l.type}">${l.msg}</span></span>`
  ).join('');
  el.parentElement.scrollTop = el.parentElement.scrollHeight;
}

function addLog(msg, type='ok') {
  const d = new Date();
  const ts = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  logLines.push({ ts, msg, type });
  if (logLines.length > 60) logLines.shift();
  renderTerm();
}
function pad(n) { return String(n).padStart(2,'0'); }

/* ── Metric updater ──────────────────────────────── */
function updateMetrics() {
  document.getElementById('m-packets').textContent = metrics.packets.toLocaleString();
  document.getElementById('bar-packets').style.width = Math.min(metrics.packets/6000*100, 100) + '%';
  document.getElementById('m-hosts').textContent = metrics.hosts;
  document.getElementById('bar-hosts').style.width = (metrics.hosts/8*100) + '%';
  document.getElementById('m-data').textContent = metrics.data.toFixed(2);
  document.getElementById('bar-data').style.width = Math.min(metrics.data/10*100, 100) + '%';
  document.getElementById('m-conf').textContent = Math.floor(metrics.conf) + '%';
  document.getElementById('bar-conf').style.width = metrics.conf + '%';
}

/* ── Phase indicator ─────────────────────────────── */
function setPhase(idx) {
  for (let i=0; i<6; i++) {
    const el = document.getElementById('ph'+i);
    el.classList.remove('active','done');
    if (i < idx)  el.classList.add('done');
    if (i === idx) el.classList.add('active');
  }
}

/* ── Canvas draw loop ────────────────────────────── */
function drawNet() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Edges
  edges.forEach(([a,b]) => {
    const na = nodes[a], nb = nodes[b];
    ctx.strokeStyle = 'rgba(0,255,170,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(na.x*w, na.y*h);
    ctx.lineTo(nb.x*w, nb.y*h);
    ctx.stroke();
  });

  // Packets
  packets.forEach(p => {
    const na = nodes[p.from], nb = nodes[p.to];
    const px = na.x*w + (nb.x - na.x)*w*p.t;
    const py = na.y*h + (nb.y - na.y)*h*p.t;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI*2);
    ctx.fillStyle = p.malicious ? 'rgba(255,60,110,0.9)' : 'rgba(0,255,170,0.7)';
    ctx.shadowBlur = 14;
    ctx.shadowColor = p.malicious ? '#ff3c6e' : '#00ffaa';
    ctx.fill();
    ctx.shadowBlur = 0;
    p.t += 0.018;
  });
  packets = packets.filter(p => p.t < 1);

  // Nodes
  nodes.forEach(n => {
    const nx = n.x*w, ny = n.y*h;
    let color = 'rgba(0,255,170,0.8)', glow = '#00ffaa';
    if (n.type === 'attacker') { color = 'rgba(255,60,110,0.9)'; glow = '#ff3c6e'; }
    if (n.type === 'defense')  { color = 'rgba(0,170,255,0.8)';  glow = '#00aaff'; }
    if (n.compromised)         { color = 'rgba(255,60,110,0.9)'; glow = '#ff3c6e'; }

    const r = n.type === 'target' ? 16 : 10;
    ctx.shadowBlur = 20; ctx.shadowColor = glow;
    ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2);
    ctx.fillStyle = color.replace(/0\.[89]\)/, '0.12)');
    ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(200,230,210,0.75)';
    ctx.font = '9px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, nx, ny + r + 13);
  });
}

let animFrame;
(function renderLoop() { drawNet(); animFrame = requestAnimationFrame(renderLoop); })();

/* ── Simulation control ──────────────────────────── */
function startSim() {
  if (simRunning) return;
  simRunning = true;
  phaseIdx = 0; logIdx = 0; simTick = 0;
  metrics = { packets:0, hosts:0, data:0, conf:0 };
  nodes.forEach(n => n.compromised = false);
  logLines = [];
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('stopBtn').style.display  = 'inline-block';

  addLog('Forensix AI simulation engine v4.1 initialized', 'info');
  addLog(`Scenario loaded: ${currentScenario.toUpperCase()}`, 'info');
  addLog('Target: ACME Corp — 192.168.1.0/24', 'info');
  setPhase(0);

  const phases = scenarios[currentScenario];

  simInterval = setInterval(() => {
    simTick++;

    // Emit packets on canvas
    const fromIdx = phaseIdx >= 2 ? 7 : Math.floor(Math.random() * nodes.length);
    const toIdx   = Math.floor(Math.random() * (nodes.length - 1));
    packets.push({ from: fromIdx, to: toIdx, t: 0, malicious: phaseIdx >= 2 });
    if (phaseIdx >= 2) packets.push({ from: 7, to: 0, t: 0, malicious: true });

    // Log progression
    if (simTick % 3 === 0 && logIdx < phases[phaseIdx].length) {
      const [msg, type] = phases[phaseIdx][logIdx];
      addLog(msg, type);
      logIdx++;
    }

    // Advance phase
    if (simTick % 18 === 0 && phaseIdx < 5) {
      phaseIdx++;
      logIdx = 0;
      setPhase(phaseIdx);
    }

    // Compromise nodes
    if (phaseIdx >= 3 && Math.random() < 0.08) {
      const idx = Math.floor(Math.random() * (nodes.length - 1));
      nodes[idx].compromised = true;
      metrics.hosts = Math.min(metrics.hosts + 1, 8);
    }

    // Update metrics
    metrics.packets += Math.floor(Math.random() * 180 + 60);
    if (phaseIdx >= 4) metrics.data += Math.random() * 0.15;
    metrics.conf = Math.min(metrics.conf + 0.9, 99);
    updateMetrics();

    // End condition
    if (phaseIdx >= 5 && logIdx >= phases[5].length) {
      clearInterval(simInterval);
      simRunning = false;
      addLog('── Simulation complete. Forensic report generated. ──', 'ok');
      document.getElementById('stopBtn').style.display  = 'none';
      document.getElementById('startBtn').style.display = 'inline-block';
    }
  }, 550);
}

function stopSim() {
  clearInterval(simInterval);
  simRunning = false;
  document.getElementById('stopBtn').style.display  = 'none';
  document.getElementById('startBtn').style.display = 'inline-block';
  addLog('Simulation manually halted by operator', 'warn');
}
