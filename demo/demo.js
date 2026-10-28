// Studio desk's demo: the app's dashboard, drawn with its own stylesheet and faces (assets/app, copied unchanged from
// a release), and a pretend controller in this page that plays back an idea's run from scenarios.js. No agent runs,
// and nothing leaves the browser. The pages follow the app's markup, so they look and move as the app does; only the
// dock in the corner is the demo's own.
import { build, rhythm, VIEWBOX, COLORS, pickNew, pickName } from '../assets/app/agent-kit.js';
import { scenarios } from './scenarios.js';

const root = document.getElementById('demo');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Drawing helpers, as the app's components draw them ─────────────────────────────────────────────────────────

const esc = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );

const ICONS = {
  today: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5.5 5h13l2.5 8v6H3v-6z"/>',
  ideas:
    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  board:
    '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
  agents:
    '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  updown: '<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',
  spark: '<path d="M12 5v14M5 12h14"/>',
  clip: '<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  merge:
    '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10M6 7c0 3 3 5 10 5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  more: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>',
  restart: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
  shuffle:
    '<path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c2 0 3-1.6 4-3.5M20 7h-3c-2 0-3 1.6-4 3.5M17 4l3 3-3 3M17 14l3 3-3 3"/>',
};
const icon = (name, size = 20, weight = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const mark = size =>
  `<svg width="${size}" height="${size}" viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" rx="30" fill="#5B45E0"/><path d="M50 58C50 46.9543 58.9543 38 70 38H132.5C142.165 38 150 45.835 150 55.5C150 65.165 142.165 73 132.5 73H55C52.2386 73 50 70.7614 50 68V58Z" fill="#fff"/><path d="M50 88C50 85.2386 52.2386 83 55 83H130C141.046 83 150 91.9543 150 103V113C150 115.761 147.761 118 145 118H70C58.9543 118 50 109.046 50 98V88Z" fill="#FFD23F"/><path d="M50 145.5C50 135.835 57.835 128 67.5 128H145C147.761 128 150 130.239 150 133V143C150 154.046 141.046 163 130 163H67.5C57.835 163 50 155.165 50 145.5Z" fill="#fff"/></svg>`;

// An agent's face, as the app's AgentAvatar draws it: the kit's layers, moved by bundle.css with the agent's state.
const paths = layer =>
  layer
    .map(
      p =>
        `<path d="${p.d}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
function avatar(look, state = 'idle', size = 36, ring = true) {
  const layers = build(look, state),
    { delay, tempo } = rhythm(look),
    ringed = ring && state === 'working',
    timing = `--sd-avatar-delay:${delay}s;--sd-avatar-tempo:${tempo}`;
  const svg =
    `<svg class="sd-avatar" data-state="${state}" width="${size}" height="${size}" viewBox="${VIEWBOX}" aria-hidden="true"${ringed ? '' : ` style="${timing}"`}>` +
    `<g class="sd-avatar__whole">${paths(layers.body)}<g transform="${layers.dy}"><g class="sd-avatar__top">${paths(layers.top)}</g></g>` +
    `${paths(layers.brows)}<g class="sd-avatar__eyes">${paths(layers.eyes)}<g class="sd-avatar__pupils">${paths(layers.pupils)}</g></g>` +
    `<g class="sd-avatar__mouth">${paths(layers.mouth)}</g><g class="sd-avatar__mouth-alt">${paths(layers.mouthAlt)}</g>${paths(layers.detail)}</g></svg>`;
  return ringed
    ? `<span class="sd-avatar-ring" style="${timing};border-radius:${Math.round(size * 0.3)}px">${svg}</span>`
    : svg;
}
const chip = (tone, label, extra = '') =>
  `<span class="sd-chip${tone && tone !== 'wait' ? ` sd-chip--${tone}` : ''}${extra}"><span class="sd-chip__dot"></span>${esc(label)}</span>`;
const plural = (count, one, many = one + 's') => (count === 1 ? one : many);
const numbers = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const counted = (count, lower = false) => {
  const word = numbers[count] ?? String(count);
  return lower ? word.toLowerCase() : word;
};
const quoted = (text, length = 72) => {
  if (text.length <= length) return `“${text}”`;
  return `“${text.slice(0, length).replace(/\s+\S*$/, '')}…”`;
};
const clock = date => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// ── The pretend controller ──────────────────────────────────────────────────────────────────────────────────────

const pink = COLORS.find(([name]) => name === 'Pink')?.[1] ?? '#f0629b';
const tileColor = {
  party: [pink, 'var(--sticker-ink)'],
  dragon: ['var(--project-1)', '#fff'],
  snake: ['var(--project-2)', 'var(--sticker-ink)'],
};

class Cancelled extends Error {}

function fresh(sc) {
  return {
    sc,
    token: (projects.get(sc.id)?.token ?? 0) + 1,
    phase: 'idle',
    text: '',
    tasks: [],
    calls: [],
    agents: new Map(
      sc.team.map(member => [member.id, { ...member, state: 'idle', task: null, say: null, last: null }]),
    ),
    made: [],
    sentAt: null,
    shippedAt: null,
    waiting: new Map(),
  };
}
const projects = new Map();
for (const sc of scenarios) projects.set(sc.id, fresh(sc));

const ui = { project: scenarios[0].id, view: 'today', taskId: null, tab: 'result', speed: 1, toast: '', toastTimer: 0 };
const current = () => projects.get(ui.project);
const agentOf = (P, id) => P.agents.get(id) ?? P.made.find(item => item.id === id);
const nameOf = (P, id) => agentOf(P, id)?.name ?? 'The controller';

// Time runs only while the page is visible, at the dock's speed. A project restarted mid-run stops its old run here.
function wait(P, ms, token = P.token) {
  return new Promise((resolve, reject) => {
    let left = reduce ? Math.min(ms, 400) : ms,
      last = performance.now();
    const tick = now => {
      if (P.token !== token) return reject(new Cancelled());
      if (!document.hidden) left -= (now - last) * ui.speed;
      last = now;
      if (left <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
// A call the visitor answers: the run waits here until its button is pressed.
function answer(P, key, token = P.token) {
  return new Promise((resolve, reject) => {
    let answered = false;
    P.waiting.set(key, () => {
      answered = true;
      resolve();
    });
    const check = () => {
      if (answered) return;
      if (P.token !== token) reject(new Cancelled());
      else setTimeout(check, 300);
    };
    check();
  });
}
function toast(P, words) {
  if (P !== current()) return;
  ui.toast = words;
  clearTimeout(ui.toastTimer);
  ui.toastTimer = setTimeout(() => {
    ui.toast = '';
    render();
  }, 4200);
}

function addTask(P, fields) {
  const task = {
    column: 'ready',
    chip: null,
    attempt: 0,
    share: 0,
    attempts: [],
    tests: null,
    change: null,
    commit: null,
    blocking: null,
    needs: [],
    created: new Date(),
    ...fields,
  };
  P.tasks.push(task);
  return task;
}

// An agent at work on a task: its face rings, its card moves to In progress, and its words change line by line.
async function work(P, task, lines, { by = task.worker, chip: label = 'Working', each = 1700, keep = false } = {}) {
  const agent = agentOf(P, by);
  agent.state = 'working';
  agent.task = task.id;
  task.column = 'progress';
  task.chip = { tone: 'live', label };
  task.by = by;
  for (let i = 0; i < lines.length; i++) {
    agent.say = lines[i];
    task.line = lines[i];
    task.share = Math.round(((i + 0.6) / lines.length) * 100);
    render();
    await wait(P, each);
  }
  if (!keep) rest(P, by, task);
}
function rest(P, id, task, words) {
  const agent = agentOf(P, id);
  agent.state = 'idle';
  agent.task = null;
  agent.say = null;
  agent.last = { words: words ?? `Worked on “${task.title}”`, at: new Date() };
}
// One active attempt per agent, as the controller keeps it: a review waits until its reviewer is free.
async function claim(P, id, task) {
  const agent = agentOf(P, id);
  while (agent.task) {
    task.chip = { tone: 'wait', label: `Waits for ${agent.name}` };
    render();
    await wait(P, 250);
  }
  agent.task = task.id;
}
async function cheer(P, id) {
  const agent = agentOf(P, id);
  agent.state = 'done';
  render();
  await wait(P, 1600);
  if (agent.state === 'done') agent.state = 'idle';
}

async function play(P) {
  const { sc } = P;
  P.phase = 'running';
  P.sentAt = new Date();
  toast(P, `Sent to ${nameOf(P, sc.planner)}.`);
  render();
  await wait(P, 700);
  if (sc.checks) {
    const checks = addTask(P, { id: 'T-1a2b3c', title: sc.checks.title, kind: 'checks', worker: sc.checker });
    await work(P, checks, sc.checks.lines, { chip: 'Running tests', each: 1300 });
    checks.tests = { pass: sc.checks.tests, total: sc.checks.tests };
    checks.column = 'done';
    checks.chip = { tone: 'ok', label: 'Passed' };
    checks.finished = new Date();
    rest(P, sc.checker, checks, `Checked the source: ${sc.checks.tests} of ${sc.checks.tests} tests`);
    cheer(P, sc.checker).catch(() => {});
  }
  const plan = addTask(P, {
    id: 'T-plan01',
    title: `Plan: ${quoted(sc.suggestion, 48).slice(1, -1)}`,
    kind: 'plan',
    worker: sc.planner,
  });
  await work(P, plan, sc.planning.lines, { chip: 'Planning', each: 1500 });
  rest(P, sc.planner, plan, 'Planned your idea');
  plan.column = 'review';
  plan.chip = { tone: 'you', label: 'Accept the plan' };
  plan.finished = new Date();
  plan.summary = sc.planning.summary;
  agentOf(P, sc.planner).state = 'talking';
  P.calls.push({ kind: 'plan', task: plan.id, at: new Date() });
  toast(
    P,
    `${nameOf(P, sc.planner)}'s plan is ready: ${counted(sc.steps.length, true)} ${plural(sc.steps.length, sc.code ? 'story' : 'step', sc.code ? 'stories' : 'steps')}.`,
  );
  render();
  wait(P, 2600)
    .then(() => {
      const planner = agentOf(P, sc.planner);
      if (planner.state === 'talking') planner.state = 'idle';
      render();
    })
    .catch(() => {});
  await answer(P, 'plan');
  P.calls = P.calls.filter(call => call.kind !== 'plan');
  plan.column = 'done';
  plan.chip = { tone: 'ok', label: 'Accepted' };
  toast(P, 'Plan accepted. The house rules start the work.');
  for (const step of sc.steps)
    addTask(P, {
      id: step.id,
      title: step.title,
      kind: sc.code ? 'story' : 'step',
      worker: step.worker,
      step,
      needs: step.needs ?? [],
    });
  render();
  await wait(P, 900);
  await schedule(P);
  P.phase = 'done';
  P.shippedAt = new Date();
  toast(P, sc.code ? `Both stories are integrated. Your idea shipped.` : `Every step is accepted. Your idea is done.`);
  render();
}

