// The site's movement: the navigation's backdrop once the page scrolls, sections that rise in as they come into
// view, and faces whose eyes follow the pointer. With reduced motion, everything shows in its final state and
// nothing moves.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const seen = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          seen.unobserve(entry.target);
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    reveals.forEach(element => seen.observe(element));
  } else {
    reveals.forEach(element => element.classList.add('is-in'));
  }

  // The demo is drawn at a desktop width and scaled to fit its window, so the app keeps its desktop layout down to
  // tablet sizes; narrower than that it uses the app's own narrow layout at full size.
  const fit = document.querySelector('[data-fit]');
  if (fit) {
    const screen = fit.querySelector('iframe'),
      desk = 1400;
    const size = () => {
      const width = fit.clientWidth,
        scale = width >= 980 && width < desk ? width / desk : 1;
      screen.style.width = scale < 1 ? `${desk}px` : '';
      screen.style.height = scale < 1 ? `${fit.clientHeight / scale}px` : '';
      screen.style.transform = scale < 1 ? `scale(${scale})` : '';
    };
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(fit);
  }

  // The team keeps an eye on the pointer: each face on screen inside [data-gaze] turns its pupils toward it, a
  // little more the farther away it is. Only with a mouse or trackpad, and never with reduced motion.
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  let frame = 0,
    x = 0,
    y = 0;
  const look = () => {
    frame = 0;
    for (const face of document.querySelectorAll('[data-gaze] .sd-avatar')) {
      const pupils = face.querySelector('.sd-avatar__pupils');
      if (!pupils) continue;
      const box = face.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight || !box.width) continue;
      const dx = x - (box.left + box.width / 2),
        dy = y - (box.top + box.height / 2),
        far = Math.hypot(dx, dy) || 1,
        reach = Math.min(1, far / 240);
      pupils.style.transform = `translate(${((dx / far) * 1.7 * reach).toFixed(2)}px, ${((dy / far) * 1.5 * reach).toFixed(2)}px)`;
    }
  };
  addEventListener(
    'pointermove',
    event => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(look);
    },
    { passive: true },
  );
})();

// Pictures in a post open larger: a click (or Enter) opens the picture in a dialog that fits the window, a click on the
// picture there shows it at full size to scroll through, and Escape, Close or a click outside closes it and returns
// focus to the picture.
(() => {
  const pictures = document.querySelectorAll('.post-art img, img[data-zoom]');
  if (!pictures.length || typeof HTMLDialogElement !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Picture, larger');
  dialog.innerHTML =
    '<button type="button" class="lightbox__close" aria-label="Close">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    '</button><div class="lightbox__frame"><img alt="" /></div>' +
    '<p class="lightbox__hint">Click the picture to see it at full size. Escape closes it.</p>';
  document.body.append(dialog);
  const frame = dialog.querySelector('.lightbox__frame'),
    large = dialog.querySelector('img');
  let opener = null;
  const close = () => dialog.close();
  dialog.querySelector('.lightbox__close').addEventListener('click', close);
  // A click on the backdrop lands on the dialog itself.
  dialog.addEventListener('click', event => event.target === dialog && close());
  large.addEventListener('click', () => frame.classList.toggle('is-full'));
  dialog.addEventListener('close', () => {
    frame.classList.remove('is-full');
    opener?.focus();
  });
  for (const picture of pictures) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'zoomable';
    button.innerHTML = '<span class="zoomable__hint" aria-hidden="true">Click to enlarge</span>';
    picture.replaceWith(button);
    button.prepend(picture);
    button.setAttribute('aria-label', `Open larger: ${picture.alt}`);
    button.addEventListener('click', () => {
      opener = button;
      large.src = picture.currentSrc || picture.src;
      large.alt = picture.alt;
      dialog.showModal();
    });
  }
})();
