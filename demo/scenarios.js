// The demo's ideas. Each is a project with its team, the plan the planner proposes for the idea, and every step's
// attempts: what the agent says while it works, what it hands in, and what the reviewer says about it. Nothing here
// is generated; the demo plays it back as the app would show a real run. The faces come from the app's own kit:
// the starting agents wear their classic looks, and a specialist made for one project gets a new look from the same
// parts, as the app makes one.
import { CLASSIC, pickNew } from '../assets/app/agent-kit.js';

const classic = name => CLASSIC.find(agent => agent.name === name).look;
const agent = (id, name, job, look, made = false) => ({ id, name, job, look, made });
const mara = agent('mara', 'Mara', 'Planner', classic('Mara'));
const juno = agent('juno', 'Juno', 'Writer', classic('Juno'));
const morgan = agent('morgan', 'Morgan', 'Reviewer', classic('Morgan'));
const eli = agent('eli', 'Eli', 'Engineer', classic('Eli'));
const avery = agent('avery', 'Avery', 'Test engineer', classic('Avery'));
const made = (id, name, job, seed) =>
  agent(
    id,
    name,
    job,
    pickNew(
      seed,
      CLASSIC.map(item => item.look),
    ),
    true,
  );

export const scenarios = [
  {
    id: 'party',
    suggestion: 'Throw my cat Biscuit a 4th birthday party',
    idea: 'Throw my cat Biscuit a 4th birthday party. Five neighborhood cats are coming, plus their people. Keep it under an hour; Biscuit naps at 4.',
    project: { name: "Biscuit's birthday", initials: 'BB', kind: 'General work', color: '#f0629b' },
    code: false,
    rules: 'House rules: you accept plans; starting work, reviews and acceptance run on their own.',
    team: [mara, juno, made('tam', 'Tam', 'Pet chef', 'biscuit#chef'), morgan],
    planner: 'mara',
    reviewer: 'morgan',
    planning: {
      lines: [
        'Reading your idea…',
        'Five guests, under an hour, a nap at 4.',
        'Three steps. The menu needs a specialist.',
      ],
      summary:
        'Three steps. I made Tam, a pet chef, for the menu. The run of show waits for the menu, so the cake comes before the nap.',
    },
    steps: [
      {
        id: 'T-3f81c2',
        title: 'Invitations for five cats and their people',
        worker: 'juno',
        attempts: [
          {
            lines: [
              'Rhyming "whiskers" with "delicious"… it doesn\'t.',
              'Five invitations, one per guest.',
              'RSVP by slow blink. Obviously.',
            ],
            review: {
              verdict: 'pass',
              lines: ['Checking every guest is invited…'],
              notes: ['All five guests are named, and the time fits before the nap.'],
            },
          },
        ],
        file: {
          name: 'invitations.md',
          body: [
            'Mittens, Sir Pounce, Olive, Gus and Pickles:',
            '',
            "You're invited to BISCUIT'S 4TH BIRTHDAY.",
            'Saturday, 3 PM, the sunny spot by the window.',
            'There will be a box. A big one.',
            '',
            'Please RSVP with a slow blink.',
          ],
        },
        summary: 'Five invitations, one per guest, with the time and the box.',
      },
      {
        id: 'T-a90d47',
        title: 'A party menu Biscuit can actually eat',
        worker: 'tam',
        attempts: [
          {
            lines: [
              'What does a cat eat at a party?',
              'Tuna and pumpkin cake, whipped-cream frosting…',
              'Garnish: a little chives. Fancy.',
            ],
            review: {
              verdict: 'back',
              lines: ['Reading the menu…', 'Checking each ingredient is safe for cats…'],
              findings: [
                'menu.md:4: Chives are toxic to cats, like everything in the onion family.',
                "menu.md:3: Whipped cream upsets most adult cats; they can't digest the lactose.",
              ],
            },
          },
          {
            lines: [
              "Starting from Morgan's findings.",
              'Frosting: mashed sweet potato.',
              'Chives out, a pinch of catnip in.',
            ],
            review: {
              verdict: 'pass',
              lines: ['Checking the fixes…'],
              notes: ['Both findings fixed. The candle stays unlit, as written.'],
            },
          },
        ],
        file: {
          name: 'menu.md',
          body: [
            'For the cats',
            '- Tuna and pumpkin cake, mashed sweet potato frosting',
            '- Chicken party poppers: plain, cooked, bite-size',
            '- A pinch of catnip, for the brave',
            '- Water bar: one bowl, one dripping tap',
            '',
            'For the people: pizza, on the counter, out of paw reach',
          ],
        },
        summary: 'A menu that is safe for cats, with the people food kept apart.',
      },
      {
        id: 'T-c4e215',
        title: 'Run of show, from arrival to nap',
        worker: 'juno',
        needs: ['T-a90d47'],
        attempts: [
          {
            lines: ['Reading the menu Tam handed on.', 'Cake at 3:30, nap at 3:45.', 'Leaving room for zoomies.'],
            review: {
              verdict: 'pass',
              lines: ['Checking it ends before 4…'],
              notes: ['Ends at 3:45, before the nap. The cake matches the menu.'],
            },
          },
        ],
        file: {
          name: 'run-of-show.md',
          body: [
            '3:00  Guests arrive. Suspicious sniffing.',
            '3:15  The box opens. Nobody uses the door.',
            '3:30  Cake. The candle stays unlit.',
            '3:40  Zoomies (unscheduled, inevitable)',
            '3:45  Group nap. Mandatory.',
          ],
        },
        summary: 'Forty-five minutes, from arrival to the group nap.',
      },
    ],
  },
  {
    id: 'dragon',
    suggestion: "Write a bedtime story about a dragon who's scared of the dark",
    idea: "Write a bedtime story about a dragon who's scared of the dark, for my 5-year-old. Five minutes to read aloud, and she should find her own courage.",
    project: { name: 'Bedtime stories', initials: 'BS', kind: 'General work', color: '#5b45e0' },
    code: false,
    rules: 'House rules: you accept plans; starting work, reviews and acceptance run on their own.',
    team: [mara, juno, made('fern', 'Fern', 'Illustrator', 'dragon#illustrator'), morgan],
    planner: 'mara',
    reviewer: 'morgan',
    planning: {
      lines: ['Reading your idea…', 'Five minutes aloud is about 600 words.', 'A story, then pictures for it.'],
      summary:
        'Two steps: Juno writes the story, then Fern, an illustrator I made for this, plans a picture for each page.',
    },
    steps: [
      {
        id: 'T-71b0e9',
        title: 'The story, about five minutes read aloud',
        worker: 'juno',
        attempts: [
          {
            lines: [
              'Meet Ember, the biggest dragon on Cinder Hill.',
              'She sleeps with her tail around a lantern.',
              'A wizard brings a magic night-light…',
            ],
            review: {
              verdict: 'back',
              lines: ['Reading it aloud, with a timer…', 'Checking it against the idea…'],
              findings: [
                'story.md: It runs about 1,400 words, near eleven minutes aloud. The idea asks for five.',
                'story.md:41: A magic night-light fixes the fear. The idea asks for Ember to find her own courage.',
              ],
            },
          },
          {
            lines: [
              "Starting from Morgan's findings.",
              'No wizard. Ember tries one small breath of flame.',
              'Cut to 620 words.',
            ],
            review: {
              verdict: 'pass',
              lines: ['Reading it aloud again…'],
              notes: ["About five minutes now, and the courage is Ember's own."],
            },
          },
        ],
        file: {
          name: 'story.md',
          body: [
            'Ember was the biggest dragon on Cinder Hill,',
            'and the only one who slept with her tail',
            'wrapped around a lantern.',
            '',
            '…',
            '',
            'So when the lantern flickered out, Ember breathed',
            'one small, warm breath. Just enough to see',
            'that the dark was only the cave,',
            'the same cave, waiting for morning.',
          ],
        },
        summary: 'A 620-word story; Ember lights the dark with her own small flame.',
      },
      {
        id: 'T-0de83a',
        title: 'A picture for every page',
        worker: 'fern',
        needs: ['T-71b0e9'],
        attempts: [
          {
            lines: [
              'Reading the story Juno handed on.',
              'Eight pages, eight pictures.',
              'Warm colors, one small flame.',
            ],
            review: {
              verdict: 'pass',
              lines: ['Checking every page has a picture…'],
              notes: ['One picture per page, and each matches its words.'],
            },
          },
        ],
        file: {
          name: 'pictures.md',
          body: [
            'Page 1  Ember, enormous, curled around a tiny lantern.',
            'Page 4  The lantern gutters out. Only two worried eyes.',
            'Page 7  One small flame, held like a candle.',
            'Page 8  The cave is just a cave. Ember asleep, smiling.',
          ],
        },
        summary: 'A picture for each of the eight pages.',
      },
    ],
  },
  {
    id: 'snake',
    suggestion: 'Make my snake game speed up every 5 apples',
    idea: 'Make my snake game speed up every 5 apples, and show the speed on the score bar.',
    project: { name: 'Snake game', initials: 'SG', kind: 'Code · git repository', color: '#2bbf95' },
    code: true,
    rules: 'House rules: you accept plans and integrate; starting stories, checks and reviews run on their own.',
    team: [mara, eli, avery, morgan],
    planner: 'mara',
    reviewer: 'morgan',
    checker: 'avery',
    checks: {
      title: 'Check the source before planning',
      lines: ['Copying the project into the sandbox…', 'Running its tests…', '22 of 22 passed.'],
      tests: 22,
    },
    planning: {
      lines: ['Reading the checks Avery measured.', 'Reading the game loop…', 'Two stories, one after another.'],
      summary:
        'Two stories: the speed-up with its tests first, then the speed on the score bar. Eli builds, Avery tests, Morgan reviews.',
    },
    steps: [
      {
        id: 'T-5c2f70',
        title: 'Speed up the snake every 5 apples',
        worker: 'eli',
        attempts: [
          {
            lines: [
              'Reading src/snake.js.',
              'Each 5 apples, the step gets 10% shorter.',
              'Adding tests for apples 5 and 10.',
            ],
            tests: { pass: 24, total: 24 },
            change: { added: 31, removed: 4, files: 2 },
            review: {
              verdict: 'back',
              lines: ['Reading the change…', 'What happens at apple 100?'],
              findings: [
                'src/snake.js:41: The speed has no cap. At 60 apples the snake moves every 8 ms, faster than the screen draws.',
              ],
            },
          },
          {
            lines: ["Starting from Morgan's findings.", 'Capping the step at 60 ms.', 'A test for apple 100.'],
            tests: { pass: 25, total: 25 },
            change: { added: 38, removed: 4, files: 2 },
            review: {
              verdict: 'pass',
              lines: ['Checking the cap and its test…'],
              notes: ['Capped, and the new test covers apple 100.'],
            },
          },
        ],
        diff: [
          ['hunk', '@@ src/snake.js @@'],
          ['', 'export function stepTime(apples) {'],
          ['del', '  return BASE_STEP;'],
          ['add', '  const faster = BASE_STEP * 0.9 ** Math.floor(apples / 5);'],
          ['add', '  return Math.max(MIN_STEP, Math.round(faster));'],
          ['', '}'],
        ],
        commit: '4c1e9a2',
        summary: 'Every 5 apples the snake gets 10% faster, never below 60 ms a step.',
      },
      {
        id: 'T-e8a316',
        title: 'Show the speed on the score bar',
        worker: 'eli',
        needs: ['T-5c2f70'],
        attempts: [
          {
            lines: ['Reading the score bar.', 'Speed 1 to 9, beside the score.', 'A test for the label.'],
            tests: { pass: 26, total: 26 },
            change: { added: 14, removed: 2, files: 2 },
            review: {
              verdict: 'pass',
              lines: ['Reading the change…'],
              notes: ['The label follows the cap: it stops at speed 9.'],
            },
          },
        ],
        diff: [
          ['hunk', '@@ src/score-bar.js @@'],
          ['del', '  bar.textContent = `Score ${score}`;'],
          ['add', '  bar.textContent = `Score ${score} · Speed ${speedOf(apples)}`;'],
        ],
        commit: '9b07d3e',
        summary: 'The score bar shows the speed, from 1 to 9.',
      },
    ],
  },
];