// Steps start when what they need is done and their agent is free: two attempts at once, as the app's default, and
// a code project's stories one after another.
async function schedule(P) {
  const slots = P.sc.code ? 1 : 2,
    running = new Map(),
    steps = P.tasks.filter(task => task.step);
  const done = id => P.tasks.find(task => task.id === id)?.column === 'done';
  const busy = id => [...running.keys()].some(key => P.tasks.find(task => task.id === key).worker === id);
  while (steps.some(task => task.column !== 'done')) {
    for (const task of steps)
      if (!task.started && running.size < slots && task.needs.every(done) && !busy(task.worker)) {
        task.started = true;
        const step = runStep(P, task).finally(() => running.delete(task.id));
        step.catch(() => {});
        running.set(task.id, step);
      }
    if (!running.size) break;
    await Promise.race(running.values());
  }
}

async function runStep(P, task) {
  const { sc } = P,
    step = task.step,
    reviewer = agentOf(P, sc.reviewer);
  for (let i = 0; i < step.attempts.length; i++) {
    const attempt = step.attempts[i],
      record = { n: i + 1, by: task.worker, started: new Date() };
    task.attempt = i + 1;
    task.attempts.push(record);
    await work(P, task, attempt.lines, { chip: sc.code ? 'Editing' : 'Working', keep: !!attempt.tests });
    if (attempt.tests) {
      await work(P, task, ['Running the tests in the sandbox…'], { chip: 'Running tests', each: 2200 });
      task.tests = attempt.tests;
      task.change = attempt.change;
      record.tests = attempt.tests;
      record.change = attempt.change;
    }
    rest(P, task.worker, task);
    // The independent review: another agent reads the work against the idea.
    task.column = 'review';
    await claim(P, sc.reviewer, task);
    task.chip = { tone: 'live', label: 'Reviewing' };
    reviewer.state = 'working';
    for (const line of attempt.review.lines) {
      reviewer.say = line;
      task.line = line;
      render();
      await wait(P, 1500);
    }
    rest(P, sc.reviewer, task, `Reviewed “${task.title}”`);
    record.review = attempt.review;
    record.finished = new Date();
    if (attempt.review.verdict === 'back') {
      const findings = attempt.review.findings;
      task.blocking = { count: findings.length, place: /^([\w./-]+:\d+)/.exec(findings[0])?.[1] ?? null };
      task.chip = { tone: 'bad', label: 'Sent back' };
      toast(P, `${reviewer.name} sent “${task.title}” back: ${findings.length} blocking.`);
      render();
      await wait(P, 2600);
      task.blocking = null;
      continue;
    }
  }
  if (sc.code) {
    task.column = 'review';
    task.chip = { tone: 'you', label: 'Integrate' };
    P.calls.push({ kind: 'integrate', task: task.id, at: new Date() });
    toast(P, `“${task.title}” passed its tests and review. It's yours to integrate.`);
    render();
    await answer(P, `integrate:${task.id}`);
    P.calls = P.calls.filter(call => call.task !== task.id);
    task.chip = { tone: 'live', label: 'Integrating' };
    P.integrating = task.id;
    render();
    await wait(P, 2400);
    P.integrating = null;
    task.commit = step.commit;
    task.chip = { tone: 'ok', label: 'Integrated' };
    toast(P, `Integrated as ${step.commit}. ${task.tests.total} of ${task.tests.total} tests passed after the merge.`);
  } else {
    task.chip = { tone: 'ok', label: 'Accepted' };
    toast(P, `Accepted “${task.title}”.`);
  }
  task.column = 'done';
  task.finished = new Date();
  agentOf(P, task.worker).last = { words: `Finished “${task.title}”`, at: new Date() };
  await cheer(P, task.worker);
}

function start(P) {
  play(P).catch(error => {
    if (!(error instanceof Cancelled)) console.error(error);
  });
}
function restart(id) {
  const old = projects.get(id),
    next = fresh(old.sc);
  next.token = old.token + 1;
  old.token = next.token;
  projects.set(id, next);
  ui.view = 'today';
  ui.taskId = null;
  render();
}

// ── Pages ───────────────────────────────────────────────────────────────────────────────────────────────────────

const busyAgents = P => [...P.agents.values(), ...P.made].filter(agent => agent.task);
const floorLine = P => {
  const all = [...P.agents.values(), ...P.made],
    working = all.filter(agent => agent.task).length;
  return `${working} working · ${all.length - working} free · nothing paused`;
};
const callsTitle = calls =>
  !calls ? 'Nothing needs you right now.' : `${counted(calls)} ${plural(calls, 'call is', 'calls are')} yours to make.`;
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Morning.' : hour < 18 ? 'Afternoon.' : 'Evening.';
};
const dayLine = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function floorSentence(P) {
  const running = P.tasks.filter(
    task => task.column === 'progress' || (task.column === 'review' && task.chip?.tone === 'live'),
  );
  const sentences = [];
  if (running.length) {
    const first = running[0],
      verb =
        first.chip?.label === 'Running tests'
          ? 'running the tests on'
          : first.kind === 'plan'
            ? 'planning'
            : first.column === 'review'
              ? 'reviewing'
              : 'working on';
    const who = first.column === 'review' ? nameOf(P, P.sc.reviewer) : nameOf(P, first.by ?? first.worker);
    sentences.push(`${who} is ${verb} ${first.kind === 'plan' ? 'your latest idea' : `“${first.title}”`}.`);
    if (running.length > 1)
      sentences.push(
        `${counted(running.length - 1)} more ${plural(running.length - 1, 'agent is', 'agents are')} working.`,
      );
  } else sentences.push('Nothing is running right now.');
  if (P.shippedAt) sentences.push('One idea shipped today.');
  return sentences.join(' ');
}

