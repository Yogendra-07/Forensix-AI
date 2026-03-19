/* ═══════════════════════════════════════════════════
   FORENSIX AI — HISTORY CHARTS
   File: js/charts.js
   ═══════════════════════════════════════════════════ */

/* ── Shared chart defaults ───────────────────────── */
const sharedOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        color: '#4a7a5a',
        font: { family: 'Share Tech Mono', size: 10 },
        boxWidth: 12,
        padding: 16,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(5,10,15,0.95)',
      borderColor: 'rgba(0,255,170,0.2)',
      borderWidth: 1,
      titleColor: '#00ffaa',
      bodyColor: '#c8e6d0',
      titleFont: { family: 'Orbitron', size: 11 },
      bodyFont:  { family: 'Share Tech Mono', size: 10 },
      padding: 12,
    }
  },
  scales: {
    x: {
      ticks: { color: '#4a7a5a', font: { family: 'Share Tech Mono', size: 9 } },
      grid:  { color: 'rgba(0,255,170,0.04)' }
    },
    y: {
      ticks: { color: '#4a7a5a', font: { family: 'Share Tech Mono', size: 9 } },
      grid:  { color: 'rgba(0,255,170,0.04)' }
    }
  }
};

/* ── 1. Timeline / Frequency line chart ──────────── */
new Chart(document.getElementById('timelineChart'), {
  type: 'line',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: '2023',
        data:  [3,5,2,7,4,8,6,9,5,11,7,12],
        borderColor: '#00ffaa',
        backgroundColor: 'rgba(0,255,170,0.05)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#00ffaa',
        pointBorderColor: '#050a0f',
        pointBorderWidth: 2,
      },
      {
        label: '2024',
        data:  [5,8,12,6,15,9,18,14,22,17,25,20],
        borderColor: '#ff3c6e',
        backgroundColor: 'rgba(255,60,110,0.05)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ff3c6e',
        pointBorderColor: '#050a0f',
        pointBorderWidth: 2,
      }
    ]
  },
  options: { ...sharedOptions }
});

/* ── 2. Attack vector doughnut ───────────────────── */
new Chart(document.getElementById('vectorChart'), {
  type: 'doughnut',
  data: {
    labels: ['SQL Injection','Phishing','Ransomware','DDoS','Zero-Day','MITM'],
    datasets: [{
      data: [28, 22, 18, 15, 10, 7],
      backgroundColor: [
        'rgba(255,60,110,0.8)',
        'rgba(255,204,0,0.8)',
        'rgba(0,170,255,0.8)',
        'rgba(0,255,170,0.7)',
        'rgba(255,107,53,0.8)',
        'rgba(168,85,247,0.8)',
      ],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#4a7a5a',
          font: { family: 'Share Tech Mono', size: 9 },
          boxWidth: 10,
          padding: 12,
        }
      },
      tooltip: sharedOptions.plugins.tooltip,
    }
  }
});

/* ── 3. Severity stacked bar ─────────────────────── */
new Chart(document.getElementById('severityChart'), {
  type: 'bar',
  data: {
    labels: ['2019','2020','2021','2022','2023','2024'],
    datasets: [
      { label:'CRITICAL', data:[2,3,5,4,7,9],   backgroundColor:'rgba(255,60,110,0.75)' },
      { label:'HIGH',     data:[4,5,6,8,10,13],  backgroundColor:'rgba(255,204,0,0.7)'   },
      { label:'MEDIUM',   data:[8,10,12,9,14,17], backgroundColor:'rgba(0,170,255,0.55)' },
    ]
  },
  options: {
    ...sharedOptions,
    plugins: { ...sharedOptions.plugins },
    scales: {
      x: { ...sharedOptions.scales.x, stacked: true },
      y: { ...sharedOptions.scales.y, stacked: true },
    }
  }
});

/* ── 4. Risk score radar / area chart ────────────── */
new Chart(document.getElementById('riskChart'), {
  type: 'line',
  data: {
    labels: ['Q1 2022','Q2 2022','Q3 2022','Q4 2022','Q1 2023','Q2 2023','Q3 2023','Q4 2023','Q1 2024','Q2 2024'],
    datasets: [{
      label: 'RISK SCORE',
      data:  [42, 55, 48, 62, 58, 74, 69, 82, 77, 91],
      borderColor: '#ff3c6e',
      backgroundColor: 'rgba(255,60,110,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#ff3c6e',
      pointBorderColor: '#050a0f',
      pointBorderWidth: 2,
    },{
      label: 'DETECTION RATE',
      data:  [60, 62, 65, 63, 70, 74, 78, 80, 85, 88],
      borderColor: '#00ffaa',
      backgroundColor: 'rgba(0,255,170,0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#00ffaa',
      pointBorderColor: '#050a0f',
      pointBorderWidth: 2,
    }]
  },
  options: { ...sharedOptions }
});
