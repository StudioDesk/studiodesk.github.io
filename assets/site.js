// The site's movement: the navigation's backdrop once the page scrolls, sections that rise in as they come into
// view, and the hero's flow, one idea going through the team on a loop. With reduced motion, everything shows in
// its final state and nothing moves.
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

  const flow = document.querySelector('[data-flow]');
  if (flow) play(flow);

  function play(flow) {
    const order = ['planner', 'you', 'agent', 'checks', 'reviewer'];
    const stations = Object.fromEntries(order.map(role => [role, flow.querySelector(`[data-role="${role}"]`)]));
    const fill = flow.querySelector('.flow__rail-fill');
    const chip = flow.querySelector('[data-status]');
    const idea = flow.querySelector('[data-idea]');
    const caret = flow.querySelector('.flow__caret');
    const log = flow.querySelector('.flow__log');
    // How each face looks while its station is at work, as the app draws its agents
    const busy = { planner: 'thinking', agent: 'working', checks: 'working', reviewer: 'thinking' };
    const labels = { planner: 'Planner', you: 'You', agent: 'Agent', checks: 'Checks', reviewer: 'Reviewer', done: 'Done' };

    // Time passes only while the flow is on screen and the tab is visible, so it never runs unseen.
    let onScreen = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting)).observe(flow);
    }
    const wait = ms =>
      reduce
        ? Promise.resolve()
        : new Promise(done => {
            let last = performance.now();
            const tick = now => {
              if (onScreen && !document.hidden) ms -= now - last;
              last = now;
              if (ms <= 0) done();
              else requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });

    const set = (role, state, note) => {
      const station = stations[role];
      station.dataset.state = state;
      if (note !== undefined) station.querySelector('.station__note').textContent = note;
      const face = station.querySelector('.face-open');
      if (face) face.dataset.state = state === 'active' ? busy[role] : 'idle';
      station.querySelector('.station__badge').textContent = state === 'back' ? '↩' : '✓';
    };
    const rail = (role, back = false) => {
      fill.style.width = `${(order.indexOf(role) / (order.length - 1)) * 100}%`;
      fill.classList.toggle('is-back', back);
    };
    const status = (tone, label) => {
      chip.className = `chip chip--${tone}`;
      chip.querySelector('[data-label]').textContent = label;
    };
    const say = (who, what) => {
      const line = document.createElement('li');
      const name = document.createElement('span');
      const text = document.createElement('span');
      name.className = `who who--${who}`;
      name.textContent = labels[who];
      text.className = 'what';
      text.textContent = what;
      line.append(name, text);
      log.append(line);
      while (log.children.length > 7) log.firstElementChild.remove();
    };
    const reset = () => {
      order.forEach(role => set(role, 'idle', stations[role].dataset.idle));
      rail('planner');
      log.replaceChildren();
      idea.textContent = '';
      status('wait', 'New idea');
    };
    const type = async text => {
      caret.hidden = false;
      if (reduce) idea.textContent = text;
      for (let i = 1; !reduce && i <= text.length; i++) {
        idea.textContent = text.slice(0, i);
        await wait(26);
      }
      await wait(350);
      caret.hidden = true;
    };

    const once = async () => {
      reset();
      await wait(700);
      await type(idea.dataset.idea);

      status('live', 'Planning');
      set('planner', 'active', 'Planning');
      await wait(1700);
      set('planner', 'done', 'One story');
      say('planner', 'planned it as a story, with the tests it needs');
      rail('you');

      status('you', 'Needs you');
      set('you', 'active', 'Approve the plan');
      await wait(1700);
      set('you', 'done', 'Approved');
      say('you', 'approved the plan');
      rail('agent');

      status('live', 'Building');
      set('agent', 'active', 'Building');
      await wait(1900);
      set('agent', 'done', 'Changed 3 files');
      say('agent', 'changed 3 files in its own copy');
      rail('checks');

      status('live', 'Testing');
      set('checks', 'active', 'Testing');
      await wait(1400);
      set('checks', 'done', '18 of 18');
      say('checks', '18 of 18 tests passed, in the sandbox');
      rail('reviewer');

      status('live', 'In review');
      set('reviewer', 'active', 'Reviewing');
      await wait(1800);
      set('reviewer', 'back', 'Sent back');
      say('reviewer', 'sent it back: an item due today shows as overdue');
      status('bad', 'Sent back');
      rail('reviewer', true);
      await wait(1300);

      rail('agent', true);
      set('checks', 'idle', stations.checks.dataset.idle);
      status('live', 'Fixing');
      set('agent', 'active', 'Fixing');
      await wait(1700);
      set('agent', 'done', 'Fixed');
      say('agent', 'fixed it, starting from the review');
      rail('checks');

      status('live', 'Testing');
      set('checks', 'active', 'Testing');
      await wait(1200);
      set('checks', 'done', '19 of 19');
      say('checks', '19 of 19 tests passed, in the sandbox');
      rail('reviewer');

      status('live', 'In review');
      set('reviewer', 'active', 'Reviewing');
      await wait(1500);
      set('reviewer', 'done', 'Passed');
      say('reviewer', 'passed it');
      say('done', 'merged into your branch');
      status('ok', 'Merged');
      await wait(4200);
    };

    (async () => {
      if (reduce) return once();
      for (;;) await once();
    })();
  }
})();