function frame(P) {
  const calls = P.calls.length;
  const count = calls
    ? `<span class="sd-count" aria-label="${calls} ${plural(calls, 'call')} for you">${calls}</span>`
    : '';
  const pages = [
    ['today', 'Today', 'today'],
    ['ideas', 'Ideas', 'ideas'],
    ['board', 'Board', 'board'],
    ['agents', 'Agents', 'agents'],
    ['settings', 'Project settings', 'settings'],
  ];
  const here =
    ui.view === 'task' ? (P.tasks.find(t => t.id === ui.taskId)?.kind === 'plan' ? 'ideas' : 'board') : ui.view;
  const [bg, fg] = tileColor[P.sc.id];
  return `<div class="sd-app sd-ground">
  <div class="sd-frame">
    <nav class="sd-rail" aria-label="Projects">${mark(32)}<span class="sd-rail__rule" aria-hidden="true"></span>${scenarios
      .map(sc => {
        const [b, f] = tileColor[sc.id];
        return `<a href="#${sc.id}" class="sd-rail__tile" data-act="project" data-arg="${sc.id}" style="background:${b};color:${f}" aria-label="${esc(sc.project.name)}" title="${esc(sc.project.name)}"${sc.id === ui.project ? ' aria-current="true"' : ''}>${sc.project.initials}</a>`;
      })
      .join(
        '',
      )}<button type="button" class="sd-rail__add" aria-label="Add a project" title="Adding a project isn't in the demo" disabled>${icon('plus', 20, 2.4)}</button><a href="#settings" class="sd-rail__settings" data-act="view" data-arg="settings" aria-label="Settings" title="Settings">${icon('settings')}</a></nav>
    <aside class="sd-sidebar" aria-label="${esc(P.sc.project.name)}">
      <div class="sd-sidebar__project"><span class="sd-eyebrow" style="font-size:10.5px">Project</span><span class="sd-sidebar__name">${esc(P.sc.project.name)}</span><span class="sd-meta">${esc(P.sc.project.kind)}</span></div>
      <button type="button" class="sd-search" data-act="rail-hint">${icon('search', 17, 2.2)}<span>Find a project</span><kbd class="sd-kbd">Ctrl K</kbd></button>
      <button type="button" class="sd-btn sd-btn--primary" style="width:100%" data-act="new-idea">${icon('plus', 18, 2.4)}New idea<kbd class="sd-key" aria-hidden="true">N</kbd></button>
      <nav aria-label="Main">${pages
        .map(
          ([id, label, name]) =>
            `<a class="sd-navlink" href="#${id}" data-act="view" data-arg="${id}"${here === id ? ' aria-current="page"' : ''}>${icon(name)}${label}${id === 'today' ? count : ''}</a>`,
        )
        .join('')}</nav>
      <div class="sd-status">
        <div class="sd-status__head"><span class="sd-status__light sd-status__light--live" aria-hidden="true"></span>Demo controller, in this page</div>
        <div class="sd-meta">${floorLine(P)}</div>
        <div class="sd-meta">${esc(P.sc.rules)}</div>
      </div>
    </aside>
  </div>
  <header class="sd-topbar">${mark(30)}<button type="button" class="sd-topbar__project" data-act="next-project" aria-label="Switch project. Current: ${esc(P.sc.project.name)}"><span class="sd-topbar__square" style="background:${bg}"></span><span class="sd-topbar__name">${esc(P.sc.project.name)}</span>${icon('updown', 16, 2.2)}</button></header>
  <main class="sd-main"><div class="sd-page">${page(P)}</div></main>
  <nav class="sd-tabbar" aria-label="Pages">${pages
    .filter(([id]) => id !== 'settings')
    .flatMap(([id, label, name]) => [
      ...(id === 'board'
        ? [
            `<button type="button" class="sd-tab" aria-label="New idea" data-act="new-idea"><span class="sd-tab__new">${icon('plus', 28, 2.6)}</span></button>`,
          ]
        : []),
      `<a class="sd-tab" href="#${id}" data-act="view" data-arg="${id}"${here === id ? ' aria-current="page"' : ''}>${icon(name, 24)}${label}${id === 'today' ? count : ''}</a>`,
    ])
    .join('')}</nav>
</div>`;
}

function page(P) {
  if (ui.view === 'task') return storyPage(P);
  if (ui.view === 'board') return boardPage(P);
  if (ui.view === 'agents') return agentsPage(P);
  if (ui.view === 'ideas') return ideasPage(P);
  if (ui.view === 'settings') return settingsPage(P);
  return todayPage(P);
}

function ideaBox(P) {
  const sc = P.sc,
    sent = P.phase !== 'idle',
    ready = !sent && P.text === sc.idea;
  const others = scenarios.filter(item => item.id !== sc.id);
  return `<form class="sd-ideabox" aria-label="New idea for ${esc(sc.project.name)}" data-act="send-form">
  <div class="sd-ideabox__head"><label class="sd-ideabox__label" for="idea-text"><span class="sd-ideabox__dot" style="background:${tileColor[sc.id][0]}"></span><span>New idea for ${esc(sc.project.name)}</span></label></div>
  <textarea id="idea-text" class="sd-ideabox__text" rows="2" readonly placeholder="${sent ? 'Your idea is with the team. Watch it go below.' : 'In the demo the team knows one idea per project. Pick it below.'}"></textarea>
  ${
    !sent
      ? `<div class="sd-ideabox__suggestions"><span class="sd-meta">Try this idea</span><div><button type="button" class="sd-ideabox__suggest" data-act="suggest">${icon('spark', 16)}<span>${esc(sc.suggestion)}</span></button></div></div>`
      : ''
  }
  <div class="sd-ideabox__bar">
    <button type="button" class="sd-ideabox__tool" disabled title="Files aren't in the demo">${icon('clip', 18)}Files</button>
    <div class="sd-ideabox__send">${ready ? '<span class="sd-meta">Ctrl + Enter</span>' : ''}<button type="submit" class="sd-btn sd-btn--primary sd-ideabox__sendbtn${ready ? ' demo-nudge' : ''}"${ready ? '' : ' disabled'}><span>Send to ${esc(sc.project.name)}</span>${icon('arrow', 16, 2.4)}</button></div>
  </div>
  ${!sent ? `<span class="sd-meta demo-others">Or open another project: ${others.map(item => `<a href="#${item.id}" data-act="project" data-arg="${item.id}">${esc(item.project.name)}</a>`).join(' or ')}</span>` : ''}
</form>`;
}

function said(look, state, html) {
  return `<div class="sd-message">${look ? avatar(look, state, 36) : ''}<div class="sd-bubble" style="display:flex;flex-direction:column;gap:var(--space-8)">${html}</div></div>`;
}
function decision({ chipHtml, time, title, origin, body, actions, note }) {
  return `<article class="sd-card sd-decision">
  <div class="sd-decision__head">${chipHtml}<span class="sd-meta sd-decision__time">${esc(time)}</span></div>
  <div class="sd-decision__heading"><h3 class="sd-decision__title">${esc(title)}</h3>${origin ? `<div class="sd-meta sd-wide-only">${origin}</div>` : ''}</div>
  ${body ?? ''}
  <div class="sd-decision__actions">${actions}${note ? `<span class="sd-meta sd-decision__note">${esc(note)}</span>` : ''}</div>
</article>`;
}
const origin = (P, task) => {
  const stories = P.tasks.filter(item => item.step),
    index = stories.indexOf(task);
  return `${index >= 0 && P.sc.code ? `Story ${index + 1} of ${stories.length} · ` : ''}from your idea <a href="#ideas" data-act="view" data-arg="ideas">${esc(quoted(P.sc.idea, 64))}</a>`;
};

