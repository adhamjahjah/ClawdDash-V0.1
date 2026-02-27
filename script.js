/* ── Telegram bootstrap ─────────────────────────────── */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Override: Ignored Telegram themeParams to enforce Black & Orange theme
  /*
  const tp = tg.themeParams || {};
  const setVar = (k, v) => v && document.documentElement.style.setProperty(k, v);
  setVar('--bg',     tp.bg_color);
  setVar('--bg2',    tp.secondary_bg_color);
  setVar('--text',   tp.text_color);
  setVar('--hint',   tp.hint_color);
  setVar('--accent', tp.button_color);
  */
}

/* ── API config ─────────────────────────────────────── */
const API_URL = 'http://localhost:8000';  // change to deployed URL
const API_KEY = 'changeme';

/* ── Demo / Mock Data ───────────────────────────────── */
const _now = Date.now();
const ago = s => _now - s * 1000;

const DEMO_TASKS = [
  {
    id: 'tsk_001', type: 'web_automation', subtype: 'scraping',
    name: 'Scrape G2 competitor reviews',
    status: 'running', priority: 'high', progress: 58,
    steps: [
      { label: 'Initialize browser', status: 'completed' },
      { label: 'Navigate to G2', status: 'completed' },
      { label: 'Paginate & extract data', status: 'running' },
      { label: 'Deduplicate records', status: 'pending' },
      { label: 'Export to Google Sheets', status: 'pending' },
    ],
    currentStep: 'Paginate & extract data', stepIdx: 3,
    started_at: ago(148), eta: '~2 min', retry_count: 0,
    tags: ['scraping', 'research', 'marketing'],
  },
  {
    id: 'tsk_002', type: 'research', subtype: 'summarization',
    name: 'Summarize HN top 10 posts',
    status: 'running', priority: 'medium', progress: 32,
    steps: [
      { label: 'Fetch HN front page', status: 'completed' },
      { label: 'Extract top 10 URLs', status: 'completed' },
      { label: 'Crawl articles (3/10)', status: 'running' },
      { label: 'Summarize content', status: 'pending' },
      { label: 'Format & send report', status: 'pending' },
    ],
    currentStep: 'Crawl articles (3/10)', stepIdx: 3,
    started_at: ago(74), eta: '~5 min', retry_count: 0,
    tags: ['research', 'daily'],
  },
  {
    id: 'tsk_003', type: 'api_integration', subtype: 'sync',
    name: 'Sync Stripe leads → Notion DB',
    status: 'waiting_input', priority: 'high', progress: 50,
    steps: [
      { label: 'Connect to Stripe API', status: 'completed' },
      { label: 'Fetch new subscriptions', status: 'completed' },
      { label: 'Authenticate with Notion', status: 'waiting' },
      { label: 'Map & insert records', status: 'pending' },
    ],
    currentStep: 'Waiting for Notion auth', stepIdx: 3,
    started_at: ago(318), eta: 'Awaiting input', retry_count: 0,
    error_message: 'Notion OAuth token expired — please re-authenticate in Settings.',
    tags: ['api', 'crm', 'automation'],
  },
  {
    id: 'tsk_004', type: 'dev_infra', subtype: 'deploy',
    name: 'Deploy staging environment',
    status: 'completed', priority: 'high', progress: 100,
    steps: [
      { label: 'Run test suite', status: 'completed' },
      { label: 'Build Docker image', status: 'completed' },
      { label: 'Push to registry', status: 'completed' },
      { label: 'Deploy to staging', status: 'completed' },
      { label: 'Health check', status: 'completed' },
    ],
    currentStep: 'All steps complete', stepIdx: 5,
    started_at: ago(1840), completed_at: ago(740), eta: 'Completed', retry_count: 0,
    tags: ['deploy', 'staging', 'infra'],
  },
  {
    id: 'tsk_005', type: 'web_automation', subtype: 'seo',
    name: 'Analyze SEO for landing pages',
    status: 'pending', priority: 'low', progress: 0,
    steps: [
      { label: 'Crawl sitemap', status: 'pending' },
      { label: 'Run Lighthouse audits', status: 'pending' },
      { label: 'Extract meta issues', status: 'pending' },
      { label: 'Generate SEO report', status: 'pending' },
    ],
    currentStep: 'Waiting in queue', stepIdx: 0,
    started_at: null, eta: '~8 min', retry_count: 0,
    tags: ['seo', 'marketing'],
  },
  {
    id: 'tsk_006', type: 'api_integration', subtype: 'export',
    name: 'Export Stripe invoice PDFs',
    status: 'failed', priority: 'medium', progress: 40,
    steps: [
      { label: 'Authenticate Stripe', status: 'completed' },
      { label: 'List invoices (Apr)', status: 'completed' },
      { label: 'Download PDFs', status: 'failed' },
      { label: 'Upload to S3', status: 'pending' },
    ],
    currentStep: 'Download PDFs', stepIdx: 3,
    started_at: ago(2410), eta: 'Failed', retry_count: 2,
    error_code: 'RATE_LIMIT_429',
    error_message: 'Stripe API rate limit exceeded after 47 calls. Scheduled retry in 60s.',
    tags: ['api', 'billing', 'export'],
  },
  {
    id: 'tsk_007', type: 'local_ops', subtype: 'backup',
    name: 'Local database backup',
    status: 'completed', priority: 'medium', progress: 100,
    steps: [
      { label: 'Dump PostgreSQL DB', status: 'completed' },
      { label: 'Compress archive', status: 'completed' },
      { label: 'Verify integrity', status: 'completed' },
    ],
    currentStep: 'Done', stepIdx: 3,
    started_at: ago(4220), completed_at: ago(3810), eta: 'Completed', retry_count: 0,
    tags: ['backup', 'database'],
  },
  {
    id: 'tsk_008', type: 'research', subtype: 'competitive_analysis',
    name: 'AI tools landscape Q2 2025',
    status: 'running', priority: 'high', progress: 76,
    steps: [
      { label: 'Define competitor list', status: 'completed' },
      { label: 'Gather pricing pages', status: 'completed' },
      { label: 'Extract feature matrices', status: 'completed' },
      { label: 'Synthesize comparisons', status: 'running' },
      { label: 'Build comparison table', status: 'pending' },
      { label: 'Write executive summary', status: 'pending' },
    ],
    currentStep: 'Synthesize comparisons', stepIdx: 4,
    started_at: ago(930), eta: '~1 min', retry_count: 0,
    tags: ['research', 'competitive', 'strategy'],
  },
];

