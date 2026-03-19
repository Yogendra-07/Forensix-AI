/* ═══════════════════════════════════════════════════
   FORENSIX AI — ATTACK ARCHIVE UI
   File: js/archive.js
   Depends on: archive-data.js (loaded first)
   ═══════════════════════════════════════════════════ */

let archiveChart    = null;
let activeIdx       = 0;
let filteredIndices = attacks.map((_,i) => i); // all visible by default

/* ── Build the archive list sidebar ──────────────── */
function buildArchiveList(indices) {
  const container = document.getElementById('archiveList');
  container.innerHTML = '<div class="chart-label" style="padding:0 0 12px 0">SELECT INCIDENT</div>';

  if (!indices.length) {
    container.innerHTML += '<div style="font-family:Share Tech Mono;font-size:0.65rem;color:var(--muted);padding:20px 0;letter-spacing:2px">NO RESULTS FOUND</div>';
    return;
  }

  indices.forEach(i => {
    const a     = attacks[i];
    const sevCls = a.severity === 'CRITICAL' ? 'sev-critical' : a.severity === 'HIGH' ? 'sev-high' : 'sev-medium';
    const div   = document.createElement('div');
    div.className = 'archive-item' + (i === activeIdx ? ' active' : '');
    div.setAttribute('data-idx', i);
    div.innerHTML = `
      <div class="archive-year">${a.year}</div>
      <div class="archive-name">${a.name}</div>
      <div class="archive-type">${a.type}</div>
      <div class="severity-dot ${sevCls}"></div>
    `;
    div.addEventListener('click', () => selectAttack(i));
    container.appendChild(div);
  });
}

/* ── Filter / search ─────────────────────────────── */
function filterArchive(query) {
  const q   = (query || '').toLowerCase().trim();
  const sev = document.getElementById('archiveSeverity').value;

  filteredIndices = attacks.reduce((acc, a, i) => {
    const matchQ   = !q || a.name.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.year.includes(q);
    const matchSev = !sev || a.severity === sev;
    if (matchQ && matchSev) acc.push(i);
    return acc;
  }, []);

  buildArchiveList(filteredIndices);

  // If the currently active item is still visible, keep it; otherwise show first
  if (!filteredIndices.includes(activeIdx) && filteredIndices.length) {
    selectAttack(filteredIndices[0]);
  }
}

/* ── Render attack detail panel ──────────────────── */
function selectAttack(idx) {
  activeIdx = idx;
  const a   = attacks[idx];

  // Update sidebar active state
  document.querySelectorAll('.archive-item').forEach(el => {
    el.classList.toggle('active', Number(el.getAttribute('data-idx')) === idx);
  });

  const sevColor = a.severity === 'CRITICAL' ? 'var(--accent2)' : a.severity === 'HIGH' ? 'var(--warn)' : 'var(--accent3)';
  const detail   = document.getElementById('attackDetail');

  detail.innerHTML = `
    <div class="detail-title">${a.name}</div>
    <div class="detail-meta">
      <div class="detail-meta-item">YEAR: <strong>${a.year}</strong></div>
      <div class="detail-meta-item">TYPE: <strong>${a.type}</strong></div>
      <div class="detail-meta-item">ACTOR: <strong>${a.actor}</strong></div>
      <div class="detail-meta-item">SEVERITY: <strong style="color:${sevColor}">${a.severity}</strong></div>
      <div class="detail-meta-item">AFFECTED: <strong>${a.affected}</strong></div>
      <div class="detail-meta-item">DAMAGE: <strong>${a.damage}</strong></div>
    </div>

    <div class="detail-desc">${a.desc}</div>

    <div class="chart-label">ATTACK KILL CHAIN</div>
    <div class="attack-flow">
      ${a.flow.map((step, i) => `
        <div class="flow-step">
          <div class="flow-num">${String(i+1).padStart(2,'0')}</div>
          <div class="flow-label">${step}</div>
        </div>
      `).join('')}
    </div>

    <div class="impact-grid">
      ${a.impact.map((val, i) => `
        <div class="impact-card">
          <div class="impact-val" style="color:${a.impactColors[i]}">${val}</div>
          <div class="impact-label">KEY METRIC ${i+1}</div>
        </div>
      `).join('')}
    </div>

    <div class="chart-label">IMPACT DISTRIBUTION</div>
    <canvas id="archiveChart" style="max-height:190px;margin-bottom:24px"></canvas>

    <div class="lessons">
      <div class="lessons-title">// KEY LESSONS &amp; MITIGATIONS</div>
      ${a.lessons.map(l => `<div class="lesson-item">${l}</div>`).join('')}
    </div>
  `;

  /* Destroy old chart if exists */
  if (archiveChart) { archiveChart.destroy(); archiveChart = null; }

  archiveChart = new Chart(document.getElementById('archiveChart'), {
    type: 'bar',
    data: {
      labels: a.chartLabels,
      datasets: [{
        data: a.chartData,
        backgroundColor: a.chartLabels.map((_, i) =>
          ['rgba(255,60,110,0.75)','rgba(255,204,0,0.65)','rgba(0,170,255,0.65)','rgba(0,255,170,0.55)','rgba(168,85,247,0.65)'][i % 5]
        ),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(5,10,15,0.95)',
          borderColor: 'rgba(0,255,170,0.2)',
          borderWidth: 1,
          titleColor: '#00ffaa',
          bodyColor:  '#c8e6d0',
          titleFont: { family:'Orbitron', size:11 },
          bodyFont:  { family:'Share Tech Mono', size:10 },
          padding: 10,
        }
      },
      scales: {
        x: { ticks: { color:'#4a7a5a', font:{ family:'Share Tech Mono', size:9 } }, grid: { color:'rgba(0,255,170,0.04)' } },
        y: { ticks: { color:'#4a7a5a', font:{ family:'Share Tech Mono', size:9 } }, grid: { display: false } }
      }
    }
  });
}

/* ── Init ────────────────────────────────────────── */
buildArchiveList(filteredIndices);
selectAttack(0);
