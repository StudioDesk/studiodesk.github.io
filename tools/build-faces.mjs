// Draws the agents' faces into the pages, with agent-kit.js copied unchanged from the app
// (dashboard/src/design/agent-kit.js), so the site shows the same faces the app does and needs no script for them.
// Each <span class="face" data-face="planner" data-size="40"></span> is filled in place, so running it again only
// redraws them. data-done adds the face's happy eyes, shown when its station in the flow is done.
// Run from the site's folder: node tools/build-faces.mjs
import fs from 'node:fs';
import path from 'node:path';
import { build, CLASSIC, rhythm, VIEWBOX } from './agent-kit.js';

// The starting team's faces, by the role each plays on the site; their names never appear.
const looks = { planner: 0, agent: 1, reviewer: 2, checks: 3, writer: 4 };
const paths = layer =>
  layer
    .map(
      p =>
        `<path d="${p.d}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
const svg = (look, state, size, kind) => {
  const layers = build(look, state),
    { delay, tempo } = rhythm(look);
  return (
    `<svg class="sd-avatar ${kind}" data-state="${state}" width="${size}" height="${size}" viewBox="${VIEWBOX}" aria-hidden="true" style="--delay:${delay}s;--tempo:${tempo}">` +
    `<g class="sd-avatar__whole">${paths(layers.body)}<g transform="${layers.dy}"><g class="sd-avatar__top">${paths(layers.top)}</g></g>` +
    `${paths(layers.brows)}<g class="sd-avatar__eyes">${paths(layers.eyes)}<g class="sd-avatar__pupils">${paths(layers.pupils)}</g></g>` +
    `<g class="sd-avatar__mouth">${paths(layers.mouth)}</g>${paths(layers.detail)}</g></svg>`
  );
};

const root = path.resolve(import.meta.dirname, '..');
const pages = [];
const walk = folder => {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'tools' || entry.name === 'assets') continue;
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
};
walk(root);

for (const page of pages) {
  let count = 0;
  const html = fs.readFileSync(page, 'utf8').replace(/<span class="face"([^>]*)>[\s\S]*?<\/span>/g, (_, attrs) => {
    const role = /data-face="(\w+)"/.exec(attrs)?.[1];
    if (!(role in looks)) throw new Error(`${page}: no face for "${role}"`);
    const size = Number(/data-size="(\d+)"/.exec(attrs)?.[1] || 40),
      look = CLASSIC[looks[role]].look;
    count++;
    const open = svg(look, 'idle', size, 'face-open');
    return `<span class="face"${attrs}>${open}${/data-done/.test(attrs) ? svg(look, 'done', size, 'face-happy') : ''}</span>`;
  });
  fs.writeFileSync(page, html);
  console.log(`${path.relative(root, page)}: ${count} faces`);
}