const _nextDay = (h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, m, 0, 0); return d; };
const _nextMon = () => { const d = new Date(); d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7 || 7); d.setHours(8, 0, 0, 0); return d; };
const _inMin = n => new Date(_now + n * 60000);
const _nextMth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); d.setHours(6, 0, 0, 0); return d; };

const DEMO_SCHEDULED = [
  { id: 'sch_1', name: 'Daily competitor price check', type: 'web_automation', subtype: 'scraping', next_run: _nextDay(9), recurrence: 'Daily 09:00', enabled: true, avg_dur: '4m 12s', last_status: 'completed' },
  { id: 'sch_2', name: 'Weekly competitor report', type: 'research', subtype: 'comparison', next_run: _nextMon(), recurrence: 'Mon 08:00', enabled: true, avg_dur: '12m 38s', last_status: 'completed' },
  { id: 'sch_3', name: 'Hourly system health check', type: 'dev_infra', subtype: 'monitoring', next_run: _inMin(43), recurrence: 'Every 1h', enabled: true, avg_dur: '0m 23s', last_status: 'completed' },
  { id: 'sch_4', name: 'Monthly analytics export', type: 'api_integration', subtype: 'export', next_run: _nextMth(), recurrence: '1st of month', enabled: true, avg_dur: '7m 05s', last_status: 'completed' },
  { id: 'sch_5', name: 'Nightly database backup', type: 'local_ops', subtype: 'backup', next_run: _nextDay(2), recurrence: 'Daily 02:00', enabled: false, avg_dur: '1m 47s', last_status: 'failed' },
];

const DEMO_LOGS = [
  { id: 'lg1', level: 'info', task_id: 'tsk_004', task_name: 'Deploy staging', msg: 'Health check passed — all services responding (200 OK)', ts: ago(740) },
  { id: 'lg2', level: 'info', task_id: 'tsk_004', task_name: 'Deploy staging', msg: 'Docker image pushed → registry.openclaw.io/staging:abc1234', ts: ago(840) },
  { id: 'lg3', level: 'error', task_id: 'tsk_006', task_name: 'Export invoices', msg: '429 Too Many Requests — Stripe rate limit exceeded after 47 calls', ts: ago(960) },
  { id: 'lg4', level: 'warning', task_id: 'tsk_006', task_name: 'Export invoices', msg: 'Retry attempt 2/3 scheduled in 60s', ts: ago(1030) },
  { id: 'lg5', level: 'info', task_id: 'tsk_001', task_name: 'Scrape G2', msg: 'Page 3 complete — 47 reviews extracted, deduplicating...', ts: ago(1110) },
  { id: 'lg6', level: 'info', task_id: 'tsk_008', task_name: 'AI tools landscape', msg: 'Feature matrix built for 14 competitors', ts: ago(1250) },
  { id: 'lg7', level: 'warning', task_id: 'tsk_003', task_name: 'Stripe→Notion sync', msg: 'Notion OAuth token expired — user action required', ts: ago(1390) },
  { id: 'lg8', level: 'debug', task_id: 'tsk_002', task_name: 'Summarize HN', msg: 'GET https://news.ycombinator.com → 200 OK (412ms)', ts: ago(1460) },
  { id: 'lg9', level: 'info', task_id: 'tsk_007', task_name: 'DB backup', msg: 'Backup verified — SHA256 checksum OK (2.3 GB)', ts: ago(3810) },
  { id: 'lg10', level: 'error', task_id: 'tsk_006', task_name: 'Export invoices', msg: 'Retry attempt 1/3 failed — still rate limited (429)', ts: ago(1710) },
  { id: 'lg11', level: 'info', task_id: 'tsk_004', task_name: 'Deploy staging', msg: 'Test suite passed — 247/247 tests in 14.2s', ts: ago(1920) },
  { id: 'lg12', level: 'debug', task_id: 'tsk_001', task_name: 'Scrape G2', msg: 'Browser launched — Chromium headless v124.0.6367.207', ts: ago(2010) },
  { id: 'lg13', level: 'info', task_id: 'tsk_008', task_name: 'AI tools landscape', msg: 'Competitor list: 14 tools identified across 6 categories', ts: ago(2120) },
  { id: 'lg14', level: 'warning', task_id: 'tsk_005', task_name: 'SEO analysis', msg: 'Task queued — waiting for available runner slot', ts: ago(2410) },
  { id: 'lg15', level: 'info', task_id: 'tsk_007', task_name: 'DB backup', msg: 'PostgreSQL dump started — estimating 2.3 GB uncompressed', ts: ago(4220) },
];

