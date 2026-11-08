(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;
  const t = (x, y, s, o) => T(x, y, s, Object.assign({ anchor: 'middle', size: 24 }, o || {}));
  const bx = (x, y, w, h, s, o) => [B(x, y, w, h, o), t(x + w / 2, y + h / 2 + 8, s, o)];

  NB.register({
    id: 'qseam-background',
    title: 'QSeam background',
    subtitle: 'Explain how modules, links and merges fit together, and why a link costs more than its gate error.',
    category: 'Quantum computing',
    cover: {
      palette: 3,
      art: [
        B(10, 12, 32, 28),
        B(58, 12, 32, 28),
        B(10, 60, 32, 28),
        B(58, 60, 32, 28),
        L([[42, 26], [58, 26]], { w: 3 }),
        L([[26, 40], [26, 60]], { w: 3 }),
        K([[26, 12], [34, 2], [66, 2], [74, 12]])
      ]
    },
    glossary: [
      {
        group: 'The machine',
        note: 'Where patches live and how the machine is laid out.',
        items: [
          { term: 'module', means: 'One superconducting die. The machine is many modules joined together.', hover: false },
          { term: 'die', aka: ['dies'], means: 'A single chip cut from a wafer. One die is one module.' },
          { term: 'superconducting', means: 'Qubits built from superconducting circuits on a chip.' },
          { term: 'yield', means: 'The share of dies that come out working. It falls as a die gets larger.' },
          { term: 'tile', aka: ['tiles'], means: 'A slot on a module that holds one patch, so one logical qubit. Four per module.' },
          { term: 'routing bus', aka: ['bus'], means: 'Space in a module that carries merge paths. It carries two paths at a time.' },
          { term: 'magic-state factory', aka: ['factory', 'factories'], means: 'A module set aside to make magic states. About one module in four.' },
          { term: 'magic state', aka: ['magic states'], means: 'A special prepared state that a non-Clifford rotation uses up.' },
          { term: 'buffer', means: 'Ready magic states held by a factory. Each buffer slot serves one merge at a time.' },
          { term: 'tier', aka: ['tiers'], means: 'One flat layer of modules. A machine can stack several tiers.' },
          { term: 'pitch', aka: ['pitches'], means: 'The spacing between neighbouring module sites. Distances are counted in pitches.' },
          { term: 'planar', means: 'A machine with one tier of modules, such as P32 (8 × 4).' },
          { term: 'stacked', means: 'A machine with several tiers, such as S32 (4 × 4 × 2).' },
          { term: 'P32', aka: ['S32'], means: 'The paper machines with 32 modules. P32 is 8 × 4 planar. S32 is 4 × 4 × 2 stacked.' },
          { term: 'nx', aka: ['ny', 'nz'], means: 'Modules wide, modules deep, and number of tiers in the grid.' }
        ]
      },
      {
        group: 'Links, seams and channels',
        note: 'What joins modules, and how the joins are bundled.',
        items: [
          { term: 'link', aka: ['links'], means: 'One coupler between two modules. It does one CNOT per round, with error ε and duration t.', hover: false },
          { term: 'coupler', aka: ['couplers'], means: 'The device that joins two qubits or two modules. One link is one coupler.' },
          { term: 'on-chip', means: 'Inside one die. On-chip gates are the baseline: error 0.1%, duration 30 ns.' },
          { term: 'error ε', aka: ['ε'], means: 'The chance a link CNOT goes wrong.' },
          { term: 'duration', aka: ['duration t'], means: 'How long a link CNOT takes. Counted in units of 30 ns, the on-chip CNOT time.' },
          { term: 'lateral', aka: ['Lateral', 'L'], means: 'Link between neighbours in the same tier. Default 0.5%, 100 ns.' },
          { term: 'vertical', aka: ['Vertical', 'V'], means: 'Link between stacked tiers. Default 0.8%, 70 ns.' },
          { term: 'cable', aka: ['Cable', 'cables', 'C'], means: 'Link between distant modules, 2 to 4 pitches. Default 1%, 200 ns at 2 pitches.' },
          { term: 'length ℓ', aka: ['ℓ'], means: 'Length of a link in pitches.' },
          { term: 'ε₀', means: 'Base error of the shortest link of a class.' },
          { term: 't₀', means: 'Base duration of the shortest link of a class.' },
          { term: 'ℓ₀', means: 'Length of the shortest link of a class. For cables, 2 pitches.' },
          { term: 'δ', means: 'Extra error added per pitch beyond ℓ₀. Default cable: 0.4%.' },
          { term: 'γ', means: 'Extra duration added per pitch beyond ℓ₀. Default cable: 20 ns.' },
          { term: 'seam', aka: ['seams'], means: 'A module boundary that a merge region crosses. A merge d rows tall uses 2d − 1 links there.' },
          { term: 'channel', aka: ['channels'], means: 'A bundle of links of one kind and one length that joins two modules.' },
          { term: 'lane', aka: ['lanes'], means: 'A set of 2d − 1 links in a channel. It carries one merge at a time. A channel has one or two.' },
          { term: 'cable port', aka: ['cable ports'], means: 'Where a cable attaches to a module. At most two per module.' },
          { term: 'D(t)', aka: ['D₀'], means: 'Round time across a seam: D₀ + 3 (t − 1) × 30 ns, with D₀ = 1 µs on-chip.' }
        ]
      },
      {
        group: 'Codes, rounds and merges',
        note: 'The error-correction setting that links live inside.',
        items: [
          { term: 'logical qubit', aka: ['logical qubits'], means: 'One protected qubit spread over many physical qubits.' },
          { term: 'surface code', means: 'A code that stores a logical qubit on a d × d grid of data qubits with measure qubits.' },
          { term: 'patch', aka: ['patches'], means: 'The d × d grid of data qubits that holds one logical qubit.' },
          { term: 'data qubit', aka: ['data qubits'], means: 'A physical qubit in the patch that stores the logical state.' },
          { term: 'measure qubit', aka: ['measure qubits'], means: 'A helper qubit that checks parities of neighbouring data qubits.' },
          { term: 'check', aka: ['checks'], means: 'A parity measurement on neighbouring data qubits, done every round.' },
          { term: 'parity', aka: ['parities'], means: 'Whether a set of bits holds an even or odd number of 1s.' },
          { term: 'code distance', means: 'The number d, the side of the patch. Bigger d protects better and costs more qubits.' },
          { term: 'threshold', means: 'The error rate below which a larger code gives lower logical failure.' },
          { term: 'CNOT', aka: ['CNOTs'], means: 'A two-qubit gate that flips the target qubit if the control is 1.' },
          { term: 'CNOT layer', aka: ['CNOT layers'], means: 'One set of CNOTs that run at the same time. A round has four.' },
          { term: 'round', aka: ['rounds'], means: 'One pass that measures every check once.', hover: false },
          { term: 'lock-step', means: 'All measure qubits run their gates together, so the round waits for the slowest.' },
          { term: 'idle error', means: 'Error a qubit picks up while it waits unused. It grows with waiting time.' },
          { term: 'physical error rate', aka: ['p'], means: 'Base error of one physical operation. The paper uses p = 0.1%.' },
          { term: 'SI1000', means: 'The noise model the paper simulates with.' },
          { term: 'lattice surgery', means: 'Joining two patches through an ancilla region, then splitting them again.' },
          { term: 'merge', aka: ['merges'], means: 'Join two patches with an ancilla region and run the merged code for d rounds.' },
          { term: 'split', means: 'Cut the merged code back into two patches.' },
          { term: 'ancilla region', aka: ['ancilla'], means: 'Fresh qubits that fill the gap between two patches during a merge.' },
          { term: 'merge outcome', aka: ['outcome'], means: 'The result of a merge, read from the new checks of the ancilla region.' },
          { term: 'new checks', means: 'The extra checks that the ancilla region adds. More route means more new checks.' },
          { term: 'logical CNOT', means: 'A CNOT between two logical qubits. It takes two merges.' },
          { term: 'non-Clifford rotation', aka: ['rotation', 'rotations'], means: 'A logical operation that needs a magic state. It takes one merge.' },
          { term: 'space-like', means: 'A merge failure where an error chain crosses the merged code.' },
          { term: 'time-like', means: 'A merge failure where measurement errors across rounds corrupt the outcome.' },
          { term: 'program fails', aka: ['program failure'], means: 'A program fails if any merge fails or any patch fails while it waits.' },
          { term: 'strip', means: 'A test block of code, d rows by 2d columns, with one seam, run for d rounds.' }
        ]
      },
      {
        group: 'Designs, routes and costs',
        note: 'How channels are chosen and how the paper prices them.',
        items: [
          { term: 'topology', means: 'Which modules are joined, and by which kind of channel.' },
          { term: 'compiler', means: 'The tool that picks, for each operation, which channels it uses and when.' },
          { term: 'logical cost', means: 'What a link adds to the chance that a whole error-corrected program fails.' },
          { term: 'proxy', aka: ['proxies'], means: 'A stand-in number for link cost, such as gate error or hop count.' },
          { term: 'gate error', means: 'The error of one operation on a link.' },
          { term: 'hop count', aka: ['hop-counting', 'hops', 'hop'], means: 'The number of channels a route crosses.' },
          { term: 'path', aka: ['paths', 'route', 'routes'], means: 'The list of channels one merge crosses.' },
          { term: 'traffic', means: 'How many merges a program sends between each pair of modules.' },
          { term: 'base fabric', means: 'Lateral channels between neighbours in a tier. They come free.' },
          { term: 'budget', means: 'The number B of extra lanes, vertical or cable, a builder may add.' },
          { term: 'design', aka: ['designs'], means: 'One choice of extra channels, within budget B, on top of the base fabric.' },
          { term: 'mesh', means: 'Design that adds vertical channels, or second lanes on busy lateral channels.' },
          { term: 'ruche', means: 'Design that adds regular two-pitch cables.' },
          { term: 'random', means: 'Design that adds channels by chance.', hover: false },
          { term: 'bulk', means: 'Failure from the plain columns of the merged code, apart from extra seam error.' },
          { term: 'seam excess', means: 'The extra failure a noisy seam adds over a seam with on-chip error.' },
          { term: 'idle memory', means: 'Failure of patches while they wait. 48% of failure in the paper programs at d = 13.' },
          { term: 'QSeam', means: 'The paper tool: measure link costs once per technology, then use them to choose and route.' }
        ]
      },
      {
        group: 'Units',
        items: [
          { term: 'ns', means: 'Nanosecond, a billionth of a second.' },
          { term: 'µs', means: 'Microsecond, 1000 ns.' }
        ]
      }
    ],
    sections: [
      /* ============================ SECTION 1 ============================ */
      {
        title: 'The problem',
        intro: 'Big quantum computers will be built from many small chips. This section says why, what a builder must decide, and what the paper claims.',
        bridge: 'You now know the open question: what does a link cost a program? To answer it we need the protected operations programs are made of. Section 2 builds them on one chip.',
        tabs: [
          {
            title: 'Why many small chips',
            buildsOn: 'This opens the notebook. It assumes only that useful quantum computers need very many good qubits, as QEC basics argued.',
            leadsTo: 'Next tab names the two choices a builder faces once a machine is many modules joined together.',
            idea: [
              'A *superconducting* chip, called a *die*, has qubits built on it. Bigger dies are more likely to contain a broken part.',
              'The share of working dies is the *yield*. It falls as a die grows.',
              'Error-corrected programs need far more qubits than one good die can hold.',
              'So the plan is many small dies, called *modules*, joined together.'
            ],
            sketch: [
              t(120, 48, 'one big die', { c: 'red' }),
              B(40, 70, 160, 150, { c: 'red' }),
              L([[70, 100], [110, 140]], { c: 'red' }),
              L([[110, 100], [70, 140]], { c: 'red' }),
              t(120, 255, 'yield drops\nas it grows', { c: 'red' }),
              A(215, 145, 285, 145),
              t(440, 88, 'many small modules', { c: 'green' }),
              ...bx(300, 110, 80, 60, 'module'),
              ...bx(400, 110, 80, 60, 'module'),
              ...bx(500, 110, 80, 60, 'module'),
              L([[380, 140], [400, 140]], { c: 'green' }),
              L([[480, 140], [500, 140]], { c: 'green' }),
              t(440, 210, 'joined by links', { c: 'green' })
            ],
            takeaway: 'Big machines are many small modules, joined together.',
            widget: null,
            check: {
              q: 'Why not just build one huge chip?',
              options: [
                'Yield: bigger dies are more likely to be broken',
                'Qubits on one chip cannot talk to each other',
                'Superconducting chips cannot be larger than a coin',
                'Modules are always more accurate than one chip'
              ],
              answer: 0,
              why: 'The paper says the yield of a single die falls long before it holds enough qubits.'
            }
          },
          {
            title: 'Two decisions',
            buildsOn: 'The last tab ended with many modules joined by links. This tab asks what a builder must choose about those joins.',
            leadsTo: 'Next tab asks how those two decisions are priced today, and which number they use for a link.',
            idea: [
              'A *link* is one connection between two modules. A *channel* is a bundle of links.',
              '*Topology*: which modules are joined, and by which kind of channel. Fixed when the machine is built.',
              'The *compiler*: for each operation of a program, which channels it travels over. Chosen per program.',
              'Both choices need one number: the *logical cost* of a link, the extra chance the whole program fails.'
            ],
            sketch: [
              t(105, 48, 'topology', { c: 'blue', size: 28 }),
              B(40, 80, 60, 50), B(140, 80, 60, 50), B(40, 180, 60, 50), B(140, 180, 60, 50),
              L([[100, 105], [140, 105]], { dash: true }),
              L([[100, 205], [140, 205]], { dash: true }),
              L([[70, 130], [70, 180]], { dash: true }),
              L([[170, 130], [170, 180]], { dash: true }),
              t(105, 275, 'what to build', { c: 'blue' }),
              t(470, 48, 'compiler', { c: 'red', size: 28 }),
              B(340, 130, 60, 50), B(440, 130, 60, 50), B(540, 130, 60, 50),
              A(402, 155, 438, 155, { c: 'red' }),
              A(502, 155, 538, 155, { c: 'red' }),
              t(470, 235, 'which way to go', { c: 'red' })
            ],
            takeaway: 'Topology picks the joins. The compiler picks the route.',
            widget: null,
            check: {
              q: 'Which choice is made per program, not when the machine is built?',
              options: [
                'The compiler: which channels each operation uses',
                'Topology: which modules are joined',
                'The number of tiles per module',
                'The size of the die'
              ],
              answer: 0,
              why: 'Topology is fixed at build time. The compiler routes every operation of each program.'
            }
          },
          {
            title: 'How links are priced today',
            buildsOn: 'The last tab said both decisions need the logical cost of a link. This tab shows which number people use instead.',
            leadsTo: 'Next section builds the error-correction setting on one chip, so we can see what a link really does to a program.',
            idea: [
              'Studies give every link one error rate, for example 1%. Compilers cost a link by hop count, length or gate error.',
              '*Hop count* is the number of channels a route crosses. *Gate error* is the error of one operation on the link.',
              'But links differ about 10 times in error and several times in speed. Even four links built alike differed by 2.5 times.',
              'The paper claims the true cost is none of these. It is what a link does to the failure of the whole program.'
            ],
            sketch: [
              t(115, 40, 'proxies', { c: 'red', size: 28 }),
              ...bx(30, 60, 170, 50, 'one error rate', { c: 'red' }),
              ...bx(30, 130, 170, 50, 'hop count', { c: 'red' }),
              ...bx(30, 200, 170, 50, 'gate error', { c: 'red' }),
              A(205, 85, 330, 140), A(205, 155, 330, 155), A(205, 225, 330, 170),
              H(355, 130, 235, 46, { c: 'yellow' }),
              ...bx(345, 120, 255, 66, 'logical cost', { c: 'green' }),
              t(470, 240, 'what it does to\nthe whole program')
            ],
            takeaway: 'Proxies: error rate, hop count, gate error. Truth: effect on the program.',
            widget: null,
            check: {
              q: 'Which is NOT one of the proxies the paper says links are priced by today?',
              options: ['Hop count', 'Gate error', 'One shared error rate', 'Program failure probability'],
              answer: 3,
              why: 'Program failure is what the paper wants to use. The others are today proxies.'
            }
          }
        ]
      },

      /* ============================ SECTION 2 ============================ */
      {
        title: 'Patches, rounds and merges',
        intro: 'One logical qubit lives in a patch of many physical qubits. Patches are joined for logic by a merge. Merges are what links carry later.',
        bridge: 'You now hold patches, rounds, distance d, merges, and two ways a merge fails. Section 3 draws the machine that holds the patches: modules, tiles, buses and factories.',
        tabs: [
          {
            title: 'A logical qubit is a patch',
            buildsOn: 'Section 1 left us asking what a link does to a program. This tab starts from the protected qubit that programs run on.',
            leadsTo: 'Next tab runs the checks round after round, and shows what sets how long a round takes.',
            idea: [
              'Recap: a builder needs the logical cost of a link. To see it, start with what runs on a module.',
              'A *logical qubit* is one protected qubit spread over many physical qubits. In the *surface code* it sits on a *patch*.',
              'A patch is a d × d grid of *data qubits*. *Measure qubits* between them check parities of neighbouring data qubits.',
              'd is the *code distance*. Bigger d protects better, at the cost of more qubits.'
            ],
            sketch: [
              B(40, 70, 200, 190),
              L([[107, 70], [107, 260]], { dash: true }),
              L([[173, 70], [173, 260]], { dash: true }),
              t(140, 50, 'patch'),
              t(140, 292, 'd × d data qubits'),
              A(252, 165, 338, 165),
              O(400, 100, 14), O(560, 100, 14), O(400, 230, 14), O(560, 230, 14),
              ...bx(435, 140, 90, 50, 'measure', { c: 'green' }),
              L([[435, 140], [411, 108]]), L([[525, 140], [549, 108]]),
              L([[435, 190], [411, 222]]), L([[525, 190], [549, 222]]),
              t(480, 70, 'data qubits')
            ],
            takeaway: 'A patch is d × d data qubits plus measure qubits that check them.',
            widget: { type: 'surface' },
            check: {
              q: 'In a distance-d patch, what do the measure qubits do?',
              options: [
                'Check parities of neighbouring data qubits',
                'Store the logical qubit by themselves',
                'Carry the link between two modules',
                'Make magic states'
              ],
              answer: 0,
              why: 'They measure parity checks. The logical qubit lives in the data qubits.'
            }
          },
          {
            title: 'A round of checks',
            buildsOn: 'The patch has measure qubits that check data qubits. This tab asks how often, and how long that takes.',
            leadsTo: 'Next tab asks what happens to qubits that wait while a round finishes.',
            idea: [
              'A *round* measures every check once, using *CNOT* gates between measure qubits and data qubits.',
              'All measure qubits run their CNOTs together, in *lock-step*, in four *CNOT layers*.',
              'So a round lasts as long as its slowest gate. On-chip, a CNOT is 30 ns and a round is about D₀ = 1 µs.'
            ],
            sketch: [
              t(255, 45, 'four CNOT layers'),
              B(40, 60, 100, 60), B(150, 60, 100, 60), B(260, 60, 100, 60), B(370, 60, 100, 60),
              B(40, 180, 100, 60), B(150, 180, 200, 60, { c: 'red' }), B(360, 180, 100, 60), B(470, 180, 100, 60),
              t(305, 268, 'one slow gate stretches the round', { c: 'red' }),
              A(40, 300, 590, 300),
              t(580, 290, 'time')
            ],
            takeaway: 'One round lasts as long as its slowest gate.',
            widget: null,
            check: {
              q: 'One gate in a round is much slower than the others. How long is the round?',
              options: [
                'As long as the slowest gate',
                'The average of all the gates',
                'As long as the fastest gate',
                'Unchanged, because gates run in parallel'
              ],
              answer: 0,
              why: 'Rounds run in lock-step, so every qubit waits for the slowest gate.'
            }
          },
          {
            title: 'Waiting costs error',
            buildsOn: 'A round ends when its slowest gate ends. This tab asks what the faster qubits do in the meantime.',
            leadsTo: 'Next tab asks how many errors a patch can survive at all, which is what the code distance d buys.',
            idea: [
              'A qubit that waits is not safe. It picks up *idle error* for every nanosecond it sits unused.',
              'So a longer round means more idle error on every qubit in it.',
              'The paper simulates with the *SI1000* noise model, at a *physical error rate* p = 0.1%.',
              'Remember this: time costs error. It returns in Section 4, where slow links stretch the round.'
            ],
            sketch: [
              L([[60, 40], [60, 280], [600, 280]]),
              K([[60, 260], [200, 240], [350, 190], [470, 130], [580, 90]], { c: 'red' }),
              D(580, 90, { c: 'red' }),
              H(100, 62, 290, 46, { c: 'yellow' }),
              t(245, 96, 'time costs error', { size: 30 }),
              t(330, 306, 'time spent waiting'),
              t(70, 30, 'idle error', { anchor: 'start' })
            ],
            takeaway: 'Waiting piles up error, so a longer round costs more.',
            widget: null,
            check: {
              q: 'A qubit finishes its CNOT early and waits for the round to end. What happens to it?',
              options: [
                'It keeps picking up idle error while it waits',
                'Nothing, waiting qubits are error free',
                'It is corrected automatically by the other qubits',
                'It resets itself to |0⟩'
              ],
              answer: 0,
              why: 'Idle error grows with waiting time, so long rounds hurt every qubit.'
            }
          },
          {
            title: 'Distance d buys safety',
            buildsOn: 'Idle and gate errors hit every round. This tab shows how a larger patch outruns them.',
            leadsTo: 'Next tab asks how two patches interact, since a program needs more than idle patches.',
            idea: [
              'Below a *threshold* error rate, logical failure falls exponentially as d grows.',
              'In the paper simulations, raising d by two cuts the failure of a plain block of code 5 to 7 times (d = 5 to 9).',
              'The price: a patch has d × d data qubits, so qubit cost grows with d².'
            ],
            sketch: [
              L([[60, 40], [60, 280], [600, 280]]),
              K([[150, 70], [280, 130], [410, 190], [540, 250]]),
              D(150, 70), D(280, 130), D(410, 190), D(540, 250),
              t(330, 308, 'code distance d'),
              t(70, 30, 'logical failure', { anchor: 'start' }),
              t(400, 100, 'each +2 in d: 5 to 7 times\nless failure', { c: 'green' })
            ],
            takeaway: 'Bigger d: failure drops exponentially, qubit cost rises as d².',
            widget: { type: 'scaling' },
            check: {
              q: 'You raise the code distance from 7 to 9, below threshold. What happens to logical failure?',
              options: [
                'It drops by a large constant factor',
                'It stays about the same',
                'It rises because there are more qubits',
                'It drops by exactly 2 times'
              ],
              answer: 0,
              why: 'Below threshold, logical failure falls exponentially with d.'
            }
          },
          {
            title: 'Merge and split',
            buildsOn: 'A patch holds one logical qubit well. This tab connects two patches, since a program needs them to interact.',
            leadsTo: 'Next tab says what merges are used for in a program: CNOTs and rotations.',
            idea: [
              'Two patches sit apart. A logical operation between them needs them joined for a while.',
              '*Lattice surgery* does this: fill the gap with an *ancilla region* of fresh qubits, so both patches form one bigger code.',
              'That is a *merge*. Run it for d rounds, then *split* the code back into two patches.',
              'The merge also reads an *outcome* from the new checks of the ancilla region.'
            ],
            sketch: [
              B(20, 110, 60, 70), B(110, 110, 60, 70),
              A(190, 145, 235, 145),
              H(300, 110, 50, 70, { c: 'mint' }),
              B(250, 110, 150, 70),
              A(415, 145, 460, 145),
              B(470, 110, 60, 70), B(560, 110, 60, 70),
              t(95, 215, 'two patches'),
              t(325, 215, 'merged, d rounds'),
              t(545, 215, 'split'),
              t(325, 95, 'ancilla region', { c: 'green' })
            ],
            takeaway: 'Merge: join two patches via an ancilla for d rounds, then split.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Two patches sit apart, each with d × d data qubits.', show: 'patch A        patch B' },
                { say: 'Fill the gap with an ancilla region of fresh qubits.', show: 'patch A + ancilla + patch B' },
                { say: 'Run the merged code for d rounds. It acts as one bigger code.', show: 'merge: d rounds' },
                { say: 'Split into two patches. The outcome was read from the new checks.', show: 'patch A        patch B' }
              ]
            },
            check: {
              q: 'What fills the gap between two patches during a merge?',
              options: [
                'An ancilla region of fresh qubits',
                'A cable',
                'A magic state',
                'A third logical qubit'
              ],
              answer: 0,
              why: 'The ancilla region joins the patches into one larger code for d rounds.'
            }
          },
          {
            title: 'What merges are for',
            buildsOn: 'A merge joins two patches for d rounds. This tab shows the program operations that are built from merges.',
            leadsTo: 'Next tab asks how a merge can go wrong, since every merge in a program can fail.',
            idea: [
              'A *logical CNOT* between two patches takes *two merges*.',
              'A *non-Clifford rotation* takes one merge with a *magic state*, a special prepared state, from a *factory*, a module that makes them.',
              'So a program is a long list of merges between patches, and between patches and factories.',
              'Merges between modules cross links. That is where link cost enters.'
            ],
            sketch: [
              t(135, 60, 'logical CNOT', { c: 'blue', size: 28 }),
              ...bx(30, 110, 70, 60, 'A'), ...bx(170, 110, 70, 60, 'B'),
              A(102, 128, 168, 128), A(168, 152, 102, 152),
              t(135, 230, '= two merges'),
              t(495, 60, 'rotation', { c: 'red', size: 28 }),
              ...bx(380, 110, 90, 60, 'patch'), ...bx(520, 110, 90, 60, 'factory', { c: 'pink' }),
              A(472, 140, 518, 140),
              t(495, 230, '= one merge +\nmagic state')
            ],
            takeaway: 'CNOT = 2 merges. Rotation = 1 merge with a magic state.',
            widget: null,
            check: {
              q: 'A program has 10 logical CNOTs and no rotations. How many merges does it use?',
              options: ['20', '10', '5', '40'],
              answer: 0,
              why: 'Each logical CNOT needs two merges.'
            }
          },
          {
            title: 'Two ways a merge fails',
            buildsOn: 'Merges are the unit of work from the last tab. Each one can fail, in one of two distinct ways.',
            leadsTo: 'Next section places patches on real hardware. The seam, where links enter a merge, comes in Section 4.',
            idea: [
              '*Space-like* failure: an error chain crosses the merged code and flips the logical result.',
              '*Time-like* failure: measurement errors, strung across rounds, corrupt the merge *outcome*.',
              'Both depend on d, on the number of rounds, and on the noise of everything the merge touches.'
            ],
            keys: [
              { tone: 'main', h: 'When does a program fail?', t: '*A program fails if any merge fails, or any patch fails while it waits.* These events are rare and nearly independent, so their chances add up.' }
            ],
            sketch: [
              B(40, 80, 240, 150),
              K([[50, 200], [130, 150], [200, 120], [270, 100]], { c: 'red' }),
              D(50, 200, { c: 'red' }), D(270, 100, { c: 'red' }),
              t(160, 50, 'space-like', { c: 'red', size: 28 }),
              t(160, 270, 'chain crosses the code'),
              A(380, 260, 380, 70, { c: 'blue' }),
              D(440, 230, { c: 'blue' }), D(470, 180, { c: 'blue' }), D(440, 130, { c: 'blue' }), D(470, 90, { c: 'blue' }),
              L([[440, 230], [470, 180], [440, 130], [470, 90]], { c: 'blue', dash: true }),
              t(520, 45, 'time-like', { c: 'blue', size: 28 }),
              t(520, 275, 'errors through\nthe rounds')
            ],
            takeaway: 'Space-like: chain across the code. Time-like: wrong outcome.',
            widget: null,
            check: {
              q: 'Measurement errors line up across the rounds and flip a merge outcome. Which failure is it?',
              options: ['Time-like', 'Space-like', 'Idle', 'Factory failure'],
              answer: 0,
              why: 'Corrupting the outcome through measurement errors across rounds is the time-like failure.'
            }
          }
        ]
      },

      /* ============================ SECTION 3 ============================ */
      {
        title: 'The machine of modules',
        intro: 'Patches need somewhere to live. This section builds the machine: modules, tiles, buses, factories, and how modules are laid out.',
        bridge: 'You now hold the layout: modules on a grid, each with tiles and a bus, some of them factories. Section 4 asks how modules are joined, which brings in links, seams and channels.',
        tabs: [
          {
            title: 'Module and tile',
            buildsOn: 'Section 2 ended with merges between patches. This tab says where a patch physically lives.',
            leadsTo: 'Next tab adds the bus, the space a merge path uses to get through a module.',
            idea: [
              'Recap: patches hold logical qubits and merges join them. Now: where patches live.',
              'A *module* is one superconducting die. The machine is many modules.',
              'Each module has four *tiles*. A tile is a slot that holds one patch, so one logical qubit.',
              'So a module holds up to four patches.'
            ],
            sketch: [
              B(60, 40, 300, 230),
              B(80, 60, 125, 85), B(215, 60, 125, 85), B(80, 160, 125, 85), B(215, 160, 125, 85),
              t(210, 30, 'module'),
              A(430, 100, 345, 100),
              t(520, 108, 'tile: slot for\none patch'),
              t(520, 220, '4 tiles per module', { c: 'green' })
            ],
            takeaway: 'Module = one die. Tile = slot for one patch. Four tiles per module.',
            widget: null,
            check: {
              q: 'What does one tile hold?',
              options: [
                'One patch, so one logical qubit',
                'One whole module',
                'One link',
                'One magic-state factory'
              ],
              answer: 0,
              why: 'A tile is a slot for one patch.'
            }
          },
          {
            title: 'The routing bus',
            buildsOn: 'Each tile holds a patch. To merge two patches, an ancilla region has to reach from one to the other.',
            leadsTo: 'Next tab adds factories, the modules whose job is making magic states.',
            idea: [
              'A merge needs a path of free space between patches. Inside a module, that space is the *routing bus*.',
              'The bus carries *two paths at a time*. Each bus slot serves one merge at a time.',
              'If both slots are busy, a third merge has to wait.'
            ],
            sketch: [
              B(60, 40, 360, 230),
              B(80, 60, 150, 70), B(250, 60, 150, 70),
              H(80, 200, 320, 50, { c: 'yellow' }),
              ...bx(80, 200, 320, 50, 'bus'),
              A(155, 132, 155, 198, { c: 'blue' }), A(325, 132, 325, 198, { c: 'red' }),
              t(530, 100, '2 paths\nat a time'),
              t(530, 230, 'a 3rd merge\nmust wait', { c: 'red' })
            ],
            takeaway: 'The bus carries two merge paths at a time.',
            widget: null,
            check: {
              q: 'Three merges all want the bus of one module at once. What happens?',
              options: [
                'One waits, because the bus carries two paths',
                'All three run together',
                'The module splits into two',
                'The merges switch to a cable'
              ],
              answer: 0,
              why: 'A bus slot serves one merge at a time, and the bus carries two paths.'
            }
          },
          {
            title: 'Factory modules',
            buildsOn: 'Rotations need a magic state, as Section 2 said. This tab shows where magic states come from.',
            leadsTo: 'Next tab places all these modules on a grid and gives the distance between them a unit.',
            idea: [
              'A *magic-state factory* is a module set aside to make *magic states*, the special states rotations use.',
              'About one module in four is a factory.',
              'A rotation merges with a magic state from a factory, so qubits with many rotations want a factory close by.',
              'A factory holds a *buffer* of ready magic states. Each buffer slot serves one merge at a time.'
            ],
            sketch: [
              B(60, 80, 110, 80), B(210, 80, 110, 80), B(60, 190, 110, 80),
              ...bx(210, 190, 110, 80, 'factory', { c: 'pink' }),
              A(172, 230, 208, 230, { c: 'red' }),
              t(115, 62, 'module'),
              t(480, 120, '1 module in 4\nis a factory'),
              t(480, 230, 'rotation asks the\nfactory for a\nmagic state', { c: 'red' })
            ],
            takeaway: 'Factories make magic states. Rotations ask a factory for one.',
            widget: null,
            check: {
              q: 'Why does a qubit with many rotations prefer to sit near a factory?',
              options: [
                'Each rotation merges with a magic state from a factory',
                'Factories correct its errors',
                'Factories give it extra idle time',
                'Rotations only work inside factories'
              ],
              answer: 0,
              why: 'Rotations use up magic states, and factories make them.'
            }
          },
          {
            title: 'Grid and pitch',
            buildsOn: 'Modules, tiles, buses and factories are the parts. This tab lays the modules out and fixes a unit of distance.',
            leadsTo: 'Next tab stacks tiers on top of each other, which changes how far apart modules are.',
            idea: [
              'Modules sit on a grid, nx modules wide and ny deep, in one layer called a *tier*.',
              'The spacing between neighbouring module sites is one *pitch*. Distances are counted in pitches.',
              'Example: two modules with one module between them are 2 pitches apart.'
            ],
            sketch: [
              B(80, 70, 90, 60), B(210, 70, 90, 60), B(340, 70, 90, 60),
              B(80, 170, 90, 60), B(210, 170, 90, 60), B(340, 170, 90, 60),
              L([[125, 270], [255, 270]]), L([[125, 262], [125, 278]]), L([[255, 262], [255, 278]]),
              t(190, 302, '1 pitch'),
              t(255, 45, 'nx = 3 modules wide'),
              t(540, 130, 'ny = 2\nmodules deep')
            ],
            takeaway: 'Modules form a grid. One pitch = the spacing between neighbours.',
            widget: null,
            check: {
              q: 'Two modules in a row have exactly one module between them. How far apart are they?',
              options: ['2 pitches', '1 pitch', '3 pitches', '0 pitches'],
              answer: 0,
              why: 'Neighbours are 1 pitch apart. One module between them makes 2.'
            }
          },
          {
            title: 'Planar or stacked',
            buildsOn: 'One tier is a flat grid of nx × ny modules. This tab stacks tiers, adding the third direction nz.',
            leadsTo: 'Next section joins the modules. Neighbours in a tier, modules in different tiers and distant modules each need their own kind of join.',
            idea: [
              'Stack nz tiers and the grid is nx × ny × nz. One tier is a *planar* machine. Several tiers make a *stacked* one.',
              'The paper tests P32 (8 × 4, planar) and S32 (4 × 4 × 2, stacked). Both have 32 modules.',
              'Stacking shortens trips. Corner to corner is 10 neighbour steps on P32 and 7 on S32 (6 across, 1 up).'
            ],
            sketch: [
              B(30, 100, 240, 120),
              t(150, 170, 'P32: 8 × 4'),
              t(150, 250, 'one flat tier'),
              B(350, 40, 200, 90), B(350, 180, 200, 90),
              L([[400, 130], [400, 180]], { c: 'blue' }), L([[500, 130], [500, 180]], { c: 'blue' }),
              t(450, 92, 'tier 1'), t(450, 232, 'tier 0'),
              t(450, 302, 'S32: 4 × 4 × 2'),
              t(582, 160, 'links', { c: 'blue' })
            ],
            takeaway: 'Stacking tiers keeps the module count but shortens distances.',
            widget: null,
            check: {
              q: 'S32 is 4 × 4 × 2. How many modules is that?',
              options: ['32', '16', '8', '64'],
              answer: 0,
              why: '4 × 4 × 2 = 32, the same count as P32.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 ============================ */
      {
        title: 'Links, seams and channels',
        intro: 'Modules are joined by links. This section defines a link, its three kinds, the seam a merge crosses, and the channel that bundles links.',
        bridge: 'You now hold: a link has error and duration, a seam uses 2d − 1 links, a channel bundles them into lanes, and a slow link stretches every round. Section 5 asks how channels are chosen and routed.',
        tabs: [
          {
            title: 'A link',
            buildsOn: 'Section 3 ended with modules on a grid, some far apart. This tab defines the thing that joins two modules.',
            leadsTo: 'Next tab names the three kinds of link and gives each its error and its speed.',
            idea: [
              'Recap: modules sit on a grid, some far apart. Now: what joins them.',
              'A *link* is one coupler between two modules. It does one CNOT between a qubit on each side, once per round.',
              'It has an *error* ε, the chance the CNOT goes wrong, and a *duration* t, how long it takes.',
              'On-chip gates are better: error 0.1%, duration 30 ns. Every link is worse in both.'
            ],
            sketch: [
              B(40, 80, 160, 160), B(440, 80, 160, 160),
              D(170, 160), D(470, 160),
              L([[170, 160], [470, 160]], { c: 'green' }),
              t(320, 130, 'link', { c: 'green', size: 28 }),
              t(320, 200, 'error ε, duration t'),
              t(320, 270, 'one CNOT per round'),
              t(120, 60, 'module'), t(520, 60, 'module')
            ],
            takeaway: 'A link is one coupler. It has an error ε and a duration t.',
            widget: null,
            check: {
              q: 'What does one link do in each round?',
              options: [
                'One CNOT between qubits on two modules',
                'A whole merge',
                'One round of checks for a patch',
                'It stores a logical qubit'
              ],
              answer: 0,
              why: 'A link carries one CNOT per round. Many links together carry a merge.'
            }
          },
          {
            title: 'Three kinds of link',
            buildsOn: 'A link has error ε and duration t. Where it sits decides its kind and its numbers.',
            leadsTo: 'Next tab shows that a cable is not one fixed link: its length changes its error and duration.',
            idea: [
              '*Lateral* (L): between neighbours in the same tier. Default 0.5% error, 100 ns.',
              '*Vertical* (V): between stacked tiers. Default 0.8% error, 70 ns.',
              '*Cable* (C): between distant modules, 2 to 4 pitches. Default 1% error, 200 ns at 2 pitches.',
              'Vertical is the fastest link and cable the slowest. All are worse than on-chip (0.1%, 30 ns).'
            ],
            keys: [
              { tone: 'main', h: 'These are paper defaults', t: 'Reported ranges are wider: L 0.5 to 1.7% and 56 to 164 ns, V about 1% and 70 ns, C 1.2 to 8.8% and 235 ns or more. The default cable is better than every reported one.' }
            ],
            sketch: [
              B(30, 120, 50, 40), B(110, 120, 50, 40), L([[80, 140], [110, 140]], { c: 'green' }),
              B(280, 70, 50, 40), B(280, 190, 50, 40), L([[305, 110], [305, 190]], { c: 'blue' }),
              B(450, 130, 50, 40), B(560, 130, 50, 40), K([[475, 130], [505, 95], [555, 95], [585, 130]], { c: 'red' }),
              t(95, 215, 'lateral L\n0.5%, 100 ns', { size: 22 }),
              t(305, 275, 'vertical V\n0.8%, 70 ns', { size: 22 }),
              t(530, 215, 'cable C\n1%, 200 ns', { size: 22 })
            ],
            takeaway: 'L: neighbours. V: between tiers. C: distant. Cable is slowest.',
            widget: null,
            check: {
              q: 'Which link kind has the shortest duration by default?',
              options: ['Vertical (70 ns)', 'Lateral (100 ns)', 'Cable (200 ns)', 'They are all equal'],
              answer: 0,
              why: 'Defaults: V 70 ns, L 100 ns, C 200 ns.'
            }
          },
          {
            title: 'Longer cables are worse',
            buildsOn: 'The cable default was given at 2 pitches. This tab says what changes when the cable is longer.',
            leadsTo: 'Next tab leaves single links and asks where a merge actually uses them: the seam.',
            idea: [
              'A cable gets worse with its *length* ℓ, counted in pitches.',
              'Default cable: 1% and 200 ns at 2 pitches, plus 0.4% and 20 ns for each extra pitch.',
              'So at 3 pitches: 1.4% and 220 ns. At 4 pitches: 1.8% and 240 ns.'
            ],
            math: [
              { h: 'The rule', eq: ['ε(ℓ) = ε₀ + δ · max(ℓ − ℓ₀, 0)', 't(ℓ) = t₀ + γ · max(ℓ − ℓ₀, 0)'], why: 'Only length beyond ℓ₀ adds cost. max(x, 0) is x if x > 0, else 0.' },
              { h: 'Default cable numbers', eq: ['ε₀ = 1%, δ = 0.4% per pitch, ℓ₀ = 2', 't₀ = 200 ns, γ = 20 ns per pitch'], why: 'These are the paper default cable values.' },
              { h: 'At 3 pitches', eq: ['ε(3) = 1% + 0.4% × (3 − 2) = 1.4%', 't(3) = 200 + 20 × (3 − 2) = 220 ns'] },
              { h: 'At 4 pitches', eq: ['ε(4) = 1% + 0.4% × 2 = 1.8%', 't(4) = 200 + 20 × 2 = 240 ns'] }
            ],
            sketch: [
              L([[60, 260], [600, 260]]),
              B(110, 160, 90, 100, { c: 'red' }), B(270, 120, 90, 140, { c: 'red' }), B(430, 80, 90, 180, { c: 'red' }),
              t(155, 148, '1.0%, 200 ns'), t(315, 108, '1.4%, 220 ns'), t(475, 68, '1.8%, 240 ns'),
              t(155, 288, '2 pitches'), t(315, 288, '3 pitches'), t(475, 288, '4 pitches')
            ],
            takeaway: 'Each extra pitch adds 0.4% error and 20 ns to a cable.',
            widget: null,
            check: {
              q: 'A cable is 4 pitches long (1% and 200 ns at 2 pitches, plus 0.4% and 20 ns per extra pitch). Its error and duration?',
              options: ['1.8% and 240 ns', '1.4% and 220 ns', '2.0% and 280 ns', '1.0% and 200 ns'],
              answer: 0,
              why: 'Two extra pitches: 1% + 0.8% = 1.8%, and 200 + 40 = 240 ns.'
            }
          },
          {
            title: 'The seam',
            buildsOn: 'A link carries one CNOT per round, and a merge needs many CNOTs. This tab shows where a merge uses links: at a module boundary.',
            leadsTo: 'Next tab names the bundle of links a seam uses, a channel, and the lanes inside it.',
            idea: [
              'A merge region can span two modules. The boundary it crosses is a *seam*.',
              'At the seam, a column of measure qubits sits on one module and the next column of data qubits on the other.',
              'Each check across the seam needs a link CNOT. A merge d rows tall uses *2d − 1 links*, each doing one CNOT per round.',
              'At d = 5 that is 9 links. At d = 9 it is 17.'
            ],
            sketch: [
              B(60, 50, 190, 200), B(390, 50, 190, 200),
              L([[250, 70], [390, 70]], { c: 'green' }), L([[250, 90], [390, 90]], { c: 'green' }),
              L([[250, 110], [390, 110]], { c: 'green' }), L([[250, 130], [390, 130]], { c: 'green' }),
              L([[250, 150], [390, 150]], { c: 'green' }), L([[250, 170], [390, 170]], { c: 'green' }),
              L([[250, 190], [390, 190]], { c: 'green' }), L([[250, 210], [390, 210]], { c: 'green' }),
              L([[250, 230], [390, 230]], { c: 'green' }),
              t(155, 35, 'module m'), t(485, 35, 'module m′'),
              t(320, 285, 'seam: 2d − 1 links', { c: 'green' })
            ],
            takeaway: 'A merge crossing a seam uses 2d − 1 links, one CNOT each per round.',
            widget: null,
            check: {
              q: 'At code distance d = 7, how many links does a merge use across one seam?',
              options: ['13', '7', '14', '15'],
              answer: 0,
              why: '2d − 1 = 2 × 7 − 1 = 13.'
            }
          },
          {
            title: 'Channel and lane',
            buildsOn: 'A seam uses 2d − 1 links. This tab names that bundle and says how many merges it can serve at once.',
            leadsTo: 'Next tab shows what a seam does to the round time, since the slowest link sets the pace.',
            idea: [
              'A *channel* joins two modules with links of one kind (L, V or C) and one length ℓ.',
              'A channel has one or two *lanes*. A lane is a set of 2d − 1 links.',
              'A lane carries *one merge at a time*. A second lane lets two merges cross together.',
              'A merge that needs a busy lane waits. Waiting is idle time, and idle time costs error.'
            ],
            sketch: [
              t(70, 80, '1 lane'),
              ...bx(140, 50, 120, 40, 'M1'), ...bx(260, 50, 120, 40, 'M2', { c: 'red' }),
              t(260, 122, 'M2 waits for M1', { c: 'red' }),
              t(70, 190, 'lane 1'), ...bx(140, 170, 120, 40, 'M1'),
              t(70, 240, 'lane 2'), ...bx(140, 220, 120, 40, 'M2', { c: 'red' }),
              t(210, 295, 'both run together', { c: 'green' })
            ],
            takeaway: 'Channel = bundle of links. Lane = 2d − 1 links, one merge at a time.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Two merges, M1 and M2, both need the same channel.', show: 'channel with 1 lane' },
                { say: 'M1 takes the lane. M2 has to wait until M1 is done.', show: 'lane 1: M1, then M2' },
                { say: 'Add a second lane and both merges run together.', show: 'lane 1: M1    lane 2: M2' }
              ]
            },
            check: {
              q: 'Two merges need the same channel at the same time. The channel has one lane. What happens?',
              options: [
                'One merge waits until the other finishes',
                'Both run, each at half speed',
                'The channel adds a lane automatically',
                'Both fail'
              ],
              answer: 0,
              why: 'A lane carries one merge at a time.'
            }
          },
          {
            title: 'Slow links stretch the round',
            buildsOn: 'Section 2 said a round lasts as long as its slowest gate. A seam puts links, slower than on-chip gates, into the round.',
            leadsTo: 'Next section chooses which channels to build and route over, where this stretch decides which are cheap.',
            idea: [
              'Three of the four CNOT layers in a round contain seam CNOTs, so all three stretch to the link duration t.',
              'With t counted in 30 ns on-chip CNOT times, a round across a seam lasts D(t) = D₀ + 3 (t − 1) × 30 ns.',
              'If a merge crosses several links, the slowest one sets the pace for every column.',
              'A cable at 200 ns stretches each round by about 510 ns. A lateral link at 100 ns, by about 210 ns.'
            ],
            math: [
              { h: 'The formula', eq: ['D(t) = D₀ + 3 (t − 1) × 30 ns', 'D₀ = 1000 ns, the on-chip round'], why: 'Three layers stretch from 1 to t CNOT times. The fourth stays.' },
              { h: 'Duration in CNOT times', eq: ['t = duration / 30 ns', 'lateral: 100 / 30 = 3.33'] },
              { h: 'Lateral link', eq: ['D = 1000 + 3 × (3.33 − 1) × 30', '  = 1000 + 210 = 1210 ns'] },
              { h: 'Cable', eq: ['t = 200 / 30 = 6.67', 'D = 1000 + 3 × (6.67 − 1) × 30 = 1510 ns'] },
              { h: 'Vertical link', eq: ['t = 70 / 30 = 2.33', 'D = 1000 + 3 × 1.33 × 30 = 1120 ns'] }
            ],
            sketch: [
              ...bx(120, 50, 300, 36, 'on-chip 1000 ns'),
              ...bx(120, 110, 336, 36, 'vertical 1120 ns', { c: 'blue' }),
              ...bx(120, 170, 363, 36, 'lateral 1210 ns', { c: 'green' }),
              H(250, 232, 190, 32, { c: 'yellow' }),
              ...bx(120, 230, 453, 36, 'cable 1510 ns', { c: 'red' }),
              t(330, 300, 'round time across one seam')
            ],
            takeaway: 'The slowest link sets the round: cable +510 ns, lateral +210 ns.',
            widget: {
              type: 'stack',
              unit: 'ns',
              segments: [
                { label: 'on-chip round', v: 1000 },
                { label: 'stretch from a 200 ns cable', v: 510 }
              ],
              note: 'With the default links, a lateral link stretches the round by 210 ns and a vertical link by 120 ns.'
            },
            check: {
              q: 'A merge crosses a lateral link (100 ns) and a cable (200 ns). Which sets the round time?',
              options: [
                'The cable, the slowest link',
                'The lateral link, the first one crossed',
                'The average of the two',
                'Neither, links sit outside the round'
              ],
              answer: 0,
              why: 'The slowest link sets the pace of every column.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 ============================ */
      {
        title: 'Choosing and routing',
        intro: 'Now the two decisions from Section 1 can be stated exactly. Builders spend a budget on channels, and the compiler routes merges over them.',
        bridge: 'You can now state both decisions, and you saw hop counting pick a slower route. Section 6 shows, with the paper numbers, four effects that make simple costs mislead.',
        tabs: [
          {
            title: 'Base fabric and budget',
            buildsOn: 'Section 4 defined channels and lanes. This tab says which ones come free and which ones are bought.',
            leadsTo: 'Next tab shows three simple ways to spend the budget, the first designs of a machine.',
            idea: [
              'Recap: links sit in channels, and channels hold lanes. Now: which channels a machine has.',
              'Lateral channels between neighbours in a tier come free. They form the *base fabric*.',
              'Vertical channels and cables of 2 to 4 pitches are bought from a *budget* of B lanes. At most two *cable ports* per module.',
              'The paper uses B = 16 lanes on 32 modules and B = 32 on 64.'
            ],
            sketch: [
              B(60, 140, 90, 60), B(270, 140, 90, 60), B(480, 140, 90, 60),
              L([[150, 170], [270, 170]], { c: 'green' }), L([[360, 170], [480, 170]], { c: 'green' }),
              K([[105, 140], [200, 95], [430, 95], [525, 140]], { c: 'red', dash: true }),
              L([[315, 200], [315, 255]], { c: 'blue', dash: true }),
              B(270, 255, 90, 40),
              t(190, 225, 'free: base fabric', { c: 'green' }),
              t(315, 70, 'bought with budget B', { c: 'red' }),
              t(480, 280, 'vertical, bought', { c: 'blue' })
            ],
            takeaway: 'Lateral channels are free. Vertical channels and cables cost budget B.',
            widget: null,
            check: {
              q: 'Which channels come free with the machine?',
              options: [
                'Lateral channels between neighbours in a tier',
                'Vertical channels',
                'Cables of 2 pitches',
                'Second lanes on every channel'
              ],
              answer: 0,
              why: 'Lateral channels form the base fabric. The rest is bought from the budget B.'
            }
          },
          {
            title: 'Designs: mesh, ruche, random',
            buildsOn: 'A budget of B lanes can be spent in many ways. This tab shows three simple ways, called designs.',
            leadsTo: 'Next tab asks how a program uses a design, through traffic and paths.',
            idea: [
              'A *design* is one choice of extra channels, within budget B, on top of the base fabric.',
              '*Mesh* adds vertical channels, or second lanes on busy lateral channels.',
              '*Ruche* adds regular two-pitch cables. *Random* adds channels by chance.',
              'The question for the builder: which design should be picked?'
            ],
            sketch: [
              t(105, 48, 'mesh', { c: 'blue', size: 28 }),
              B(70, 90, 70, 45), B(70, 200, 70, 45), L([[105, 135], [105, 200]], { c: 'blue' }),
              t(105, 272, 'vertical\nchannels'),
              t(360, 60, 'ruche', { c: 'red', size: 28 }),
              B(250, 170, 60, 45), B(410, 170, 60, 45), K([[280, 170], [320, 110], [400, 110], [440, 170]], { c: 'red' }),
              t(360, 280, 'two-pitch cables'),
              t(545, 60, 'random', { c: 'green', size: 28 }),
              O(520, 130, 12), O(585, 170, 12), O(540, 230, 12), L([[520, 130], [585, 170], [540, 230]], { dash: true }),
              t(555, 285, 'by chance')
            ],
            takeaway: 'A design = extra channels on top of the base fabric, within budget B.',
            widget: null,
            check: {
              q: 'Which design buys regular two-pitch cables?',
              options: ['Ruche', 'Mesh', 'Random', 'The base fabric'],
              answer: 0,
              why: 'Ruche adds regular two-pitch cables. Mesh adds vertical channels and second lanes.'
            }
          },
          {
            title: 'Traffic and paths',
            buildsOn: 'A design is the machine as built. This tab turns to what runs on it: merges between modules.',
            leadsTo: 'Next tab compares two paths between the same modules, the simplest routing choice.',
            idea: [
              '*Traffic* is how many merges a program sends between each pair of modules. It decides which channels get busy.',
              'The paper design search sends magic-state traffic to the two nearest factories.',
              'A *path* is the list of channels one merge crosses. Its length in channels is the number of *hops*, h.',
              'The compiler picks a path for every merge.'
            ],
            sketch: [
              ...bx(40, 140, 90, 60, 'A'), ...bx(220, 140, 90, 60, 'B'), ...bx(400, 140, 90, 60, 'C'),
              L([[130, 175], [220, 175]], { c: 'green' }), L([[310, 175], [400, 175]], { c: 'green' }),
              A(135, 155, 215, 155, { c: 'red' }), A(315, 155, 395, 155, { c: 'red' }),
              t(265, 100, 'path from A to C', { c: 'red' }),
              t(265, 260, '2 hops: h = 2')
            ],
            takeaway: 'A path is the channels a merge crosses. Hops = how many.',
            widget: null,
            check: {
              q: 'A merge goes from module A through B and C to D, all in one row. How many hops?',
              options: ['3', '4', '2', '1'],
              answer: 0,
              why: 'It crosses three channels: A to B, B to C, C to D.'
            }
          },
          {
            title: 'Hops against round time',
            buildsOn: 'A path is a list of channels, and each channel has a link duration. Section 4 showed the slowest link sets the round time.',
            leadsTo: 'Next section lists four such effects, with the paper numbers, that simple costs miss.',
            idea: [
              'Take modules A and C, two pitches apart. Route 1: two lateral channels, 2 hops. Route 2: one 2-pitch cable, 1 hop.',
              'A *hop-counting* router picks Route 2, since 1 hop beats 2.',
              'But the cable stretches each round by about 0.5 µs, a lateral link by about 0.2 µs.',
              'Fewer hops, slower rounds. This is the first example of a proxy misleading.'
            ],
            sketch: [
              ...bx(40, 60, 80, 44, 'A'), ...bx(160, 60, 80, 44, 'B'), ...bx(280, 60, 80, 44, 'C'),
              L([[120, 82], [160, 82]], { c: 'green' }), L([[240, 82], [280, 82]], { c: 'green' }),
              t(500, 80, 'Route 1: 2 hops\nround 1210 ns', { c: 'green' }),
              ...bx(40, 200, 80, 44, 'A'), ...bx(280, 200, 80, 44, 'C'),
              K([[80, 200], [130, 150], [270, 150], [320, 200]], { c: 'red' }),
              t(500, 220, 'Route 2: 1 hop\nround 1510 ns', { c: 'red' })
            ],
            takeaway: 'Fewer hops does not mean faster rounds. The slowest link decides.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Route 1: A to B to C over two lateral channels.', show: '2 hops, slowest link 100 ns, round 1210 ns' },
                { say: 'Route 2: A to C over one cable of 2 pitches.', show: '1 hop, slowest link 200 ns, round 1510 ns' },
                { say: 'A hop-counting router prefers Route 2.', show: '1 hop < 2 hops' },
                { say: 'But every round of the merge is slower on Route 2.', show: '1510 − 1210 = 300 ns per round' }
              ]
            },
            check: {
              q: 'What does a hop-counting router choose here, and why is that a problem?',
              options: [
                'The cable, but its slow link makes every round longer',
                'The lateral route, because it has more hops',
                'The cable, because it has lower error',
                'Either one, they cost the same'
              ],
              answer: 0,
              why: 'One hop beats two, yet the cable stretches each round by about 0.5 µs against 0.2 µs.'
            }
          }
        ]
      },

      /* ============================ SECTION 6 ============================ */
      {
        title: 'Why proxies fail',
        intro: 'Section 1 claimed that error rate, hop count and gate error mislead. Here are the four effects of the paper, each with its numbers.',
        bridge: 'You now know the problem, the machine, and four reasons simple costs fail. Next is QSeam itself: how the paper measures these costs once per link type and uses them to choose channels and routes.',
        tabs: [
          {
            title: 'Effect 1: steep in link error',
            buildsOn: 'Section 5 showed hop counting misleading. This tab starts the four effects with another proxy, gate error.',
            leadsTo: 'Next tab asks whether a bigger code distance rescues a noisy seam.',
            idea: [
              'Recap: simple costs can mislead. Now: four effects, with numbers.',
              'The paper tests a *strip*: d rows by 2d columns of code with one seam, run for d rounds.',
              'At d = 9, a 0.5% seam multiplies the strip failure by 1.48. A 4% seam multiplies it by 77.',
              'Gate error is only 8 times higher, yet the 4% seam adds about 160 times as much failure.'
            ],
            math: [
              { h: 'Extra failure of each seam', eq: ['0.5% seam: 1.48 − 1 = 0.48', '4% seam: 77 − 1 = 76'], why: 'The seam multiplies failure, so the extra is the factor minus 1.' },
              { h: 'Compare the extras', eq: ['76 / 0.48 ≈ 158, about 160 times', 'gate error: 4% / 0.5% = 8 times'] }
            ],
            sketch: [
              L([[60, 260], [600, 260]]),
              B(150, 220, 100, 40),
              H(385, 128, 110, 50, { c: 'yellow' }),
              B(390, 60, 100, 200, { c: 'red' }),
              t(200, 210, '8×'),
              t(440, 165, '160×', { c: 'red', size: 36 }),
              t(200, 290, 'gate error'),
              t(440, 290, 'extra failure'),
              t(320, 30, '0.5% seam against 4% seam, d = 9')
            ],
            takeaway: 'Seam failure rises about 160 times when gate error rises 8 times.',
            widget: null,
            check: {
              q: 'At d = 9, the 4% seam adds about 160 times the failure of the 0.5% seam. Its gate error is how many times higher?',
              options: ['8', '160', '77', '4'],
              answer: 0,
              why: '4% / 0.5% = 8, yet the failure added is about 160 times more.'
            }
          },
          {
            title: 'Effect 2: distance helps seams less',
            buildsOn: 'Gate error underprices a bad seam. Section 2 said a larger d fixes errors, so this tab asks whether d also fixes a noisy seam.',
            leadsTo: 'Next tab leaves error size and asks about the other number on a link, its duration.',
            idea: [
              'Raising d by two cuts the failure of a seam-free strip by 5 to 7 times (d = 5 to 9).',
              'It cuts the extra failure from a 1 to 2% seam by only 3 to 5 times.',
              'So a noisy seam falls behind the rest of the code as d grows. The gap between good and poor links widens.'
            ],
            sketch: [
              L([[60, 40], [60, 280], [600, 280]]),
              K([[120, 80], [260, 135], [400, 195], [540, 270]], { c: 'blue' }),
              K([[120, 120], [260, 140], [400, 170], [540, 200]], { c: 'red' }),
              t(210, 252, 'seam-free strip', { c: 'blue' }),
              t(500, 90, 'extra failure\nfrom the seam', { c: 'red' }),
              t(330, 306, 'code distance d'),
              t(70, 30, 'failure', { anchor: 'start' })
            ],
            takeaway: 'Raising d helps the rest of the code more than a noisy seam.',
            widget: null,
            check: {
              q: 'What happens to the gap between good and poor links as d grows?',
              options: [
                'It widens, since seams improve less than the rest',
                'It shrinks, since d fixes everything',
                'It stays the same',
                'It vanishes at d = 9'
              ],
              answer: 0,
              why: 'A +2 in d helps a noisy seam 3 to 5 times, and the rest 5 to 7 times.'
            }
          },
          {
            title: 'Effect 3: duration is an error source',
            buildsOn: 'Section 4 showed a slow link stretches every round. This tab measures what that stretch does to failure.',
            leadsTo: 'Next tab shows a fourth effect that has nothing to do with the link itself: how long the route is.',
            idea: [
              'A slow link makes the whole merged region wait. Waiting is idle error on every qubit.',
              'Take a link as accurate as an on-chip gate but 10 times slower. At d = 9 it raises the strip failure 9.2 times.',
              'So *duration* is an error source on its own, even when the gate error is no worse than on-chip.',
              'A hop count or a gate error never sees this.'
            ],
            math: [
              { h: 'Round time at 10 times slower', eq: ['t = 10 CNOT times', 'D = 1000 + 3 × (10 − 1) × 30 = 1810 ns'], why: 'The round nearly doubles, so every qubit idles far longer.' }
            ],
            sketch: [
              L([[60, 40], [60, 280], [600, 280]]),
              K([[130, 250], [250, 230], [380, 160], [560, 60]], { c: 'red' }),
              D(130, 250, { c: 'red' }), D(560, 60, { c: 'red' }),
              H(100, 62, 290, 46, { c: 'yellow' }),
              t(245, 96, '10× slower: 9.2× failure', { size: 26 }),
              t(330, 306, 'link duration t'),
              t(70, 30, 'strip failure', { anchor: 'start' })
            ],
            takeaway: 'A link 10× slower, same accuracy, raises failure 9.2×.',
            widget: {
              type: 'stack',
              unit: 'ns',
              segments: [
                { label: 'on-chip round', v: 1000 },
                { label: 'extra wait, link 10 times slower', v: 810 }
              ],
              note: 'At t = 10 CNOT times the round lasts 1810 ns, so every qubit waits much longer.'
            },
            check: {
              q: 'A link has the same gate error as an on-chip gate but takes 10 times longer. What does the paper find at d = 9?',
              options: [
                'Strip failure rises 9.2 times',
                'Nothing changes, since the error is the same',
                'Strip failure falls',
                'Strip failure rises 1.1 times'
              ],
              answer: 0,
              why: 'Rounds wait for the slowest link, so the long duration adds idle error everywhere.'
            }
          },
          {
            title: 'Effect 4: routes add outcome failure',
            buildsOn: 'Duration affects every column of a merge. This tab shows a separate cost of a long route, on the merge outcome.',
            leadsTo: 'Next tab adds up where program failure comes from, to see how much each effect matters.',
            idea: [
              'A longer route widens the ancilla region. A wider region adds *new checks*.',
              'The merge outcome is read from those new checks. It fails if a chain of measurement errors runs through the rounds on one.',
              'At d = 9, a merge with 10 times as many new checks fails 11 times as often.',
              'So route length costs failure beyond the seam itself.'
            ],
            sketch: [
              B(60, 50, 140, 40),
              D(90, 70), D(130, 70), D(170, 70),
              t(420, 78, 'short route: few new checks'),
              t(300, 170, 'long route: many new checks'),
              B(60, 180, 480, 40),
              D(100, 200), D(170, 200), D(240, 200), D(310, 200), D(380, 200), D(450, 200), D(510, 200),
              H(100, 248, 440, 44, { c: 'yellow' }),
              t(320, 280, 'ten times the checks, 11× the failure')
            ],
            takeaway: 'Longer routes add new checks, each a place for a wrong outcome.',
            widget: null,
            check: {
              q: 'Apart from link error, why does a longer route raise the failure of a merge?',
              options: [
                'The wider ancilla region adds new checks, each a place for a wrong outcome',
                'Longer routes use up the budget B',
                'Each hop adds one extra lane',
                'The factory runs out of magic states'
              ],
              answer: 0,
              why: 'The outcome is read from the new checks, and a measurement error chain on one corrupts it.'
            }
          },
          {
            title: 'Where failure comes from',
            buildsOn: 'You now have four effects. This tab asks which parts of a whole program failure they touch.',
            leadsTo: 'Next tab runs the whole chain of this notebook once, in order, so every transition sits in one place.',
            idea: [
              'For the compiled programs at d = 13, the model puts 48% of failure on idle memory and 31% on wrong merge outcomes.',
              'Another 15% goes to the *bulk* of the routes, and only 6% to the seam excess.',
              'Idle failure grows with run time, and outcome failure with route length. Both depend on how links are used.',
              'So the paper concludes that link cost must be calibrated at the logical level, and composed along routes and schedules.'
            ],
            sketch: [
              B(60, 120, 240, 60),
              B(300, 120, 155, 60, { c: 'red' }),
              B(455, 120, 75, 60, { c: 'blue' }),
              B(530, 120, 30, 60, { c: 'green' }),
              t(180, 230, 'idle memory 48%'),
              t(378, 230, 'wrong merge\noutcomes 31%', { c: 'red' }),
              t(440, 100, 'bulk of routes 15%', { c: 'blue' }),
              t(545, 50, 'seam excess 6%', { c: 'green' }),
              A(545, 56, 545, 118, { c: 'green' })
            ],
            takeaway: 'Seam excess is 6% of failure, but links shape the other parts too.',
            widget: null,
            check: {
              q: 'At d = 13, which part carries the largest share of failure in the paper model?',
              options: ['Idle memory, 48%', 'Wrong merge outcomes, 31%', 'Bulk of the routes, 15%', 'Seam excess, 6%'],
              answer: 0,
              why: 'Idle memory is 48%, then outcomes 31%, bulk 15% and seam excess 6%.'
            }
          },
          {
            title: 'The whole chain, once',
            buildsOn: 'Every earlier tab, in order. This tab runs the chain once so all the transitions are in one place.',
            leadsTo: 'The QSeam method comes next: it measures each link type once, then composes costs along routes and schedules.',
            idea: [
              'Patches hold logical qubits. Merges join them. A merge between modules crosses a *seam* of 2d − 1 links.',
              'Links sit in channels and lanes. Channels come from the base fabric and the budget, and the compiler routes merges over them.',
              'A slow or noisy link, or a long route, makes a merge fail more often. A program fails if any merge or patch fails.',
              'Not covered here: how QSeam measures these costs, its model, and its results.'
            ],
            sketch: [
              ...bx(40, 70, 150, 60, 'patch'), ...bx(245, 70, 150, 60, 'merge'), ...bx(450, 70, 150, 60, 'seam'),
              A(190, 100, 245, 100), A(395, 100, 450, 100),
              K([[525, 135], [525, 170], [115, 170], [115, 205]]),
              A(115, 185, 115, 208),
              ...bx(40, 210, 150, 60, 'channel'), ...bx(245, 210, 150, 60, 'route'), ...bx(450, 210, 150, 60, 'program fails', { c: 'red' }),
              A(190, 240, 245, 240), A(395, 240, 450, 240)
            ],
            takeaway: 'A merge crosses seams and channels along a route. Links add failure.',
            widget: null,
            check: {
              q: 'Which statement ties the whole chain together?',
              options: [
                'A merge between modules crosses seams over channels, and each link adds failure',
                'Patches are joined by cables only',
                'The budget B sets the code distance',
                'Factories correct link errors'
              ],
              answer: 0,
              why: 'Merges between modules use links at seams, in channels, along a route.'
            }
          }
        ]
      }
    ]
  });
})();
