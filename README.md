Forensix-AI
Digital Cyber Crime Reconstruction

A browser-based educational platform that visually demonstrates how cyber
attacks are carried out, analyzed, and understood. Built entirely with
vanilla HTML, CSS, and JavaScript — no frameworks, no backend, no install.
 
 
IDEA
----
The goal is to make cybersecurity education interactive and visual. Instead
of reading about attacks in theory, users can watch a simulated attack unfold
in real-time across an animated network, explore historical breach data through
charts, track global threats on a live-style world map, and study detailed
case files of real-world cyber incidents.
 
 
WHAT IT DOES
------------
- Simulates 4 attack types (SQL Injection, Ransomware, Phishing, DDoS)
  step by step through a 6-phase kill chain with a live terminal log
- Shows company attack history through charts and an incident timeline
- Displays an animated global threat map with attack arcs between cities
- Provides a searchable archive of 7 major real-world cyber attacks with
  kill chain breakdowns, impact data, and mitigation lessons
 
 
TECH USED
---------
- HTML5          — page structure and canvas elements
- CSS3           — animations, custom properties, grid/flexbox layout
- JavaScript     — simulation engine, DOM logic, canvas rendering
- Canvas API     — network topology visualizer and world threat map
- Chart.js       — history charts (line, doughnut, stacked bar)
- Google Fonts   — Orbitron, Share Tech Mono, Rajdhani
 
 
FILES
-----
index.html        main page
css/style.css     all styling and animations
js/data.js        attack scripts and archive case data
js/main.js        loader, cursor, clock, counters, particles
js/simulation.js  network canvas and attack simulation engine
js/charts.js      Chart.js history visualizations
js/archive.js     archive list, search, and detail panel
js/threatmap.js   animated world map with attack arcs
 
 
HOW TO RUN
----------
Open index.html in any modern browser. No setup needed.
 
 
PURPOSE
-------
Educational and research use only. No real attacks are performed.
Understanding how attacks work is the first step in defending against them.
 