const DEMO_ANALYTICS = {
  kpis: [
    { label: 'Tasks (30d)', value: '247', trend: '+12%', dir: 'up' },
    { label: 'Success Rate', value: '91%', trend: '+2%', dir: 'up' },
    { label: 'Avg Duration', value: '4m 23s', trend: '-8%', dir: 'up' },
    { label: 'Active Now', value: '3', trend: '—', dir: 'flat' },
  ],
  types: [
    { label: 'Web Auto', count: 84, pct: 34, color: 'var(--c-web)' },
    { label: 'Research', count: 69, pct: 28, color: 'var(--c-res)' },
    { label: 'API Integ', count: 54, pct: 22, color: 'var(--c-api)' },
    { label: 'Dev/Infra', count: 25, pct: 10, color: 'var(--c-dev)' },
    { label: 'Local Ops', count: 15, pct: 6, color: 'var(--c-local)' },
  ],
  statusDist: [
    { label: 'Completed', pct: 68, color: 'var(--c-done)' },
    { label: 'Running', pct: 12, color: 'var(--c-run)' },
    { label: 'Failed', pct: 9, color: 'var(--c-fail)' },
    { label: 'Pending', pct: 7, color: 'var(--hint)' },
    { label: 'Waiting', pct: 4, color: 'var(--c-wait)' },
  ],
  failures: [
    { name: 'API Rate Limit', count: 18, pct: 73 },
    { name: 'Auth Token Expired', count: 11, pct: 44 },
    { name: 'Target Site Unreachable', count: 7, pct: 28 },
    { name: 'Script Timeout (120s)', count: 5, pct: 20 },
    { name: 'Output Parse Error', count: 3, pct: 12 },
  ],
};

/* ── State ──────────────────────────────────────────── */
const state = {
  activeTab: 'home',
  taskFilter: 'all',
  logFilter: 'all',
  tasks: DEMO_TASKS.map(t => ({ ...t, steps: t.steps.map(s => ({ ...s })) })),
  logs: [...DEMO_LOGS],
  scheduled: DEMO_SCHEDULED.map(s => ({ ...s })),
  analytics: { ...DEMO_ANALYTICS },
  expanded: new Set(),
  connectionStatus: 'demo',
};

/* ── DOM helpers ────────────────────────────────────── */
const $ = id => document.getElementById(id);
const el = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