function calls(P) {
  return P.calls
    .map(call => {
      const task = P.tasks.find(item => item.id === call.task);
      if (call.kind === 'plan') {
        const planner = agentOf(P, P.sc.planner);
        return decision({
          chipHtml: chip('you', 'Accept the result'),
          time: clock(call.at),
          title: task.title,
          origin: origin(P, task),
          body: said(
            planner.look,
            planner.state,
            `<span>${esc(P.sc.planning.summary)}</span><ol class="demo-plan">${P.sc.steps
              .map(
                step =>
                  `<li><b>${esc(step.title)}</b> <span class="sd-meta">· ${esc(nameOf(P, step.worker))}${step.needs?.length ? ', after the one before' : ''}</span></li>`,
              )
              .join('')}</ol>`,
          ),
          actions: `<button type="button" class="sd-btn sd-btn--primary demo-nudge" data-act="answer" data-arg="plan">Accept planning result</button><a class="sd-btn" href="#task" data-act="task" data-arg="${task.id}">Open the result</a>`,
        });
      }
      const share = (task.change.added / (task.change.added + task.change.removed)) * 100,
        reviewer = agentOf(P, P.sc.reviewer),
        last = task.attempts.at(-1);
      return decision({
        chipHtml: `<span class="sd-chip sd-chip--brand">${icon('merge', 14, 2.4)}Ready to integrate</span>`,
        time: clock(call.at),
        title: task.title,
        origin: origin(P, task),
        body: `<div class="sd-decision__tiles">
  <a class="sd-tile" href="#task" data-act="task" data-arg="${task.id}" data-tab="change"><span class="sd-eyebrow">Change</span><span style="display:flex;align-items:baseline;gap:var(--space-8)"><b class="sd-tile__value" style="color:var(--add)">+${task.change.added}</b><b class="sd-tile__value" style="color:var(--del)">−${task.change.removed}</b></span><span class="sd-bar" aria-hidden="true"><span class="sd-bar__part sd-bar__part--ok" style="width:${share}%"></span><span class="sd-bar__part sd-bar__part--bad" style="width:${100 - share}%"></span></span><span class="sd-meta">in ${task.change.files} files</span></a>
  <a class="sd-tile" href="#task" data-act="task" data-arg="${task.id}"><span class="sd-eyebrow">Tests</span><b class="sd-tile__value">${task.tests.pass} / ${task.tests.total}</b><span class="sd-bar" aria-hidden="true"><span class="sd-bar__part sd-bar__part--ok" style="width:100%"></span></span><span class="sd-meta">passed in the sandbox</span></a>
  <a class="sd-tile" href="#task" data-act="task" data-arg="${task.id}" data-tab="review"><span class="sd-wide-only" style="display:inline-flex">${avatar(reviewer.look, 'done', 40)}</span><span class="sd-eyebrow"><span class="sd-wide-only">${esc(reviewer.name)}'s review</span><span class="sd-narrow-only">Review</span></span>${chip('ok', 'Passed', ' sd-wide-only')}<span class="sd-meta">${last.review.notes?.length ?? 0} ${plural(last.review.notes?.length ?? 0, 'note')}</span></a>
</div>`,
        actions: `<button type="button" class="sd-btn sd-btn--primary demo-nudge" data-act="answer" data-arg="integrate:${task.id}">Integrate</button><a class="sd-btn" href="#task" data-act="task" data-arg="${task.id}">See the change</a>`,
        note: `Built by ${nameOf(P, task.worker)} in ${task.attempts.length} ${plural(task.attempts.length, 'attempt')} · reviewed by ${reviewer.name}`,
      });
    })
    .join('');
}

function floor(P) {
  const all = [...P.agents.values(), ...P.made],
    busy = all.filter(agent => agent.task),
    free = all.filter(agent => !agent.task);
  const live = busy
    .map(agent => {
      const task = P.tasks.find(item => item.id === agent.task);
      const reviewing = task.column === 'review';
      const label = reviewing ? 'Reviewing' : (task.chip?.label ?? 'Working');
      const step =
        task.kind === 'plan'
          ? 'Planning'
          : task.kind === 'checks'
            ? 'Checks'
            : reviewing
              ? 'Review'
              : `Attempt ${task.attempt}`;
      return `<section class="sd-card sd-card--live sd-floor-live" aria-label="${esc(agent.name)} is working" data-key="live-${agent.id}">
  <div class="sd-floor-live__who">${avatar(agent.look, 'working', 48)}<div style="min-width:0"><div><span class="sd-floor-live__name">${esc(agent.name)}</span> <span class="sd-meta">· ${esc(agent.job)}</span></div>${chip('live', label)}</div></div>
  <a class="sd-floor-live__story" href="#task" data-act="task" data-arg="${task.id}">${esc(task.title)}</a>
  ${agent.say ? `<div class="sd-bubble" style="flex:none">${esc(agent.say)}<div class="sd-meta" style="margin-top:2px">${clock(new Date())}</div></div>` : ''}
  <div style="display:flex;flex-direction:column;gap:var(--space-6)"><div class="sd-meta sd-floor-live__line"><span>${step} · ${reviewing ? 'reviewing' : label === 'Running tests' ? 'now testing' : 'working'}</span></div><span class="sd-bar" aria-hidden="true"><span class="sd-bar__part sd-bar__part--live" style="width:${Math.max(6, task.share || 30)}%"></span></span></div>
  <a class="sd-btn sd-btn--sm" style="align-self:flex-start" href="#task" data-act="task" data-arg="${task.id}">Watch ${esc(agent.name)} work</a>
</section>`;
    })
    .join('');
  const integrating = P.integrating
    ? `<section class="sd-card sd-card--live sd-floor-live" aria-label="The controller is integrating"><div class="sd-floor-live__who"><span class="sd-floor-live__name">The controller</span>${chip('live', 'Integrating')}</div><a class="sd-floor-live__story" href="#task" data-act="task" data-arg="${P.integrating}">${esc(P.tasks.find(t => t.id === P.integrating).title)}</a><span class="sd-meta">It formats the change and runs every test; it commits only if they all pass.</span></section>`
    : '';
  const list = free.length
    ? `<section class="sd-card sd-floor-list" aria-label="Free agents">${free
        .map(
          agent =>
            `<div class="sd-floor-row" data-key="free-${agent.id}">${avatar(agent.look, agent.state, 36)}<div class="sd-floor-row__text"><b>${esc(agent.name)}</b> <span class="sd-meta">· ${esc(agent.job)}</span>${agent.last ? `<div class="sd-meta">${esc(agent.last.words)} · ${clock(agent.last.at)}</div>` : agent.made ? '<div class="sd-meta">Made for this project</div>' : ''}</div><span class="sd-chip">Free</span></div>`,
        )
        .join('')}</section>`
    : '';
  return live + integrating + list;
}

function shipped(P) {
  const results = P.tasks.filter(task => task.step && task.column === 'done');
  const row = P.shippedAt
    ? `<a class="sd-cardlist__row" href="#ideas" data-act="view" data-arg="ideas"><span class="sd-cardlist__label">${esc(quoted(P.sc.idea))}</span><span class="sd-cardlist__meta">${chip('ok', P.sc.code ? `${results.length} ${plural(results.length, 'story', 'stories')}` : `${results.length} ${plural(results.length, 'result')}`)}${P.sc.code ? `<span class="sd-file">${esc(results[0].commit)}</span>${results.length > 1 ? `<span class="sd-file">+${results.length - 1}</span>` : ''}` : ''}<span class="sd-meta">${clock(P.shippedAt)}</span></span></a>`
    : '<span class="sd-meta" style="padding-top:var(--space-6)">Nothing has shipped yet today.</span>';
  return `<section class="sd-card sd-cardlist" aria-labelledby="shipped"><div class="sd-cardlist__head"><h2 id="shipped" class="sd-cardlist__title">Shipped today</h2><a href="#ideas" data-act="view" data-arg="ideas">All ideas</a></div>${row}</section>`;
}

function strip(P) {
  const all = [...P.agents.values(), ...P.made];
  return `<section aria-label="On the floor" class="sd-narrow-only"><div class="sd-floor-strip">${all
    .map(agent => {
      const live = !!agent.task;
      return `<span class="sd-floor-strip__who" data-key="strip-${agent.id}"><span class="sd-floor-strip__ring${live ? ' sd-floor-strip__ring--live' : ''}">${avatar(agent.look, live ? 'working' : agent.state, 50, false)}</span>${esc(agent.name)}<span class="sd-floor-strip__state${live ? ' sd-floor-strip__state--live' : ''}">${live ? (P.tasks.find(t => t.id === agent.task)?.column === 'review' ? 'reviewing' : 'working') : 'free'}</span></span>`;
    })
    .join('')}</div></section>`;
}

