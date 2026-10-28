// "Your specialists": the plus (or Build one) opens a builder with the app's own face kit (assets/app, copied
// unchanged), laid out as the app's face picker is: the face large in the state shown, a row of choices for each part,
// each choice the face with that one part changed, Shuffle, and Show to step through the states an agent goes
// through. Add to the team puts the specialist on the card. Without scripts the card simply describes it.
import {
  build,
  rhythm,
  VIEWBOX,
  CLASSIC,
  COLORS,
  SLOTS,
  STATES,
  hash,
  rng,
  pickLook,
  pickNew,
  pickName,
} from './app/agent-kit.js';

const card = document.querySelector('[data-yours]'),
  dialog = document.querySelector('[data-builder]');
if (card && dialog && typeof dialog.showModal === 'function') {
  const $ = selector => dialog.querySelector(selector);
  const stage = $('[data-builder-stage]'),
    nameField = $('[data-builder-name]'),
    roles = $('[data-builder-roles]'),
    parts = $('[data-builder-parts]'),
    show = $('[data-builder-state]'),
    meaning = $('[data-builder-meaning]');
  const jobs = ['Researcher', 'Copywriter', 'Designer', 'Fact checker', 'Editor', 'Translator', 'Data analyst'];
  const labels = { color: 'Color', body: 'Body', eyes: 'Eyes', mouth: 'Mouth', top: 'Topper', detail: 'Detail' };
  const esc = text =>
    String(text).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const paths = layer =>
    layer
      .map(
        p =>
          `<path d="${p.d}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      .join('');
  // A face as the app's AgentAvatar draws it; working rings it.
  const face = (look, state, size, ring = false) => {
    const layers = build(look, state),
      { delay, tempo } = rhythm(look),
      timing = `--delay:${delay}s;--tempo:${tempo}`,
      svg =
        `<svg class="sd-avatar" data-state="${state}" width="${size}" height="${size}" viewBox="${VIEWBOX}" aria-hidden="true" style="${timing}">` +
        `<g class="sd-avatar__whole">${paths(layers.body)}<g transform="${layers.dy}"><g class="sd-avatar__top">${paths(layers.top)}</g></g>` +
        `${paths(layers.brows)}<g class="sd-avatar__eyes">${paths(layers.eyes)}<g class="sd-avatar__pupils">${paths(layers.pupils)}</g></g>` +
        `<g class="sd-avatar__mouth">${paths(layers.mouth)}</g><g class="sd-avatar__mouth-alt">${paths(layers.mouthAlt)}</g>${paths(layers.detail)}</g></svg>`;
    return ring && state === 'working'
      ? `<span class="sd-avatar-ring" style="${timing};border-radius:${Math.round(size * 0.3)}px">${svg}</span>`
      : svg;
  };

  const seed = `site#${Date.now()}`,
    taken = CLASSIC.map(agent => agent.look);
  const draft = {
    look: pickNew(seed, taken),
    name: pickName(
      seed,
      CLASSIC.map(agent => agent.name),
    ),
    job: jobs[hash(seed) % jobs.length],
    shown: STATES.findIndex(([state]) => state === 'working'),
  };
  let added = null;

  const drawStage = () => {
    const [state, label, words] = STATES[draft.shown];
    stage.innerHTML = face(draft.look, state, 156, true);
    show.textContent = `Show: ${label}`;
    meaning.textContent = words;
  };
  const drawRoles = () => {
    roles.innerHTML = jobs
      .map(
        job =>
          `<button type="button" role="radio" class="builder__role" aria-checked="${job === draft.job}" data-job="${esc(job)}">${esc(job)}</button>`,
      )
      .join('');
  };
  const drawParts = () => {
    // Color first, then the shapes, as the app's picker lists them.
    const order = [...SLOTS].sort(([a], [b]) => (a === 'color' ? -1 : b === 'color' ? 1 : 0));
    parts.innerHTML = order
      .map(([key, list]) => {
        const options =
          key === 'color'
            ? COLORS.map(
                ([color, hex], index) =>
                  `<button type="button" role="radio" class="colorpick" aria-checked="${draft.look.color === index}" aria-label="${color}" title="${color}" style="background:${hex}" data-slot="color" data-index="${index}"></button>`,
              ).join('')
            : list
                .map(
                  ([part], index) =>
                    `<button type="button" role="radio" class="partopt" aria-checked="${draft.look[key] === index}" aria-label="${esc(part)}" title="${esc(part)}" data-slot="${key}" data-index="${index}">${face({ ...draft.look, [key]: index }, 'idle', 42)}</button>`,
                )
                .join('');
        return `<div class="partrow"><span class="eyebrow" id="part-${key}">${labels[key]} · ${list.length}</span><div class="partrow__opts" role="radiogroup" aria-labelledby="part-${key}">${options}</div></div>`;
      })
      .join('');
  };
  const drawAll = () => {
    nameField.value = draft.name;
    drawStage();
    drawRoles();
    drawParts();
  };

  parts.addEventListener('click', event => {
    const option = event.target.closest('[data-slot]');
    if (!option) return;
    draft.look = { ...draft.look, [option.dataset.slot]: Number(option.dataset.index) };
    drawStage();
    drawParts();
    parts.querySelector(`[data-slot="${option.dataset.slot}"][data-index="${option.dataset.index}"]`)?.focus();
  });
  roles.addEventListener('click', event => {
    const option = event.target.closest('[data-job]');
    if (!option) return;
    draft.job = option.dataset.job;
    drawRoles();
  });
  nameField.addEventListener('input', () => (draft.name = nameField.value));
  $('[data-builder-shuffle]').addEventListener('click', () => {
    draft.look = pickLook(rng(hash(`${draft.name}#${Date.now()}`)));
    drawStage();
    drawParts();
  });
  show.addEventListener('click', () => {
    draft.shown = (draft.shown + 1) % STATES.length;
    drawStage();
  });
  // A click on the backdrop closes it, as Close does.
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close('cancel');
  });
  dialog.addEventListener('close', () => {
    if (dialog.returnValue !== 'done') return;
    added = { look: draft.look, name: draft.name.trim() || 'Your specialist', job: draft.job };
    const spot = card.querySelector('[data-yours-face]'),
      job = added.job.toLowerCase();
    spot.innerHTML = `<span class="face">${face(added.look, 'done', 64)}</span>`;
    setTimeout(() => {
      if (added) spot.innerHTML = `<span class="face">${face(added.look, 'idle', 64)}</span>`;
    }, 1700);
    card.querySelector('[data-yours-name]').textContent =
      `Meet ${added.name}, ${/^[aeiou]/.test(job) ? 'an' : 'a'} ${job}`;
    card.querySelector('[data-yours-label]').textContent = `Change ${added.name}`;
  });

  for (const opener of card.querySelectorAll('[data-yours-open]')) {
    opener.disabled = false;
    opener.hidden = false;
    opener.addEventListener('click', () => {
      drawAll();
      dialog.returnValue = '';
      dialog.showModal();
      nameField.blur();
      $('[data-builder-shuffle]').focus();
    });
  }
}