/* ── Formatters ─────────────────────────────────────── */
const relTime = ts => {
  if (!ts) return 'not started';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const fmtTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = d => {
  const today = new Date(), tom = new Date(today);
  tom.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tom.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const TYPE_LABEL = { web_automation: 'Web', research: 'Research', api_integration: 'API', dev_infra: 'Dev', local_ops: 'Local' };
const STATUS_LABEL = { running: 'Running', pending: 'Pending', waiting_input: 'Waiting', completed: 'Done', failed: 'Failed', cancelled: 'Cancelled' };
const STEP_ICON = { completed: '✓', running: '↻', pending: '○', failed: '✕', waiting: '⏸' };

/* ── Render: Home ───────────────────────────────────── */
function renderHome() {
  const running = state.tasks.filter(t => t.status === 'running');
  const failed = state.tasks.filter(t => t.status === 'failed');
  const upcoming = [...state.scheduled].sort((a, b) => a.next_run - b.next_run).slice(0, 3);
  const recentLogs = state.logs.slice(0, 3);

  // ── Active Tasks widget ──────────────────────────────
  const activeSec = $('widget-active-tasks');
  const visibleRings = running.slice(0, 2);
  const extraCount = running.length > 2 ? running.length - 2 : 0;
  const activePill = running.length === 1 ? '1 running' : `${running.length} running`;

  activeSec.innerHTML = `
    <div class="widget-header">
      <span class="widget-title">Active Tasks</span>
      <div class="widget-header-right">
        <span class="widget-meta">${activePill}</span>
        <button class="widget-nav-btn" onclick="goTo('tasks','running')" aria-label="View running tasks">→</button>
      </div>
    </div>
    ${running.length === 0
      ? '<div class="active-tasks-none">No active tasks right now</div>'
      : `<div class="active-tasks-scroll">
          ${visibleRings.map(t => `
            <div class="active-task-card">
              <div class="ring home-ring" data-id="${t.id}" data-target="${t.progress}" style="--p:0%">
                <div class="ring-inner">0%</div>
              </div>
              <div class="active-task-name">${t.name}</div>
              <div class="active-task-type">${TYPE_LABEL[t.type] || t.type}</div>
              <div class="active-task-eta">${t.eta}</div>
            </div>`).join('')}
         </div>
         ${extraCount > 0 ? `<div class="active-tasks-overflow">+ ${extraCount} more (${running.slice(2).map(t => t.name + ' ' + t.progress + '%').join(', ')})</div>` : ''}`
    }`;

  // ── Quick Stats widget ───────────────────────────────
  const statsSec = $('widget-quick-stats');
  const shortLabel = l => l.replace(' (30d)', '').replace(' Rate', '').replace(' Now', '');
  statsSec.innerHTML = `
    <div class="widget-header">
      <span class="widget-title">Quick Stats</span>
      <button class="widget-nav-btn" onclick="goTo('analytics')" aria-label="View analytics">→</button>
    </div>
    <div class="quick-stats-row">
      ${state.analytics.kpis.map(k => `
        <div class="stat-chip">
          <div class="stat-chip-value">${k.value}</div>
          <div class="stat-chip-label">${shortLabel(k.label)}</div>
        </div>`).join('')}
    </div>`;

  // ── Coming Up widget ─────────────────────────────────
  const upcomingSec = $('widget-coming-up');
  const fmtUpcoming = d => {
    const diffMin = Math.round((d - Date.now()) / 60000);
    if (diffMin < 120) return `in ${diffMin}m`;
    const today = new Date(), tom = new Date(today);
    tom.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString() || d.toDateString() === tom.toDateString()) return fmtTime(d);
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  };
  const recurBadge = rec => {
    if (rec.startsWith('Daily')) return 'Daily';
    if (rec.startsWith('Every')) return rec.replace('Every ', '');
    if (rec.startsWith('Mon')) return 'Mon';
    if (rec.startsWith('1st')) return 'Monthly';
    return rec.split(' ')[0];
  };
  upcomingSec.innerHTML = `
    <div class="widget-header">
      <span class="widget-title">Coming Up</span>
      <div class="widget-header-right">
        <span class="widget-meta">${state.scheduled.length} tasks</span>
        <button class="widget-nav-btn" onclick="goTo('scheduled')" aria-label="View scheduled">→</button>
      </div>
    </div>
    <div class="coming-up-list">
      ${upcoming.map(s => `
        <div class="coming-up-item">
          <span class="coming-up-time">${fmtUpcoming(s.next_run)}</span>
          <span class="coming-up-name">${s.name}</span>
          <span class="coming-up-badge">${recurBadge(s.recurrence)}</span>
        </div>`).join('')}
    </div>`;

  // ── Failed Tasks widget (conditional) ───────────────
  const failedSec = $('widget-failed');
  if (failed.length > 0) {
    failedSec.style.display = '';
    failedSec.innerHTML = `
      <div class="widget-header">
        <span class="widget-title" style="color:var(--c-fail)">Failed (${failed.length})</span>
        <button class="widget-nav-btn" onclick="goTo('tasks','failed')" aria-label="View failed tasks">→</button>
      </div>
      ${failed.map(t => `
        <div class="failed-mini-item">
          <span class="failed-mini-icon">✕</span>
          <div class="failed-mini-body">
            <div class="failed-mini-name">${t.name}</div>
            <div class="failed-mini-meta">${t.error_code || 'Error'} · ${t.retry_count} retr${t.retry_count === 1 ? 'y' : 'ies'}</div>
          </div>
        </div>`).join('')}`;
  } else {
    failedSec.style.display = 'none';
  }

  // ── Recent Logs widget ───────────────────────────────
  const logsSec = $('widget-recent-logs');
  logsSec.innerHTML = `
    <div class="widget-header">
      <span class="widget-title">Recent Logs</span>
      <button class="widget-nav-btn" onclick="goTo('logs')" aria-label="View logs">→</button>
    </div>
    <div class="recent-log-list">
      ${recentLogs.map(log => `
        <div class="recent-log-item">
          <div class="log-dot ${log.level}"></div>
          <div class="recent-log-body">
            <div class="recent-log-name">${log.task_name}</div>
            <div class="recent-log-msg">${log.msg}</div>
          </div>
        </div>`).join('')}
    </div>`;

  // ── Animate rings in (0% → actual, via @property transition) ──
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.home-ring').forEach(ring => {
      const pct = ring.dataset.target + '%';
      ring.style.setProperty('--p', pct);
      const inner = ring.querySelector('.ring-inner');
      if (inner) inner.textContent = ring.dataset.target + '%';
    });
  }));
}