function endCard(P) {
  if (P.phase !== 'done') return '';
  const others = scenarios.filter(item => item.id !== P.sc.id);
  return `<section class="sd-card demo-end" aria-label="The run is done">
  <div class="demo-end__faces">${P.sc.team.map(member => avatar(member.look, 'done', 40)).join('')}</div>
  <div><h3 class="sd-decision__title">That's the whole run.</h3><p class="sd-meta" style="margin:4px 0 0">${
    P.sc.code
      ? 'Two stories planned, built, tested, sent back once, fixed and integrated.'
      : 'Planned, done, sent back once, fixed and accepted.'
  } In the app, real agents do this on your own Claude Code or Codex sign-in.</p></div>
  <div class="demo-end__actions"><a class="sd-btn sd-btn--primary" href="#ideas" data-act="view" data-arg="ideas">Read what they made</a>${others
    .map(
      item =>
        `<a class="sd-btn" href="#${item.id}" data-act="project" data-arg="${item.id}">Try “${esc(item.project.name)}”</a>`,
    )
    .join('')}</div>
</section>`;
}

function todayPage(P) {
  const decisions = P.calls.length;
  return `<header class="sd-pagehead"><div class="sd-pagehead__text"><div class="sd-eyebrow">${esc(dayLine())}</div><h1 class="sd-pagehead__title"><span class="sd-wide-only">${greeting()} ${callsTitle(decisions)}</span><span class="sd-narrow-only">${greeting()} ${callsTitle(decisions).replace(' to make', '')}</span></h1><p class="sd-pagehead__lead sd-wide-only">${esc(floorSentence(P))}</p></div><a class="sd-btn sd-wide-only" href="#board" data-act="view" data-arg="board">${icon('search', 18, 2.2)}Find work</a></header>
${endCard(P)}
${P.phase === 'done' ? '' : ideaBox(P)}
${strip(P)}
<div class="sd-columns">
  <section class="sd-columns__main" aria-labelledby="calls">
    <div class="sd-section-head"><h2 id="calls" class="sd-section-title">Your calls</h2>${decisions ? chip('you', `${decisions} waiting on you`) : ''}</div>
    ${calls(P)}
    ${
      !decisions
        ? `<div class="sd-card sd-card--quiet" style="padding:var(--space-16) 18px;color:var(--ink-2)">Nothing is waiting on you. ${
            P.phase === 'running'
              ? 'The team is working; their calls appear here.'
              : 'Send an idea, and the calls it needs appear here.'
          }</div>`
        : ''
    }
  </section>
  <aside class="sd-columns__side sd-wide-only" aria-label="On the floor"><h2 class="sd-section-title">On the floor</h2>${floor(P)}${shipped(P)}</aside>
</div>
<div class="sd-narrow-only">${P.shippedAt ? shipped(P) : ''}</div>`;
}

const columns = [
  ['planned', 'Planned', 'needs your OK'],
  ['ready', 'Ready', 'approved, queued'],
  ['progress', 'In progress', ''],
  ['review', 'Review', 'checked, then yours'],
  ['done', 'Done', 'newest first'],
];
function card(P, task) {
  const tone = task.chip?.tone,
    variant = tone === 'you' ? ' sd-kcard--you' : tone === 'live' ? ' sd-kcard--live' : '',
    eyebrow =
      task.kind === 'plan' ? 'Plan' : task.kind === 'checks' ? 'Checks' : task.kind === 'story' ? 'Story' : 'Step',
    waits = task.column === 'ready' && task.needs.find(id => P.tasks.find(t => t.id === id)?.column !== 'done'),
    face = task.column === 'review' && tone === 'live' ? agentOf(P, P.sc.reviewer) : agentOf(P, task.by ?? task.worker),
    faceState =
      task.column === 'progress' || (task.column === 'review' && tone === 'live')
        ? 'working'
        : task.column === 'done'
          ? 'done'
          : 'idle',
    foot =
      task.column === 'progress'
        ? `${face.name} · ${task.kind === 'plan' || task.kind === 'checks' ? 'working' : `attempt ${task.attempt}`}`
        : task.column === 'review' && tone === 'live'
          ? `${face.name} is reviewing`
          : task.column === 'done'
            ? `${nameOf(P, task.worker)}${task.attempts.length > 1 ? ` · ${task.attempts.length} attempts` : ''}`
            : nameOf(P, task.worker);
  return `<a class="sd-kcard${variant}" href="#task" data-act="task" data-arg="${task.id}" data-key="card-${task.id}">
  <span class="sd-kcard__top"><span class="sd-eyebrow">${eyebrow}</span>${task.chip && !waits && task.column !== 'ready' ? chip(tone, task.chip.label) : `<span class="sd-mono sd-meta sd-kcard__id">${task.id}</span>`}</span>
  <span class="sd-kcard__title">${esc(task.title)}</span>
  ${waits ? `<span class="sd-chip sd-chip--wrap" style="align-self:flex-start"><span class="sd-chip__dot"></span>Waits for ${waits}</span>` : ''}
  ${task.column === 'progress' ? `<span style="display:flex;flex-direction:column;gap:var(--space-4)"><span class="sd-bar sd-bar--thin" aria-hidden="true"><span class="sd-bar__part sd-bar__part--live" style="width:${Math.max(6, task.share)}%"></span></span></span>` : ''}
  ${task.change && task.column !== 'progress' ? `<span style="display:flex;flex-wrap:wrap;gap:var(--space-6);align-items:center;font-size:12.5px"><b style="color:var(--add)">+${task.change.added}</b><b style="color:var(--del)">−${task.change.removed}</b><span class="sd-meta">· ${task.tests.pass} tests ·</span>${chip('ok', 'Passed', ' sd-chip--inline')}</span>` : ''}
  ${task.blocking ? `<span style="display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:center">${chip('bad', `${task.blocking.count} blocking`, ' sd-chip--inline')}${task.blocking.place ? `<span class="sd-file">${esc(task.blocking.place)}</span>` : ''}</span>` : ''}
  ${task.commit ? `<span style="display:flex;gap:var(--space-6);align-items:center"><span class="sd-file">${task.commit}</span><span class="sd-meta">${clock(task.finished)}</span></span>` : ''}
  <span class="sd-kcard__from"><span class="sd-ideadot" style="background:${tileColor[P.sc.id][0]}"></span><span>${esc(quoted(P.sc.suggestion, 40))}</span></span>
  <span class="sd-kcard__foot">${avatar(face.look, faceState, 22, false)}${esc(foot)}</span>
</a>`;
}
function boardPage(P) {
  const busy = P.tasks.filter(task => task.column === 'progress').length;
  const counts = {
    open: P.tasks.filter(task => task.column !== 'done').length,
    calls: P.calls.length,
    working: P.tasks.filter(task => task.chip?.tone === 'live').length,
  };
  return `<div class="sd-boardpage">
  <header class="sd-boardhead"><div class="sd-boardhead__text"><h1 class="sd-boardhead__title">Board</h1><p class="sd-meta" style="margin:0">Every task in ${esc(P.sc.project.name)}, from proposed to done.</p></div></header>
  <div class="sd-toolbar"><span class="sd-filter" aria-pressed="true">Open work <b>${counts.open}</b></span><span class="sd-filter"><span class="sd-filter__dot" style="background:var(--you-dot)"></span>Your calls <b>${counts.calls}</b></span><span class="sd-filter"><span class="sd-filter__dot" style="background:var(--live-dot)"></span>Working <b>${counts.working}</b></span><span class="sd-toolbar__rule sd-wide-only" aria-hidden="true"></span>${[...P.agents.values()].map(agent => `<span class="sd-face" title="${esc(agent.name)}">${avatar(agent.look, agent.task ? 'working' : agent.state, 28, false)}</span>`).join('')}</div>
  <div class="sd-kanbanwrap" role="region" aria-label="Board columns" tabindex="0"><div class="sd-kanban">${columns
    .map(([id, name, note]) => {
      const own = P.tasks.filter(task => task.column === id);
      if (id === 'done') own.reverse();
      return `<section class="sd-col" aria-label="${name}"><div class="sd-colhead"><span class="sd-colhead__name">${name}</span><span class="sd-colhead__count">${own.length}</span><span class="sd-meta sd-colhead__note">${id === 'progress' ? `${busy} of ${P.sc.code ? 1 : 2} ${plural(P.sc.code ? 1 : 2, 'slot')} busy` : note}</span></div>${
        own.length
          ? own.map(task => card(P, task)).join('')
          : id === 'planned' && P.phase === 'idle'
            ? `<div class="sd-empty">Nothing proposed. A new idea lands here as ${P.sc.code ? 'stories' : 'steps'} for you to approve. <a class="sd-link" href="#today" data-act="view" data-arg="today">Send an idea</a></div>`
            : ''
      }</section>`;
    })
    .join('')}</div></div>
</div>`;
}

