// Copies the app's design system into assets/app/, unchanged, from one of its release tags, so the site and the demo
// use the same stylesheet, faces and mark the app ships. Nothing in assets/app/ is edited by hand; run this again for a
// new release instead.
// Usage, from the site's folder: node tools/sync-app.mjs <a checkout of studiodesk/studio-desk> <tag>
// For example: node tools/sync-app.mjs ../studio-desk v1.0.1
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [repo, tag] = process.argv.slice(2);
if (!repo || !tag) {
  console.error('Usage: node tools/sync-app.mjs <a checkout of studiodesk/studio-desk> <tag>');
  process.exit(1);
}
const files = {
  'tokens.css': 'dashboard/src/design/tokens.css',
  'bundle.css': 'dashboard/src/design/bundle.css',
  'agent-kit.js': 'dashboard/src/design/agent-kit.js',
  'logo.svg': 'dashboard/src/design/logo.svg',
};
const git = args => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
const commit = git(['rev-parse', `${tag}^{commit}`]).trim();
const out = path.resolve(import.meta.dirname, '..', 'assets', 'app');
fs.mkdirSync(out, { recursive: true });
for (const [name, source] of Object.entries(files)) {
  fs.writeFileSync(path.join(out, name), git(['show', `${commit}:${source}`]));
  console.log(`${name} ← ${tag}:${source}`);
}
fs.writeFileSync(
  path.join(out, 'VERSION'),
  `Copied unchanged from studiodesk/studio-desk ${tag} (${commit}) by tools/sync-app.mjs. Don't edit these files.\n`,
);