/* ── Render: Tasks ──────────────────────────────────── */
function renderTasks() {
  // Count per status
  const counts = { all: 0, running: 0, pending: 0, waiting_input: 0, failed: 0, completed: 0 };
  state.tasks.forEach(t => {
    counts.all++;
    if (counts[t.status] !== undefined) counts[t.status]++;
  });

  $('fc-all').textContent = counts.all;
  $('fc-running').textContent = counts.running;
  $('fc-pending').textContent = counts.pending;
  $('fc-waiting').textContent = counts.waiting_input;
  $('fc-failed').textContent = counts.failed;
  $('fc-done').textContent = counts.completed;

  $('badge-failed').classList.toggle('visible', counts.failed > 0);

  const active = counts.running + counts.waiting_input;
  $('hdr-active').textContent = `${active} active`;
  $('hdr-label').textContent = active > 0 ? 'Working' : 'Idle';
  const dot = document.querySelector('#hdr-dot');
  dot.className = 'status-dot ' + (active > 0 ? 'working' : 'idle');

  // Filter
  const visible = state.taskFilter === 'all'
    ? state.tasks
    : state.tasks.filter(t => t.status === state.taskFilter);

  const list = $('task-list');
  list.innerHTML = '';

  if (visible.length === 0) {
    list.appendChild(emptyState('No tasks here', 'Switch filter to see other tasks'));
    return;
  }

  visible.forEach(task => buildTaskCard(task, list));
}

function buildTaskCard(task, container) {
  const expanded = state.expanded.has(task.id);
  const hasProg = ['running', 'waiting_input', 'completed', 'failed'].includes(task.status);
  const fillClass = task.status === 'completed' ? 'done' : task.status === 'failed' ? 'failed' : task.status === 'waiting_input' ? 'wait' : '';

  const stepsHTML = task.steps.map(s => `
    <div class="step-item ${s.status}">
      <div class="step-icon ${s.status}">${STEP_ICON[s.status] || '○'}</div>
      <span class="step-label">${s.label}</span>
    </div>`).join('');

  const errorHTML = task.error_message ? `
    <div class="error-box">
      <div class="error-box-title">${task.error_code || 'Error'}${task.retry_count ? ` · Retry ${task.retry_count}` : ''}</div>
      <div class="error-box-msg">${task.error_message}</div>
    </div>` : '';

  const tagsHTML = task.tags.map(t => `<span class="tag">${t}</span>`).join('');

  let actionsHTML = '';
  if (task.status === 'running' || task.status === 'waiting_input')
    actionsHTML = `<button class="btn-action cancel" data-action="cancel" data-id="${task.id}">Cancel</button>`;
  else if (task.status === 'failed')
    actionsHTML = `<button class="btn-action retry" data-action="retry" data-id="${task.id}">↻ Retry</button>`;
  else if (task.status === 'completed')
    actionsHTML = `<button class="btn-action rerun" data-action="rerun" data-id="${task.id}">▶ Re-run</button>`;

  const timing = task.status === 'completed' && task.completed_at
    ? `Finished ${relTime(task.completed_at)}`
    : task.started_at ? `Started ${relTime(task.started_at)}` : 'Not started';

  const card = el('div', `task-card${expanded ? ' expanded' : ''}`);
  card.dataset.id = task.id;
  card.innerHTML = `
    <div class="task-card-top">
      <span class="type-tag ${task.type}">${TYPE_LABEL[task.type] || task.type}</span>
      <div class="task-card-body">
        <div class="task-card-name">${task.name}</div>
        <div class="task-card-meta"><span>${task.subtype}</span><span>·</span><span>${timing}</span></div>
      </div>
      <div class="task-card-right">
        <div class="status-badge ${task.status}"><span class="sdot"></span>${STATUS_LABEL[task.status]}</div>
      </div>
      <span class="expand-icon">▾</span>
    </div>
    ${hasProg ? `
    <div class="task-progress">
      <div class="progress-row">
        <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${task.progress}%"></div></div>
        <span class="progress-pct ${fillClass}">${task.progress}%</span>
      </div>
      <div class="progress-step">${task.currentStep} (${task.stepIdx}/${task.steps.length})</div>
    </div>` : ''}
    <div class="task-detail">
      <div class="task-detail-inner">
        <div class="step-list">${stepsHTML}</div>
        ${errorHTML}
        <div class="tag-row">${tagsHTML}</div>
        <div class="task-actions">${actionsHTML}</div>
      </div>
    </div>`;

  card.querySelector('.task-card-top').addEventListener('click', () => {
    card.classList.toggle('expanded');
    if (card.classList.contains('expanded')) state.expanded.add(task.id);
    else state.expanded.delete(task.id);
    if (tg) tg.HapticFeedback?.selectionChanged();
  });

  card.querySelectorAll('[data-action]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); handleAction(task.id, btn.dataset.action); })
  );

  container.appendChild(card);
}

async function handleAction(taskId, action) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  if (tg) tg.HapticFeedback?.impactOccurred('light');

  // Try API first (live mode)
  if (state.connectionStatus === 'live') {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/${action}`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
      });
      if (res.ok) {
        await fetchState();
        return;
      }
    } catch (_) { /* fall through to local mutation */ }
  }

  // Local mutation fallback (demo mode or API failure)
  if (action === 'cancel') {
    task.status = 'cancelled';
    addLog('info', taskId, task.name, 'Task cancelled by user');

  } else if (action === 'retry') {
    task.status = 'running';
    task.progress = 0;
    task.retry_count++;
    task.started_at = Date.now();
    task.steps.forEach((s, i) => { s.status = i === 0 ? 'running' : 'pending'; });
    task.currentStep = task.steps[0].label;
    task.stepIdx = 1;
    delete task.error_code;
    delete task.error_message;
    addLog('info', taskId, task.name, `Retry #${task.retry_count} started`);

  } else if (action === 'rerun') {
    task.status = 'pending';
    task.progress = 0;
    task.started_at = null;
    task.steps.forEach(s => { s.status = 'pending'; });
    task.currentStep = 'Waiting in queue';
    task.stepIdx = 0;
    addLog('info', taskId, task.name, 'Task queued for re-run');
  }

  renderTasks();
}