function steps(task, P) {
  const plan = task.kind === 'plan';
  const list = plan
    ? [
        ['Planned', task.column !== 'progress' ? 'done' : 'live'],
        ['Accepted', task.column === 'done' ? 'done' : task.column === 'review' ? 'you' : 'todo'],
      ]
    : [
        ['Approved', 'done'],
        [P.sc.code ? 'Built' : 'Done', task.column === 'progress' ? 'live' : task.column === 'ready' ? 'todo' : 'done'],
        ...(P.sc.code ? [['Tested', task.tests ? 'done' : task.column === 'progress' ? 'live' : 'todo']] : []),
        [
          `Reviewed by ${nameOf(P, P.sc.reviewer)}`,
          task.column === 'done' || task.chip?.tone === 'you'
            ? 'done'
            : task.chip?.tone === 'bad'
              ? 'bad'
              : task.column === 'review'
                ? 'live'
                : 'todo',
        ],
        [
          P.sc.code ? 'Integrated' : 'Accepted',
          task.column === 'done' ? 'done' : task.chip?.tone === 'you' ? 'you' : 'todo',
        ],
      ];
  return `<ol class="sd-steps" aria-label="Where it is">${list
    .map(
      ([label, state]) =>
        `<li class="sd-steps__step${state === 'done' ? '' : ` sd-steps__step--${state}`}"${state === 'you' || state === 'live' ? ' aria-current="step"' : ''}><span class="sd-steps__mark">${
          state === 'done'
            ? icon('check', 12, 4)
            : state === 'bad'
              ? icon('close', 11, 3.4)
              : state === 'you'
                ? '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>'
                : ''
        }</span>${esc(label)}</li>`,
    )
    .join('')}</ol>`;
}

function stands(P, task) {
  const worker = agentOf(P, task.by ?? task.worker),
    reviewer = agentOf(P, P.sc.reviewer),
    tone = task.chip?.tone ?? 'wait';
  let who = worker,
    state = 'idle',
    title = 'Waiting to start',
    detail = task.needs.length
      ? `It starts when ${task.needs.join(', ')} is done.`
      : 'It starts when an agent is free.';
  if (task.column === 'progress') {
    state = 'working';
    title = `${worker.name} is working on it`;
    detail = task.line ?? '';
  } else if (task.column === 'review' && tone === 'live') {
    who = reviewer;
    state = 'working';
    title = `${reviewer.name} is reviewing it`;
    detail = task.line ?? '';
  } else if (tone === 'bad') {
    who = reviewer;
    title = `${reviewer.name} sent it back`;
    detail = `${task.blocking?.count ?? 1} blocking. The next attempt starts from the findings.`;
  } else if (tone === 'you') {
    title = task.kind === 'plan' ? 'The plan waits for you' : 'Ready for you to integrate';
    detail =
      task.kind === 'plan'
        ? 'Accept it on Today, and the house rules start the work.'
        : 'It passed its tests and review. Integrate it from Today.';
  } else if (task.column === 'done') {
    state = 'done';
    title = task.commit ? 'Integrated.' : 'Accepted.';
    detail = task.commit
      ? `Commit ${task.commit} on main. ${task.tests.total} of ${task.tests.total} tests passed after the merge.`
      : task.kind === 'plan'
        ? 'The plan was accepted, and its work was made.'
        : `${task.attempts.length > 1 ? `Accepted on attempt ${task.attempts.length}, after one send-back.` : 'Accepted on its first attempt.'}`;
  }
  const standTone = task.column === 'done' ? 'ok' : tone === 'wait' ? 'wait' : tone;
  return `<section class="sd-stands sd-stands--${standTone}" aria-label="Where it stands"><span class="sd-stands__icon sd-wide-only">${avatar(who.look, state, 44)}</span><div class="sd-stands__text"><div class="sd-stands__head"><div class="sd-stands__title">${esc(title)}</div></div>${detail ? `<div class="sd-stands__detail">${esc(detail)}</div>` : ''}</div></section>`;
}

function reviewPanel(P, task) {
  const reviewer = agentOf(P, P.sc.reviewer);
  const reviews = task.attempts.filter(item => item.review);
  if (!reviews.length)
    return `<p class="sd-meta">No review yet. ${esc(reviewer.name)} reviews each attempt once it's done.</p>`;
  return reviews
    .map(
      item => `<div class="demo-review">
  <div class="demo-review__head"><span class="sd-eyebrow">Attempt ${item.n}</span>${item.review.verdict === 'pass' ? chip('ok', 'Passed') : chip('bad', 'Sent back')}</div>
  ${said(
    reviewer.look,
    item.review.verdict === 'pass' ? 'done' : 'idle',
    item.review.verdict === 'pass'
      ? `<span>${(item.review.notes ?? []).map(esc).join('<br>')}</span>`
      : (item.review.findings ?? [])
          .map(text => {
            const match = /^([\w./-]+(?::\d+)?):\s*(.*)$/s.exec(text);
            return `<span class="demo-finding">${chip('bad', 'Blocking', ' sd-chip--inline')}${match ? `<span class="sd-file">${esc(match[1])}</span> ${esc(match[2])}` : esc(text)}</span>`;
          })
          .join(''),
  )}
</div>`,
    )
    .join('');
}

function resultPanel(P, task) {
  const step = task.step;
  if (task.kind === 'plan')
    return `${said(agentOf(P, P.sc.planner).look, 'idle', `<span>${esc(task.summary ?? 'Planning…')}</span>`)}<ol class="demo-plan">${P.sc.steps
      .map(item => `<li><b>${esc(item.title)}</b> <span class="sd-meta">· ${esc(nameOf(P, item.worker))}</span></li>`)
      .join('')}</ol>`;
  if (task.kind === 'checks')
    return `<p style="margin:0">${task.tests ? `${task.tests.pass} of ${task.tests.total} tests passed in the sandbox, before any planning.` : 'Running the tests in the sandbox…'}</p>`;
  if (task.column !== 'done' && !task.change)
    return `<p class="sd-meta">${esc(nameOf(P, task.worker))} hands in ${P.sc.code ? 'a change' : 'its files'} when the attempt ends.</p>`;
  if (step.diff) {
    // Old and new line numbers, as the app's change view counts them.
    let before = 40,
      after = 40;
    return `<p style="margin:0 0 var(--space-12)">${esc(step.summary)}</p><div class="sd-code" role="figure" aria-label="The change">${step.diff
      .map(([kind, text]) => {
        const sign = kind === 'add' ? '+' : kind === 'del' ? '−' : '',
          old = kind === 'hunk' || kind === 'add' ? '' : ++before,
          now = kind === 'hunk' || kind === 'del' ? '' : ++after;
        return `<div class="sd-code__line${kind ? ` sd-code__line--${kind}` : ''}"><span class="sd-code__num">${old}</span><span class="sd-code__num">${now}</span><span class="sd-code__sign">${sign}</span><span>${esc(text)}</span></div>`;
      })
      .join('')}</div>`;
  }
  return `<p style="margin:0 0 var(--space-12)">${esc(step.summary)}</p><div class="demo-file"><div class="demo-file__name"><span class="sd-file">${esc(step.file.name)}</span></div><pre class="demo-file__body">${esc(step.file.body.join('\n'))}</pre></div>`;
}

