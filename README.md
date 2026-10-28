# Studio desk's site

The landing page, the live demo and the blog for [Studio desk](https://github.com/studiodesk/studio-desk), served by GitHub Pages from this repository's `main` branch. Plain HTML, CSS and a little JavaScript, with no build step to publish. Nothing here changes the app: the demo uses the app's own stylesheet and faces, copied unchanged from a release.

- `index.html`: the landing page, with the demo in a window under the pitch. On a phone, the window becomes a link to the demo.
- `demo/`: the demo. The app's dashboard (Today, Ideas, Board, Agents, a story's page) drawn with the app's stylesheet, and a pretend controller in the page that plays back one idea per project from `demo/scenarios.js`: a cat's birthday party, a bedtime story and a snake game. No agent runs, and nothing leaves the browser. `demo/#dragon` opens a project directly.
- `blog/`: the blog. Each post is a folder with its own `index.html`, and `blog/index.html` lists them.
- `assets/`: the site's stylesheet and scripts (sections that rise into view, eyes that follow the pointer, the demo's fit in its window, and `team.js`, which makes a new specialist's face), the fonts (served from here, with their licenses), the mark and the social preview image.
- `assets/app/`: the app's `tokens.css`, `bundle.css`, `agent-kit.js` and `logo.svg`, copied unchanged from a release by `tools/sync-app.mjs`. Never edit them here.
- `404.html`: the page GitHub Pages shows for a missing address.

## Changing it

- **Words:** edit the HTML. Every claim about Studio desk should trace to the current release's README or release notes, and the roadmap to what the maintainers have planned.
- **A new release of the app:** run `node tools/sync-app.mjs <a checkout of studio-desk> <tag>` from this folder, then `node tools/build-faces.mjs`, and check the demo still matches the app's pages.
- **The demo's ideas:** each project in `demo/scenarios.js` lists its team, the plan and every attempt: what the agent says while it works, what it hands in, and the review. The pages in `demo/demo.js` follow the app's markup, so a change to the app's pages may need the same change there.
- **Faces:** a `<span class="face" data-face="planner" data-size="40"></span>` is drawn by `node tools/build-faces.mjs`, run from this folder, with the app's `agent-kit.js`. Add `data-done` for the happy face a hover shows.
- **Looks:** `assets/site.css` takes its colors and components from the app's design system. Change them there first.
- **Previewing:** the demo loads as modules, so serve the folder from a local web server rather than opening the file.

## Moving to a domain

Add a `CNAME` file with the domain, point the domain's DNS at GitHub Pages, and turn on Enforce HTTPS in the repository's Pages settings. Then change `https://studiodesk.github.io` in the pages' `canonical` and `og:` tags to the new address.

## Privacy

The site sets no cookies, runs no analytics and loads nothing from other sites.