/* In-place progress update (avoids full DOM rebuild for smooth bars) */
function updateProgressInPlace() {
  state.tasks.filter(t => t.status === 'running').forEach(task => {
    const card = document.querySelector(`.task-card[data-id="${task.id}"]`);
    if (!card) return;
    const fill = card.querySelector('.progress-fill');
    const pct = card.querySelector('.progress-pct');
    const step = card.querySelector('.progress-step');
    if (fill) fill.style.width = task.progress + '%';
    if (pct) pct.textContent = task.progress + '%';
    if (step) step.textContent = `${task.currentStep} (${task.stepIdx}/${task.steps.length})`;
  });
}

/* In-place ring update for home tab (avoids full re-render) */
function updateRingsInPlace() {
  state.tasks.filter(t => t.status === 'running').forEach(task => {
    const ring = document.querySelector(`.home-ring[data-id="${task.id}"]`);
    if (!ring) return;
    ring.dataset.target = task.progress;
    ring.style.setProperty('--p', task.progress + '%');
    const inner = ring.querySelector('.ring-inner');
    if (inner) inner.textContent = task.progress + '%';
  });
  const running = state.tasks.filter(t => t.status === 'running');
  const meta = $('widget-active-tasks')?.querySelector('.widget-meta');
  if (meta) meta.textContent = running.length === 1 ? '1 running' : `${running.length} running`;
}

/* ── Render: Scheduled ──────────────────────────────── */
function renderScheduled() {
  const list = $('schedule-list');
  list.innerHTML = '';

  const grouped = {};
  state.scheduled.forEach(s => {
    const key = fmtDate(s.next_run);
    (grouped[key] = grouped[key] || []).push(s);
  });

  const keys = Object.keys(grouped).sort((a, b) => {
    const da = state.scheduled.find(s => fmtDate(s.next_run) === a).next_run;
    const db = state.scheduled.find(s => fmtDate(s.next_run) === b).next_run;
    return da - db;
  });

  keys.forEach(dk => {
    const lbl = el('div', 'schedule-group-label', dk);
    list.appendChild(lbl);

    grouped[dk].forEach(sch => {
      const item = el('div', 'schedule-item');
      item.innerHTML = `
        <div class="sched-time-block">
          <span class="sched-time">${fmtTime(sch.next_run)}</span>
          <span class="sched-date">${fmtDate(sch.next_run)}</span>
        </div>
        <div class="sched-divider"></div>
        <div class="sched-info">
          <div class="sched-name">${sch.name}</div>
          <div class="sched-meta">${sch.recurrence} · avg ${sch.avg_dur}</div>
        </div>
        <div class="sched-right">
          <span class="recur-badge">${sch.recurrence.split(' ')[0]}</span>
          <label class="toggle">
            <input type="checkbox" ${sch.enabled ? 'checked' : ''} data-id="${sch.id}"/>
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>
        </div>`;

      item.querySelector('input[type=checkbox]').addEventListener('change', async e => {
        const s = state.scheduled.find(x => x.id === e.target.dataset.id);
        if (!s) return;
        if (tg) tg.HapticFeedback?.impactOccurred('light');
        const newEnabled = e.target.checked;

        if (state.connectionStatus === 'live') {
          try {
            const res = await fetch(`${API_URL}/api/scheduled/${s.id}`, {
              method: 'PATCH',
              headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ enabled: newEnabled }),
            });
            if (res.ok) { s.enabled = newEnabled; return; }
          } catch (_) { /* fall through */ }
        }
        s.enabled = newEnabled;
      });

      list.appendChild(item);
    });
  });
}

/* ── Render: Logs ───────────────────────────────────── */
function renderLogs() {
  const filtered = state.logFilter === 'all'
    ? state.logs
    : state.logs.filter(l => l.level === state.logFilter);

  const list = $('log-list');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.appendChild(emptyState('No logs', 'Try a different filter'));
    return;
  }

  filtered.forEach(log => {
    const item = el('div', 'log-item');
    item.innerHTML = `
      <span class="log-level ${log.level}">${log.level}</span>
      <div class="log-body">
        <div class="log-msg">${log.msg}</div>
        <div class="log-meta">
          <span>${relTime(log.ts)}</span>
          <span>·</span>
          <span class="log-task-ref">${log.task_name}</span>
        </div>
      </div>`;
    list.appendChild(item);
  });
}