function storyPage(P) {
  const task = P.tasks.find(item => item.id === ui.taskId);
  if (!task) {
    ui.view = 'board';
    return boardPage(P);
  }
  const tabs = [
    ['result', task.kind === 'plan' ? 'Plan' : P.sc.code && task.step ? 'Change' : 'Result'],
    ...(task.step ? [['review', 'Review', task.attempts.filter(item => item.review).length]] : []),
    ...(task.step ? [['attempts', 'Attempts', task.attempts.length]] : []),
  ];
  const tab = tabs.some(([id]) => id === ui.tab) ? ui.tab : 'result';
  const worker = agentOf(P, task.worker),
    reviewer = agentOf(P, P.sc.reviewer);
  const panel =
    tab === 'review'
      ? reviewPanel(P, task)
      : tab === 'attempts'
        ? `<ul class="demo-attempts">${task.attempts
            .map(
              item =>
                `<li>${avatar(worker.look, 'idle', 28)}<span><b>Attempt ${item.n}</b> by ${esc(worker.name)}${item.tests ? ` · ${item.tests.pass} of ${item.tests.total} tests` : ''}<span class="sd-meta" style="display:block">${item.review ? (item.review.verdict === 'pass' ? `Passed ${reviewer.name}'s review` : `Sent back by ${reviewer.name}; the next attempt saw the findings`) : 'In progress'}</span></span></li>`,
            )
            .join('')}</ul>`
        : resultPanel(P, task);
  const tiles =
    task.change && P.sc.code
      ? `<div class="sd-tiles"><button type="button" class="sd-tile sd-tile--raised" data-act="tab" data-arg="result"><span class="sd-eyebrow">The change</span><span style="display:flex;align-items:baseline;gap:var(--space-8)"><b class="sd-tile__value sd-tile__value--lg" style="color:var(--add)">+${task.change.added}</b><b class="sd-tile__value sd-tile__value--lg" style="color:var(--del)">−${task.change.removed}</b><span class="sd-meta">in ${task.change.files} files</span></span><span class="sd-bar" aria-hidden="true"><span class="sd-bar__part sd-bar__part--ok" style="width:${(task.change.added / (task.change.added + task.change.removed)) * 100}%"></span><span class="sd-bar__part sd-bar__part--bad" style="width:${(task.change.removed / (task.change.added + task.change.removed)) * 100}%"></span></span></button><button type="button" class="sd-tile sd-tile--raised" data-act="tab" data-arg="attempts"><span class="sd-eyebrow">Tests in the sandbox</span><b class="sd-tile__value sd-tile__value--lg">${task.tests.pass} / ${task.tests.total}</b><span class="sd-bar" aria-hidden="true"><span class="sd-bar__part sd-bar__part--ok" style="width:100%"></span></span></button><button type="button" class="sd-tile sd-tile--raised" style="flex-direction:row;align-items:center;gap:14px" data-act="tab" data-arg="review">${avatar(reviewer.look, 'idle', 46)}<span style="display:flex;flex-direction:column;gap:var(--space-4)"><span class="sd-eyebrow">${esc(reviewer.name)}'s review</span>${
          task.attempts.at(-1)?.review?.verdict === 'pass'
            ? chip('ok', 'Passed')
            : task.attempts.at(-1)?.review
              ? chip('you', 'Asked for changes')
              : chip('wait', 'Reviewing')
        }</span></button></div>`
      : '';
  return `<article class="sd-storypage">
  <div class="sd-backbar"><a class="sd-btn sd-btn--ghost" style="padding:0 12px;gap:var(--space-4)" href="#board" data-act="view" data-arg="board">${icon('back', 20, 2.4)}Board</a><span class="sd-meta sd-backbar__place">${task.id}</span></div>
  <header class="sd-storyhead"><div class="sd-storyhead__kind sd-wide-only"><span class="sd-chip sd-chip--brand">${task.kind === 'plan' ? 'Plan' : task.kind === 'checks' ? 'Source checks' : P.sc.code ? 'Source story' : 'Step'}</span><span class="sd-mono sd-meta">${task.id}</span></div><h1 class="sd-storyhead__title">${esc(task.title)}</h1>${task.kind === 'checks' ? '' : steps(task, P)}</header>
  ${stands(P, task)}
  ${tiles}
  <div class="sd-story">
    <section class="sd-card sd-story__main">
      <div class="sd-tabs" role="tablist" aria-label="Details">${tabs
        .map(
          ([id, label, count]) =>
            `<button type="button" role="tab" class="sd-tabs__tab" aria-selected="${id === tab}" data-act="tab" data-arg="${id}">${label}${count ? `<span class="sd-tabs__count">${count}</span>` : ''}</button>`,
        )
        .join('')}</div>
      <div role="tabpanel"><div class="sd-tabpanel">${panel}</div></div>
    </section>
    <aside class="sd-story__side sd-wide-only"><section class="sd-card sd-sidecard" aria-label="People">
      <div class="sd-person">${avatar(worker.look, worker.task === task.id ? 'working' : task.column === 'done' ? 'done' : 'idle', 40)}<span><b>${esc(worker.name)}</b> ${
        P.sc.code && task.step
          ? task.change
            ? 'built it'
            : task.column === 'progress'
              ? 'is building it'
              : 'builds it'
          : task.column === 'done'
            ? 'did it'
            : task.column === 'progress'
              ? 'is doing it'
              : 'does it'
      }<span class="sd-meta" style="display:block">${esc(worker.job)}${worker.made ? ' · made for this project' : ''}</span></span></div>
      ${task.step ? `<div class="sd-person">${avatar(reviewer.look, reviewer.task === task.id ? 'working' : 'idle', 40)}<span><b>${esc(reviewer.name)}</b> ${task.attempts.some(item => item.review) ? 'reviewed it' : 'reviews it'}<span class="sd-meta" style="display:block">${esc(reviewer.job)}</span></span></div>` : ''}
    </section></aside>
  </div>
</article>`;
}

function ideasPage(P) {
  const sent = P.phase !== 'idle';
  return `<header class="sd-pagehead"><div class="sd-pagehead__text"><div class="sd-eyebrow">${esc(P.sc.project.name)}</div><h1 class="sd-pagehead__title">Ideas</h1><p class="sd-pagehead__lead">Every idea you sent, with what the team made of it.</p></div></header>
${
  !sent
    ? `<div class="sd-card sd-card--quiet" style="padding:var(--space-16) 18px;color:var(--ink-2)">No ideas yet. <a href="#today" data-act="view" data-arg="today">Send this project's idea from Today.</a></div>`
    : `<section class="sd-card demo-idea">
  <div class="demo-idea__head">${P.shippedAt ? chip('ok', 'Shipped') : chip('live', 'Working')}<span class="sd-meta">Sent ${clock(P.sentAt)}</span></div>
  <h2 class="sd-decision__title">${esc(quoted(P.sc.idea, 200))}</h2>
  <div class="demo-idea__steps">${
    P.tasks
      .filter(task => task.step)
      .map(
        task =>
          `<div class="demo-idea__step"><div class="demo-idea__stephead">${avatar(agentOf(P, task.worker).look, task.column === 'done' ? 'done' : task.column === 'progress' ? 'working' : 'idle', 32, false)}<a href="#task" data-act="task" data-arg="${task.id}"><b>${esc(task.title)}</b></a>${task.chip ? chip(task.chip.tone, task.chip.label) : chip('wait', 'Ready')}</div>${task.column === 'done' ? resultPanel(P, task) : ''}</div>`,
      )
      .join('') || '<span class="sd-meta">Waiting for the plan.</span>'
  }</div>
</section>`
}`;
}

function agentsPage(P) {
  const all = [...P.agents.values(), ...P.made];
  return `<header class="sd-pagehead"><div class="sd-pagehead__text"><div class="sd-eyebrow">${esc(P.sc.project.name)}</div><h1 class="sd-pagehead__title">Agents</h1><p class="sd-pagehead__lead">Who works on this project, what each one does and which AI tool it runs on.</p></div></header>
