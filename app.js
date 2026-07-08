/* UN-SWAP 3.0 Dashboard — application */
(function () {
  'use strict';

  const D = window.SWAP_DATA;
  let YEAR = D.latestYear;

  const RATINGS = ['EX', 'ME', 'AP', 'MI', 'NA', 'NR'];
  const RATED = ['EX', 'ME', 'AP', 'MI']; // codes that count toward percentages
  const LABEL = {
    EX: 'Exceeds', ME: 'Meets', AP: 'Approaches',
    MI: 'Missing', NA: 'Not Applicable', NR: 'Not Reported'
  };
  const LABEL_FULL = {
    EX: 'Exceeds requirements', ME: 'Meets requirements', AP: 'Approaches requirements',
    MI: 'Missing', NA: 'Not Applicable', NR: 'Not Reported'
  };

  const app = document.getElementById('app');

  /* ---------------- helpers ---------------- */

  const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const byName = {};
  D.entities.forEach(e => { byName[e.name] = e; });

  const NAMES = window.ENTITY_NAMES || {};
  const fullName = n => NAMES[n] || '';

  /* logo: embedded data URI (survives partial uploads) with file fallback */
  const LOGO = window.LOGO_DATA_URI || 'assets/unswap-logo.png';

  const TYPES = [...new Set(D.entities.map(e => e.type))].sort();

  function rating(ent, pi, year) {
    const y = year || YEAR;
    return (ent.ratings[y] && ent.ratings[y][pi]) || 'NR';
  }

  function emptyCounts() {
    return { EX: 0, ME: 0, AP: 0, MI: 0, NA: 0, NR: 0 };
  }

  function addTo(counts, code) { counts[code] = (counts[code] || 0) + 1; }

  function statsOf(counts) {
    const rated = RATED.reduce((s, c) => s + counts[c], 0);
    return {
      counts, rated,
      mePct: rated ? (counts.EX + counts.ME) / rated * 100 : null,
      exPct: rated ? counts.EX / rated * 100 : null
    };
  }

  function entityStats(ent, year) {
    const c = emptyCounts();
    D.indicators.forEach(pi => addTo(c, rating(ent, pi.id, year)));
    return statsOf(c);
  }

  function poolStats(entities, year, indicatorId) {
    const c = emptyCounts();
    entities.forEach(ent => {
      if (indicatorId) addTo(c, rating(ent, indicatorId, year));
      else D.indicators.forEach(pi => addTo(c, rating(ent, pi.id, year)));
    });
    return statsOf(c);
  }

  const systemStats = (year, pi) => poolStats(D.entities, year, pi);
  const typeStats = (type, year, pi) => poolStats(D.entities.filter(e => e.type === type), year, pi);

  const pct = v => v === null ? '—' : Math.round(v) + '%';

  const NA_NOTE = '<p class="na-note">Percentages exclude ratings of Not Applicable.</p>';

  /* green up / orange down triangle vs a benchmark */
  function trend(v, ref, label) {
    if (v === null || ref === null) return '';
    const a = Math.round(v), b = Math.round(ref);
    if (a > b) return `<span class="up">▲</span> Above ${label}`;
    if (a < b) return `<span class="down">▼</span> Below ${label}`;
    return `<span class="even">●</span> On par with ${label}`;
  }

  /* ---------------- shared components ---------------- */

  function hbar(counts, opts) {
    const o = opts || {};
    const segs = RATINGS
      .filter(c => counts[c] > 0 && !(o.skipNR && c === 'NR'))
      .map(c => `<span class="seg ${c.toLowerCase()}" style="flex:${counts[c]}" title="${LABEL_FULL[c]}: ${counts[c]}"></span>`)
      .join('');
    return `<div class="hbar" style="${o.style || ''}">${segs || '<span class="seg nr" style="flex:1"></span>'}</div>`;
  }

  function chip(code) {
    return `<span class="chip ${code.toLowerCase()}">${LABEL[code]}</span>`;
  }

  /* large distribution bar with each label placed under its own colour segment */
  function bigBar(counts) {
    const total = RATINGS.reduce((s, c) => s + counts[c], 0) || 1;
    const cols = RATINGS.filter(c => counts[c] > 0).map(c => {
      const p = counts[c] / total * 100;
      const lbl = p >= 10 ? `${LABEL[c]}: <strong>${counts[c]}</strong>`
        : p >= 4 ? `<strong>${counts[c]}</strong>` : '';
      const bg = c === 'NR'
        ? 'repeating-linear-gradient(45deg,var(--c-nr),var(--c-nr) 3px,#fff 3px,#fff 6px)'
        : `var(--c-${c.toLowerCase()})`;
      return `<div class="bigseg" style="flex:${counts[c]}" title="${LABEL_FULL[c]}: ${counts[c]}">
        <div class="bigseg-block" style="background:${bg}"></div>
        <div class="bigseg-lbl">${lbl}</div>
      </div>`;
    }).join('');
    return `<div class="bigbar">${cols}</div>`;
  }

  function legend(withNR) {
    const codes = withNR ? RATINGS : RATINGS.slice(0, 5);
    return `<div class="legend">${codes.map(c => {
      const bg = c === 'NR'
        ? 'background:repeating-linear-gradient(45deg,var(--c-nr),var(--c-nr) 3px,#fff 3px,#fff 6px)'
        : `background:var(--c-${c.toLowerCase()})`;
      return `<span class="key"><span class="sw" style="${bg}"></span>${LABEL[c]}</span>`;
    }).join('')}</div>`;
  }

  function searchBox(id, placeholder) {
    return `<div class="search-box" id="${id}">
      <span class="icon">🔍</span>
      <input type="text" placeholder="${placeholder}" autocomplete="off" aria-label="Search entities">
      <div class="search-results" hidden></div>
    </div>`;
  }

  function wireSearch(id) {
    const box = document.getElementById(id);
    if (!box) return;
    const input = box.querySelector('input');
    const list = box.querySelector('.search-results');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { list.hidden = true; return; }
      const hits = D.entities.filter(e =>
        e.name.toLowerCase().includes(q) || fullName(e.name).toLowerCase().includes(q)).slice(0, 8);
      list.innerHTML = hits.length
        ? hits.map(e => `<button data-go="entity/${encodeURIComponent(e.name)}">
            <span>${esc(e.name)}</span><span class="t">${esc(e.type)}</span></button>`).join('')
        : '<button disabled><span class="t">No match</span></button>';
      list.hidden = false;
    });
    document.addEventListener('click', ev => {
      if (!box.contains(ev.target)) list.hidden = true;
    });
  }

  function entitySelect(id, selected, blankLabel) {
    return `<select id="${id}">
      <option value="">${blankLabel || 'Select an entity…'}</option>
      ${D.entities.map(e => `<option value="${esc(e.name)}" ${e.name === selected ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}
    </select>`;
  }

  /* ---------------- pages ---------------- */

  function pageOverview() {
    const sys = systemStats(YEAR);
    const reporting = D.entities.filter(e => entityStats(e).rated > 0).length;

    const areaGroups = D.areas.map(area => {
      const pis = D.indicators.filter(p => p.area === area);
      const rows = pis.map(pi => {
        const s = systemStats(YEAR, pi.id);
        return `<div class="bar-row" data-go="indicator/${pi.id}" title="Open ${pi.id}">
          <span class="pi-id">${pi.id}</span>
          <span class="pi-name">${esc(pi.name)}</span>
          ${hbar(s.counts)}
          <span class="num strong">${pct(s.mePct)}</span>
          <span class="num soft">${pct(s.exPct)}</span>
        </div>`;
      }).join('');
      return `<div class="area-group">
        <div class="area-label">${esc(area)} <span class="mini">${pis.length} indicator${pis.length > 1 ? 's' : ''}</span></div>
        ${rows}
      </div>`;
    }).join('');

    app.innerHTML = `
      <div class="hero wrap">
        <div class="hero-top">
          <div>
            <h1>How is the UN system performing on gender equality?</h1>
            <p class="sub">Results of the ${YEAR} UN-SWAP 3.0 reporting cycle — ${reporting} entities,
            18 performance indicators, one shared accountability framework for gender mainstreaming.</p>
          </div>
          <div class="hero-art" aria-hidden="true">
            <img src="${LOGO}" alt="">
          </div>
        </div>
        <div class="stat-strip">
          <div class="stat"><div class="big">${pct(sys.mePct)}</div><div class="lbl">of ratings meet or exceed requirements</div></div>
          <div class="stat"><div class="big">${pct(sys.exPct)}</div><div class="lbl">exceed requirements</div></div>
          <div class="stat"><div class="big">${reporting}</div><div class="lbl">reporting entities in ${YEAR}</div></div>
        </div>
      </div>

      <div class="section wrap">
        <div class="section-head">
          <h2>The 18 performance indicators</h2>
          <span class="note">system-wide distribution</span>
        </div>
        ${NA_NOTE}
        <div class="bar-row heads">
          <span class="pi-id"></span>
          <span class="pi-name"></span>
          <div class="hbar" style="visibility:hidden"></div>
          <span class="num colh">M + E</span>
          <span class="num colh">Exceeds</span>
        </div>
        ${areaGroups}
        ${legend(true)}
      </div>

      <div class="section wrap">
        <div class="section-head"><h2>Find your entity</h2></div>
        ${searchBox('home-search', 'Type an entity name — e.g. UNICEF, WFP, UNDP…')}
        <p style="margin-top:12px;font-size:13px;color:var(--muted)">
          Or browse the full <a href="#/entities" style="color:var(--accent)">list of ${D.entities.length} entities</a>,
          open the <a href="#/explorer" style="color:var(--accent)">data explorer</a>, or
          <a href="#/compare" style="color:var(--accent)">compare entities</a>.</p>
      </div>`;
    wireSearch('home-search');
  }

  function pageIndicator(piId) {
    const pi = D.indicators.find(p => p.id === piId);
    if (!pi) { app.innerHTML = '<div class="wrap section"><p>Indicator not found.</p></div>'; return; }
    const s = systemStats(YEAR, pi.id);
    const idx = D.indicators.indexOf(pi);
    const prev = D.indicators[idx - 1], next = D.indicators[idx + 1];

    const typeRows = TYPES.map(t => {
      const ts = typeStats(t, YEAR, pi.id);
      const n = D.entities.filter(e => e.type === t).length;
      return `<div class="bar-row" style="cursor:default">
        <span class="pi-name" style="width:230px">${esc(t)} <span style="color:var(--faint)">(${n})</span></span>
        ${hbar(ts.counts)}
        <span class="num strong">${pct(ts.mePct)}</span>
        <span class="num soft">${pct(ts.exPct)}</span>
      </div>`;
    }).join('');

    const groups = RATINGS.map(code => {
      const ents = D.entities.filter(e => rating(e, pi.id) === code);
      if (!ents.length) return '';
      return `<div style="margin-top:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          ${chip(code)} <span style="font-size:12.5px;color:var(--muted)">${ents.length} entit${ents.length > 1 ? 'ies' : 'y'}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${ents.map(e => `<button class="btn" style="font-size:12.5px;padding:5px 12px" data-go="entity/${encodeURIComponent(e.name)}">${esc(e.name)}</button>`).join('')}
        </div>
      </div>`;
    }).join('');

    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / Indicators / ${pi.id}</div>
        <h1>${pi.id} — ${esc(pi.name)}</h1>
        <div class="meta"><span class="tag">${esc(pi.area)}</span><span class="tag">${YEAR}</span></div>
        <div class="actions">
          <select id="pi-jump" class="year-pick" style="border-radius:8px" aria-label="Jump to indicator">
            ${D.indicators.map(p => `<option value="${p.id}" ${p.id === pi.id ? 'selected' : ''}>${p.id} — ${esc(p.name)}</option>`).join('')}
          </select>
          ${prev ? `<button class="btn" data-go="indicator/${prev.id}">← ${prev.id}</button>` : ''}
          ${next ? `<button class="btn" data-go="indicator/${next.id}">${next.id} →</button>` : ''}
          <button class="btn" data-go="facts/${pi.id}">Facts for this indicator</button>
        </div>
      </div>

      <div class="section wrap">
        <div class="grid-2">
          <div class="kpi"><div class="v">${pct(s.mePct)}</div><div class="l">meet or exceed requirements (of ${s.rated} rated)</div></div>
          <div class="kpi"><div class="v">${pct(s.exPct)}</div><div class="l">exceed requirements</div></div>
        </div>
        ${NA_NOTE}
        <div style="margin-top:16px">${bigBar(s.counts)}</div>
      </div>

      <div class="section wrap">
        <div class="section-head"><h2>By Entity Type</h2></div>
        ${NA_NOTE}
        <div class="bar-row heads">
          <span class="pi-name" style="width:230px"></span>
          <div class="hbar" style="visibility:hidden"></div>
          <span class="num colh">M + E</span>
          <span class="num colh">Exceeds</span>
        </div>
        ${typeRows}
        ${legend(true)}
      </div>

      <div class="section wrap">
        <div class="section-head"><h2>Entities by rating</h2><span class="note">click a name to open its performance page</span></div>
        ${groups}
      </div>`;

    document.getElementById('pi-jump').addEventListener('change', ev => {
      go('indicator/' + ev.target.value);
    });
  }

  function pageEntities() {
    const rows = D.entities.map(e => {
      const s = entityStats(e);
      return { e, s };
    });
    rows.sort((a, b) => a.e.name.localeCompare(b.e.name));

    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / Entities</div>
        <h1>All entities</h1>
        <div class="meta"><span class="tag">${D.entities.length} entities</span><span class="tag">${YEAR}</span></div>
      </div>
      <div class="section wrap">
        <div class="filters">
          <input type="text" id="ent-filter" placeholder="Filter by name…">
          <select id="ent-type"><option value="">All types</option>${TYPES.map(t => `<option>${esc(t)}</option>`).join('')}</select>
          <select id="ent-sort">
            <option value="name">Sort: name</option>
            <option value="me">Sort: M+E % (high → low)</option>
            <option value="ex">Sort: Exceeds % (high → low)</option>
          </select>
        </div>
        <table class="data" id="ent-table">
          <thead><tr><th>Entity</th><th>Type</th><th style="width:32%">Distribution</th><th class="r">M + E</th><th class="r">Exceeds</th></tr></thead>
          <tbody></tbody>
        </table>
        ${legend(true)}
        ${NA_NOTE}
      </div>`;

    const tbody = app.querySelector('#ent-table tbody');
    function draw() {
      const q = document.getElementById('ent-filter').value.trim().toLowerCase();
      const t = document.getElementById('ent-type').value;
      const sort = document.getElementById('ent-sort').value;
      let list = rows.filter(r =>
        (!q || r.e.name.toLowerCase().includes(q)) && (!t || r.e.type === t));
      if (sort === 'me') list = list.slice().sort((a, b) => (b.s.mePct ?? -1) - (a.s.mePct ?? -1));
      if (sort === 'ex') list = list.slice().sort((a, b) => (b.s.exPct ?? -1) - (a.s.exPct ?? -1));
      tbody.innerHTML = list.map(r => `
        <tr class="clickable" data-go="entity/${encodeURIComponent(r.e.name)}">
          <td style="font-weight:600">${esc(r.e.name)}</td>
          <td style="color:var(--muted);font-size:12.5px">${esc(r.e.type)}</td>
          <td>${hbar(r.s.counts)}</td>
          <td class="r" style="font-weight:600">${pct(r.s.mePct)}</td>
          <td class="r" style="color:var(--muted)">${pct(r.s.exPct)}</td>
        </tr>`).join('');
    }
    ['ent-filter', 'ent-type', 'ent-sort'].forEach(id =>
      document.getElementById(id).addEventListener('input', draw));
    draw();
  }

  function pageEntity(name) {
    const ent = byName[name];
    if (!ent) { app.innerHTML = '<div class="wrap section"><p>Entity not found.</p></div>'; return; }
    const s = entityStats(ent);
    const ts = typeStats(ent.type, YEAR);
    const sys = systemStats(YEAR);
    const peers = D.entities.filter(e => e.type === ent.type).length;

    const areaBlocks = D.areas.map(area => {
      const pis = D.indicators.filter(p => p.area === area);
      const rows = pis.map(pi => {
        const code = rating(ent, pi.id);
        return `<div class="ind-line">
          <span class="pi-id">${pi.id}</span>
          <a class="pi-name" href="#/indicator/${pi.id}" title="Open indicator page">${esc(pi.name)}</a>
          ${chip(code)}
        </div>`;
      }).join('');
      return `<div class="area-group">
        <div class="area-label">${esc(area)}</div>${rows}
      </div>`;
    }).join('');

    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / <a href="#/entities">Entities</a> / ${esc(ent.name)}</div>
        <h1>${esc(ent.name)}</h1>
        ${fullName(ent.name) ? `<p class="fullname">${esc(fullName(ent.name))}</p>` : ''}
        <div class="meta"><span class="tag">${esc(ent.type)}</span><span class="tag">UN-SWAP 3.0 · ${YEAR}</span></div>
        <div class="actions">
          <button class="btn primary" data-go="compare?a=${encodeURIComponent(ent.name)}">Compare with another entity</button>
          <button class="btn" data-go="compare?a=${encodeURIComponent(ent.name)}&mode=bench">Compare with Entity Type and UN System</button>
          <button class="btn" data-print="${esc(ent.name)}">Download performance card (PDF)</button>
        </div>
      </div>

      <div class="section wrap">
        <div class="grid-4">
          <div class="kpi"><div class="k">${esc(ent.name)}</div><div class="v">${pct(s.mePct)}</div><div class="l">meets or exceeds (M+E)</div>
            <div class="d">${trend(s.mePct, ts.mePct, 'the Entity Type average')}</div>
            <div class="d">${trend(s.mePct, sys.mePct, 'the UN System average')}</div></div>
          <div class="kpi"><div class="k">${esc(ent.name)}</div><div class="v">${pct(s.exPct)}</div><div class="l">exceeds</div></div>
          <div class="kpi bench"><div class="k">For comparison</div><div class="v">${pct(ts.mePct)}</div><div class="l">M+E average of ${esc(ent.type)} (${peers} entities)</div></div>
          <div class="kpi bench"><div class="k">For comparison</div><div class="v">${pct(sys.mePct)}</div><div class="l">M+E average of the UN System</div></div>
        </div>
        ${NA_NOTE}
        <div style="margin-top:14px">${bigBar(s.counts)}</div>
      </div>

      <div class="section wrap">
        <div class="section-head"><h2>Ratings by indicator</h2></div>
        ${areaBlocks}
      </div>
      ${window.UNWOMEN_LOGO_URI ? `<img class="print-unwomen" src="${window.UNWOMEN_LOGO_URI}" alt="UN Women">` : ''}`;
  }

  function pageCompare(params) {
    const a = params.get('a') || '';
    const b = params.get('b') || '';
    const m = params.get('mode');
    const mode = (m === 'bench' || m === 'peer') ? 'bench' : 'entity';

    let body = '';
    if (mode === 'entity') body = compareEntityBody(a, b);
    else body = compareBenchBody(a);

    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / Compare</div>
        <h1>Compare performance</h1>
        <div class="meta">
          <div class="mode-tabs">
            <button class="${mode === 'entity' ? 'active' : ''}" data-go="compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}">Entity vs Entity</button>
            <button class="${mode === 'bench' ? 'active' : ''}" data-go="compare?a=${encodeURIComponent(a)}&mode=bench">Entity vs Entity Type vs UN System</button>
          </div>
        </div>
      </div>
      <div class="section wrap">${body}</div>`;

    const selA = document.getElementById('cmp-a');
    const selB = document.getElementById('cmp-b');
    if (selA) selA.addEventListener('change', () => {
      const q = mode === 'bench'
        ? `compare?a=${encodeURIComponent(selA.value)}&mode=bench`
        : `compare?a=${encodeURIComponent(selA.value)}&b=${encodeURIComponent(selB ? selB.value : '')}`;
      go(q);
    });
    if (selB) selB.addEventListener('change', () => {
      go(`compare?a=${encodeURIComponent(selA.value)}&b=${encodeURIComponent(selB.value)}`);
    });
    const diffOnly = document.getElementById('diff-only');
    if (diffOnly) diffOnly.addEventListener('change', () => {
      document.querySelectorAll('tr.same-row').forEach(tr => { tr.hidden = diffOnly.checked; });
    });
  }

  function compareEntityBody(a, b) {
    let html = `<div class="pick-row">
      ${entitySelect('cmp-a', a, 'Select first entity…')}
      <span class="vs">vs</span>
      ${entitySelect('cmp-b', b, 'Select second entity…')}
    </div>`;

    const ea = byName[a], eb = byName[b];
    if (!ea || !eb) {
      return html + `<p style="margin-top:22px;color:var(--muted)">Select two entities to see an indicator-by-indicator comparison.</p>`;
    }
    const sa = entityStats(ea), sb = entityStats(eb);

    const rows = D.areas.map(area => {
      const pis = D.indicators.filter(p => p.area === area);
      const head = `<tr><td colspan="4" style="background:var(--soft);font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:var(--muted)">${esc(area)}</td></tr>`;
      const body = pis.map(pi => {
        const ca = rating(ea, pi.id), cb = rating(eb, pi.id);
        const differs = ca !== cb;
        return `<tr class="${differs ? 'differs' : 'same-row'}">
          <td style="width:44px;color:var(--faint);font-weight:600;font-size:12px">${pi.id}</td>
          <td>${esc(pi.name)}</td>
          <td style="width:140px">${chip(ca)}</td>
          <td style="width:140px">${chip(cb)}</td>
        </tr>`;
      }).join('');
      return head + body;
    }).join('');

    html += `
      <div class="grid-2" style="margin-top:22px">
        <div class="card">
          <div style="font-weight:600;margin-bottom:2px">${esc(ea.name)}</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">${esc(ea.type)}</div>
          ${hbar(sa.counts, { style: 'height:16px' })}
          <div style="margin-top:10px;font-size:13px">M+E <strong>${pct(sa.mePct)}</strong> · Exceeds <strong>${pct(sa.exPct)}</strong></div>
        </div>
        <div class="card">
          <div style="font-weight:600;margin-bottom:2px">${esc(eb.name)}</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">${esc(eb.type)}</div>
          ${hbar(sb.counts, { style: 'height:16px' })}
          <div style="margin-top:10px;font-size:13px">M+E <strong>${pct(sb.mePct)}</strong> · Exceeds <strong>${pct(sb.exPct)}</strong></div>
        </div>
      </div>
      ${NA_NOTE}
      <div style="display:flex;align-items:center;gap:8px;margin:20px 0 8px">
        <label class="diff-note"><input type="checkbox" id="diff-only"> show differences only</label>
        <span class="diff-note" style="margin-left:auto">highlighted rows = ratings differ</span>
      </div>
      <table class="data">
        <thead><tr><th></th><th>Indicator</th><th>${esc(ea.name)}</th><th>${esc(eb.name)}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    return html;
  }

  function compareBenchBody(a) {
    let html = `<div class="pick-row">${entitySelect('cmp-a', a, 'Select your entity…')}</div>`;
    const ea = byName[a];
    if (!ea) {
      return html + `<p style="margin-top:22px;color:var(--muted)">Select an entity to compare it with its Entity Type and the UN System as a whole.</p>`;
    }
    const s = entityStats(ea);
    const peersList = D.entities.filter(e => e.type === ea.type);
    const ts = typeStats(ea.type, YEAR);
    const sys = systemStats(YEAR);

    const rows = D.areas.map(area => {
      const pis = D.indicators.filter(p => p.area === area);
      const head = `<tr><td colspan="5" style="background:var(--soft);font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:var(--muted)">${esc(area)}</td></tr>`;
      const body = pis.map(pi => {
        const c = rating(ea, pi.id);
        const tPi = typeStats(ea.type, YEAR, pi.id);
        const sPi = systemStats(YEAR, pi.id);
        return `<tr>
          <td style="width:44px;color:var(--faint);font-weight:600;font-size:12px">${pi.id}</td>
          <td>${esc(pi.name)}</td>
          <td style="width:130px">${chip(c)}</td>
          <td style="width:170px" title="Distribution among ${esc(ea.type)} entities">${hbar(tPi.counts, { style: 'height:11px' })}</td>
          <td style="width:170px" title="Distribution across the UN system">${hbar(sPi.counts, { style: 'height:11px' })}</td>
        </tr>`;
      }).join('');
      return head + body;
    }).join('');

    html += `
      <div class="grid-3" style="margin-top:22px">
        <div class="kpi"><div class="v">${pct(s.mePct)}</div><div class="l">${esc(ea.name)} — meets or exceeds</div>
          <div class="d" style="color:var(--muted)">Exceeds ${pct(s.exPct)}</div></div>
        <div class="kpi"><div class="v">${pct(ts.mePct)}</div><div class="l">${esc(ea.type)} average (${peersList.length} entities)</div>
          <div class="d" style="color:var(--muted)">Exceeds ${pct(ts.exPct)}</div></div>
        <div class="kpi"><div class="v">${pct(sys.mePct)}</div><div class="l">UN System average</div>
          <div class="d" style="color:var(--muted)">Exceeds ${pct(sys.exPct)}</div></div>
      </div>
      ${NA_NOTE}
      <table class="data" style="margin-top:16px">
        <thead><tr><th></th><th>Indicator</th><th>${esc(ea.name)}</th><th>${esc(ea.type)}</th><th>UN System</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${legend(true)}`;
    return html;
  }

  function pageFacts(piId) {
    const pi = D.indicators.find(p => p.id === piId) || D.indicators[0];
    const reqs = (window.SWAP_REQUIREMENTS || {})[pi.id] || [];
    const LV = { AP: 1, ME: 2, EX: 3 };
    const RLV = { AP: 1, ME: 2, EX: 3 };

    const rated = D.entities.filter(e => RATED.includes(rating(e, pi.id)));
    const denom = rated.length;

    function moItems(e) {
      return ((e.mo && e.mo[YEAR] && e.mo[YEAR][pi.id]) || []);
    }

    const cards = reqs.map(f => {
      const need = LV[f.level];
      const achieved = rated.filter(e => (RLV[rating(e, pi.id)] || 0) >= need);
      const partial = f.mo
        ? rated.filter(e => rating(e, pi.id) === 'MI' &&
            moItems(e).some(it => it.toLowerCase().includes(f.mo.toLowerCase())))
        : [];
      const total = achieved.length + partial.length;
      const pctW = denom ? Math.round(total / denom * 100) : 0;
      const method = f.level === 'EX' ? 'Exceeds rating'
        : f.level === 'ME' ? 'Meets rating and above'
        : 'Approaches rating and above' + (f.mo ? ' + partial Missing rating' : '');
      const chipsOf = (list, dashed) => list
        .sort((x, y) => x.name.localeCompare(y.name))
        .map(e => `<button class="fact-chip${dashed ? ' partial' : ''}" data-go="entity/${encodeURIComponent(e.name)}"
          title="${dashed ? 'Rated Missing — reported this sub-requirement' : esc(e.name)}">${esc(e.name)}</button>`).join('');
      return `<div class="fact-card">
        <div class="fact-top">
          <span class="fact-text">${esc(f.text)} <span class="fact-method">(${method})</span></span>
          <span class="fact-count">${total}</span>
        </div>
        <div class="fact-bar"><span style="width:${pctW}%"></span></div>
        <div class="fact-sub">
          <span>${pctW}% of ${denom} rated entities</span>
          ${partial.length ? `<span>· includes ${partial.length} rated Missing that reported this sub-requirement</span>` : ''}
        </div>
        ${total ? `<details class="fact-details"><summary>Show entities (${total})</summary>
          <div class="fact-chips">${chipsOf(achieved, false)}${chipsOf(partial, true)}</div>
        </details>` : ''}
      </div>`;
    }).join('');

    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / Facts</div>
        <h1>Facts — what entities have put in place</h1>
        <p class="fullname" style="font-size:15px">Ratings translated into concrete sub-requirements of the UN-SWAP 3.0 framework, with the entities that reported achieving each one.</p>
        <div class="actions">
          <select id="fact-pi" class="year-pick" style="border-radius:8px" aria-label="Choose indicator">
            ${D.indicators.map(p => `<option value="${p.id}" ${p.id === pi.id ? 'selected' : ''}>${p.id} — ${esc(p.name)}</option>`).join('')}
          </select>
          <button class="btn" data-go="indicator/${pi.id}">Open ${pi.id} indicator page</button>
        </div>
      </div>
      <div class="section wrap">
        <div class="section-head"><h2>${pi.id} — ${esc(pi.name)}</h2>
          <span class="note">${esc(pi.area)} · ${YEAR} · ${denom} rated entities</span></div>
        ${reqs.length ? cards : '<p style="color:var(--muted)">Sub-requirements for this indicator have not been loaded yet.</p>'}
        <p style="margin-top:16px;font-size:12.5px;color:var(--faint)">
          How this is derived: an entity's rating means it satisfies all sub-requirements up to that level.
          Entities rated Missing are counted for a sub-requirement only where they reported it under the
          missing-rating options. Not Applicable and Not Reported entities are excluded.</p>
      </div>`;

    document.getElementById('fact-pi').addEventListener('change', ev => {
      go('facts/' + ev.target.value);
    });
  }

  function pageExplorer() {
    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / Explorer</div>
        <h1>Data explorer</h1>
        <div class="meta"><span class="tag">${D.entities.length} entities × ${D.indicators.length} indicators</span><span class="tag">${YEAR}</span></div>
      </div>
      <div class="section wrap">
        <div class="filters">
          <input type="text" id="hx-filter" placeholder="Filter entities…">
          <select id="hx-type"><option value="">All types</option>${TYPES.map(t => `<option>${esc(t)}</option>`).join('')}</select>
          <select id="hx-area"><option value="">All performance areas</option>${D.areas.map(a => `<option>${esc(a)}</option>`).join('')}</select>
          <select id="hx-sort">
            <option value="name">Sort: name</option>
            <option value="me">Sort: M+E % (high → low)</option>
          </select>
        </div>
        <div class="heat-scroll"><table class="heat" id="hx-table"></table></div>
        ${legend(true)}
        ${NA_NOTE}
        <p style="margin-top:6px;font-size:12.5px;color:var(--faint)">Hover a cell for details; click an entity name to open its page, a column header to open the indicator.</p>
      </div>`;

    const table = document.getElementById('hx-table');
    function draw() {
      const q = document.getElementById('hx-filter').value.trim().toLowerCase();
      const t = document.getElementById('hx-type').value;
      const areaF = document.getElementById('hx-area').value;
      const sort = document.getElementById('hx-sort').value;
      const pis = D.indicators.filter(p => !areaF || p.area === areaF);
      let ents = D.entities.filter(e =>
        (!q || e.name.toLowerCase().includes(q)) && (!t || e.type === t));
      if (sort === 'me') ents = ents.slice().sort((x, y) => (entityStats(y).mePct ?? -1) - (entityStats(x).mePct ?? -1));

      table.innerHTML = `
        <thead><tr>
          <th class="ename">Entity</th>
          ${pis.map(pi => `<th title="${pi.id} — ${esc(pi.name)} (${esc(pi.area)})" data-go="indicator/${pi.id}" style="cursor:pointer">${pi.num}</th>`).join('')}
          <th style="text-align:right;padding-right:10px">M+E</th>
        </tr></thead>
        <tbody>
          ${ents.map(e => {
            const s = entityStats(e);
            return `<tr>
              <td class="ename" data-go="entity/${encodeURIComponent(e.name)}">${esc(e.name)}</td>
              ${pis.map(pi => {
                const c = rating(e, pi.id);
                return `<td><span class="cell ${c.toLowerCase()}" data-go="entity/${encodeURIComponent(e.name)}"
                  title="${esc(e.name)} · ${pi.id} ${esc(pi.name)}: ${LABEL_FULL[c]}"></span></td>`;
              }).join('')}
              <td style="text-align:right;padding-right:10px;font-weight:600;font-size:12px">${pct(s.mePct)}</td>
            </tr>`;
          }).join('')}
        </tbody>`;
    }
    ['hx-filter', 'hx-type', 'hx-area', 'hx-sort'].forEach(id =>
      document.getElementById(id).addEventListener('input', draw));
    draw();
  }

  function pageAbout() {
    app.innerHTML = `
      <div class="page-head wrap">
        <div class="crumb"><a href="#/">Overview</a> / About</div>
        <h1>About UN-SWAP 3.0</h1>
      </div>
      <div class="section wrap prose">
        <img class="logo" src="${LOGO}" alt="UN-SWAP illustration">
        <p>The United Nations System-wide Action Plan on Gender Equality and the Empowerment of Women
        (UN-SWAP) is the UN system's accountability framework for gender mainstreaming. Each year,
        UN entities self-assess against 18 performance indicators organised in seven performance areas,
        providing a rating, a justification, and supporting evidence for each indicator.
        UN Women serves as the secretariat of the framework.</p>
        <p>UN-SWAP 3.0 is the third generation of the framework; ${D.latestYear} is its first reporting year.
        Learn more on the
        <a href="https://gendercoordinationandmainstreaming.unwomen.org/un-swap" target="_blank" rel="noopener">UN Women gender coordination and mainstreaming site</a>.</p>

        <h2>Ratings</h2>
        <table class="data" style="max-width:640px">
          <thead><tr><th>Rating</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>${chip('EX')}</td><td>The entity exceeds the requirements of the indicator.</td></tr>
            <tr><td>${chip('ME')}</td><td>The entity fully meets the requirements of the indicator.</td></tr>
            <tr><td>${chip('AP')}</td><td>The entity is approaching, but does not yet meet, the requirements.</td></tr>
            <tr><td>${chip('MI')}</td><td>The elements required by the indicator are missing.</td></tr>
            <tr><td>${chip('NA')}</td><td>The indicator is not applicable to the entity's mandate or business model.</td></tr>
            <tr><td>${chip('NR')}</td><td>The entity did not submit a rating for this indicator.</td></tr>
          </tbody>
        </table>

        <h2>How the numbers are calculated</h2>
        <p>Two summary measures are used throughout this site: the share of ratings that
        <strong>meet or exceed requirements (M+E)</strong> and the share that <strong>exceed requirements</strong>.
        Both are calculated on rated indicators only — ratings of Not Applicable and indicators that were
        not reported are excluded from the denominator. Not Applicable ratings are always shown in
        the charts as they provide important context on the distinct mandates of individual entities.</p>

        <h2>Data</h2>
        <p>The data on this site reflects the ${D.latestYear} UN-SWAP 3.0 reporting cycle
        (${D.entities.length} entities). As future reporting cycles are completed, additional years
        and trend views will be added. For questions about the data, contact the UN-SWAP secretariat
        at UN Women: <a href="mailto:unswap.helpdesk@unwomen.org">unswap.helpdesk@unwomen.org</a>.</p>
      </div>`;
  }

  /* ---------------- router ---------------- */

  function go(route) { location.hash = '#/' + route; }

  document.addEventListener('click', ev => {
    const pr = ev.target.closest('[data-print]');
    if (pr) {
      const prev = document.title;
      document.title = `${YEAR} ${pr.getAttribute('data-print')} UN-SWAP`;
      const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
      window.addEventListener('afterprint', restore);
      window.print();
      return;
    }
    const el = ev.target.closest('[data-go]');
    if (el && !el.disabled) { go(el.getAttribute('data-go')); }
  });

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = h.split('?');
    return { path: pathPart.split('/').filter(Boolean), params: new URLSearchParams(queryPart || '') };
  }

  function setActiveNav(section) {
    document.querySelectorAll('nav.main-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.nav === section);
    });
  }

  function render() {
    const { path, params } = parseHash();
    const p0 = path[0] || '';
    window.scrollTo(0, 0);
    switch (p0) {
      case '': setActiveNav('home'); pageOverview(); break;
      case 'indicator': setActiveNav('indicators'); pageIndicator(path[1]); break;
      case 'indicators': setActiveNav('indicators'); pageIndicator(path[1] || 'PI1'); break;
      case 'entities': setActiveNav('entities'); pageEntities(); break;
      case 'entity': setActiveNav('entities'); pageEntity(decodeURIComponent(path[1] || '')); break;
      case 'compare': setActiveNav('compare'); pageCompare(params); break;
      case 'facts': setActiveNav('facts'); pageFacts(path[1] || 'PI1'); break;
      case 'explorer': setActiveNav('explorer'); pageExplorer(); break;
      case 'about': setActiveNav('about'); pageAbout(); break;
      default: setActiveNav('home'); pageOverview();
    }
  }

  /* ---------------- init ---------------- */

  const yearSel = document.getElementById('year-pick');
  D.years.forEach(y => {
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    if (y === YEAR) o.selected = true;
    yearSel.appendChild(o);
  });
  yearSel.addEventListener('change', () => { YEAR = yearSel.value; render(); });

  window.addEventListener('hashchange', render);
  render();
})();