/* ── Render: Analytics ──────────────────────────────── */
function renderAnalytics() {
  const analytics = state.analytics;

  // KPIs
  const grid = $('kpi-grid');
  grid.innerHTML = '';
  const arrow = d => d === 'up' ? '↑' : d === 'down' ? '↓' : '→';
  analytics.kpis.forEach(k => {
    const c = el('div', 'kpi-card');
    c.innerHTML = `
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-trend ${k.dir}">${arrow(k.dir)} ${k.trend}</div>`;
    grid.appendChild(c);
  });

  // Type bar chart
  const chart = $('type-chart');
  chart.innerHTML = '';
  const maxC = Math.max(...analytics.types.map(t => t.count));
  analytics.types.forEach(t => {
    const row = el('div', 'bar-row');
    row.innerHTML = `
      <span class="bar-lbl">${t.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(t.count / maxC) * 100}%;background:${t.color}"></div></div>
      <span class="bar-val">${t.count}</span>`;
    chart.appendChild(row);
  });

  // Status distribution
  const dist = $('status-dist');
  const segs = analytics.statusDist.map(s => `<div class="stacked-seg" style="width:${s.pct}%;background:${s.color}"></div>`).join('');
  const legend = analytics.statusDist.map(s => `<div class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label} ${s.pct}%</div>`).join('');
  dist.innerHTML = `<div class="stacked-bar-wrap"><div class="stacked-bar">${segs}</div><div class="stacked-legend">${legend}</div></div>`;

  // Failure list
  const flist = $('failure-list');
  flist.innerHTML = '';
  analytics.failures.forEach((f, i) => {
    const li = el('li', 'failure-item');
    li.innerHTML = `
      <span class="failure-rank">#${i + 1}</span>
      <div class="failure-info">
        <div class="failure-name">${f.name}</div>
        <div class="failure-count">${f.count} occurrences</div>
      </div>
      <div class="failure-bar-wrap"><div class="failure-bar" style="width:${f.pct}%"></div></div>`;
    flist.appendChild(li);
  });
}

/* ── Tab switching ──────────────────────────────────── */
function switchTab(name) {
  if (state.activeTab === name) return;

  const oldPane = $(`pane-${state.activeTab}`);
  oldPane.classList.remove('visible');
  setTimeout(() => {
    oldPane.classList.remove('active');
    const newPane = $(`pane-${name}`);
    newPane.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => newPane.classList.add('visible')));
  }, 170);

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  state.activeTab = name;
  if (tg) tg.HapticFeedback?.selectionChanged();

  if (name === 'home') renderHome();
  if (name === 'scheduled') renderScheduled();
  if (name === 'logs') renderLogs();
  if (name === 'analytics') renderAnalytics();
}

/* ── Deep-link helper ───────────────────────────────── */
function goTo(tab, filter = null) {
  if (tab === 'tasks' && filter) {
    state.taskFilter = filter;
    $('pane-tasks').querySelectorAll('.filter-chip').forEach(b =>
      b.classList.toggle('active', b.dataset.filter === filter)
    );
  }
  switchTab(tab);
  if (tab === 'tasks') renderTasks();
}

/* ── Filters ────────────────────────────────────────── */
function setupFilters() {
  $('pane-tasks').querySelectorAll('.filter-chip').forEach(btn =>
    btn.addEventListener('click', () => {
      $('pane-tasks').querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.taskFilter = btn.dataset.filter;
      renderTasks();
    })
  );
  $('pane-logs').querySelectorAll('.filter-chip').forEach(btn =>
    btn.addEventListener('click', () => {
      $('pane-logs').querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.logFilter = btn.dataset.filter;
      renderLogs();
    })
  );
}

/* ── Simulation (demo mode only) ────────────────────── */
function simulateProgress() {
  if (state.connectionStatus === 'live') return;  // skip in live mode

  let statusChanged = false;

  state.tasks.forEach(task => {
    if (task.status !== 'running') return;

    // Advance progress
    task.progress = Math.min(task.progress + Math.floor(Math.random() * 3) + 1, 100);

    // Sync steps to progress
    const newStepIdx = Math.min(Math.ceil(task.progress / 100 * task.steps.length), task.steps.length);
    if (newStepIdx !== task.stepIdx) {
      for (let i = 0; i < newStepIdx - 1; i++) {
        if (task.steps[i].status !== 'completed') {
          task.steps[i].status = 'completed';
          addLog('info', task.id, task.name, `✓ Step complete: ${task.steps[i].label}`);
        }
      }
      task.stepIdx = newStepIdx;
      if (task.steps[newStepIdx - 1]) {
        task.steps[newStepIdx - 1].status = 'running';
        task.currentStep = task.steps[newStepIdx - 1].label;
      }
    }

    // Completion
    if (task.progress >= 100) {
      task.status = 'completed';
      task.progress = 100;
      task.completed_at = Date.now();
      task.steps.forEach(s => s.status = 'completed');
      task.currentStep = 'Done';
      addLog('info', task.id, task.name, 'Task completed successfully');
      statusChanged = true;

      // Promote first pending task
      const next = state.tasks.find(t => t.status === 'pending');
      if (next) setTimeout(() => {
        next.status = 'running';
        next.started_at = Date.now();
        if (next.steps[0]) { next.steps[0].status = 'running'; next.currentStep = next.steps[0].label; next.stepIdx = 1; }
        addLog('info', next.id, next.name, 'Task started');
        renderTasks();
      }, 1200);
    }
  });

  if (statusChanged) {
    renderTasks();
    if (state.activeTab === 'home') renderHome();
  } else if (state.activeTab === 'tasks') {
    updateProgressInPlace();
  } else if (state.activeTab === 'home') {
    updateRingsInPlace();
  }
  if (state.activeTab === 'logs' && statusChanged) renderLogs();
}

