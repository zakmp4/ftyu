/* ==========================================================================
   AQUILA — Service coverage map + suburb lookup
   Self-contained SVG map. No tiles, no external libraries, works offline.

   Coordinates are a plain equirectangular projection of real lat/lng:
     x = (lng - 153.290) / 0.310 * 560
     y = (-27.840 - lat) / 0.565 * 1153
   The viewBox aspect (560 x 1153) matches true ground distance at this
   latitude — 30.4 km wide by 62.7 km tall — so nothing is stretched.
   ========================================================================== */
(function () {
  'use strict';

  var stage = document.getElementById('mapStage');
  if (!stage) return;

  var W = 560, H = 1153;

  /* ---------- Serviced areas ----------
     n = name, p = postcode, s = state, g = group, a = anchor label (shown when zoomed out) */
  var AREAS = [
    /* --- Gold Coast north & central --- */
    { n: 'Sanctuary Cove',    p: '4212', s: 'QLD', g: 'north', x: 136, y: 39,   r: 20 },
    { n: 'Hope Island',       p: '4212', s: 'QLD', g: 'north', x: 105, y: 45,   r: 26, a: 1 },
    { n: 'Paradise Point',    p: '4216', s: 'QLD', g: 'north', x: 186, y: 55,   r: 20 },
    { n: 'Oxenford',          p: '4210', s: 'QLD', g: 'north', x: 45,  y: 98,   r: 30 },
    { n: 'Helensvale',        p: '4212', s: 'QLD', g: 'north', x: 72,  y: 122,  r: 30, a: 1 },
    { n: 'Runaway Bay',       p: '4216', s: 'QLD', g: 'north', x: 190, y: 133,  r: 20 },
    { n: 'Pacific Pines',     p: '4211', s: 'QLD', g: 'north', x: 36,  y: 173,  r: 26 },
    { n: 'Biggera Waters',    p: '4216', s: 'QLD', g: 'north', x: 186, y: 190,  r: 18 },
    { n: 'Arundel',           p: '4214', s: 'QLD', g: 'north', x: 117, y: 198,  r: 24 },
    { n: 'Labrador',          p: '4215', s: 'QLD', g: 'north', x: 199, y: 214,  r: 20 },
    { n: 'Parkwood',          p: '4214', s: 'QLD', g: 'north', x: 135, y: 224,  r: 22 },
    { n: 'Southport',         p: '4215', s: 'QLD', g: 'north', x: 199, y: 261,  r: 24, a: 1 },
    { n: 'Main Beach',        p: '4217', s: 'QLD', g: 'north', x: 249, y: 280,  r: 16 },
    { n: 'Molendinar',        p: '4214', s: 'QLD', g: 'north', x: 135, y: 286,  r: 20 },
    { n: 'Nerang',            p: '4211', s: 'QLD', g: 'north', x: 81,  y: 312,  r: 32, a: 1 },
    { n: 'Ashmore',           p: '4214', s: 'QLD', g: 'north', x: 157, y: 316,  r: 20 },
    { n: 'Isle of Capri',     p: '4217', s: 'QLD', g: 'north', x: 231, y: 329,  r: 12 },
    { n: 'Surfers Paradise',  p: '4217', s: 'QLD', g: 'north', x: 253, y: 331,  r: 18, a: 1 },
    { n: 'Bundall',           p: '4217', s: 'QLD', g: 'north', x: 215, y: 339,  r: 18 },
    { n: 'Carrara',           p: '4211', s: 'QLD', g: 'north', x: 135, y: 367,  r: 26 },

    /* --- Gold Coast south --- */
    { n: 'Broadbeach Waters', p: '4218', s: 'QLD', g: 'south', x: 235, y: 388,  r: 20 },
    { n: 'Mermaid Waters',    p: '4218', s: 'QLD', g: 'south', x: 246, y: 414,  r: 20 },
    { n: 'Robina',            p: '4226', s: 'QLD', g: 'south', x: 186, y: 484,  r: 33, a: 1 },
    { n: 'Mudgeeraba',        p: '4213', s: 'QLD', g: 'south', x: 119, y: 488,  r: 37 },
    { n: 'Varsity Lakes',     p: '4227', s: 'QLD', g: 'south', x: 211, y: 504,  r: 23 },
    { n: 'Burleigh Heads',    p: '4220', s: 'QLD', g: 'south', x: 287, y: 520,  r: 25, a: 1 },
    { n: 'Tallebudgera',      p: '4228', s: 'QLD', g: 'south', x: 253, y: 571,  r: 30 },
    { n: 'Palm Beach',        p: '4221', s: 'QLD', g: 'south', x: 320, y: 571,  r: 22 },
    { n: 'Elanora',           p: '4221', s: 'QLD', g: 'south', x: 282, y: 602,  r: 23 },
    { n: 'Currumbin',         p: '4223', s: 'QLD', g: 'south', x: 349, y: 612,  r: 25 },
    { n: 'Tugun',             p: '4224', s: 'QLD', g: 'south', x: 367, y: 645,  r: 18 },
    { n: 'Coolangatta',       p: '4225', s: 'QLD', g: 'south', x: 443, y: 667,  r: 22, a: 1 },

    /* --- Tweed, NSW --- */
    { n: 'Tweed Heads',       p: '2485', s: 'NSW', g: 'tweed', x: 461, y: 694,  r: 23, a: 1 },
    { n: 'Banora Point',      p: '2486', s: 'NSW', g: 'tweed', x: 439, y: 761,  r: 25 },
    { n: 'Terranora',         p: '2486', s: 'NSW', g: 'tweed', x: 372, y: 767,  r: 30 },
    { n: 'Kingscliff',        p: '2487', s: 'NSW', g: 'tweed', x: 517, y: 849,  r: 22, a: 1 },
    { n: 'Casuarina',         p: '2487', s: 'NSW', g: 'tweed', x: 515, y: 918,  r: 20 },
    { n: 'Murwillumbah',      p: '2484', s: 'NSW', g: 'tweed', x: 191, y: 992,  r: 37, a: 1 },
    { n: 'Cabarita Beach',    p: '2488', s: 'NSW', g: 'tweed', x: 509, y: 1010, r: 20 },
    { n: 'Pottsville',        p: '2489', s: 'NSW', g: 'tweed', x: 495, y: 1094, r: 23, a: 1 }
  ];

  var GROUPS = [
    { id: 'all',   label: 'All areas' },
    { id: 'north', label: 'GC North &amp; Central' },
    { id: 'south', label: 'GC South' },
    { id: 'tweed', label: 'Tweed · NSW' }
  ];

  /* Local shorthand and alternative names that should still resolve */
  var ALIAS = {
    'broadbeach': 'Broadbeach Waters',
    'mermaidbeach': 'Mermaid Waters',
    'mermaid': 'Mermaid Waters',
    'tweed': 'Tweed Heads',
    'tweedheadssouth': 'Tweed Heads',
    'coolie': 'Coolangatta',
    'burleigh': 'Burleigh Heads',
    'burleighwaters': 'Burleigh Heads',
    'currumbinwaters': 'Currumbin',
    'currumbinvalley': 'Currumbin',
    'bogangar': 'Cabarita Beach',
    'murbah': 'Murwillumbah',
    'salt': 'Casuarina',
    'kingy': 'Kingscliff',
    'surfers': 'Surfers Paradise',
    'sp': 'Surfers Paradise',
    'thespit': 'Main Beach',
    'spit': 'Main Beach',
    'harbourtown': 'Biggera Waters',
    'capri': 'Isle of Capri',
    'sanctuary': 'Sanctuary Cove',
    'thebroadwater': 'Labrador',
    'gaven': 'Pacific Pines',
    'ashmorecity': 'Ashmore',
    'robinatown': 'Robina',
    'varsity': 'Varsity Lakes'
  };

  /* ---------- Geometry helpers ---------- */
  function rnd(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* Closed Catmull-Rom through points -> cubic bezier (organic suburb blobs) */
  function smoothClosed(pts) {
    var n = pts.length;
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' +
                 c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' +
                 p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d + 'Z';
  }

  function blobPath(cx, cy, r, seed) {
    var pts = [], n = 13;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var rr = r * (0.80 + 0.40 * rnd(seed * 7.3 + i * 2.1));
      pts.push([cx + Math.cos(a) * rr * 1.06, cy + Math.sin(a) * rr * 0.94]);
    }
    return smoothClosed(pts);
  }

  /* Mainland shore: Broadwater edge in the north, open coast from the Spit south */
  var COAST = [[186,0],[195,55],[202,122],[208,184],[220,224],[235,245],[249,276],
               [257,306],[262,367],[271,428],[289,490],[311,551],[352,612],[376,653],
               [473,669],[481,694],[497,735],[515,796],[529,857],[535,918],[533,979],
               [524,1041],[511,1102],[506,1153]];

  /* South Stradbroke Island, offshore of the Broadwater */
  var ISLAND = [[240,-40],[258,-40],[264,60],[266,130],[259,190],[251,224],
                [244,214],[249,150],[251,80],[242,10]];

  var BORDER = [[473,669],[379,714],[289,776],[199,837],[90,898],[0,939]];
  var RIVER  = [[481,694],[455,715],[425,735],[390,765],[350,800],[310,840],
                [270,880],[235,920],[210,955],[193,988]];

  function poly(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ',' + p[1]; }).join('');
  }

  /* ---------- Build the SVG ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  var svg = el('svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Map of Aquila Water Leak Detection service areas across the Gold Coast and Tweed'
  });

  var vp = el('g', { id: 'mapViewport' });
  svg.appendChild(vp);

  /* Ocean */
  vp.appendChild(el('rect', { x: -300, y: -300, width: W + 600, height: H + 600, fill: '#c9d8e6' }));

  /* Decorative swell out at sea */
  [[330,140],[400,330],[430,560],[560,760],[556,1030]].forEach(function (p) {
    vp.appendChild(el('path', { class: 'map-wave', d: 'M' + p[0] + ',' + p[1] + ' q 22,-10 44,0 t 44,0 t 44,0' }));
  });

  /* Mainland (everything west of the shore) */
  vp.appendChild(el('path', {
    class: 'map-land',
    d: 'M-300,-300 L186,-300 ' + poly(COAST).slice(1) + ' L506,' + (H + 300) + ' L-300,' + (H + 300) + ' Z'
  }));
  vp.appendChild(el('path', { class: 'map-land', d: smoothClosed(ISLAND) }));
  vp.appendChild(el('path', { class: 'map-coast', d: poly(COAST) }));
  vp.appendChild(el('path', { class: 'map-coast', d: smoothClosed(ISLAND) }));
  vp.appendChild(el('path', { class: 'map-river', d: poly(RIVER) }));
  vp.appendChild(el('path', { class: 'map-border', d: poly(BORDER) }));

  /* Region + state labels */
  var regionLabels = [];
  function regionLabel(x, y, text, cls) {
    var g = el('g', { class: 'map-region ' + (cls || '') });
    var t = el('text', { x: x, y: y });
    t.textContent = text;
    g.appendChild(t);
    vp.appendChild(g);
    regionLabels.push(t);
  }
  regionLabel(72, 40, 'Gold Coast');
  regionLabel(222, 120, 'Broadwater', 'sea');
  regionLabel(140, 800, 'QLD');
  regionLabel(105, 880, 'NSW');
  regionLabel(320, 930, 'Tweed Shire');
  regionLabel(430, 430, 'Coral Sea', 'sea');

  /* Serviced areas */
  var areaLayer = el('g', {});
  var labelLayer = el('g', {});
  vp.appendChild(areaLayer);
  vp.appendChild(labelLayer);

  var nodes = {};

  AREAS.forEach(function (a, i) {
    var g = el('g', { class: 'area-g', 'data-name': a.n, tabindex: '0', role: 'button' });
    var title = el('title', {});
    title.textContent = a.n + ' ' + a.s + ' ' + a.p + ' — serviced';
    g.appendChild(title);
    g.appendChild(el('path', { class: 'area-shape', d: blobPath(a.x, a.y, a.r, i + 1) }));
    g.appendChild(el('circle', { class: 'area-dot', cx: a.x, cy: a.y, r: 2.4 }));
    areaLayer.appendChild(g);

    var lg = el('g', { class: 'map-label' + (a.a ? ' is-anchor' : '') });
    var t = el('text', { x: 0, y: 0 });
    t.textContent = a.n;
    lg.appendChild(t);
    labelLayer.appendChild(lg);

    nodes[a.n] = { g: g, label: lg, data: a };

    g.addEventListener('click', function () { select(a.n, true); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(a.n, true); }
    });
  });

  stage.insertBefore(svg, stage.firstChild);

  /* ---------- Zoom ---------- */
  var scale = 1, focus = { x: W / 2, y: H / 2 }, activeName = null;
  var LABEL_ALL_AT = 1.8;   // below this zoom, only anchor labels stay visible

  function applyView() {
    vp.setAttribute('transform',
      'translate(' + (W / 2 - focus.x * scale).toFixed(2) + ',' +
                     (H / 2 - focus.y * scale).toFixed(2) + ') scale(' + scale.toFixed(3) + ')');

    var inv = 1 / scale;
    var showAll = scale >= LABEL_ALL_AT;

    AREAS.forEach(function (a) {
      var node = nodes[a.n];
      // counter-scale so text stays a constant size on screen
      node.label.setAttribute('transform',
        'translate(' + a.x + ',' + (a.y + a.r + 13 * inv) + ') scale(' + inv.toFixed(3) + ')');
      var visible = showAll || a.a || a.n === activeName;
      node.label.style.opacity = visible ? '1' : '0';
    });

    regionLabels.forEach(function (t) {
      t.style.fontSize = (15 * inv) + 'px';
      t.style.letterSpacing = (3.3 * inv) + 'px';
    });
  }

  function zoomTo(x, y, k) {
    scale = Math.max(1, Math.min(7, k));
    focus.x = x; focus.y = y;
    applyView();
  }

  /* ---------- Selection + lookup ---------- */
  var resultBox = document.getElementById('lookupResult');
  var input     = document.getElementById('lookupInput');
  var chipWrap  = document.getElementById('chipList');

  function clearActive() {
    activeName = null;
    [].forEach.call(document.querySelectorAll('.area-g.is-active'), function (g) { g.classList.remove('is-active'); });
    [].forEach.call(document.querySelectorAll('.chip.is-active'), function (c) { c.classList.remove('is-active'); });
  }

  function select(name, scroll) {
    var node = nodes[name];
    if (!node) return;
    clearActive();
    activeName = name;
    node.g.classList.add('is-active');
    node.g.parentNode.appendChild(node.g);      // bring to front
    node.label.parentNode.appendChild(node.label);
    var chip = chipWrap && chipWrap.querySelector('[data-chip="' + name + '"]');
    if (chip) chip.classList.add('is-active');
    zoomTo(node.data.x, node.data.y, 3.6);
    showResult(true, node.data);
    if (scroll && window.innerWidth <= 920) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function showResult(covered, data, query) {
    if (!resultBox) return;
    resultBox.className = 'lookup-result show ' + (covered ? 'yes' : 'maybe');

    if (covered) {
      // other suburbs sharing this postcode
      var siblings = AREAS.filter(function (a) { return a.p === data.p && a.n !== data.n; })
                          .map(function (a) { return a.n; });
      var extra = siblings.length
        ? '<p style="margin-top:.5rem;">Also in ' + data.p + ': ' + esc(siblings.join(', ')) + '.</p>'
        : '';
      resultBox.innerHTML =
        '<div class="lr-head">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7fd4" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></svg>' +
          '<b>Yes — we service ' + esc(data.n) + '</b>' +
        '</div>' +
        '<p>' + esc(data.n) + ' ' + data.s + ' ' + data.p + ' is inside our service area. ' +
        'Bookings Monday to Friday, 7:00am – 5:00pm.</p>' + extra +
        '<a class="btn btn-primary" href="contact.html">Book an Inspection</a>';
    } else {
      resultBox.innerHTML =
        '<div class="lr-head">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c69126" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>' +
          '<b>Not on our standard list</b>' +
        '</div>' +
        '<p>We couldn\'t match <strong>' + esc(query || '') + '</strong> to a suburb in our service area. ' +
        'That doesn\'t always mean no — give us a call and we\'ll tell you straight away whether we can get to you.</p>' +
        '<a class="btn btn-primary" href="tel:0413336880">Call 0413 336 880</a>';
    }
  }

  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function lookup(query) {
    var q = norm(query);
    if (!q) return;

    if (ALIAS[q]) { select(ALIAS[q], true); return; }

    var exact = null, starts = null, contains = null, byPost = null;
    AREAS.forEach(function (a) {
      var n = norm(a.n);
      if (n === q) exact = a.n;
      else if (!starts && n.indexOf(q) === 0) starts = a.n;
      else if (!contains && q.length >= 3 && n.indexOf(q) > -1) contains = a.n;
      if (!byPost && a.p === q) byPost = a.n;
    });

    var hit = exact || byPost || starts || contains;
    if (hit) {
      select(hit, true);
    } else {
      clearActive();
      zoomTo(W / 2, H / 2, 1);
      showResult(false, null, query.trim());
    }
  }

  /* ---------- Controls ---------- */
  var form = document.getElementById('lookupForm');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); lookup(input.value); });
  if (input) input.addEventListener('change', function () { if (input.value) lookup(input.value); });

  var dl = document.getElementById('suburbOptions');
  if (dl) {
    AREAS.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).forEach(function (a) {
      var o = document.createElement('option');
      o.value = a.n;
      o.label = a.s + ' ' + a.p;
      dl.appendChild(o);
    });
  }

  /* Chip list + group filters */
  if (chipWrap) {
    var filterWrap = document.getElementById('chipFilters');
    if (filterWrap) {
      GROUPS.forEach(function (grp, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tab';
        b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        b.innerHTML = grp.label;
        b.addEventListener('click', function () {
          [].forEach.call(filterWrap.children, function (c) { c.setAttribute('aria-selected', 'false'); });
          b.setAttribute('aria-selected', 'true');
          [].forEach.call(chipWrap.children, function (c) {
            c.hidden = !(grp.id === 'all' || c.getAttribute('data-group') === grp.id);
          });
        });
        filterWrap.appendChild(b);
      });
    }

    AREAS.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.setAttribute('data-chip', a.n);
      b.setAttribute('data-group', a.g);
      b.innerHTML = esc(a.n) + ' <small>' + a.s + ' ' + a.p + '</small>';
      b.addEventListener('click', function () { select(a.n, true); });
      chipWrap.appendChild(b);
    });

    var count = document.getElementById('chipCount');
    if (count) count.textContent = AREAS.length + ' suburbs in our service area';
  }

  var zin  = document.getElementById('zoomIn');
  var zout = document.getElementById('zoomOut');
  var zres = document.getElementById('zoomReset');
  if (zin)  zin.addEventListener('click',  function () { zoomTo(focus.x, focus.y, scale * 1.5); });
  if (zout) zout.addEventListener('click', function () { zoomTo(focus.x, focus.y, scale / 1.5); });
  if (zres) zres.addEventListener('click', function () {
    clearActive();
    zoomTo(W / 2, H / 2, 1);
    if (resultBox) resultBox.className = 'lookup-result';
    if (input) input.value = '';
  });

  applyView();
})();