<div class="demo-agents">${all
    .map(
      agent => `<section class="sd-card demo-agent" data-key="agent-${agent.id}">
  ${avatar(agent.look, agent.task ? 'working' : agent.state, 64)}
  <div><h2 class="sd-agenthead__name" style="font-size:22px">${esc(agent.name)}</h2><span class="sd-meta">${esc(agent.job)}</span></div>
  <div class="demo-agent__chips">${agent.task ? chip('live', 'Working') : '<span class="sd-chip">Free</span>'}<span class="sd-chip">${agent.id === 'eli' || agent.made ? 'Codex CLI' : 'Claude Code · Opus'}</span>${agent.made ? chip('brand', 'Made for this project') : ''}</div>
</section>`,
    )
    .join('')}
  <section class="sd-card demo-agent demo-agent--new">
    <span class="demo-agent__plus">${icon('plus', 28, 2.6)}</span>
    <div><h2 class="sd-agenthead__name" style="font-size:22px">Need a specialist?</h2><span class="sd-meta">In the app you make one for the project, with its own instructions, tool and model. Its face is put together from parts, so no two look alike.</span></div>
    <button type="button" class="sd-btn" data-act="make-agent">${icon('shuffle', 18)}Make one</button>
  </section>
</div>`;
}

function settingsPage(P) {
  return `<header class="sd-pagehead"><div class="sd-pagehead__text"><div class="sd-eyebrow">${esc(P.sc.project.name)}</div><h1 class="sd-pagehead__title">Project settings</h1><p class="sd-pagehead__lead">In the app, this is where you set the house rules: what waits for you and what runs on its own.</p></div></header>
<section class="sd-card demo-rules">
  <h2 class="sd-section-title" style="font-size:20px">House rules here</h2>
  ${[
    ['Plans', 'wait for you', 'you'],
    [P.sc.code ? 'Starting stories' : 'Starting work', 'run on their own', 'ok'],
    ...(P.sc.code ? [['Tests in the sandbox', 'run on their own', 'ok']] : []),
    ['Reviews', 'run on their own', 'ok'],
    [
      P.sc.code ? 'Integrating' : 'Accepting results',
      P.sc.code ? 'waits for you' : 'runs on its own',
      P.sc.code ? 'you' : 'ok',
    ],
  ]
    .map(([what, how, tone]) => `<div class="demo-rule"><span>${what}</span>${chip(tone, how)}</div>`)
    .join('')}
  <p class="sd-meta" style="margin:0">Every project starts with every plan waiting for you. You turn that up or down any time. In the demo these are fixed.</p>
</section>`;
}

function dock() {
  return `<div class="demo-dock" role="group" aria-label="Demo controls"><span class="demo-dock__tag">Demo</span><span class="demo-dock__words">A pretend team, playing back a run. Nothing leaves your browser.</span><span class="demo-dock__speed" role="group" aria-label="Speed">${[
    1, 2, 4,
  ]
    .map(
      speed =>
        `<button type="button" data-act="speed" data-arg="${speed}" aria-pressed="${ui.speed === speed}">${speed}×</button>`,
    )
    .join(
      '',
    )}</span><button type="button" class="demo-dock__restart" data-act="restart" title="Start this project over" aria-label="Start this project over">${icon('restart', 16, 2.2)}</button></div>`;
}

// ── Rendering: the page is drawn as text, then patched into place, so an unchanged face keeps moving ──────────────

function patch(from, to) {
  if (
    from.nodeType !== to.nodeType ||
    from.nodeName !== to.nodeName ||
    (from.nodeType === 1 && from.getAttribute('data-key') !== to.getAttribute('data-key'))
  ) {
    from.replaceWith(to);
    return;
  }
  if (from.nodeType !== 1) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue;
    return;
  }
  for (const { name } of [...from.attributes]) if (!to.hasAttribute(name)) from.removeAttribute(name);
  for (const { name, value } of [...to.attributes])
    if (from.getAttribute(name) !== value) from.setAttribute(name, value);
  if (from.nodeName === 'TEXTAREA') return;
  patchChildren(from, to);
}
function patchChildren(from, to) {
  const before = [...from.childNodes],
    after = [...to.childNodes];
  after.forEach((node, index) => (before[index] ? patch(before[index], node) : from.appendChild(node)));
  for (let index = before.length - 1; index >= after.length; index--) before[index].remove();
}
function render() {
  const P = current(),
    template = document.createElement('template');
  template.innerHTML =
    frame(P) + dock() + `<div class="sd-toast" role="status"${ui.toast ? '' : ' hidden'}>${esc(ui.toast)}</div>`;
  patchChildren(root, template.content);
  const field = root.querySelector('#idea-text');
  if (field && field.value !== P.text) field.value = P.text;
  document.title = `${P.sc.project.name} · Studio desk demo`;
}

// ── What the visitor does ───────────────────────────────────────────────────────────────────────────────────────

async function suggest(P) {
  if (P.typing || P.phase !== 'idle') return;
  P.typing = true;
  const token = P.token,
    text = P.sc.idea;
  try {
    for (let i = 1; i <= text.length; i += reduce ? text.length : 2) {
      P.text = text.slice(0, i);
      render();
      await wait(P, 18, token);
    }
    P.text = text;
  } catch {
    return;
  } finally {
    P.typing = false;
  }
  render();
  root.querySelector('.sd-ideabox__sendbtn')?.focus({ preventScroll: true });
}
function send(P) {
  if (P.phase !== 'idle' || P.text !== P.sc.idea) return;
  P.text = '';
  start(P);
}
function show(view, taskId) {
  ui.view = view;
  ui.taskId = taskId ?? null;
  if (view !== 'task') ui.tab = 'result';
  render();
  root.querySelector('.sd-main')?.scrollTo?.({ top: 0 });
  scrollTo({ top: 0 });
}

root.addEventListener('click', event => {
  const target = event.target.closest('[data-act]');
  if (!target || target.matches('form')) return;
  const act = target.dataset.act,
    arg = target.dataset.arg,
    P = current();
  if (target.tagName === 'A' || act !== 'send-form') event.preventDefault();
  if (act === 'view') show(arg);
  else if (act === 'task') {
    ui.tab = target.dataset.tab ?? 'result';
    show('task', arg);
    ui.tab = target.dataset.tab ?? 'result';
    render();
  } else if (act === 'tab') {
    ui.tab = arg;
    render();
  } else if (act === 'project') {
    ui.project = arg;
    show('today');
  } else if (act === 'next-project') {
    const index = scenarios.findIndex(item => item.id === ui.project);
    ui.project = scenarios[(index + 1) % scenarios.length].id;
    show('today');
  } else if (act === 'suggest') suggest(P);
  else if (act === 'new-idea') {
    show('today');
    root.querySelector('.sd-ideabox__suggest, .sd-ideabox__sendbtn')?.focus();
  } else if (act === 'answer') {
    const resolve = P.waiting.get(arg);
    if (resolve) {
      P.waiting.delete(arg);
      resolve();
    }
  } else if (act === 'speed') {
    ui.speed = Number(arg);
    render();
  } else if (act === 'restart') restart(ui.project);
  else if (act === 'make-agent') {
    // A specialist made from the kit, as the app makes one: a new look at least three parts from every face here.
    const taken = [...P.agents.values(), ...P.made].map(agent => agent.look);
    const seed = `${P.sc.id}#extra#${P.made.length}#${Date.now()}`;
    {
      const names = [...P.agents.values(), ...P.made].map(agent => agent.name);
      const jobs = ['Researcher', 'Editor', 'Designer', 'Fact checker', 'Translator', 'Producer'];
      P.made.push({
        id: `made-${P.made.length}`,
        name: pickName(seed, names),
        job: jobs[P.made.length % jobs.length],
        look: pickNew(seed, taken),
        made: true,
        state: 'done',
        task: null,
        say: null,
        last: null,
      });
      render();
      setTimeout(() => {
        const made = P.made.at(-1);
        if (made && made.state === 'done') made.state = 'idle';
        render();
      }, 1600);
    }
  } else if (act === 'rail-hint') {
    toast(P, 'In the demo, pick a project from the rail on the left.');
    render();
  }
});
root.addEventListener('submit', event => {
  event.preventDefault();
  send(current());
});
root.addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && event.target.id === 'idea-text') send(current());
});

// A project in the address opens first: /demo/#dragon. An embedded demo starts on the first project.
const first = location.hash.slice(1);
if (scenarios.some(item => item.id === first)) ui.project = first;
render();