/* ── Log helper ─────────────────────────────────────── */
function addLog(level, taskId, taskName, msg) {
  state.logs.unshift({ id: `lg${Date.now()}`, level, task_id: taskId, task_name: taskName, msg, ts: Date.now() });
  if (state.logs.length > 60) state.logs.pop();
}

/* ── Backend polling ────────────────────────────────── */
async function fetchState() {
  try {
    const res = await fetch(`${API_URL}/api/state`, {
      headers: { 'X-API-Key': API_KEY },
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    applyState(data);
    setConnectionStatus('live');
  } catch (_) {
    setConnectionStatus('demo');
  }
}

function applyState(data) {
  // Tasks: convert DB fields to frontend shape
  state.tasks = (data.tasks || []).map(t => ({
    ...t,
    currentStep: t.current_step || 'Waiting in queue',
    stepIdx: t.step_idx || 0,
    tags: t.tags || [],
    steps: t.steps || [],
  }));

  // Logs: already in the right shape
  state.logs = data.logs || [];

  // Scheduled: convert next_run int (ms) → Date object
  state.scheduled = (data.scheduled || []).map(s => ({
    ...s,
    enabled: Boolean(s.enabled),
    next_run: s.next_run ? new Date(s.next_run) : new Date(Date.now() + 86400000),
  }));

  // Analytics
  if (data.analytics) {
    state.analytics = data.analytics;
  }

  // Re-render current view
  renderTasks();
  if (state.activeTab === 'home') renderHome();
  else if (state.activeTab === 'scheduled') renderScheduled();
  else if (state.activeTab === 'logs') renderLogs();
  else if (state.activeTab === 'analytics') renderAnalytics();
}

/* ── Connection status indicator ────────────────────── */
function setConnectionStatus(status) {
  if (state.connectionStatus === status) return;
  state.connectionStatus = status;

  // Update or create the connection indicator in header meta
  let indicator = $('conn-status');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.id = 'conn-status';
    indicator.style.cssText = 'margin-left:6px;font-size:11px;opacity:0.75';
    const meta = document.querySelector('.header-meta');
    if (meta) meta.appendChild(indicator);
  }

  if (status === 'live') {
    indicator.innerHTML = '<span style="color:#4ade80">●</span> Live';
  } else {
    indicator.innerHTML = '<span style="color:#666">◌</span> Demo';
  }
}

/* ── Empty state helper ─────────────────────────────── */
function emptyState(title, sub) {
  const d = el('div', 'empty-state');
  d.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.94 0 13.36 0c-1.31 0-2.47.53-3.32 1.39L9 2.5 7.96 1.39C7.11.53 5.95 0 4.64 0 2.06 0 0 2.06 0 4.64c0 .48.11.92.18 1.36H0v2h2v12h2V8h16v12h2V8h2V6h-2zm-6.64-4c1.31 0 2.36 1.05 2.36 2.36 0 .31-.06.6-.16.88L4.44 5.24A2.324 2.324 0 0 1 4.64 2C5.95 2 7 3.05 7 4.36c0 .31-.06.6-.16.88L4.44 5.24A2.324 2.324 0 0 1 4.64 2zm0 0" fill="currentColor"/>
    </svg>
    <div class="empty-state-title">${title}</div>
    <div class="empty-state-sub">${sub}</div>`;
  return d;
}

/* ── Refresh button ─────────────────────────────────── */
function setupRefresh() {
  $('btn-refresh').addEventListener('click', async () => {
    const svg = $('btn-refresh').querySelector('svg');
    svg.classList.add('spinning');
    setTimeout(() => svg.classList.remove('spinning'), 500);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
    await fetchState();
    renderTasks();
    if (state.activeTab === 'home') renderHome();
  });
}

/* ── Periodic timestamp refresh ─────────────────────── */
function refreshTimes() {
  if (state.activeTab === 'tasks') renderTasks();
  if (state.activeTab === 'logs') renderLogs();
  if (state.activeTab === 'home') renderHome();
}

/* ── Init ───────────────────────────────────────────── */
function init() {
  renderTasks();   // populate task pane + header counts/badge
  renderHome();    // populate home pane
  requestAnimationFrame(() => requestAnimationFrame(() => $('pane-home').classList.add('visible')));

  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab))
  );

  setupFilters();
  setupRefresh();

  // Try to connect to backend immediately, then poll every 3s
  fetchState();
  setInterval(fetchState, 3000);

  // Demo simulation still runs but is gated (no-op when live)
  setInterval(simulateProgress, 1700);
  setInterval(refreshTimes, 20000);  // "Xs ago" labels
}

document.addEventListener('DOMContentLoaded', init);
