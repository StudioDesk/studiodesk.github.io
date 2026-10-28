// "Your specialists": each press of Make one puts a new agent together from the app's own face kit (assets/app,
// copied unchanged), the way the app makes one for a project: a look at least three parts away from the starting
// team's, and a name from the same list. Without scripts the card simply describes it.
import { build, rhythm, VIEWBOX, CLASSIC, pickNew, pickName } from './app/agent-kit.js';

const card = document.querySelector('[data-yours]');
if (card) {
  const spot = card.querySelector('[data-yours-face]'),
    caption = card.querySelector('[data-yours-name]'),
    button = card.querySelector('[data-yours-button]');
  const jobs = [
    'Copywriter',
    'Researcher',
    'Designer',
    'Fact checker',
    'Editor',
    'Translator',
    'Data analyst',
    'Producer',
  ];
  const paths = layer =>
    layer
      .map(
        p =>
          `<path d="${p.d}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      .join('');
  const face = (look, state) => {
    const layers = build(look, state),
      { delay, tempo } = rhythm(look);
    return (
      `<svg class="sd-avatar" data-state="${state}" width="64" height="64" viewBox="${VIEWBOX}" aria-hidden="true" style="--delay:${delay}s;--tempo:${tempo}">` +
      `<g class="sd-avatar__whole">${paths(layers.body)}<g transform="${layers.dy}"><g class="sd-avatar__top">${paths(layers.top)}</g></g>` +
      `${paths(layers.brows)}<g class="sd-avatar__eyes">${paths(layers.eyes)}<g class="sd-avatar__pupils">${paths(layers.pupils)}</g></g>` +
      `<g class="sd-avatar__mouth">${paths(layers.mouth)}</g>${paths(layers.detail)}</g></svg>`
    );
  };
  let made = 0,
    settle = 0;
  button.hidden = false;
  button.addEventListener('click', () => {
    const seed = `site#${Date.now()}#${made}`,
      look = pickNew(
        seed,
        CLASSIC.map(agent => agent.look),
      ),
      name = pickName(
        seed,
        CLASSIC.map(agent => agent.name),
      ),
      job = jobs[made++ % jobs.length].toLowerCase();
    spot.innerHTML = `<span class="face">${face(look, 'done')}</span>`;
    caption.textContent = `Meet ${name}, ${/^[aeiou]/.test(job) ? 'an' : 'a'} ${job}`;
    clearTimeout(settle);
    settle = setTimeout(() => (spot.innerHTML = `<span class="face">${face(look, 'idle')}</span>`), 1700);
  });
}
