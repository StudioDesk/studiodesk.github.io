# Studio desk's site

The landing page and blog for [Studio desk](https://github.com/studiodesk/studio-desk), served by GitHub Pages from this repository's `main` branch. Plain HTML and CSS with one small script, and no build step to publish.

- `index.html`: the landing page. Its hero shows one of the code sample's own ideas going through the team, as an illustration.
- `blog/`: the blog. Each post is a folder with its own `index.html`, and `blog/index.html` lists them.
- `assets/`: the stylesheet (the app's design tokens and components), the script (sections that rise into view, and the hero's flow), the fonts (served from here, with their licenses), the mark and the social preview image.
- `404.html`: the page GitHub Pages shows for a missing address.

## Changing it

- **Words:** edit the HTML. Every claim about Studio desk should trace to the current release's README or release notes.
- **Faces:** a `<span class="face" data-face="planner" data-size="40"></span>` is drawn by `node tools/build-faces.mjs`, run from this folder, with `tools/agent-kit.js` copied unchanged from the app (`dashboard/src/design/agent-kit.js`). Copy it again when the app's faces change, then rerun the script.
- **Looks:** `assets/site.css` takes its colors and components from the app's design system. Change them there first.

## Moving to a domain

Add a `CNAME` file with the domain, point the domain's DNS at GitHub Pages, and turn on Enforce HTTPS in the repository's Pages settings. Then change `https://studiodesk.github.io` in the pages' `canonical` and `og:` tags to the new address.

## Privacy

The site sets no cookies, runs no analytics and loads nothing from other sites.
