/* ═══════════════════════════════════════════════════
   FORENSIX AI — LIVE GLOBAL THREAT MAP
   File: js/threatmap.js
   ═══════════════════════════════════════════════════
   Renders an animated threat map using Canvas2D.
   Shows randomised attack arcs from origin cities
   to target cities with colour-coded attack types.
*/

(function () {
  const mc  = document.getElementById('threatMapCanvas');
  const mctx = mc.getContext('2d');

  function resizeMap() {
    mc.width  = mc.offsetWidth;
    mc.height = mc.offsetHeight || 420;
  }
  resizeMap();
  window.addEventListener('resize', resizeMap);

  /* ── City coordinate data (normalised 0–1) ─────── */
  const cities = [
    { name:'Moscow',        x:0.60, y:0.24 },
    { name:'Beijing',       x:0.78, y:0.28 },
    { name:'Pyongyang',     x:0.82, y:0.25 },
    { name:'Bucharest',     x:0.56, y:0.24 },
    { name:'Lagos',         x:0.50, y:0.48 },
    { name:'Tehran',        x:0.63, y:0.30 },
    { name:'São Paulo',     x:0.31, y:0.65 },
    { name:'New York',      x:0.18, y:0.28 },
    { name:'London',        x:0.46, y:0.21 },
    { name:'Berlin',        x:0.52, y:0.21 },
    { name:'Paris',         x:0.48, y:0.22 },
    { name:'Tokyo',         x:0.84, y:0.28 },
    { name:'Sydney',        x:0.87, y:0.74 },
    { name:'Mumbai',        x:0.69, y:0.38 },
    { name:'Toronto',       x:0.16, y:0.27 },
    { name:'Singapore',     x:0.79, y:0.47 },
    { name:'Johannesburg',  x:0.55, y:0.62 },
    { name:'Dubai',         x:0.65, y:0.35 },
    { name:'Chicago',       x:0.16, y:0.29 },
    { name:'Seoul',         x:0.83, y:0.26 },
  ];

  /* ── Attack type colours ───────────────────────── */
  const attackTypes = [
    { label:'RANSOMWARE',   color:'#ff3c6e' },
    { label:'PHISHING',     color:'#ffcc00' },
    { label:'DDoS',         color:'#00aaff' },
    { label:'SQL INJECTION',color:'#00ffaa' },
  ];

  /* ── Active arcs ───────────────────────────────── */
  let arcs = [];

  function spawnArc() {
    const fromIdx = Math.floor(Math.random() * cities.length);
    let toIdx     = Math.floor(Math.random() * cities.length);
    if (toIdx === fromIdx) toIdx = (fromIdx + 1) % cities.length;
    const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    arcs.push({
      from:    cities[fromIdx],
      to:      cities[toIdx],
      color:   type.color,
      label:   type.label,
      t:       0,
      speed:   0.004 + Math.random() * 0.004,
      trail:   [],
      done:    false,
    });
  }

  // Seed initial arcs
  for (let i = 0; i < 6; i++) {
    setTimeout(spawnArc, i * 400);
  }
  // Spawn new arcs on interval
  setInterval(() => {
    if (arcs.filter(a => !a.done).length < 12) spawnArc();
    // Remove finished arcs older than 3 seconds
    arcs = arcs.filter(a => !a.done || (a._doneAt && Date.now() - a._doneAt < 3000));
  }, 800);

  /* ── Quadratic Bezier helper ───────────────────── */
  function bezierPoint(from, to, t, w, h) {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - 0.18; // arc lift
    const x  = (1-t)*(1-t)*from.x*w + 2*(1-t)*t*mx*w + t*t*to.x*w;
    const y  = (1-t)*(1-t)*from.y*h + 2*(1-t)*t*my*h + t*t*to.y*h;
    return { x, y };
  }

  /* ── Draw world map (simple dot grid) ─────────── */
  function drawWorld(w, h) {
    // Background
    mctx.fillStyle = 'rgba(0,0,0,0.5)';
    mctx.fillRect(0, 0, w, h);

    // Latitude / longitude grid
    mctx.strokeStyle = 'rgba(0,255,170,0.04)';
    mctx.lineWidth   = 1;
    for (let i = 1; i < 8; i++) {
      // Horizontal
      mctx.beginPath();
      mctx.moveTo(0, (i/8)*h);
      mctx.lineTo(w, (i/8)*h);
      mctx.stroke();
    }
    for (let i = 1; i < 12; i++) {
      // Vertical
      mctx.beginPath();
      mctx.moveTo((i/12)*w, 0);
      mctx.lineTo((i/12)*w, h);
      mctx.stroke();
    }

    // City dots
    cities.forEach(c => {
      mctx.beginPath();
      mctx.arc(c.x*w, c.y*h, 3, 0, Math.PI*2);
      mctx.fillStyle = 'rgba(0,255,170,0.35)';
      mctx.shadowBlur = 6;
      mctx.shadowColor = '#00ffaa';
      mctx.fill();
      mctx.shadowBlur = 0;

      mctx.fillStyle = 'rgba(74,122,90,0.7)';
      mctx.font = '8px Share Tech Mono';
      mctx.textAlign = 'center';
      mctx.fillText(c.name, c.x*w, c.y*h - 7);
    });
  }

  /* ── Main render loop ──────────────────────────── */
  function frame() {
    const w = mc.width, h = mc.height;
    mctx.clearRect(0, 0, w, h);
    drawWorld(w, h);

    arcs.forEach(arc => {
      if (arc.done) {
        // Draw fading impact splash
        const { x, y } = bezierPoint(arc.from, arc.to, 1, w, h);
        const age = arc._doneAt ? (Date.now() - arc._doneAt) / 3000 : 0;
        mctx.beginPath();
        mctx.arc(x, y, 6 + age * 14, 0, Math.PI*2);
        mctx.strokeStyle = arc.color + Math.floor((1 - age) * 80).toString(16).padStart(2,'0');
        mctx.lineWidth = 1;
        mctx.stroke();
        return;
      }

      arc.t += arc.speed;
      if (arc.t >= 1) {
        arc.t = 1;
        arc.done = true;
        arc._doneAt = Date.now();
      }

      // Draw trail
      arc.trail.push(arc.t);
      if (arc.trail.length > 40) arc.trail.shift();

      for (let i = 1; i < arc.trail.length; i++) {
        const p0 = bezierPoint(arc.from, arc.to, arc.trail[i-1], w, h);
        const p1 = bezierPoint(arc.from, arc.to, arc.trail[i],   w, h);
        const alpha = i / arc.trail.length;
        mctx.beginPath();
        mctx.moveTo(p0.x, p0.y);
        mctx.lineTo(p1.x, p1.y);
        mctx.strokeStyle = arc.color + Math.floor(alpha * 200).toString(16).padStart(2,'0');
        mctx.lineWidth = 1.5;
        mctx.shadowBlur = alpha > 0.7 ? 8 : 0;
        mctx.shadowColor = arc.color;
        mctx.stroke();
        mctx.shadowBlur = 0;
      }

      // Head dot
      const head = bezierPoint(arc.from, arc.to, arc.t, w, h);
      mctx.beginPath();
      mctx.arc(head.x, head.y, 3, 0, Math.PI*2);
      mctx.fillStyle   = arc.color;
      mctx.shadowBlur  = 14;
      mctx.shadowColor = arc.color;
      mctx.fill();
      mctx.shadowBlur = 0;
    });

    requestAnimationFrame(frame);
  }

  frame();
})();
