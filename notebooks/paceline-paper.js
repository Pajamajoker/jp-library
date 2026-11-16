/* Notebook: the Paceline paper (reducing execution time on modular bicycle-code quantum computers).
   Sections 1 to 4 are background. Sections 5 to 9 are the paper.
   Note: a module-timeline widget (busy, blocked, unused per module over a run) would suit Sections 5 to 8.
   It does not exist in the shell, so 'stack' and 'steps' are used instead. */
(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;
  const t = (x, y, s, o) => T(x, y, s, Object.assign({ anchor: 'middle', size: 24 }, o || {}));
  const bx = (x, y, w, h, s, o) => [B(x, y, w, h, o), t(x + w / 2, y + h / 2 + 8, s, o)];
  /* bicycle-code drawings: site (i, j) holds X (top left), L (top right), R (bottom left), Z (bottom right) */
  const cell = (ox, oy, cw, ch) => (i, j, k) => [ox + i * cw + cw * (k === 'X' || k === 'R' ? 0.28 : 0.72), oy + j * ch + ch * (k === 'X' || k === 'L' ? 0.3 : 0.74)];
  const gridP = (ox, oy, cw, ch, nc, nr) => {
    const v = [], hz = [];
    for (let i = 1; i < nc; i++) { const x = ox + i * cw; v.push(...(i % 2 ? [[x, oy], [x, oy + nr * ch]] : [[x, oy + nr * ch], [x, oy]])); }
    for (let j = 1; j < nr; j++) { const y = oy + j * ch; hz.push(...(j % 2 ? [[ox, y], [ox + nc * cw, y]] : [[ox + nc * cw, y], [ox, y]])); }
    return [B(ox, oy, nc * cw, nr * ch, { dash: true }), L(v, { dash: true }), L(hz, { dash: true })];
  };
  const arr = (P, from, to, k, c) => {
    const [x1, y1] = P(from[0], from[1], 'X'), [x2, y2] = P(to[0], to[1], k), d = Math.hypot(x2 - x1, y2 - y1);
    return A(x1 + (x2 - x1) * 9 / d, y1 + (y2 - y1) * 9 / d, x2 - (x2 - x1) * 6 / d, y2 - (y2 - y1) * 6 / d, { c });
  };
  const xsq = (P, i, j) => { const [x, y] = P(i, j, 'X'); return B(x - 8, y - 8, 16, 16, { c: 'red' }); };
  const PS = cell(220, 30, 70, 64), PF = cell(40, 20, 70, 44);

  NB.register({
    id: 'paceline-paper',
    title: 'The Paceline paper',
    subtitle: 'Explain why bicycle-code machines spend most of a run waiting, and how Paceline cuts that wait.',
    category: 'Papers',
    cover: {
      palette: 5,
      art: [
        B(2, 34, 20, 32),
        B(27, 34, 20, 32),
        B(52, 34, 20, 32),
        L([[22, 50], [27, 50]], { w: 3 }),
        L([[47, 50], [52, 50]], { w: 3 }),
        L([[72, 50], [78, 50]], { w: 3 }),
        O(90, 50, 12),
        K([[12, 30], [30, 12], [70, 12], [88, 36]], { dash: true })
      ]
    },
    glossary: [
      {
        group: 'Paulis and gates',
        note: 'The gate set that programs are written in.',
        items: [
          { term: 'Pauli product', aka: ['Pauli products', 'Pauli', 'Paulis'], means: 'One of I, X, Y, Z on each qubit, multiplied together. ZZI means Z on qubits 1 and 2, nothing on 3.' },
          { term: 'I', means: 'The identity. Does nothing to its qubit.' },
          { term: 'support', means: 'The qubits where a Pauli product is not I. ZIX has support {1, 3}.' },
          { term: 'clash', aka: ['clashes'], means: 'Two different non-I Paulis on the same qubit, like Z against X.' },
          { term: 'commute', aka: ['commuting', 'commutes', 'commutation'], means: 'Two Pauli products commute when they clash an even number of times. Then their order does not matter.' },
          { term: 'anticommute', means: 'Two Pauli products that clash an odd number of times. Their order matters.' },
          { term: 'Clifford gate', aka: ['Clifford gates', 'Clifford', 'Cliffords'], means: 'A gate that turns every Pauli product into another Pauli product. H, S and CNOT are Clifford.' },
          { term: 'H', means: 'Hadamard gate. Swaps X and Z.' },
          { term: 'S', means: 'Quarter turn about Z, a rotation by π/2. Turns X into Y. Clifford.' },
          { term: 'T gate', aka: ['T gates', 'T'], means: 'A rotation by π/4 about Z. Not Clifford. Clifford plus T can approximate any gate.' },
          { term: 'Clifford+T', means: 'Circuits built from Clifford gates and T gates only.' },
          { term: 'magic state', aka: ['magic states'], means: 'A special prepared state. Used up to apply one T gate.' },
          { term: '|T⟩', means: 'The magic state (|0⟩ + ω|1⟩)/√2, which is T applied to |+⟩.' },
          { term: 'ω', means: 'exp(iπ/4), the phase a T gate puts on |1⟩.' },
          { term: 'ω⁻¹', means: 'exp(−iπ/4) = 1/ω, the phase turned the other way.' },
          { term: 'T†', means: 'The inverse of T: a turn of −π/4 about Z. The odd outcome of a T injection gives it.' },
          { term: 'Z ⊗ Z', aka: ['joint measurement', 'joint parity'], means: 'A joint readout of two qubits: +1 if their digits agree, −1 if not. It never reads either one alone.' },
          { term: 'factory', aka: ['factories', 'magic-state factory'], means: 'A module that distils magic states. The reference machine has one, at the end of the line.' },
          { term: 'distil', aka: ['distils'], means: 'Turn many noisy magic states into fewer, cleaner ones.' },
          { term: 'T injection', aka: ['T injections'], means: 'Measure a magic state jointly with a qubit. Applies T, up to a Clifford correction set by the outcome.' },
          { term: 'Clifford correction', means: 'A Clifford gate that a T injection outcome may call for. It changes later operations.' },
          { term: 'T stream', means: 'The sequence of T injections one rotation needs, run one after another on the host.' }
        ]
      },
      {
        group: 'Programs',
        note: 'How a program looks after it is lowered.',
        items: [
          { term: 'Pauli rotation', aka: ['rotation', 'rotations'], means: 'exp(iφP/2): turn by angle φ about the Pauli product P.' },
          { term: 'φ', means: 'The rotation angle. φ = π/4 is a T gate, φ = π/2 is an S gate.' },
          { term: 'Pauli-based computation', means: 'A program written as a list of Pauli rotations and measurements, with every Clifford pushed to the end.' },
          { term: 'operation', aka: ['operations'], hover: false, means: 'One rotation or measurement of the program, called o₁, o₂, o₃ and so on.' },
          { term: 'precedence graph', means: 'Operations as dots. An arrow oⱼ → oₖ when j < k and their Paulis do not commute.' },
          { term: 'longest path', aka: ['critical path'], means: 'The longest chain of arrows in the precedence graph. No order can finish faster than it.' },
          { term: 'T-light', means: 'Programs with 1 T gate per rotation, such as adders and multipliers.' },
          { term: 'T-heavy', means: 'Programs with 24 to 94 T gates per rotation, such as Hamiltonian simulation and QFT.' },
          { term: 'lowering', aka: ['lowers', 'lowered'], means: 'Turning a program into the machine’s four instructions.' },
          { term: 'QFT', means: 'Quantum Fourier transform, a standard quantum subroutine.' },
          { term: 'TFIM', means: 'Transverse-field Ising model. Trotter circuits simulating it are the architecture’s target workload.' },
          { term: 'Trotter circuit', aka: ['Trotter circuits'], means: 'A simulation circuit that applies many small rotations in repeated steps.' }
        ]
      },
      {
        group: 'The bicycle machine',
        items: [
          { term: 'bivariate bicycle code', aka: ['bicycle code', 'bicycle codes', 'bicycle-code'], means: 'Codes whose checks are built from two cyclic shift patterns, A and B, on a 2D torus. Many logical qubits per block.' },
          { term: 'gross code', means: 'The bicycle code [[144, 12, 12]]: 144 qubits, 12 logical qubits, distance 12.' },
          { term: 'block', aka: ['code block'], means: 'One copy of the gross code, holding 12 logical qubits.' },
          { term: 'LPU', aka: ['logical processing unit'], means: 'The unit beside each block that performs its logical measurements.' },
          { term: 'code module', aka: ['module', 'modules'], hover: false, means: 'One gross-code block with its LPU. Modules sit on a line.' },
          { term: 'pivot', means: 'Logical qubit 1 of each module. It is the helper for every operation there, so 11 slots remain for data.' },
          { term: 'slot', aka: ['slots'], means: 'One of the 11 data places in a module. Which slot a qubit sits in sets its synthesis cost.' },
          { term: 'coupler', aka: ['couplers'], means: 'Hardware joining the LPUs of two neighbouring modules.' },
          { term: 'host', means: 'The code module the factory is attached to. Every T injection runs there.' },
          { term: 'reference machine', means: 'M code modules on a line and one factory at the end.' },
          { term: 'in-module measurement', aka: ['in-module measurements'], means: 'Measure a Pauli on one module through its LPU. 120 timesteps.' },
          { term: 'shift automorphism', means: 'Permutes a module’s logical qubits so its LPU can reach them.' },
          { term: 'inter-module measurement', aka: ['inter-module measurements'], means: 'Measure a Pauli product across two neighbouring modules. 120 timesteps.' },
          { term: 'timestep', aka: ['timesteps'], means: 'The unit of time: one physical gate.' },
          { term: 'automorphism', means: 'A symmetry of a code: shuffle its physical qubits and the code looks the same.' },
          { term: 'torus', means: 'A grid whose edges wrap round, like the surface of a doughnut.' },
          { term: 'cyclic shift', aka: ['cyclic shifts'], means: 'Move every qubit one site along x or y, wrapping round at the edge.' },
          { term: 'Pauli measurement', aka: ['measuring a Pauli product'], means: 'Asks one ±1 question about a Pauli product, and nothing more.' },
          { term: 'native Clifford rotation', aka: ['native Clifford rotations'], means: 'A Clifford step the LPU can do directly. Each costs one in-module measurement.' },
          { term: 'P ⊗ Z', means: 'P on the data and Z on a magic state, measured jointly. Turns the data by π/4 about P.' },
          { term: 'native', means: 'A Pauli the LPU can measure directly, with no synthesis.' }
        ]
      },
      {
        group: 'Running an operation',
        items: [
          { term: 'Pₘ', means: 'The piece of an operation’s Pauli on module m. Pₘ = I means module m holds none of its qubits.' },
          { term: 'chain', aka: ['chains'], means: 'The run of neighbouring modules an operation uses, from the host to the farthest module it needs.' },
          { term: 'link', aka: ['links'], means: 'One neighbouring pair in a chain. Costs one inter-module measurement.' },
          { term: 'GHZ state', aka: ['GHZ'], means: 'An entangled state of the pivots along a chain. It lets one joint measurement span modules.' },
          { term: 'synthesis', aka: ['synthesises', 'synthesis cost'], means: 'Measuring a non-native Pauli by wrapping a native one in Clifford rotations, then undoing them.' },
          { term: 'synthesis level', aka: ['level'], means: 'The number of in-module measurements synthesis uses for one Pauli. 18.5 on average on the gross code.' },
          { term: 'task', aka: ['tasks'], hover: false, means: 'One operation as the model times it: lead-ins, joint measurements, tails, T stream.' },
          { term: 'lead-in', aka: ['lead-ins'], means: 'The synthesis before the joint measurement on one module.' },
          { term: 'tail', aka: ['tails'], means: 'The steps that undo synthesis after the joint measurement.' },
          { term: 'outcome wait', aka: ['outcome waits'], means: 'An operation waits for the last T injection outcome of the operation before it, if they do not commute.' },
          { term: 'blocked', means: 'A task holds the module, but it does no work while the task waits on other modules.' },
          { term: 'unused', means: 'No task holds the module.' },
          { term: 'busy', hover: false, means: 'A module doing work for a task.' },
          { term: 'free', hover: false, means: 'A module no task holds.' },
          { term: 'clock', hover: false, means: 'Each module’s clock: the time it becomes free.' },
          { term: 'cost model', means: 'The architecture designers’ timing rule. It leaves the outcome wait out.' },
          { term: 'reference compiler', means: 'The architecture’s own compiler. Program order and reference placement.' },
          { term: 'reference placement', means: 'Qubits put on modules in index order, 11 per module.' },
          { term: 'baseline', means: 'The reference compiler on the reference machine, timed with outcome waits added.' },
          { term: 'program order', means: 'Running operations exactly in the order they are written.' }
        ]
      },
      {
        group: 'Paceline',
        items: [
          { term: 'Paceline', means: 'The paper’s compiler: commutation-aware ordering, level-aware seating, time-balanced placement.' },
          { term: 'placement', means: 'Which module each logical qubit goes to.' },
          { term: 'seating', means: 'Which slot each qubit takes inside its module.' },
          { term: 'schedule', means: 'A start time for every operation.' },
          { term: 'run time', means: 'Time from the first instruction to the last. Also called makespan.' },
          { term: 'floor', means: 'The larger of two lower bounds: host load per factory, and the longest chain of non-commuting operations.' },
          { term: 'lower bound', means: 'A time no schedule can beat.' },
          { term: 'graph', means: 'Dots joined by edges. Each edge joins exactly two dots.' },
          { term: 'min-cut placement', means: 'A chip-design method: split a circuit into regions with few wires crossing.' },
          { term: 'depth', means: 'How far from the start an operation sits in the precedence graph.' },
          { term: 'local search', means: 'Keep making the single change that helps most, until no change helps.' },
          { term: 'Sethi et al.’s rule', aka: ['Sethi’s order', 'Sethi order'], means: 'Order modules so the least-used one sits farthest from the factory.' },
          { term: 'in flight', means: 'Operations running at the same moment.' },
          { term: 'list scheduling', means: 'Keep a list of ready operations. Each time, start the one that can begin earliest.' },
          { term: 'ready', means: 'An operation whose predecessors have all been issued.' },
          { term: 'hypergraph', means: 'A graph where one edge, a hyperedge, can join many vertices at once.' },
          { term: 'hyperedge', aka: ['hyperedges'], means: 'An edge joining a whole set of vertices. Here, one operation joining its qubits.' },
          { term: 'λ', means: 'λⱼ: the number of modules operation j touches.' },
          { term: 'w', means: 'wⱼ: the weight of operation j in the placement cost.' },
          { term: 'count weights', means: 'Every operation weighs 1.' },
          { term: 'criticality weights', means: 'Operations with many T gates, or on the longest path, weigh more.' },
          { term: 'load', means: 'The number of operations that touch a module.' },
          { term: 'whole-run balance', means: 'Every module’s load within 10% of its share, over the whole run.' },
          { term: 'windowed balance', means: 'Cut the program by depth into four windows and balance each one.' },
          { term: 'recursive bisection', means: 'Split the line of modules in two, divide the qubits, repeat on each half.' },
          { term: 'candidate', aka: ['candidates'], means: 'One of the two placements Paceline builds. It keeps the faster.' },
          { term: 'cell', aka: ['cells'], means: 'One program on one machine layout.' },
          { term: 'held out', aka: ['held-out'], means: 'Programs not used while designing Paceline, kept to test it fairly.' },
          { term: 'headroom', means: 'A cell where the run is at least 1.25× above the floor, so there is time to win back.' },
          { term: 'geometric mean', aka: ['geometric means'], means: 'Multiply n ratios and take the n-th root. The fair average for speed-ups.' },
          { term: 'speed-up', aka: ['speed-ups'], means: 'Baseline run time divided by the new run time. 2× means twice as fast.' }
        ]
      }
    ],
    sections: [
      /* ============================ SECTION 1 (background) ============================ */
      {
        title: 'Background: Paulis and the T gate',
        intro: 'Programs on this machine are written with Pauli products, and the one hard gate is T. This section builds both, ending with how T is applied using a magic state.',
        bridge: 'You now hold Pauli products, the commute rule, Clifford gates, and a T gate applied by a T injection whose outcome makes later work wait. Section 2 writes a whole program in these pieces.',
        tabs: [
          {
            title: 'Pauli products',
            buildsOn: 'QEC basics gave the four Paulis I, X, Y, Z on one qubit. This tab writes one Pauli on each of several qubits at once.',
            leadsTo: 'Next tab asks when two Pauli products can be applied in either order, the commute rule.',
            idea: [
              'A *Pauli product* puts one of I, X, Y, Z on each qubit. Write one letter per qubit: ZZI means Z on qubits 1 and 2.',
              '*I* does nothing. So ZZI touches only qubits 1 and 2.',
              'The qubits where a product is not I are its *support*. ZIX has support {1, 3}.'
            ],
            sketch: [
              t(320, 50, 'Z Z I', { size: 40 }),
              t(200, 110, 'q1'), t(320, 110, 'q2'), t(440, 110, 'q3'),
              A(200, 120, 200, 170), A(320, 120, 320, 170),
              t(200, 200, 'Z', { c: 'blue' }), t(320, 200, 'Z', { c: 'blue' }), t(440, 200, 'nothing', { c: 'ink' }),
              H(150, 240, 340, 44, { c: 'yellow' }),
              t(320, 272, 'support = {1, 2}')
            ],
            takeaway: 'One letter per qubit. The support is where it is not I.',
            widget: null,
            check: {
              q: 'What is the support of XIZY?',
              options: ['{1, 3, 4}', '{2}', '{1, 2, 3, 4}', '{1, 4}'],
              answer: 0,
              why: 'Qubit 2 has I. Every other qubit has a non-I Pauli.'
            }
          },
          {
            title: 'When two Paulis commute',
            buildsOn: 'Pauli products put one letter on each qubit. This tab compares two products letter by letter.',
            leadsTo: 'Next tab meets gates that turn one Pauli product into another, the Clifford gates.',
            idea: [
              'A *clash* is a qubit where the two products have different non-I letters, like Z against X.',
              'Each clash flips the sign once. Even clashes: the products *commute*, so order does not matter.',
              'Odd clashes: they *anticommute*, so order matters. ZZ and XX clash twice and commute. ZI and XI clash once.'
            ],
            sketch: [
              t(150, 50, 'ZZ vs XX', { c: 'green', size: 28 }),
              t(110, 110, 'Z'), t(190, 110, 'Z'),
              t(110, 160, 'X'), t(190, 160, 'X'),
              O(110, 130, 28, { c: 'red' }), O(190, 130, 28, { c: 'red' }),
              t(150, 220, '2 clashes: commute', { c: 'green' }),
              t(470, 50, 'ZI vs XI', { c: 'red', size: 28 }),
              t(430, 110, 'Z'), t(510, 110, 'I'),
              t(430, 160, 'X'), t(510, 160, 'I'),
              O(430, 130, 28, { c: 'red' }),
              t(470, 220, '1 clash: order matters', { c: 'red' })
            ],
            takeaway: 'Even clashes: commute. Odd clashes: order matters.',
            widget: null,
            check: {
              q: 'Do ZZI and IXX commute?',
              options: ['No, they clash once, on qubit 2', 'Yes, they clash twice', 'Yes, they share no support', 'No, they clash three times'],
              answer: 0,
              why: 'Qubit 1 has Z against I, qubit 3 has I against X. Only qubit 2 is a clash.'
            }
          },
          {
            title: 'Clifford gates and the T gate',
            buildsOn: 'The commute tab compared Pauli products letter by letter. This tab adds the gates that act on them.',
            leadsTo: 'Next tab shows how a protected qubit gets a T gate: by storing its turn ahead of time in a magic state.',
            idea: [
              'A *Clifford gate* turns every Pauli product into another Pauli product. *H* swaps X and Z. *S*, a quarter turn about Z, turns X into Y.',
              'The *T gate* is half of S: a turn of π/4 about Z. It turns X into a blend of X and Y, so T is not Clifford.',
              'Clifford gates alone can be simulated fast on an ordinary computer. Adding T makes the set universal: *Clifford+T*.'
            ],
            sketch: [
              ...bx(40, 60, 80, 56, 'X', { c: 'red' }), A(130, 88, 230, 88), t(180, 70, 'H'), ...bx(240, 60, 80, 56, 'Z', { c: 'blue' }),
              ...bx(40, 150, 80, 56, 'X', { c: 'red' }), A(130, 178, 230, 178), t(180, 160, 'S'), ...bx(240, 150, 80, 56, 'Y'),
              t(180, 250, 'Clifford: Pauli in, Pauli out', { c: 'green', size: 22 }),
              O(500, 150, 90),
              L([[500, 150], [590, 150]], { c: 'red' }), L([[500, 150], [564, 168]], { c: 'blue' }),
              t(500, 40, 'T: π/4 about Z', { c: 'blue', size: 22 }),
              t(500, 280, 'X becomes a blend', { c: 'blue', size: 22 })
            ],
            takeaway: 'Clifford gates keep Paulis as Paulis. T does not, and makes the set universal.',
            widget: { type: 'qubit', sliders: ['phi'], gates: ['H', 'S'], bloch: true, readouts: true, start: { theta: 90, phi: 0 } },
            check: {
              q: 'Why is T not a Clifford gate?',
              options: ['It turns X into a blend of X and Y, not a Pauli', 'It acts on two qubits', 'It is slower than CNOT', 'It cannot be undone'],
              answer: 0,
              why: 'A Clifford must send every Pauli to a Pauli. T sends X halfway between X and Y.'
            }
          },
          {
            title: 'Magic states and factories',
            buildsOn: 'The Clifford and T tab showed T is a π/4 turn about Z and is not Clifford. This tab asks how a protected qubit gets that turn.',
            leadsTo: 'Next tab uses one magic state to turn a data qubit by T, one line at a time, without ever reading the data.',
            idea: [
              'Codes give protected qubits a safe recipe for Clifford gates. No code has a safe direct recipe for every gate, and T is the hard one.',
              'The way round it: prepare T’s turn ahead of time on a spare qubit. That qubit is a *magic state*, |T⟩ = (|0⟩ + ω|1⟩)/√2.',
              '*ω* = exp(iπ/4), the π/4 phase of T. So |T⟩ is just T applied to |+⟩: a point on the equator, 45° round from |+⟩.',
              'A *factory* module *distils* magic states: it takes many noisy ones and returns fewer, cleaner ones.'
            ],
            sketch: [
              ...bx(30, 100, 150, 80, 'factory', { c: 'ink' }),
              D(60, 60, { c: 'red' }), D(95, 50, { c: 'red' }), D(130, 62, { c: 'red' }), D(160, 48, { c: 'red' }),
              t(105, 30, 'many noisy in', { c: 'red', size: 20 }),
              A(185, 140, 255, 140, { c: 'green' }),
              O(400, 150, 100),
              E(400, 150, 100, 28, { dash: true }),
              L([[400, 150], [471, 171]], { c: 'ink' }),
              D(471, 171, { c: 'ink' }),
              t(400, 290, '|T⟩ = T|+⟩: 45° round the equator', { c: 'ink', size: 22 }),
              t(230, 120, 'clean |T⟩', { c: 'green', size: 20 })
            ],
            takeaway: 'A magic state |T⟩ is T’s turn, stored ahead of time on a spare qubit.',
            widget: { type: 'qubit', sliders: ['phi'], gates: ['H', 'S'], bloch: true, readouts: true, start: { theta: 90, phi: 45 } },
            check: {
              q: 'Which state is the magic state |T⟩?',
              options: ['(|0⟩ + ω|1⟩)/√2 with ω = exp(iπ/4)', '(|0⟩ + |1⟩)/√2', '|1⟩', '(|0⟩ + i|1⟩)/√2'],
              answer: 0,
              why: '|T⟩ = T|+⟩: T puts the phase ω = exp(iπ/4) on the |1⟩ part of |+⟩. The i version is S|+⟩.'
            }
          },
          {
            title: 'T injection, step by step',
            buildsOn: 'The magic state |T⟩ carries T’s phase ω on its |1⟩ part. This tab moves that phase onto a data qubit.',
            leadsTo: 'Next tab follows the other outcome, which turns the data the wrong way, and the fix that repairs it.',
            idea: [
              'Wrong picture: to apply T we must look at the data qubit. Reading it would collapse α and β. A T injection never does that.',
              'It measures one joint property: *Z ⊗ Z* on the data qubit and |T⟩. That asks only: an even or odd number of 1s between them?',
              'Both answers come up 50/50 for every α and β, so the readout learns nothing about the data.',
              'Even (+1): only the patterns 00 and 11 survive, and the data ends up as α|0⟩ + ωβ|1⟩. That is T applied.'
            ],
            keys: [
              { tone: 'main', h: 'The data qubit is never read', t: 'The only questions asked are *joint*: the parity of data and magic state, then the magic state alone. Neither answer depends on α or β, so nothing about the protected data is learned or collapsed.' }
            ],
            math: [
              { h: 'Multiply out', eq: ['(α|0⟩ + β|1⟩)(|0⟩ + ω|1⟩)/√2', '= (α|00⟩ + αω|01⟩ + β|10⟩ + βω|11⟩)/√2'], why: 'Left digit is the data qubit, right digit the magic state.' },
              { h: 'Chance of even parity', eq: ['P(+1) = (|α|² + |βω|²) / 2', '      = (|α|² + |β|²) / 2 = 1/2'], why: '|ω| = 1, and |α|² + |β|² = 1. The answer does not depend on α or β.' },
              { h: 'Chance of odd parity', eq: ['P(−1) = (|αω|² + |β|²) / 2 = 1/2'] },
              { h: 'Even: what is left', eq: ['α|00⟩ + ωβ|11⟩'], why: 'Divide by √(1/2) to renormalise. The two qubits now agree.' },
              { h: 'Read the magic qubit in X', eq: ['|0⟩ = (|+⟩ + |−⟩)/√2', '|1⟩ = (|+⟩ − |−⟩)/√2'] },
              { h: 'Result', eq: ['reads +:  α|0⟩ + ωβ|1⟩ = T|ψ⟩', 'reads −:  α|0⟩ − ωβ|1⟩ = Z T|ψ⟩'], why: 'The − case only needs a Z, a plain Pauli, to finish.' }
            ],
            sketch: [
              ...bx(30, 70, 200, 60, 'α|0⟩ + β|1⟩', { c: 'blue' }),
              t(130, 50, 'data qubit', { c: 'blue', size: 20 }),
              ...bx(30, 190, 200, 60, '|T⟩', { c: 'ink' }),
              t(130, 280, 'magic state', { c: 'ink', size: 20 }),
              L([[240, 100], [270, 100], [270, 220], [240, 220]]),
              ...bx(290, 130, 120, 60, 'Z ⊗ Z'),
              t(350, 115, 'parity only', { size: 20 }),
              A(415, 160, 465, 160),
              H(470, 60, 150, 40, { c: 'yellow' }),
              t(545, 88, '50/50 coin'),
              t(545, 170, 'even:', { c: 'green', size: 22 }),
              t(545, 200, 'T applied', { c: 'green', size: 22 }),
              t(545, 260, 'odd: next tab', { c: 'red', size: 22 })
            ],
            takeaway: 'A T injection asks only a joint parity. It never reads the data qubit.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'Two qubits', h: 220, parts: [
                    ...bx(60, 50, 220, 60, 'α|0⟩ + β|1⟩', { c: 'blue' }), t(170, 140, 'data qubit ψ', { c: 'blue', size: 20 }),
                    ...bx(360, 50, 220, 60, '|0⟩ + ω|1⟩', { c: 'ink' }), t(470, 140, 'magic state, ÷ √2', { c: 'ink', size: 20 }),
                    t(320, 195, 'ω = exp(iπ/4), the phase that T adds', { size: 20 })],
                  say: 'The data qubit holds unknown α and β. The magic state holds the phase ω on its 1 part. Goal: move ω onto the data’s 1 part.' },
                { t: 'Four patterns', h: 220, parts: [
                    ...bx(30, 60, 130, 60, 'α · 00'), ...bx(180, 60, 130, 60, 'αω · 01'),
                    ...bx(330, 60, 130, 60, 'β · 10'), ...bx(480, 60, 130, 60, 'βω · 11'),
                    t(320, 40, 'data digit first, magic digit second', { size: 20 }),
                    t(320, 175, 'every pair of digits, with its weight', { size: 20 })],
                  eq: ['(α|0⟩ + β|1⟩)(|0⟩ + ω|1⟩)/√2', '= (α|00⟩ + αω|01⟩ + β|10⟩ + βω|11⟩)/√2'],
                  say: 'Multiply out, like the coin table in Quantum basics. Each of the four patterns gets one weight.' },
                { t: 'Ask only the parity', h: 220, parts: [
                    H(30, 60, 130, 60, { c: 'mint' }), H(480, 60, 130, 60, { c: 'mint' }),
                    ...bx(30, 60, 130, 60, 'α · 00', { c: 'green' }), ...bx(180, 60, 130, 60, 'αω · 01', { c: 'red' }),
                    ...bx(330, 60, 130, 60, 'β · 10', { c: 'red' }), ...bx(480, 60, 130, 60, 'βω · 11', { c: 'green' }),
                    t(320, 165, 'Z ⊗ Z: even (+1) or odd (−1)?', { size: 22 }),
                    t(170, 205, 'even: 00, 11', { c: 'green', size: 20 }), t(470, 205, 'odd: 01, 10', { c: 'red', size: 20 })],
                  say: 'Z ⊗ Z gives +1 if the two digits agree and −1 if they differ. It never asks what the data digit is on its own.' },
                { t: 'A fair coin', h: 220, parts: [
                    O(320, 90, 50), t(320, 100, '50/50', { size: 26 }),
                    t(320, 175, 'same odds for every α and β', { c: 'green', size: 22 })],
                  eq: ['P(even) = (|α|² + |β|²)/2 = 1/2', 'P(odd)  = (|α|² + |β|²)/2 = 1/2'],
                  say: 'Since |ω| = 1, both answers have chance one half whatever α and β are. A readout that gives the same odds for every state learns nothing about that state.' },
                { t: 'Even: 00 and 11 stay', h: 220, parts: [
                    ...bx(120, 50, 170, 60, 'α · 00', { c: 'green' }), ...bx(350, 50, 170, 60, 'ωβ · 11', { c: 'green' }),
                    t(320, 150, 'the two qubits now agree', { size: 22 }),
                    t(320, 190, 'ω sits on the β part', { c: 'ink', size: 22 })],
                  eq: ['α|00⟩ + ωβ|11⟩'],
                  say: 'The odd patterns are gone. α and β are kept exactly, and the ω that rode on the magic qubit’s 1 is now tied to the data’s 1.' },
                { t: 'Release the magic qubit', h: 220, parts: [
                    ...bx(60, 50, 200, 60, 'magic in X'), A(270, 80, 340, 80),
                    ...bx(350, 50, 240, 60, 'α|0⟩ + ωβ|1⟩', { c: 'green' }),
                    H(200, 150, 240, 40, { c: 'yellow' }), t(320, 178, '= T (α|0⟩ + β|1⟩)', { size: 24 })],
                  eq: ['X readout +:  α|0⟩ + ωβ|1⟩ = T|ψ⟩', 'X readout −:  α|0⟩ − ωβ|1⟩, fix with one Z'],
                  say: 'Measuring the magic qubit in X unglues it without revealing α or β, again a 50/50 answer. The data qubit is left turned by T. A − answer only needs a Z.' }
              ]
            },
            deeper: {
              l2: [
                { title: 'T injection as a circuit', wires: ['q=ψ', 'm=|T⟩'],
                  cols: ['CX q m', 'M m', 'FIX S q 1 m'],
                  notes: ['A CNOT from the data q to the magic qubit m, then a Z readout of m, asks exactly the Z ⊗ Z question: m reads 0 if the digits agreed, 1 if not.',
                    'Readout 0: the data is T|ψ⟩. Readout 1: the data is T†|ψ⟩, the turn the wrong way, and an S gate fixes it.',
                    'This is the textbook form. The frames above use the joint-measurement form, which ends in the same state.'] }
              ],
              l3: [
                { title: 'On the bicycle machine', wires: ['pivot', 'magic'],
                  cols: ['BOX pivot magic joint Z ⊗ Z / 120 timesteps', 'H magic', 'M magic', 'FIX S pivot odd pivot'],
                  notes: ['Here the magic state comes from the factory and is measured jointly with the host’s *pivot*, not with a data qubit.',
                    'H then a Z readout is the X readout of the frames. The S fix depends on the joint parity, not on this last readout.',
                    'Earlier steps move the rotation onto the pivot, so the data qubits only ever meet joint measurements. Section 4 shows how.',
                    'The paper counts 120 timesteps for the measurement, and the factory stays busy 109 timesteps more.'] }
              ]
            },
            check: {
              q: 'Why does the Z ⊗ Z readout not disturb α and β?',
              options: [
                'Both answers have chance 1/2 for every α and β, so it learns nothing about them',
                'It is done on a copy of the data qubit',
                'It is measured very gently',
                'It only reads the data qubit when the factory is idle'
              ],
              answer: 0,
              why: 'A readout only disturbs what it can tell apart. This one gives the same odds for every data state.'
            }
          },
          {
            title: 'The fix: a T that went backwards',
            buildsOn: 'The step-by-step tab followed the even outcome to T|ψ⟩. This tab follows the odd outcome, which happens just as often.',
            leadsTo: 'Next section writes a whole program as Pauli rotations, where this outcome-dependent fix becomes a wait between operations.',
            idea: [
              'Odd (−1): the patterns 01 and 10 survive. After the magic qubit is released, the data is α|0⟩ + ω⁻¹β|1⟩.',
              '*ω⁻¹* = exp(−iπ/4) is ω turned the other way. So the data got *T†*, the inverse of T: a turn of −π/4.',
              'The fix is one S gate. S = T · T, so S · T† = T. S is Clifford, the easy kind. This is the *Clifford correction*.',
              'Which fix is needed is known only after the readout. So whatever comes next must wait for that outcome.'
            ],
            sketch: [
              O(170, 160, 100),
              E(170, 160, 100, 28, { dash: true }),
              L([[170, 160], [270, 160]], { c: 'blue' }),
              L([[170, 160], [241, 181]], { c: 'green' }),
              L([[170, 160], [241, 139]], { c: 'red' }),
              t(170, 40, 'seen from above the equator', { size: 20 }),
              t(300, 210, 'T: +45°', { c: 'green', size: 22 }),
              t(300, 125, 'T†: −45°', { c: 'red', size: 22 }),
              ...bx(400, 120, 200, 60, 'S: +90°', { c: 'green' }),
              t(500, 220, '−45° + 90° = +45°', { c: 'green', size: 22 }),
              t(500, 90, 'odd outcome', { c: 'red', size: 22 })
            ],
            takeaway: 'Odd outcome gives T†. One S gate turns it into T.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'Odd: 01 and 10 stay', h: 220, parts: [
                    ...bx(120, 50, 170, 60, 'ωα · 01', { c: 'red' }), ...bx(350, 50, 170, 60, 'β · 10', { c: 'red' }),
                    t(320, 150, 'the two qubits now disagree', { size: 22 }),
                    t(320, 190, 'ω sits on the α part this time', { c: 'ink', size: 22 })],
                  eq: ['ωα|01⟩ + β|10⟩'],
                  say: 'Same chance as the even case, one half. Now ω is attached to the data’s 0 part instead of its 1 part.' },
                { t: 'Release the magic qubit', h: 220, parts: [
                    ...bx(60, 50, 200, 60, 'magic in X'), A(270, 80, 340, 80),
                    ...bx(350, 50, 240, 60, 'ωα|0⟩ + β|1⟩', { c: 'red' }),
                    t(320, 170, 'up to a Z, as in the even case', { size: 20 })],
                  eq: ['ωα|0⟩ + β|1⟩'],
                  say: 'Reading the magic qubit in X unglues it, just as before. The data keeps α and β, but ω is on the wrong part.' },
                { t: 'That is T†', h: 220, parts: [
                    t(320, 50, 'ωα|0⟩ + β|1⟩', { size: 26 }), A(320, 66, 320, 96),
                    t(320, 126, '= ω (α|0⟩ + (β/ω)|1⟩)', { size: 26 }),
                    H(190, 150, 260, 44, { c: 'pink' }), t(320, 180, '= T† (α|0⟩ + β|1⟩)', { size: 24 })],
                  eq: ['ω⁻¹ = exp(−iπ/4) = 1/ω', 'an overall factor ω changes nothing you can measure'],
                  say: 'Pull ω out in front. An overall factor has no effect on any readout. What remains has ω⁻¹ on the 1 part: the T turn backwards.' },
                { t: 'Fix with S', h: 220, parts: [
                    ...bx(40, 60, 160, 60, 'T†: −45°', { c: 'red' }), t(230, 98, '+', { size: 30 }),
                    ...bx(260, 60, 160, 60, 'S: +90°', { c: 'green' }), t(450, 98, '=', { size: 30 }),
                    ...bx(480, 60, 120, 60, 'T', { c: 'green' }),
                    t(320, 175, 'S = T · T, a Clifford gate', { size: 22 })],
                  eq: ['S · T† = T · T · T† = T'],
                  say: 'S is two T turns. One cancels the T†, one is left. S is Clifford, so it has a safe protected recipe. This is the Clifford correction.' },
                { t: 'Why later work waits', h: 220, parts: [
                    ...bx(40, 70, 170, 60, 'T injection', { c: 'ink' }), D(210, 100, { c: 'red' }),
                    A(215, 100, 300, 100, { c: 'red' }),
                    ...bx(310, 70, 290, 60, 'next step: with or without S?'),
                    t(320, 180, 'known only after the readout', { c: 'red', size: 22 })],
                  say: 'Half the time the fix is needed, half the time not, and nobody knows which until the readout ends. Any step that depends on it must wait. Section 4 calls this the outcome wait.' }
              ]
            },
            check: {
              q: 'The parity readout is odd. Which gate turns the data from T†|ψ⟩ into T|ψ⟩?',
              options: ['S', 'T†', 'X', 'H'],
              answer: 0,
              why: 'S = T · T, so S · T† = T. A second T† would turn further the wrong way.'
            }
          }
        ]
      },

      /* ============================ SECTION 2 (background) ============================ */
      {
        title: 'Background: programs as Pauli rotations',
        intro: 'This machine does not run a circuit gate by gate. It runs a list of rotations about Pauli products. This section builds that list and the rule for reordering it.',
        bridge: 'You now hold a program as a list of Pauli rotations, the precedence graph that limits reordering, and T-light against T-heavy. Section 3 builds the machine that runs the list.',
        tabs: [
          {
            title: 'A Pauli rotation',
            buildsOn: 'Section 1 gave Pauli products and the T gate as a turn about Z. This tab turns about any Pauli product instead.',
            leadsTo: 'Next tab moves every Clifford gate out of the way, so a program becomes a list of these rotations.',
            idea: [
              'A *Pauli rotation* exp(iφP/2) turns by angle *φ* about the Pauli product P.',
              'T is the rotation about Z with φ = π/4. S is φ = π/2.',
              'P can span many qubits: a rotation about ZZX acts on three qubits at once.'
            ],
            sketch: [
              t(320, 60, 'exp(iφP/2)', { size: 40 }),
              A(260, 80, 160, 150), A(380, 80, 480, 150),
              t(140, 180, 'φ: angle', { c: 'red' }),
              t(500, 180, 'P: Pauli product', { c: 'blue' }),
              ...bx(60, 220, 150, 50, 'T: Z, π/4'),
              ...bx(240, 220, 150, 50, 'S: Z, π/2'),
              ...bx(420, 220, 170, 50, 'ZZX: 3 qubits')
            ],
            takeaway: 'A rotation = an angle φ about a Pauli product P.',
            widget: null,
            check: {
              q: 'Which rotation is a T gate on qubit 1?',
              options: ['Angle π/4 about ZI…', 'Angle π/2 about ZI…', 'Angle π/4 about XI…', 'Angle π about ZI…'],
              answer: 0,
              why: 'T is a π/4 turn about Z. π/2 would be S.'
            }
          },
          {
            title: 'Push the Cliffords to the end',
            buildsOn: 'Clifford gates turn Paulis into Paulis, from Section 1. A rotation is an angle about a Pauli. This tab combines the two facts.',
            leadsTo: 'Next tab asks when two rotations in the list may trade places.',
            idea: [
              'Move a Clifford gate past a rotation. The rotation keeps its angle, but its Pauli changes to another Pauli.',
              'Do this for every Clifford. The program becomes a list of Pauli rotations, then measurements.',
              'This form is *Pauli-based computation*. The architecture’s compiler starts from it.'
            ],
            sketch: [
              ...bx(40, 60, 80, 60, 'H'),
              ...bx(140, 60, 150, 60, 'rot Z', { c: 'blue' }),
              t(400, 98, '='),
              ...bx(450, 60, 150, 60, 'rot X', { c: 'red' }),
              ...bx(450, 140, 80, 60, 'H'),
              A(490, 125, 490, 138),
              t(320, 250, 'list of rotations, Cliffords at the end', { c: 'green' }),
              t(165, 170, 'time runs left to right')
            ],
            takeaway: 'Pushing Cliffords to the end leaves a list of Pauli rotations.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Start: H on the qubit, then a rotation about Z.', show: 'H, then rot(φ, Z)' },
                { say: 'H turns Z into X, so the rotation after H equals H after a rotation about X.', show: 'rot(φ, Z) · H = H · rot(φ, X)' },
                { say: 'So the H moves to the end and the rotation now uses X.', show: 'rot(φ, X), then H' },
                { say: 'Repeat for every Clifford. All of them pile up at the end.', show: 'rot, rot, rot, …, measurements' }
              ]
            },
            check: {
              q: 'A Clifford is pushed past a rotation. What changes about the rotation?',
              options: ['Its Pauli, which becomes another Pauli', 'Its angle', 'Nothing at all', 'It becomes a Clifford gate'],
              answer: 0,
              why: 'Cliffords send Paulis to Paulis, so only the Pauli changes. The angle stays.'
            }
          },
          {
            title: 'The precedence graph',
            buildsOn: 'A program is now a list of Pauli rotations. Section 1 said Paulis that commute can be applied in either order.',
            leadsTo: 'Next tab asks how many T gates each rotation needs, which sets how long each one lasts.',
            idea: [
              'Two rotations whose Paulis commute may trade places. Ones that do not commute must keep their written order.',
              'Draw each operation as a dot. Add an arrow oⱼ → oₖ when j < k and their Paulis do not commute: the *precedence graph*.',
              'Dots with no path between them may run at the same time, like two loads of laundry in two machines.',
              'The *longest path* must run one step after another, so no schedule can be shorter than it.'
            ],
            sketch: [
              O(80, 160, 22), O(220, 90, 22), O(220, 230, 22), O(370, 90, 22), O(520, 160, 22),
              A(100, 150, 198, 98), A(100, 170, 198, 222), A(242, 90, 348, 90), A(390, 100, 498, 150),
              A(242, 228, 498, 168, { dash: true }),
              t(80, 210, 'o₁'), t(220, 60, 'o₂'), t(220, 285, 'o₃'), t(370, 60, 'o₄'), t(520, 210, 'o₅'),
              H(330, 268, 290, 32, { c: 'yellow' }),
              t(475, 292, 'longest: o₁ o₂ o₄ o₅', { size: 22 })
            ],
            takeaway: 'Arrows join non-commuting pairs. The longest path bounds run time.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'o₁ = ZZI and o₂ = XII clash once, so they do not commute.', show: 'arrow o₁ → o₂' },
                { say: 'o₂ = XII and o₃ = IIX share no qubit, so they commute.', show: 'no arrow: o₂ and o₃ may overlap' },
                { say: 'Follow the arrows from start to end and count the longest run.', show: 'longest path = run-time bound' }
              ]
            },
            check: {
              q: 'o₂ and o₃ have no path between them. What does that allow?',
              options: ['They may run at the same time', 'o₃ must wait for o₂', 'They must run on the same module', 'One of them can be deleted'],
              answer: 0,
              why: 'No path means no order rule between them, so they can overlap.'
            }
          },
          {
            title: 'How many T gates per rotation',
            buildsOn: 'Each dot in the precedence graph is a rotation. Section 1 said each T gate uses one magic state.',
            leadsTo: 'Next section builds the machine that runs these rotations, and the factory that feeds the T gates.',
            idea: [
              'A rotation by π/4 needs one T injection.',
              'Any other angle is approximated by a sequence of T and Clifford gates. Each injection depends on the outcome of the one before.',
              '*T-light* programs, such as adders, need 1 T per rotation. *T-heavy* ones, such as simulation, need 24 to 94.'
            ],
            sketch: [
              t(160, 50, 'T-light', { c: 'blue', size: 28 }),
              ...bx(110, 80, 100, 50, '1 T', { c: 'blue' }),
              t(160, 175, 'adders,\nmultipliers'),
              t(460, 50, 'T-heavy', { c: 'red', size: 28 }),
              B(330, 80, 30, 50, { c: 'red' }), B(365, 80, 30, 50, { c: 'red' }), B(400, 80, 30, 50, { c: 'red' }),
              B(435, 80, 30, 50, { c: 'red' }), B(470, 80, 30, 50, { c: 'red' }),
              t(555, 112, '… 24 to 94'),
              A(330, 150, 560, 150, { c: 'red' }),
              t(460, 200, 'one after another', { c: 'red' }),
              t(460, 260, 'simulation, QFT')
            ],
            takeaway: 'T-light: 1 T per rotation. T-heavy: 24 to 94, in sequence.',
            widget: null,
            check: {
              q: 'Why must the T injections of one arbitrary-angle rotation run one after another?',
              options: [
                'Each one’s basis depends on the outcome of the one before',
                'Magic states cannot be stored',
                'There are always 94 of them',
                'Clifford gates forbid overlap'
              ],
              answer: 0,
              why: 'The paper notes that each injection’s basis depends on the previous outcome.'
            }
          }
        ]
      },

      /* ============================ SECTION 3 (background) ============================ */
      {
        title: 'Background: the bicycle machine',
        intro: 'The paper’s machine stores 12 logical qubits per block, does its logic by measuring Pauli products, and joins blocks in a line. This section builds it and its four instructions.',
        bridge: 'You now hold bicycle-code blocks, modules on a line, each an LPU with a pivot and 11 slots, a factory on its host, and four timed instructions. Section 4 runs and times one rotation on this machine.',
        tabs: [
          {
            title: 'Many logical qubits per block',
            buildsOn: 'Section 2 ended with a program as rotations on logical qubits. This tab asks what holds those logical qubits.',
            leadsTo: 'Next tab opens the block: what makes this code a bicycle code.',
            idea: [
              'A surface-code patch holds 1 logical qubit, and needs hundreds to thousands of physical qubits for it.',
              'A *bivariate bicycle code* packs many into one *block*. The *gross code* [[144, 12, 12]] holds 12 logical qubits.',
              'With its check qubits a block uses 288 physical qubits. The surface code needs nearly 3,000 for the same protection.'
            ],
            sketch: [
              t(140, 50, 'surface code', { c: 'blue' }),
              B(60, 80, 60, 60, { c: 'blue' }), B(140, 80, 60, 60, { c: 'blue' }),
              B(60, 160, 60, 60, { c: 'blue' }), B(140, 160, 60, 60, { c: 'blue' }),
              t(140, 265, '1 logical per patch'),
              t(450, 50, 'gross code', { c: 'green' }),
              B(340, 80, 220, 140, { c: 'green' }),
              t(450, 160, '12 logical', { size: 30 }),
              t(450, 265, '[[144, 12, 12]]')
            ],
            takeaway: 'One gross-code block holds 12 logical qubits. About 10× fewer qubits.',
            widget: null,
            check: {
              q: 'How many logical qubits does one gross-code block store?',
              options: ['12', '1', '144', '11'],
              answer: 0,
              why: '[[144, 12, 12]]: n = 144, k = 12 logical qubits, distance 12.'
            }
          },
          {
            title: 'What makes it a bicycle code',
            buildsOn: 'The gross code holds 12 logical qubits in one block of 144 data qubits. This tab opens the block to see how its checks are built.',
            leadsTo: 'Next tab shows how logic is done on such a block: by measuring Pauli products.',
            idea: [
              'Each *site* of a 12 × 6 grid holds four qubits: an X check, data qubits L and R, and a Z check. The edges wrap round: a *torus*.',
              'A *cyclic shift* moves one site and wraps: x along the 12 side, y along the 6 side. Twelve x steps come back home.',
              'An X check at site s touches L at s + x³, y, y² (pattern A) and R at s + y³, x, x² (pattern B). Two cyclic patterns: a *bi-cycle*.',
              '*Bivariate*: shifts go two ways. They commute, so AB = BA, and that makes every X check commute with every Z check.'
            ],
            keys: [
              { tone: 'main', h: 'Bicycle is the build. The shift automorphism is a consequence.', t: 'Checks use relative steps, not fixed places. Slide *every* qubit one step along x or y and each check lands on another check: the code looks the same. That free symmetry is the *shift automorphism*. It moves the logical qubits among themselves.' }
            ],
            math: [
              { h: 'The two shifts', eq: ['x: one step along the 12 side,  x¹² = 1', 'y: one step along the 6 side,   y⁶ = 1', 'xy = yx'], why: 'Wrapping round means 12 x steps or 6 y steps return every qubit home.' },
              { h: 'The gross code patterns', eq: ['A = x³ + y + y²', 'B = y³ + x + x²'], why: 'Read + as “and also”: A picks the qubits 3 steps along x, 1 along y, and 2 along y.' },
              { h: 'The checks', eq: ['X check at s: L at s + A,  R at s + B', 'Z check at s: L at s − B,  R at s − A', 'as matrices: [A | B] and [Bᵀ | Aᵀ]'], why: 'A transpose runs the same steps backwards, so Z checks use the patterns in reverse.' },
              { h: 'Why X and Z checks commute', eq: ['overlap count = A B + B A', '              = 2 A B = 0  (mod 2)'], why: 'Shifts in x and y commute, so AB = BA. Every X and Z pair shares 0 or 2 qubits.' },
              { h: 'Counting', eq: ['data: 2 × 12 × 6 = 144', 'with one X and one Z check per site: 288', '[[144, 12, 12]]: 12 logical, distance 12'], why: '144 is a gross, a dozen dozens, hence the gross code.' }
            ],
            sketch: [
              t(105, 75, 'one site', { size: 22 }),
              B(30, 90, 150, 150),
              t(67, 150, 'X', { c: 'red', size: 30 }), t(143, 150, 'L', { size: 30 }), t(67, 215, 'R', { size: 30 }), t(143, 215, 'Z', { c: 'blue', size: 30 }),
              ...gridP(220, 30, 70, 64, 5, 4),
              xsq(PS, 0, 0),
              arr(PS, [0, 0], [3, 0], 'L', 'red'), arr(PS, [0, 0], [0, 1], 'L', 'red'), arr(PS, [0, 0], [0, 2], 'L', 'red'),
              arr(PS, [0, 0], [0, 3], 'R', 'green'), arr(PS, [0, 0], [1, 0], 'R', 'green'), arr(PS, [0, 0], [2, 0], 'R', 'green'),
              t(105, 280, 'A to L: x³, y, y²', { c: 'red', size: 17 }), t(105, 308, 'B to R: y³, x, x²', { c: 'green', size: 17 })
            ],
            takeaway: 'Bicycle: every check uses the same two cyclic step patterns, A and B.',
            widget: { type: 'bicycle' },
            deeper: {
              l1: [
                { t: 'One site', h: 200, parts: [B(240, 30, 160, 140), t(280, 90, 'X', { c: 'red', size: 30 }), t(360, 90, 'L', { size: 30 }), t(280, 150, 'R', { size: 30 }), t(360, 150, 'Z', { c: 'blue', size: 30 }),
                    t(520, 90, 'X, Z: check qubits', { size: 18 }), t(520, 150, 'L, R: data qubits', { size: 18 })],
                  say: 'The block is built from 72 identical sites. Each holds two data qubits, L and R, and two check qubits, one for an X check and one for a Z check.' },
                { t: 'A 12 × 6 torus', h: 220, parts: [B(120, 30, 400, 160, { dash: true }), A(530, 110, 600, 110, { c: 'blue' }), A(110, 110, 40, 110, { c: 'blue' }),
                    t(320, 115, '12 × 6 sites', { size: 26 }), t(320, 210, 'off the right edge: back on the left. Same for top and bottom.', { size: 16 })],
                  say: 'Lay the 72 sites on a grid 12 wide and 6 tall. Glue the right edge to the left and the bottom to the top. The surface is a torus, a doughnut: no edges at all.' },
                { t: 'Cyclic shifts', h: 200, parts: [...bx(40, 60, 90, 50, '0'), ...bx(150, 60, 90, 50, '1'), ...bx(260, 60, 90, 50, '…'), ...bx(370, 60, 90, 50, '11'),
                    K([[415, 115], [415, 160], [85, 160], [85, 118]], { c: 'blue' }), t(560, 90, 'x', { c: 'blue', size: 30 })],
                  eq: ['x: (i, j) → (i + 1, j),  mod 12', 'y: (i, j) → (i, j + 1),  mod 6'],
                  say: 'x moves every site one step along the 12 side; from column 11 it lands on column 0. y does the same along the 6 side. Twelve x steps, or six y steps, change nothing.' },
                { t: 'Pattern A: three L qubits', h: 220, parts: [...gridP(40, 20, 70, 44, 5, 4), xsq(PF, 0, 0),
                    arr(PF, [0, 0], [3, 0], 'L', 'red'), arr(PF, [0, 0], [0, 1], 'L', 'red'), arr(PF, [0, 0], [0, 2], 'L', 'red'),
                    t(PF(3, 0, 'L')[0] + 20, PF(3, 0, 'L')[1] + 22, 'x³', { c: 'red', size: 18 }), t(PF(0, 1, 'L')[0] + 22, PF(0, 1, 'L')[1] + 6, 'y', { c: 'red', size: 18 }),
                    t(PF(0, 2, 'L')[0] + 22, PF(0, 2, 'L')[1] + 6, 'y²', { c: 'red', size: 18 }),
                    t(510, 100, 'A = x³ + y + y²', { c: 'red', size: 22 })],
                  say: 'The X check at site s touches the L qubit three sites along x, the L qubit one site along y, and the L qubit two sites along y. That list is pattern A.' },
                { t: 'Pattern B: three R qubits', h: 220, parts: [...gridP(40, 20, 70, 44, 5, 4), xsq(PF, 0, 0),
                    arr(PF, [0, 0], [0, 3], 'R', 'green'), arr(PF, [0, 0], [1, 0], 'R', 'green'), arr(PF, [0, 0], [2, 0], 'R', 'green'),
                    t(PF(0, 3, 'R')[0] + 22, PF(0, 3, 'R')[1] + 6, 'y³', { c: 'green', size: 18 }), t(PF(1, 0, 'R')[0], PF(1, 0, 'R')[1] + 22, 'x', { c: 'green', size: 18 }),
                    t(PF(2, 0, 'R')[0], PF(2, 0, 'R')[1] + 22, 'x²', { c: 'green', size: 18 }),
                    t(510, 100, 'B = y³ + x + x²', { c: 'green', size: 22 })],
                  say: 'It also touches the R qubit three sites along y, and the R qubits one and two sites along x. That list is pattern B. In total the check touches 6 data qubits.' },
                { t: 'Every site, same steps', h: 200, parts: [t(320, 60, 'X check at s:  L at s + A,  R at s + B', { c: 'red', size: 20 }), t(320, 110, 'Z check at s:  L at s − B,  R at s − A', { c: 'blue', size: 20 }),
                    t(320, 170, '72 X checks + 72 Z checks, one pattern each', { size: 18 })],
                  say: 'All 72 X checks use the same steps from their own site. The Z checks use the same two patterns run backwards, with the roles of L and R swapped. Two cyclic patterns build every check: a bi-cycle.' },
                { t: 'Why they commute', h: 200, parts: [t(320, 60, 'shared qubits = AB + BA', { size: 24 }), A(320, 76, 320, 104),
                    H(190, 115, 260, 44, { c: 'yellow' }), t(320, 145, '= 2AB = 0 (mod 2)', { c: 'green', size: 24 })],
                  say: 'An X check and a Z check must clash an even number of times. Counting their shared qubits gives AB + BA. Shifts commute, so AB = BA and the count is always even: 0 or 2 in the gross code. Try it in the widget.' },
                { t: 'Slide everything', h: 200, parts: [...bx(40, 50, 220, 56, 'check at s', { c: 'red' }), A(270, 78, 370, 78, { c: 'blue' }), t(320, 60, 'x', { c: 'blue', size: 24 }),
                    ...bx(380, 50, 220, 56, 'check at s + x', { c: 'red' }), t(320, 160, 'same pattern: the code is unchanged', { c: 'green', size: 20 })],
                  say: 'Move every qubit one site along x. Each check’s six qubits move with it, so it becomes exactly the check at the next site. The whole code maps onto itself: the shift automorphism.' },
                { t: 'What it buys', h: 200, parts: [t(320, 50, '144 data + 144 checks = 288 qubits', { size: 20 }), t(320, 100, '[[144, 12, 12]]: 12 logical qubits, distance 12', { size: 20 }),
                    t(320, 160, 'a shift moves the 12 logical qubits around', { c: 'green', size: 20 })],
                  say: 'The result stores 12 logical qubits at distance 12 in 288 physical qubits. The shift keeps the code but moves the logical qubits among themselves, which the machine uses so its LPU can reach the one it needs.' }
              ]
            },
            check: {
              q: 'Is the shift automorphism what “bicycle” means?',
              options: [
                'No: bicycle means every check is built from two cyclic shift patterns, and the shift automorphism follows from that',
                'Yes: bicycle is another word for the shift automorphism',
                'No: bicycle means two blocks are joined by a coupler',
                'Yes: the code shifts two qubits at a time'
              ],
              answer: 0,
              why: 'The cyclic build comes first. Because checks are defined by relative shifts, sliding everything is a symmetry for free.'
            }
          },
          {
            title: 'Measuring a Pauli product',
            buildsOn: 'A block holds 12 logical qubits behind its bicycle checks. Section 1 defined Pauli products. This tab asks what measuring one means.',
            leadsTo: 'Next tab uses this kind of measurement to perform a rotation, the thing a program is made of.',
            idea: [
              'Measuring a Pauli product asks one yes or no question. The answer is *+1* or *−1*.',
              'Measuring Z₁Z₂ asks only: do qubits 1 and 2 agree? It never asks what either qubit is on its own.',
              'So if every pattern in the state gives the same answer, the measurement changes nothing. α|00⟩ + β|11⟩ stays as it is.',
              'QEC basics used this for checks. The T injection used it as Z ⊗ Z. This machine uses it for almost everything.'
            ],
            sketch: [
              t(320, 45, 'measure Z₁Z₂: do they agree?', { size: 24 }),
              ...bx(40, 80, 120, 56, '00', { c: 'green' }), ...bx(180, 80, 120, 56, '11', { c: 'green' }),
              ...bx(340, 80, 120, 56, '01', { c: 'red' }), ...bx(480, 80, 120, 56, '10', { c: 'red' }),
              t(170, 170, 'agree: +1', { c: 'green' }), t(470, 170, 'differ: −1', { c: 'red' }),
              H(110, 215, 420, 44, { c: 'yellow' }),
              t(320, 246, 'never asks what one qubit is')
            ],
            takeaway: 'A Pauli measurement asks one ±1 question and nothing more.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'On 00', h: 200, parts: [...bx(250, 40, 140, 60, '0 0'), t(320, 150, 'agree: +1', { c: 'green', size: 24 })],
                  eq: ['Z₁Z₂ |00⟩ = (+1)(+1) |00⟩ = +1 · |00⟩'],
                  say: 'Z leaves a 0 alone. Both qubits are 0, so no minus sign appears and the answer is +1.' },
                { t: 'On 11', h: 200, parts: [...bx(250, 40, 140, 60, '1 1'), t(320, 150, 'agree: +1', { c: 'green', size: 24 })],
                  eq: ['Z₁Z₂ |11⟩ = (−1)(−1) |11⟩ = +1 · |11⟩'],
                  say: 'Z puts a minus on a 1. Two minus signs cancel, so matching qubits give +1 again.' },
                { t: 'On 01', h: 200, parts: [...bx(250, 40, 140, 60, '0 1', { c: 'red' }), t(320, 150, 'differ: −1', { c: 'red', size: 24 })],
                  eq: ['Z₁Z₂ |01⟩ = (+1)(−1) |01⟩ = −1 · |01⟩'],
                  say: 'One minus sign survives, so qubits that differ give −1.' },
                { t: 'On α|00⟩ + β|11⟩', h: 200, parts: [t(320, 60, 'α|00⟩ + β|11⟩', { size: 28 }), A(320, 76, 320, 110),
                    H(170, 125, 300, 44, { c: 'yellow' }), t(320, 155, 'both +1: nothing changes', { c: 'green', size: 24 })],
                  eq: ['Z₁Z₂ (α|00⟩ + β|11⟩) = +1 · (α|00⟩ + β|11⟩)'],
                  say: 'Both patterns answer +1, so the answer is +1 for sure. Nothing collapses and α and β are untouched. Measuring Z₁ alone would have collapsed this state to 00 or 11.' }
              ]
            },
            check: {
              q: 'You measure Z₁Z₂ on α|00⟩ + β|11⟩. What happens?',
              options: ['It reads +1 and the state is unchanged', 'It collapses to 00 or 11', 'It reads 0 or 1 at random', 'It reads −1'],
              answer: 0,
              why: 'Every pattern in the state agrees, so the question has one answer and nothing is disturbed.'
            }
          },
          {
            title: 'A rotation by measuring',
            buildsOn: 'A Pauli measurement asks a ±1 question. Section 2 said a program is a list of Pauli rotations. This tab joins the two.',
            leadsTo: 'Next tab names the part of the machine that carries out these measurements on a module.',
            idea: [
              'A program is a list of rotations about Pauli products like ZZX. The machine has no gate that turns about ZZX directly.',
              'Recall the T injection: measure Z ⊗ Z on a data qubit and |T⟩, read |T⟩ in X, fix with S if the parity was odd.',
              'Swap that one Z for a whole product P. Measuring P ⊗ Z with |T⟩ turns the data by π/4 about P.',
              'The fix becomes a quarter turn about P, still Clifford. So one rotation is one joint measurement, plus a fix.'
            ],
            sketch: [
              t(160, 45, 'one qubit', { c: 'blue', size: 24 }),
              ...bx(60, 70, 200, 56, 'Z ⊗ Z with |T⟩', { c: 'blue' }),
              A(160, 132, 160, 180, { c: 'blue' }),
              t(160, 215, 'T on the qubit', { c: 'blue' }),
              t(480, 45, 'many qubits', { c: 'green', size: 24 }),
              ...bx(380, 70, 200, 56, 'P ⊗ Z with |T⟩', { c: 'green' }),
              A(480, 132, 480, 180, { c: 'green' }),
              t(480, 215, 'π/4 turn about P', { c: 'green' }),
              t(320, 290, 'odd outcome: Clifford fix, as before', { c: 'red', size: 22 })
            ],
            takeaway: 'A rotation about P = measure P ⊗ Z with a magic state, then fix.',
            widget: null,
            check: {
              q: 'How does this machine turn qubits by π/4 about ZZX?',
              options: [
                'It measures ZZX ⊗ Z jointly with a magic state, then applies a Clifford fix if needed',
                'It applies three T gates, one per qubit',
                'It reads all three qubits and rewrites them',
                'It cannot, so such rotations are skipped'
              ],
              answer: 0,
              why: 'The T injection trick works for any Pauli product P in place of the single Z.'
            }
          },
          {
            title: 'Module, LPU and pivot',
            buildsOn: 'A rotation is a joint measurement of a Pauli product with a magic state. This tab names the hardware that performs those measurements.',
            leadsTo: 'Next tab lines many modules up, joins neighbours, and attaches the factory.',
            idea: [
              'Each block is paired with a *logical processing unit*, the *LPU*. Block plus LPU is a *code module*.',
              'The LPU performs the module’s Pauli measurements, one at a time. So a module serves one operation at a time.',
              'Logical qubit 1 of each module is the *pivot*, the helper for every operation there. That leaves 11 *slots* for program qubits.',
              'Which slot a qubit sits in changes how costly its measurements are. Section 4 makes that a number.'
            ],
            sketch: [
              B(40, 90, 400, 90),
              ...bx(50, 105, 46, 60, 'p', { c: 'blue' }),
              B(104, 105, 30, 60), B(140, 105, 30, 60), B(176, 105, 30, 60), B(212, 105, 30, 60), B(248, 105, 30, 60),
              B(284, 105, 30, 60), B(320, 105, 30, 60), B(356, 105, 30, 60), B(392, 105, 40, 60, { dash: true }),
              ...bx(490, 105, 110, 60, 'LPU', { c: 'green' }),
              L([[440, 135], [490, 135]], { c: 'green' }),
              t(73, 75, 'pivot', { c: 'blue', size: 20 }),
              t(270, 220, '11 data slots'),
              t(545, 200, 'one at a time', { c: 'green', size: 20 })
            ],
            takeaway: 'Module = block + LPU. One pivot, 11 slots, one measurement at a time.',
            widget: null,
            check: {
              q: 'How many program qubits can one module hold?',
              options: ['11', '12', '144', '10'],
              answer: 0,
              why: '12 logical qubits, minus the pivot, leaves 11 slots.'
            }
          },
          {
            title: 'Modules on a line',
            buildsOn: 'One module has a pivot, 11 slots and an LPU. This tab joins many modules and adds the factory from Section 1.',
            leadsTo: 'Next tab lists the four instructions this machine runs, with their times.',
            idea: [
              'Modules sit on a line. *Couplers* link the LPUs of neighbouring modules only.',
              'A *factory* module distils magic states and connects to one code module, its *host*.',
              'The *reference machine*: M code modules and one factory at the end of the line.'
            ],
            sketch: [
              ...bx(30, 120, 90, 60, 'm1'), ...bx(150, 120, 90, 60, 'm2'), ...bx(270, 120, 90, 60, 'm3'),
              ...bx(390, 120, 90, 60, 'host', { c: 'blue' }),
              ...bx(520, 120, 90, 60, 'factory', { c: 'ink' }),
              L([[120, 150], [150, 150]], { c: 'green' }), L([[240, 150], [270, 150]], { c: 'green' }),
              L([[360, 150], [390, 150]], { c: 'green' }), L([[480, 150], [520, 150]], { c: 'ink' }),
              t(195, 90, 'couplers join neighbours', { c: 'green' }),
              t(320, 250, 'reference machine: one factory at the end')
            ],
            takeaway: 'Modules on a line, neighbours coupled, one factory on its host.',
            widget: null,
            check: {
              q: 'Which modules can a coupler join directly?',
              options: ['Neighbouring modules on the line', 'Any two modules', 'Only the factory and module 1', 'Only modules in different tiers'],
              answer: 0,
              why: 'Couplers link the LPUs of neighbouring modules.'
            }
          },
          {
            title: 'Four instructions',
            buildsOn: 'Earlier tabs gave Pauli measurements, the LPU and pivot, and the factory on its host. This tab names the four instructions built from them.',
            leadsTo: 'Next section uses these instructions to run one rotation whose qubits sit on several modules.',
            idea: [
              '*In-module measurement*: a Pauli on one module. *Inter-module measurement*: a Pauli product across two neighbouring modules.',
              '*T injection*: a magic state measured jointly with the host’s pivot, never with a data slot.',
              '*Shift automorphism*: slide the block one step along x or y, as in the bicycle tab. It moves logical qubits so the LPU can reach them.',
              'Time counts *timesteps*, one per physical gate. Both measurements take 120. A T injection holds the factory 109 more.'
            ],
            keys: [
              { tone: 'main', h: 'How a run fails', t: 'Each use of instruction i fails with a small chance Pᵢ. Rare, independent chances add, so a run fails with probability about *Σ Nᵢ Pᵢ*, where Nᵢ counts the uses. Fewer inter-module measurements, fewer failures.' }
            ],
            sketch: [
              ...bx(30, 40, 280, 56, 'in-module: 120', { c: 'blue' }),
              ...bx(330, 40, 280, 56, 'inter-module: 120', { c: 'green' }),
              ...bx(30, 130, 280, 56, 'T injection: 120'),
              ...bx(330, 130, 280, 56, 'shift automorphism'),
              t(170, 225, 'factory held +109', { c: 'red', size: 22 }),
              t(320, 290, 'timesteps: one per physical gate')
            ],
            takeaway: 'Four instructions. Measurements take 120 timesteps. Failure ≈ Σ Nᵢ Pᵢ.',
            widget: {
              type: 'stack',
              unit: 'timesteps',
              segments: [
                { label: 'T injection: joint measurement with the pivot', v: 120 },
                { label: 'factory still occupied', v: 109 }
              ],
              note: 'One T injection holds the factory for 229 timesteps. A T-heavy rotation needs 24 to 94 of these in a row.'
            },
            check: {
              q: 'A compiler halves the number of inter-module measurements and changes nothing else. What happens to failure?',
              options: ['It falls, since that term of Σ Nᵢ Pᵢ halves', 'It doubles', 'It stays the same', 'It falls to zero'],
              answer: 0,
              why: 'Nᵢ for inter-module measurements halves, so its share of the sum halves.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 (background) ============================ */
      {
        title: 'Background: running and timing a rotation',
        intro: 'A rotation’s Pauli usually spans several modules, and each LPU sees only its own. This section shows how the machine still runs it, then how many rotations are timed together.',
        bridge: 'You now hold the full lowering of a rotation, how runs are timed, and the baseline. The paper starts next: Section 5 asks where the baseline’s time goes.',
        tabs: [
          {
            title: 'A rotation that spans modules',
            buildsOn: 'Section 3 said a rotation about P is a joint measurement of P with a magic state, and each LPU measures only its own module.',
            leadsTo: 'Next tab tries the obvious fix, measuring each piece on its own, and shows why it breaks.',
            idea: [
              'A program’s P often touches qubits on several modules. No single LPU can measure all of it.',
              'Write P = P₁ ⊗ P₂ ⊗ P₃ ⊗ …, one piece per module. *Pₘ* is the part of P on module m.',
              'Example: P = ZX on module 1, I on module 2, Y on module 3. Pₘ = I means module m holds none of P’s qubits.'
            ],
            sketch: [
              t(320, 50, 'P = P₁ ⊗ P₂ ⊗ P₃', { size: 30 }),
              ...bx(60, 110, 140, 70, 'ZX', { c: 'blue' }),
              ...bx(250, 110, 140, 70, 'I'),
              ...bx(440, 110, 140, 70, 'Y', { c: 'blue' }),
              t(130, 225, 'module 1'), t(320, 225, 'module 2'), t(510, 225, 'module 3'),
              t(320, 285, 'P₂ = I: no qubits there', { c: 'red' })
            ],
            takeaway: 'Each module gets its own piece Pₘ. Pₘ = I means not involved.',
            widget: null,
            check: {
              q: 'For the P above, which module holds none of the rotation’s qubits?',
              options: ['Module 2', 'Module 1', 'Module 3', 'All of them hold some'],
              answer: 0,
              why: 'P₂ = I on module 2.'
            }
          },
          {
            title: 'Naive try: measure each piece',
            buildsOn: 'P splits into pieces Pₘ, one per module. Each LPU can measure its own piece. This tab tries exactly that.',
            leadsTo: 'Next tab fixes the problem with helpers glued together, so only the combined answer is learned.',
            idea: [
              'Classical first: the parity of a bit string is the product of the parities of its pieces, in ±1 form.',
              'So measuring each Pₘ and multiplying does give the right ±1 for P. But it learns each piece’s answer too.',
              'That extra knowledge disturbs the data. Take α|00⟩ + β|11⟩ with qubits on two modules and P = Z₁Z₂.',
              'Z₁Z₂ reads +1 and changes nothing. Measuring Z₁ then Z₂ collapses the state to 00 or 11.'
            ],
            sketch: [
              t(160, 45, 'measure Z₁Z₂', { c: 'green', size: 24 }),
              t(160, 105, 'α|00⟩ + β|11⟩'),
              A(160, 120, 160, 170, { c: 'green' }),
              t(160, 205, 'unchanged', { c: 'green' }),
              t(480, 45, 'measure Z₁, then Z₂', { c: 'red', size: 24 }),
              t(480, 105, 'α|00⟩ + β|11⟩'),
              A(480, 120, 480, 170, { c: 'red' }),
              t(480, 205, '00 or 11: collapsed', { c: 'red' }),
              H(120, 245, 400, 40, { c: 'yellow' }),
              t(320, 273, 'ask for the product only')
            ],
            takeaway: 'Measuring each piece learns too much and collapses the data.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'Start', h: 200, parts: [t(320, 60, 'α|00⟩ + β|11⟩', { size: 28 }), t(320, 120, 'qubit 1 on module 1, qubit 2 on module 2', { size: 20 })],
                  say: 'The program wants the answer to Z₁Z₂ only. Both patterns agree, so that answer is +1 and the state should survive.' },
                { t: 'Measure Z₁ alone', h: 200, parts: [t(320, 60, 'Z₁ reads +1 (00) or −1 (11)', { size: 24, c: 'red' }), A(320, 80, 320, 120, { c: 'red' }),
                    t(320, 160, 'α|00⟩ or β|11⟩, the other is gone', { size: 22, c: 'red' })],
                  eq: ['chance of +1 = |α|²,  chance of −1 = |β|²'],
                  say: 'The two patterns give different answers to Z₁, so this readout tells them apart. The state collapses to one pattern.' },
                { t: 'Multiply', h: 200, parts: [t(320, 60, 'Z₁ × Z₂ = (+1)(+1) or (−1)(−1) = +1', { size: 22 }),
                    H(170, 100, 300, 44, { c: 'yellow' }), t(320, 130, 'right answer, ruined state', { size: 24 })],
                  say: 'The product is +1 either way, which is right. But α and β were lost on the way. The machine must learn the product without the pieces.' }
              ]
            },
            check: {
              q: 'Why is measuring each piece Pₘ separately not good enough?',
              options: [
                'It learns each piece’s answer, which can collapse the data',
                'It gives the wrong product',
                'It takes no time',
                'It needs a magic state per piece'
              ],
              answer: 0,
              why: 'The product is right, but the extra answers tell patterns apart and destroy α and β.'
            }
          },
          {
            title: 'A GHZ chain to the host',
            buildsOn: 'Measuring each piece alone learns too much. Section 3 gave every module a helper qubit, the pivot.',
            leadsTo: 'Next tab shows how a piece the LPU cannot measure directly is measured anyway.',
            idea: [
              'Fix: glue the pivots into a *GHZ state*, (|00…0⟩ + |11…1⟩)/√2. Then measure each piece Pₘ jointly with its own pivot.',
              'Each module’s answer alone is now a coin flip. Only their product carries the answer for P, so the data survives.',
              'One inter-module measurement glues two neighbouring pivots. The glued run is the *chain*, each neighbouring pair a *link*.',
              'The T injection is at the host, so the chain runs from the farthest module with Pₘ ≠ I to the host, crossing empty ones.'
            ],
            sketch: [
              ...bx(20, 120, 100, 60, 'P₁=I'),
              ...bx(140, 120, 100, 60, 'P₂≠I', { c: 'blue' }),
              ...bx(260, 120, 100, 60, 'P₃=I'),
              ...bx(380, 120, 100, 60, 'host'),
              ...bx(500, 120, 110, 60, 'factory'),
              L([[240, 150], [260, 150]], { c: 'green' }), L([[360, 150], [380, 150]], { c: 'green' }),
              H(140, 205, 340, 30, { c: 'mint' }),
              t(310, 228, 'chain: 2 links, 3 pivots glued', { size: 22 }),
              t(310, 95, 'crossed but empty', { c: 'red', size: 20 }),
              t(310, 285, 'answers multiply to P’s answer', { c: 'green', size: 22 })
            ],
            takeaway: 'Glued pivots from the farthest touched module to the host.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'The host is module 5, beside the factory. A rotation touches qubits on module 2 only.', show: 'P₂ ≠ I, all other Pₘ = I' },
                { say: 'The T injection is on module 5, so the glue must reach module 5.', show: 'chain must include module 5' },
                { say: 'Glue joins neighbours only, so it passes through 3 and 4.', show: 'chain = 2, 3, 4, 5' },
                { say: 'Count the links: neighbouring pairs in the chain.', show: '(2,3) (3,4) (4,5): 3 inter-module measurements' }
              ]
            },
            check: {
              q: 'The host is module 5 and a rotation touches only module 2. How many modules does its chain hold?',
              options: ['4: modules 2, 3, 4, 5', '1: module 2', '2: modules 2 and 5', '5: every module'],
              answer: 0,
              why: 'The chain runs over neighbours from the farthest touched module to the host.'
            }
          },
          {
            title: 'Synthesis and its level',
            buildsOn: 'The GHZ chain needs each piece Pₘ measured with its pivot. Section 1 showed a Clifford gate turns one Pauli product into another.',
            leadsTo: 'Next tab puts the whole recipe together as one timed task.',
            idea: [
              'An LPU measures only a few Paulis directly, its *native* ones. For any other Pₘ, pick Clifford steps C that turn it into a native N.',
              'Apply C, measure N, then undo C. That asks exactly the Pₘ question. This disguise is *synthesis*.',
              'Each Clifford step is a native Clifford rotation, and each costs one in-module measurement.',
              'The number used is the piece’s *synthesis level*. It depends on the slots Pₘ touches. Gross code average: 18.5.'
            ],
            sketch: [
              ...bx(30, 110, 130, 60, 'C', { c: 'blue' }),
              ...bx(190, 110, 130, 60, 'measure N', { c: 'green' }),
              ...bx(350, 110, 130, 60, 'undo C', { c: 'blue' }),
              A(160, 140, 188, 140), A(320, 140, 348, 140),
              t(95, 90, 'lead-in', { c: 'blue', size: 22 }),
              t(415, 90, 'tail', { c: 'blue', size: 22 }),
              t(560, 130, 'level =', { c: 'red', size: 22 }),
              t(560, 160, 'C steps', { c: 'red', size: 22 }),
              H(110, 225, 420, 40, { c: 'yellow' }),
              t(320, 254, 'the slots touched set the level')
            ],
            takeaway: 'Synthesis disguises Pₘ as a native Pauli. Level = steps it costs.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'The problem', h: 200, parts: [...bx(220, 40, 200, 60, 'measure Pₘ', { c: 'red' }), t(320, 150, 'not native: the LPU cannot', { c: 'red', size: 22 })],
                  say: 'The module needs the answer to Pₘ, but Pₘ is not on the LPU’s native list.' },
                { t: 'Disguise it', h: 200, parts: [...bx(80, 40, 160, 60, 'Pₘ'), A(250, 70, 390, 70, { c: 'blue' }), t(320, 55, 'C', { c: 'blue', size: 26 }),
                    ...bx(400, 40, 160, 60, 'N', { c: 'green' }), t(320, 150, 'a Clifford turns one Pauli into another', { size: 20 })],
                  say: 'Clifford gates send Paulis to Paulis. Choose Clifford steps C that send Pₘ to a native N.' },
                { t: 'Measure, then undo', h: 200, parts: [...bx(30, 40, 160, 60, 'C', { c: 'blue' }), ...bx(240, 40, 160, 60, 'N', { c: 'green' }), ...bx(450, 40, 160, 60, 'undo C', { c: 'blue' }),
                    t(320, 150, 'answer for N = answer for Pₘ', { c: 'green', size: 22 })],
                  say: 'After C, the N question is the Pₘ question in disguise. Measure N, then undo C so the data is back where it was.' },
                { t: 'Count the cost', h: 200, parts: [t(320, 60, 'level = number of C steps', { size: 26, c: 'red' }), t(320, 120, 'each step = 1 in-module measurement', { size: 22 }),
                    t(320, 170, 'gross code: 18.5 on average', { size: 22 })],
                  say: 'Each Clifford step is itself done by an in-module measurement. Their count is the synthesis level, and it depends on which slots Pₘ touches.' }
              ]
            },
            check: {
              q: 'What decides the synthesis level of a module’s piece Pₘ?',
              options: ['Which slots Pₘ touches', 'How far the module is from the factory', 'The rotation angle', 'How many T gates the rotation needs'],
              answer: 0,
              why: 'The level depends on the slots the Pauli touches.'
            }
          },
          {
            title: 'One rotation as a task',
            buildsOn: 'A rotation now has a full recipe: GHZ chain, synthesis on each piece, T injection on the host.',
            leadsTo: 'Next tab says when a task may start, and the extra wait that T outcomes add.',
            idea: [
              'The model calls one operation a *task*. On each chain module: a *lead-in* (synthesis), a share of the joint measurements, a *tail* (undo).',
              'The host also runs the rotation’s *T stream*, its T injections in a row.',
              'A task holds each chain module from its first instruction there to its last. Two tasks never overlap on a module.',
              'So at any moment a module is *busy*, *blocked* (held while its task waits on other modules), or *unused*.'
            ],
            sketch: [
              t(40, 80, 'm1', { anchor: 'start' }), t(40, 170, 'host', { anchor: 'start' }),
              B(110, 60, 80, 30, { c: 'green' }), H(190, 60, 250, 30, { c: 'yellow' }), B(190, 60, 250, 30, { c: 'red', dash: true }), B(440, 60, 60, 30, { c: 'green' }),
              B(110, 150, 80, 30, { c: 'green' }), B(190, 150, 310, 30, { c: 'green' }),
              t(150, 120, 'busy', { c: 'green', size: 20 }), t(315, 120, 'blocked', { c: 'red', size: 20 }), t(560, 80, 'unused', { size: 20 }),
              t(345, 220, 'm1 waits for the host’s T stream', { size: 20 }),
              A(110, 280, 600, 280), t(590, 270, 'time', { anchor: 'end', size: 20 })
            ],
            takeaway: 'A task holds its chain. A held module that waits is blocked.',
            widget: {
              type: 'stack',
              unit: 'timesteps',
              segments: [
                { label: 'in-module synthesis (lead-ins and tails)', v: 2378 },
                { label: 'everything else', v: 179 }
              ],
              note: 'An operation of the 118-qubit adder, run alone, takes 2,557 timesteps on average. Synthesis is 93% of that.'
            },
            check: {
              q: 'Module 1 finished its lead-in but must wait for the host’s T stream before its tail. What is it?',
              options: ['Blocked', 'Busy', 'Unused', 'Failed'],
              answer: 0,
              why: 'Its task still holds it, but it does no work while it waits on another module.'
            }
          },
          {
            title: 'Clocks and the outcome wait',
            buildsOn: 'Tasks hold modules and never overlap on one. Section 1 showed a T injection outcome decides a Clifford fix.',
            leadsTo: 'Next tab shows the compiler the architecture ships with, and the baseline the paper measures against.',
            idea: [
              'Each module keeps a *clock*: the time it becomes free. A task needs its whole chain, so it starts at the latest clock.',
              'A T injection’s outcome sets a Clifford fix that changes the next operation that does not commute with it.',
              'So that operation also waits for its predecessor’s last T outcome: the *outcome wait*.',
              'The architecture’s *cost model* leaves this wait out. The paper adds it to every time it reports.'
            ],
            sketch: [
              ...bx(40, 50, 160, 56, 'm1: 300'), ...bx(240, 50, 160, 56, 'm2: 900', { c: 'red' }), ...bx(440, 50, 160, 56, 'm3: 500'),
              A(320, 112, 320, 150, { c: 'red' }),
              ...bx(170, 155, 300, 56, 'start ≥ 900', { c: 'red' }),
              t(320, 250, 'and ≥ the T outcome it waits for', { c: 'blue', size: 22 }),
              t(320, 300, 'the latest of these decides')
            ],
            takeaway: 'Start = latest chain clock, and no earlier than the awaited T outcome.',
            widget: null,
            check: {
              q: 'Chain clocks are 200, 700 and 400. The awaited T outcome arrives at 900. When can the task start?',
              options: ['900', '700', '200', '1300'],
              answer: 0,
              why: 'It waits for every chain module and for the outcome, so the latest of them: 900.'
            }
          },
          {
            title: 'Reference compiler and baseline',
            buildsOn: 'Tasks, clocks and outcome waits are the timing rules. Something must still choose where qubits go and the order of tasks.',
            leadsTo: 'Next section starts the paper: it times this baseline on 24 programs and asks where the time goes.',
            idea: [
              'The *reference compiler* puts qubits on modules in index order, 11 per module, seated by index: the *reference placement*.',
              'It issues operations in *program order*. Its designers note this forces all Pauli rotations to run serially.',
              'The *baseline*: this compiler on the reference machine, timed with outcome waits. *Speed-up* = baseline time / new time.',
              'Without the outcome wait, the paper’s model reproduces the cost model to the timestep on all 30 headline cases.'
            ],
            math: [
              { h: 'Speed-up', eq: ['speed-up = baseline time / new time', '1000 / 400 = 2.5×'], why: 'Above 1 is faster than the baseline. Below 1 is slower.' }
            ],
            sketch: [
              ...bx(40, 60, 160, 56, 'q1 to q11'), ...bx(240, 60, 160, 56, 'q12 to q22'), ...bx(440, 60, 160, 56, 'q23 to q33'),
              t(320, 150, 'index order placement'),
              ...bx(40, 200, 120, 50, 'o₁', { c: 'blue' }), ...bx(180, 200, 120, 50, 'o₂', { c: 'blue' }),
              ...bx(320, 200, 120, 50, 'o₃', { c: 'blue' }),
              A(162, 225, 178, 225), A(302, 225, 318, 225),
              t(540, 232, 'one by one', { c: 'red' })
            ],
            takeaway: 'Baseline: index placement, program order, outcome waits included.',
            widget: null,
            check: {
              q: 'The baseline takes 900 timesteps and a new compiler 300. What is the speed-up?',
              options: ['3×', '0.33×', '600', '1.5×'],
              answer: 0,
              why: '900 / 300 = 3.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 (paper) ============================ */
      {
        title: 'The paper: where the time goes',
        intro: 'With the background in place, here is the paper’s question. Bicycle codes save qubits but pay in time. How much of that time is spent waiting, and why?',
        bridge: 'You now know the baseline spends most of a T-light run waiting, far above the floor. Section 6 traces the waiting to four bottlenecks.',
        tabs: [
          {
            title: 'Fewer qubits, more time',
            buildsOn: 'Section 4 ended with the baseline and speed-up. This tab starts the paper with the trade the bicycle machine makes.',
            leadsTo: 'Next tab names the three decisions a compiler can still make, and shows on a small example why they matter.',
            idea: [
              'One gross-code block protects 12 logical qubits with 288 physical qubits. The surface code needs nearly 3,000 for the same.',
              'But each LPU performs one measurement at a time, so a T gate is estimated to take over 10× longer than on a surface-code machine.',
              'So run time decides whether the qubit savings pay off.'
            ],
            sketch: [
              L([[60, 270], [600, 270]]),
              B(130, 90, 100, 180, { c: 'blue' }), B(250, 250, 100, 20, { c: 'blue' }),
              t(240, 60, 'physical qubits', { c: 'blue' }),
              t(180, 80, '~3,000', { size: 20 }), t(300, 240, '288', { size: 20 }),
              t(180, 300, 'surface'), t(300, 300, 'bicycle'),
              B(410, 240, 70, 30, { c: 'red' }), B(500, 80, 70, 190, { c: 'red' }),
              t(490, 60, 'time per T', { c: 'red' }),
              t(445, 300, 'surface'), t(535, 300, 'bicycle')
            ],
            takeaway: '288 qubits instead of nearly 3,000, but over 10× more time per T.',
            widget: null,
            check: {
              q: 'Why is a T gate so slow on this machine?',
              options: ['Each LPU performs only one measurement at a time', 'The gross code has distance 1', 'Magic states cannot be made', 'Modules are not connected'],
              answer: 0,
              why: 'Every step goes through one LPU per module, one measurement at a time.'
            }
          },
          {
            title: 'Three decisions',
            buildsOn: 'Run time decides whether the machine wins. Section 4 fixed how each rotation is lowered: chain, synthesis, T injection.',
            leadsTo: 'Next tab finds a time no such decision can beat, the floor.',
            idea: [
              '*Placement*: which module each qubit goes to. It sets each chain’s length, and which rotations share a module.',
              '*Seating*: which slot inside that module. It sets synthesis cost. *Order*: when each operation is issued.',
              'Earlier compilers chose these for inter-module error, logical error or compile time. None targeted waiting.',
              'The paper’s compiler, *Paceline*, keeps the lowering as it is and makes all three decisions to cut run time.'
            ],
            sketch: [
              t(40, 50, 'index order', { anchor: 'start', c: 'red', size: 22 }),
              B(40, 65, 80, 40), B(140, 65, 80, 40), B(240, 65, 80, 40), B(340, 65, 80, 40), ...bx(440, 65, 90, 40, 'F'),
              A(60, 125, 430, 125, { c: 'red' }), A(160, 145, 430, 145, { c: 'red' }),
              t(40, 205, 'together near F', { anchor: 'start', c: 'green', size: 22 }),
              B(40, 220, 80, 40), B(140, 220, 80, 40), B(240, 220, 80, 40), B(340, 220, 80, 40), ...bx(440, 220, 90, 40, 'F'),
              A(360, 280, 430, 280, { c: 'green' }), A(260, 295, 430, 295, { c: 'green' })
            ],
            takeaway: 'Placement, seating and order: the three things Paceline decides.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'Index order', h: 220, parts: [
                    ...bx(30, 40, 110, 50, 'R1 R2'), ...bx(155, 40, 110, 50, 'R3 R1'), ...bx(280, 40, 110, 50, 'R2 R3'), ...bx(405, 40, 110, 50, 'empty'), ...bx(530, 40, 80, 50, 'F'),
                    A(80, 120, 520, 120, { c: 'red' }), t(320, 160, 'every rotation’s chain runs from module 1 to F', { c: 'red', size: 20 })],
                  say: 'Three rotations that commute. With qubits in index order, each rotation has qubits on module 1 or 2, so every chain spans almost the whole line.' },
                { t: 'They run in turn', h: 220, parts: [
                    B(60, 40, 170, 36, { c: 'blue' }), B(230, 90, 170, 36, { c: 'green' }), B(400, 140, 170, 36, { c: 'red' }),
                    t(22, 64, 'R1', { anchor: 'start', size: 20 }), t(22, 114, 'R2', { anchor: 'start', size: 20 }), t(22, 164, 'R3', { anchor: 'start', size: 20 }),
                    t(320, 205, 'chains overlap, so one at a time', { c: 'red', size: 20 })],
                  say: 'Every pair of chains shares modules, so even though the rotations commute, each waits for the one before.' },
                { t: 'Together near F', h: 220, parts: [
                    ...bx(30, 40, 110, 50, 'empty'), ...bx(155, 40, 110, 50, 'R3 R3'), ...bx(280, 40, 110, 50, 'R2 R2'), ...bx(405, 40, 110, 50, 'R1 R1'), ...bx(530, 40, 80, 50, 'F'),
                    A(460, 115, 520, 115, { c: 'blue' }), A(335, 135, 520, 135, { c: 'green' }), A(210, 155, 520, 155, { c: 'red' }),
                    t(320, 200, 'each rotation’s qubits together, near the factory', { c: 'green', size: 20 })],
                  say: 'Put each rotation’s qubits on one module, close to the factory. R1’s chain is now one module long, R2’s two, R3’s three.' },
                { t: 'They overlap', h: 220, parts: [
                    B(60, 40, 120, 36, { c: 'blue' }), B(60, 90, 220, 36, { c: 'green' }), B(60, 140, 320, 36, { c: 'red' }),
                    t(22, 64, 'R1', { anchor: 'start', size: 20 }), t(22, 114, 'R2', { anchor: 'start', size: 20 }), t(22, 164, 'R3', { anchor: 'start', size: 20 }),
                    L([[570, 30], [570, 185]], { dash: true }), L([[390, 30], [390, 185]], { c: 'green', dash: true }),
                    t(480, 205, 'ends earlier', { c: 'green', size: 20 })],
                  say: 'Shorter chains overlap less, so the rotations run partly side by side. They still share the host’s T work, but the run ends well before the index-order run.' }
              ]
            },
            check: {
              q: 'In the example, what made the rotations overlap?',
              options: ['Placing each rotation’s qubits together near the factory, so chains got short', 'Adding a second factory', 'Removing the pivot', 'Running them in program order'],
              answer: 0,
              why: 'Short chains share fewer modules, so commuting rotations no longer block each other.'
            }
          },
          {
            title: 'The floor',
            buildsOn: 'Paceline picks placement, seating and order. Section 2 said the longest path bounds run time.',
            leadsTo: 'Next tab compares the baseline with this floor on 24 programs.',
            idea: [
              'Bound 1: every rotation passes through a factory’s host, which does one thing at a time. Host work per factory bounds the run.',
              'Bound 2: the longest path of non-commuting operations, each at its cheapest, must run in sequence.',
              'The larger of the two is the *floor*. No placement or order can run faster.'
            ],
            sketch: [
              ...bx(40, 60, 120, 50, 'rot 1'), ...bx(170, 60, 120, 50, 'rot 2'), ...bx(300, 60, 120, 50, 'rot 3'),
              A(100, 115, 210, 165), A(230, 115, 230, 165), A(360, 115, 250, 165),
              ...bx(160, 170, 140, 50, 'host', { c: 'red' }),
              O(450, 90, 16), O(540, 90, 16), O(540, 180, 16),
              A(466, 90, 524, 90, { c: 'blue' }), A(540, 106, 540, 164, { c: 'blue' }),
              t(495, 230, 'longest path', { c: 'blue', size: 20 }),
              t(320, 290, 'floor = larger of the two')
            ],
            takeaway: 'Floor = the larger of host work and the longest path.',
            widget: null,
            check: {
              q: 'Host work is 5,000 timesteps and the longest path 8,000. What is the floor?',
              options: ['8,000', '5,000', '13,000', '3,000'],
              answer: 0,
              why: 'The floor is the larger of the two bounds.'
            }
          },
          {
            title: 'How far above the floor',
            buildsOn: 'The floor is a time nothing can beat. This tab compares the baseline with it on 24 programs.',
            leadsTo: 'Next tab looks inside a baseline run to see what the modules do with the lost time.',
            idea: [
              'Baseline T-light programs run 4.4 to 5.7× above the floor. Most of their time could in principle be won back.',
              'Baseline T-heavy programs run within 1.01 to 1.22× of it. There is almost nothing left to win by compiling.',
              'The programs fall into these two groups, with nothing in between.'
            ],
            sketch: [
              L([[60, 250], [600, 250]], { dash: true }),
              t(590, 240, 'floor', { anchor: 'end' }),
              B(130, 60, 120, 190, { c: 'blue' }),
              B(380, 220, 120, 30, { c: 'red' }),
              t(190, 40, '4.4 to 5.7×', { c: 'blue' }),
              t(440, 200, '1.01 to 1.22×', { c: 'red' }),
              t(190, 290, 'T-light'), t(440, 290, 'T-heavy')
            ],
            takeaway: 'T-light runs far above the floor. T-heavy sits right on it.',
            widget: null,
            check: {
              q: 'T-heavy baseline runs sit within 1.22× of the floor. What does that mean?',
              options: ['Little time is left to win by compiling alone', 'They waste the most time', 'They have no T gates', 'The floor is wrong for them'],
              answer: 0,
              why: 'A run near its lower bound has almost no slack for a compiler to recover.'
            }
          },
          {
            title: 'Busy, blocked, unused',
            buildsOn: 'T-light programs run far above the floor. Section 4 split a module’s time into busy, blocked and unused.',
            leadsTo: 'Next section traces this waiting to four bottlenecks.',
            idea: [
              'On the 118-qubit adder, the average module is busy 32% of the run, blocked 44%, and unused 24%.',
              'The 75-qubit multiplier shows the same pattern: 30% busy, 32% blocked, 38% unused.',
              'The longest path is only 8 to 12% of the baseline run on T-light programs. The rest is waiting.'
            ],
            sketch: [
              H(60, 110, 165, 60, { c: 'mint' }),
              B(60, 110, 165, 60, { c: 'green' }),
              B(225, 110, 226, 60, { c: 'red' }),
              B(451, 110, 124, 60),
              t(142, 148, 'busy 32%', { c: 'green' }),
              t(338, 148, 'blocked 44%', { c: 'red' }),
              t(513, 148, 'unused 24%'),
              t(320, 70, 'average module, 118-qubit adder'),
              t(320, 240, 'longest path: 8 to 12% of the run', { c: 'blue' })
            ],
            takeaway: 'An average adder module works a third of the run. The rest is waiting.',
            widget: {
              type: 'stack',
              unit: '%',
              segments: [
                { label: 'busy', v: 32 },
                { label: 'blocked: held, waiting on other modules', v: 44 },
                { label: 'unused', v: 24 }
              ],
              note: 'Average module on the 118-qubit adder under the baseline. The 75-qubit multiplier: 30%, 32%, 38%.'
            },
            check: {
              q: 'On the 118-qubit adder, which share of the run is the largest for an average module?',
              options: ['Blocked, 44%', 'Busy, 32%', 'Unused, 24%', 'All equal'],
              answer: 0,
              why: 'Blocked is 44%, busy 32%, unused 24%.'
            }
          }
        ]
      },

      /* ============================ SECTION 6 (paper) ============================ */
      {
        title: 'The paper: four bottlenecks',
        intro: 'The paper traces the waiting to three bottlenecks, then a fourth, the supply of magic states. Each is later answered by one step of Paceline.',
        bridge: 'You now hold four bottlenecks: program order, synthesis, load near the factory, and magic-state supply. Section 7 builds Paceline’s placement, the step that answers the hardest one.',
        tabs: [
          {
            title: '1. Serialisation under program order',
            buildsOn: 'Section 5 found modules blocked 44% of the run. Section 4 said every chain must reach the host.',
            leadsTo: 'Next tab looks inside one operation, where synthesis takes most of the time.',
            idea: [
              'Every chain runs to the host at the end of the line, so chains are long: 8.4 of 11 modules on the adder, 5.2 of 7 on the multiplier.',
              'So consecutive operations almost always share a module, and in program order the second waits for the first.',
              'Only 1.19 operations run at once on the adder on average, 1.07 on the multiplier. Yet many of them commute.'
            ],
            sketch: [
              B(40, 70, 560, 50, { c: 'blue' }),
              t(320, 103, 'o₁ chain: 8.4 of 11 modules', { c: 'blue' }),
              B(100, 160, 500, 50, { c: 'red' }),
              t(350, 193, 'o₂ chain overlaps', { c: 'red' }),
              A(320, 125, 320, 155, { c: 'red' }),
              H(120, 245, 400, 44, { c: 'yellow' }),
              t(320, 276, '1.19 operations at once')
            ],
            takeaway: 'Long chains overlap, so program order runs about one op at a time.',
            widget: null,
            check: {
              q: 'Why do operations in program order almost always wait for the one before?',
              options: ['Their long chains almost always share a module', 'Every pair of operations clashes', 'The factory is busy', 'Each needs 94 T gates'],
              answer: 0,
              why: 'Chains reach the host and cover most modules, so neighbours in the list collide even when they commute.'
            }
          },
          {
            title: '2. Synthesis cost per operation',
            buildsOn: 'Operations run nearly one at a time. Section 4 said each piece costs its synthesis level in in-module measurements.',
            leadsTo: 'Next tab removes the program-order wait and finds a new problem near the factory.',
            idea: [
              'Even without waiting, an adder operation takes 2,557 timesteps on average. Lead-ins and tails are 93% of it, on the multiplier too.',
              'The level depends on the slots a piece touches, and the reference placement fills slots by index.',
              'Seating the same qubits on the same modules by level cuts total level 28% on the adder, 27% on the multiplier, at no run-time cost.',
              'On T-heavy programs synthesis is only 7 to 15% of an operation: the T stream dominates.'
            ],
            sketch: [
              B(40, 80, 520, 50, { c: 'blue' }),
              B(560, 80, 40, 50),
              t(300, 113, 'synthesis 93%', { c: 'blue' }),
              t(320, 60, 'one adder operation: 2,557 timesteps'),
              A(300, 140, 300, 175),
              B(40, 185, 374, 50, { c: 'green' }),
              t(227, 218, 'seated by level: 28% less', { c: 'green' }),
              t(320, 280, 'same modules, same chains')
            ],
            takeaway: 'Synthesis is 93% of an adder operation. Better seats cut it 28%.',
            widget: null,
            check: {
              q: 'Why does seating by level cost nothing at run time?',
              options: ['It never changes chains or loads, only slots inside a module', 'It removes all T gates', 'It is done by the factory', 'It only changes rotation angles'],
              answer: 0,
              why: 'Seating keeps every qubit on its module, so chains and loads stay as they were.'
            }
          },
          {
            title: '3. Load imbalance around the factory',
            buildsOn: 'Fix program order and operations overlap. Every chain still ends at the host, as the first tab of this section said.',
            leadsTo: 'Next tab shows why balancing the total load is still not enough.',
            idea: [
              'Once operations overlap, the busiest module sets the run time. Every chain runs to the host, so modules near it do the most work.',
              'On the 118-qubit and 433-qubit adders, the busiest module works 41% and 26% of the baseline run.',
              'With the same placement but an order that follows commutation, that rises to 52% and 38%, within four modules of the host.'
            ],
            sketch: [
              B(40, 220, 80, 40), B(140, 190, 80, 70), B(240, 160, 80, 100),
              B(340, 110, 80, 150, { c: 'red' }), B(440, 60, 80, 200, { c: 'red' }),
              ...bx(540, 200, 80, 60, 'F'),
              t(480, 40, 'host', { c: 'red' }),
              t(180, 300, 'far from the factory'),
              t(200, 90, 'busiest: 41% to 52%', { c: 'red' })
            ],
            takeaway: 'Overlap reveals the real limit: modules near the host.',
            widget: null,
            check: {
              q: 'Why did program order hide this imbalance?',
              options: ['Everything waited anyway, so no module stood out', 'Program order balances load', 'The host was unused', 'Seating spread the work'],
              answer: 0,
              why: 'When all modules spend most of the run waiting, the busiest one is not yet the limit.'
            }
          },
          {
            title: 'Balance must hold over time',
            buildsOn: 'Load piles up near the host. The obvious fix is to spread the total work evenly over modules.',
            leadsTo: 'Next tab turns to T-heavy programs, where the limit is the factory itself.',
            idea: [
              'On the multiplier, one placement balanced total load 6% better than another, yet ran 1.16× slower.',
              'Over some stretches it put the active work on one module, and the rotations that needed the factory queued behind it.',
              'Its host was busy only 63% of the run, against 78% under the other placement. Balance must hold over time.'
            ],
            sketch: [
              t(160, 45, 'balanced in total', { c: 'green', size: 22 }),
              B(60, 70, 60, 120, { c: 'green' }), B(130, 70, 60, 120, { c: 'green' }), B(200, 70, 60, 120, { c: 'green' }),
              t(480, 45, 'but at one moment', { c: 'red', size: 22 }),
              B(380, 70, 60, 120, { c: 'red' }), B(450, 160, 60, 30), B(520, 160, 60, 30),
              t(410, 215, 'jam', { c: 'red', size: 20 }),
              t(320, 270, 'host busy 63% instead of 78%', { c: 'red' })
            ],
            takeaway: 'Even total load can still jam one module and starve the host.',
            widget: null,
            check: {
              q: 'A placement balances total load better but runs slower. Why?',
              options: ['It piles the work that runs at the same time onto one module', 'It uses fewer T gates', 'It removes the factory', 'It breaks commutation'],
              answer: 0,
              why: 'What matters is the load at each moment, not only the total.'
            }
          },
          {
            title: '4. Magic-state supply',
            buildsOn: 'Balance over time is a placement problem. On T-heavy programs the limit is the factory itself.',
            leadsTo: 'Next section builds Paceline, starting with placement.',
            idea: [
              'A T-heavy rotation needs 24 to 94 T gates, and each injection holds the single factory 109 timesteps past the joint measurement.',
              'The factory is busy up to 98% of the run, and T-heavy programs already run at 1.01 to 1.22× of the floor.',
              'Only more factories, a hardware change, can help them. They help T-light runs too, once their waiting is gone.'
            ],
            sketch: [
              ...bx(40, 110, 130, 70, 'factory'),
              H(200, 120, 392, 50, { c: 'pink' }),
              B(200, 120, 400, 50),
              t(400, 153, 'busy up to 98%'),
              t(320, 70, 'T-heavy run with one factory'),
              t(320, 240, 'no order or placement makes T faster', { c: 'red' })
            ],
            takeaway: 'T-heavy programs are paced by the factory. Only more T supply helps.',
            widget: null,
            check: {
              q: 'Why can no compiler step speed up T-heavy programs much on the reference machine?',
              options: ['The single factory is busy for up to 98% of the run', 'Synthesis takes 93% of the time', 'They have no commuting operations', 'Their chains are too short'],
              answer: 0,
              why: 'The T streams fill the factory, so the factory sets the pace.'
            }
          }
        ]
      },

      /* ============================ SECTION 7 (paper) ============================ */
      {
        title: 'The paper: time-balanced placement',
        intro: 'Placement decides which module each qubit goes to, which sets every chain and how work divides over modules. This section builds it from a classical chip-design idea.',
        bridge: 'You now hold placement: a hypergraph cut with weights and a balance bound, found by local search, laid out along the line. Section 8 picks two candidates and builds seating, factories and ordering.',
        tabs: [
          {
            title: 'The pipeline',
            buildsOn: 'Section 6 gave four bottlenecks. Section 5 said Paceline decides placement, seating and order.',
            leadsTo: 'Next tab starts placement with a picture of which qubits work together.',
            idea: [
              'Choosing start times alone is already a known hard scheduling problem, and placement changes every task’s modules too.',
              'So Paceline goes in steps. Placement fixes chains, seating the lead-ins and tails, factory choice each chain’s end, ordering the starts.',
              'It runs every step for two candidate placements, times both, and keeps the faster.'
            ],
            sketch: [
              ...bx(20, 120, 130, 56, 'placement', { c: 'blue' }),
              ...bx(170, 120, 130, 56, 'seating', { c: 'green' }),
              ...bx(320, 120, 130, 56, 'factory'),
              ...bx(470, 120, 150, 56, 'ordering', { c: 'red' }),
              A(150, 148, 168, 148), A(300, 148, 318, 148), A(450, 148, 468, 148),
              t(85, 210, 'chains', { size: 20 }), t(235, 210, 'lead-ins', { size: 20 }), t(385, 210, 'chain end', { size: 20 }), t(545, 210, 'starts', { size: 20 }),
              t(320, 70, 'two candidates through every step'),
              t(320, 270, 'time both, keep the faster', { c: 'green' })
            ],
            takeaway: 'Place, seat, pick factory, order. Two candidates; keep the faster.',
            widget: null,
            check: {
              q: 'Why does placement run before ordering?',
              options: ['Placement sets the chains, and the order depends on the chains', 'Ordering is cheaper', 'Seating needs the order', 'Factories decide the placement'],
              answer: 0,
              why: 'Where qubits sit decides which modules each chain holds, and so which operations collide.'
            }
          },
          {
            title: 'Graphs and hypergraphs',
            buildsOn: 'The pipeline starts with placement, which needs a picture of which qubits work together.',
            leadsTo: 'Next tab cuts this picture into modules and prices the cut.',
            idea: [
              'A *graph* is dots joined by edges. Each edge joins exactly two dots.',
              'A *hypergraph* lets one edge, a *hyperedge*, join any number of dots.',
              'Here each logical qubit is a dot. Each operation is a hyperedge around its support, the qubits it touches.'
            ],
            sketch: [
              t(140, 45, 'graph edge', { c: 'blue', size: 22 }),
              O(80, 120, 14), O(200, 120, 14), L([[94, 120], [186, 120]], { c: 'blue' }),
              t(470, 45, 'hyperedge', { c: 'red', size: 22 }),
              O(400, 110, 14), O(470, 160, 14), O(540, 100, 14), O(500, 220, 14),
              E(475, 155, 105, 90, { c: 'red', dash: true }),
              t(470, 290, 'one operation, four qubits', { size: 20 }),
              t(140, 200, 'two dots only', { size: 20 })
            ],
            takeaway: 'Qubits are dots. Each operation is a hyperedge around its qubits.',
            widget: null,
            check: {
              q: 'An operation’s Pauli is ZIXY. Which dots does its hyperedge join?',
              options: ['Qubits 1, 3 and 4', 'Qubits 1 and 2', 'All four qubits', 'Qubit 2 only'],
              answer: 0,
              why: 'The hyperedge joins the support: every qubit where the Pauli is not I.'
            }
          },
          {
            title: 'Placement is a cut',
            buildsOn: 'Qubits are dots and operations are hyperedges. Section 4 showed every extra module in a chain adds work.',
            leadsTo: 'Next tab gives some operations more weight than others in this cost.',
            idea: [
              'Classical first: chip designers split circuits into regions with few wires crossing. This is *min-cut placement*.',
              'Here each module takes at most 11 dots. Operation j touches *λⱼ* modules.',
              'Cost: Σ wⱼ(λⱼ − 1). An operation on one module costs 0. Each extra module adds a lead-in, a tail and joint work.'
            ],
            math: [
              { h: 'The cost', eq: ['cost = Σⱼ wⱼ (λⱼ − 1)'], why: 'wⱼ is the weight of operation j. Next tab says how it is chosen.' },
              { h: 'Example', eq: ['operation on 3 modules, weight 2', 'adds 2 × (3 − 1) = 4'] }
            ],
            sketch: [
              O(80, 120, 14), O(150, 90, 14), O(150, 170, 14), O(400, 110, 14), O(470, 160, 14), O(540, 100, 14),
              E(115, 130, 85, 70, { c: 'blue', dash: true }),
              E(470, 130, 110, 70, { c: 'blue', dash: true }),
              K([[150, 170], [300, 230], [470, 160]], { c: 'red' }),
              t(115, 240, 'module A', { c: 'blue' }),
              t(470, 240, 'module B', { c: 'blue' }),
              t(310, 290, 'cut operation: λ = 2', { c: 'red' }),
              t(320, 40, 'qubits = dots')
            ],
            takeaway: 'Placement is a hypergraph cut. Each extra module an op spans costs.',
            widget: null,
            check: {
              q: 'An operation of weight 1 touches 4 modules. What does it add to the cut cost?',
              options: ['3', '4', '1', '0'],
              answer: 0,
              why: 'wⱼ(λⱼ − 1) = 1 × (4 − 1) = 3.'
            }
          },
          {
            title: 'Weights: count or criticality',
            buildsOn: 'The cut cost multiplies each operation by a weight wⱼ. This tab gives two ways to choose it.',
            leadsTo: 'Next tab adds a balance bound, so the cut does not pile work on one module.',
            idea: [
              '*Count weights*: every operation weighs 1. Cut as few operations as possible.',
              '*Criticality weights*: an operation weighs more if it has many T injections, or lies on a long path of the precedence graph.',
              'So operations that decide the run time get the shortest chains.'
            ],
            math: [
              { h: 'Length of an operation', eq: ['dⱼ = 1 + tⱼ τT / τ₀'], why: 'tⱼ T injections of length τT, on a base length τ₀.' },
              { h: 'Criticality weight', eq: ['wⱼ = dⱼ × (longest path through oⱼ)', '         / (longest path in program)'], why: 'Long T streams and operations on critical paths weigh more.' }
            ],
            sketch: [
              ...bx(40, 70, 260, 60, 'count: w = 1', { c: 'blue' }),
              t(170, 170, 'all equal', { c: 'blue', size: 22 }),
              ...bx(340, 70, 260, 60, 'criticality', { c: 'red' }),
              t(470, 170, 'many T, long path:\nheavier', { c: 'red', size: 22 }),
              t(320, 285, 'heavy operations are cut last')
            ],
            takeaway: 'Count weights treat all ops alike. Criticality favours critical ones.',
            widget: null,
            check: {
              q: 'Under criticality weights, which operation weighs most?',
              options: ['One with many T injections on the longest path', 'One with no T gates', 'One on a single module', 'One at the end of the program'],
              answer: 0,
              why: 'The weight grows with T count and with how long a path passes through it.'
            }
          },
          {
            title: 'A balance bound',
            buildsOn: 'The cut keeps chains short. Section 6 showed load must be balanced, and balanced over time.',
            leadsTo: 'Next tab says how a cut meeting these rules is actually found.',
            idea: [
              'A module’s *load* is the number of operations that touch it. The *balance bound* keeps every load within 10% of its share.',
              'Whole-run balance applies the bound to the total load.',
              '*Windowed balance* sorts operations by *depth* in the precedence graph, cuts them into four windows of equally many, and bounds each.'
            ],
            sketch: [
              B(40, 70, 560, 50),
              t(320, 103, 'whole run: within 10%'),
              B(40, 180, 140, 50, { c: 'green' }), B(180, 180, 140, 50, { c: 'green' }),
              B(320, 180, 140, 50, { c: 'green' }), B(460, 180, 140, 50, { c: 'green' }),
              t(110, 213, 'w1'), t(250, 213, 'w2'), t(390, 213, 'w3'), t(530, 213, 'w4'),
              t(320, 275, 'each depth window balanced too', { c: 'green' })
            ],
            takeaway: 'Windowed balance spreads work that runs at the same time.',
            widget: null,
            check: {
              q: 'What does windowed balance add over whole-run balance?',
              options: ['Work that runs at the same time is spread out too', 'Fewer T gates', 'Shorter synthesis', 'A second factory'],
              answer: 0,
              why: 'It applies the 10% bound within each of four depth windows, not only in total.'
            }
          },
          {
            title: 'Finding the cut',
            buildsOn: 'A good cut has low cost and meets the balance bound. Trying every cut is far too slow.',
            leadsTo: 'Next tab arranges the resulting modules along the line.',
            idea: [
              '*Local search*: start somewhere, keep making the change that helps most, stop when nothing helps.',
              'Starts: a greedy one that fills each module with the qubits most tied to its members, and two random ones.',
              'Changes: move one qubit, or swap two. They are ranked first by how much they reduce balance violation, then by cost.'
            ],
            sketch: [
              ...bx(40, 60, 170, 56, 'greedy start', { c: 'green' }),
              ...bx(40, 140, 170, 56, 'random start'),
              ...bx(40, 220, 170, 56, 'random start'),
              A(220, 168, 300, 168),
              ...bx(310, 110, 290, 56, 'move 1 or swap 2', { c: 'blue' }),
              t(455, 200, 'first: less imbalance', { size: 20 }),
              t(455, 230, 'then: lower cost', { size: 20 }),
              t(455, 280, 'keep the best', { c: 'green' })
            ],
            takeaway: 'Three starts, then moves and swaps: balance first, cost second.',
            widget: null,
            check: {
              q: 'Which comes first when ranking a move in this local search?',
              options: ['How much it reduces balance violation', 'How much it lowers cost', 'How many T gates it moves', 'How close it is to the factory'],
              answer: 0,
              why: 'Moves are ranked by balance violation, then by cost.'
            }
          },
          {
            title: 'Ordering modules along the line',
            buildsOn: 'The cut divides qubits into groups. Modules sit on a line with the factory at one end, so which group goes where matters.',
            leadsTo: 'Next section combines these choices into Paceline’s two candidate placements.',
            idea: [
              '*Recursive bisection*: split the line in two, divide the qubits between the halves, repeat on each half.',
              'An operation that already reaches one side pulls its other qubits toward it, keeping its chain short.',
              'Other way: cut into all M modules at once, then order them by *Sethi et al.’s rule*: least-used module farthest from the nearest factory.'
            ],
            sketch: [
              B(40, 70, 560, 50),
              L([[320, 60], [320, 130]], { c: 'red' }),
              t(180, 103, 'half'), t(460, 103, 'half'),
              B(40, 170, 270, 50), B(330, 170, 270, 50),
              L([[175, 160], [175, 230]], { c: 'red' }), L([[465, 160], [465, 230]], { c: 'red' }),
              t(320, 270, 'split, then split again', { c: 'red' }),
              t(560, 50, 'factory end', { size: 20 })
            ],
            takeaway: 'Bisect the line repeatedly, or rank modules by use.',
            widget: null,
            check: {
              q: 'Under Sethi et al.’s rule, where does the least-used module go?',
              options: ['Farthest from the nearest factory', 'Next to the factory', 'In the middle', 'Anywhere'],
              answer: 0,
              why: 'Busy modules sit near a factory so their chains stay short.'
            }
          }
        ]
      },

      /* ============================ SECTION 8 (paper) ============================ */
      {
        title: 'The paper: seating, factories and ordering',
        intro: 'Paceline builds two candidate placements, seats qubits in slots, picks a factory for each rotation, and orders the operations by list scheduling.',
        bridge: 'You now hold the whole compiler. Section 9 asks how much each step buys, with and without extra factories, and whether the results hold.',
        tabs: [
          {
            title: 'Two candidates',
            buildsOn: 'Weights, balance rules and module orders combine in several ways. This tab says which two Paceline builds.',
            leadsTo: 'Next tab seats qubits inside the chosen modules.',
            idea: [
              'Candidate 1: criticality weights, whole-run balance, recursive bisection. It keeps critical chains short.',
              'Candidate 2: count weights, windowed balance, Sethi’s order. It guards the host against bursts of work.',
              'Neither always wins, so Paceline keeps the faster. The pair was chosen after the held-out runs, as Section 9 notes.'
            ],
            sketch: [
              B(40, 60, 260, 150, { c: 'blue' }),
              t(170, 100, 'candidate 1', { c: 'blue' }),
              t(170, 140, 'criticality', { size: 20 }), t(170, 165, 'whole-run', { size: 20 }), t(170, 190, 'bisection', { size: 20 }),
              B(340, 60, 260, 150, { c: 'red' }),
              t(470, 100, 'candidate 2', { c: 'red' }),
              t(470, 140, 'count', { size: 20 }), t(470, 165, 'windowed', { size: 20 }), t(470, 190, 'Sethi order', { size: 20 }),
              t(320, 270, 'keep the faster', { c: 'green' })
            ],
            takeaway: 'Two placements, built two ways. Neither always wins, so keep the faster.',
            widget: null,
            check: {
              q: 'What does candidate 2 protect against?',
              options: ['Bursts of work piling onto the host', 'Long T streams', 'Too many factories', 'Non-native Paulis'],
              answer: 0,
              why: 'Windowed balance and Sethi’s order spread the work that runs at the same time.'
            }
          },
          {
            title: 'Seating as a cost',
            buildsOn: 'Each candidate fixes every qubit’s module. Section 6 found that the slots inside a module set the synthesis cost.',
            leadsTo: 'Next tab finds a low-cost seating by swapping slots.',
            idea: [
              'Paceline lists the synthesis level of all 4¹² Paulis on a module’s 12 logical qubits, once per code.',
              'A *seating* σ puts the module’s qubits in its 11 slots. Its cost Cₘ(σ) sums the level of every piece measured there.',
              'A piece’s level depends on the slots of all its qubits together, so this is a hard *assignment problem*.'
            ],
            math: [
              { h: 'The cost of a seating', eq: ['Cₘ(σ) = Σ level(σ(Pₘ))', 'sum over every piece Pₘ on module m'], why: 'It counts the native rotations synthesis spends on module m over the whole program.' },
              { h: 'Size of the table', eq: ['4¹² = 16,777,216 Paulis'], why: 'Four choices (I, X, Y, Z) on each of 12 logical qubits.' }
            ],
            sketch: [
              B(40, 80, 280, 70),
              ...bx(50, 90, 50, 50, 'a'), ...bx(110, 90, 50, 50, 'b'), ...bx(170, 90, 50, 50, 'c'),
              t(180, 60, 'seating σ: qubits in slots'),
              A(330, 115, 390, 115),
              ...bx(400, 85, 200, 60, 'Cₘ(σ) = 40', { c: 'red' }),
              t(320, 230, 'sum of levels of every piece on m'),
              t(320, 285, 'lower cost: less synthesis', { c: 'green' })
            ],
            takeaway: 'A seating’s cost is the total synthesis level it causes.',
            widget: null,
            check: {
              q: 'What does Cₘ(σ) count?',
              options: ['The total synthesis level on module m under seating σ', 'The number of T gates', 'The number of links', 'The run time of module m'],
              answer: 0,
              why: 'It sums level(σ(Pₘ)) over every piece measured on module m.'
            }
          },
          {
            title: 'Swap until no swap helps',
            buildsOn: 'Every seating now has a cost Cₘ(σ). This tab searches for a low one.',
            leadsTo: 'Next tab picks a factory for each rotation when there are several.',
            idea: [
              'Steepest descent: try every swap of two slots, empty slots included, and apply the one that lowers the cost most.',
              'Repeat until no swap helps. Start from the current seating and four random ones, and keep the best.',
              'A seat stays inside one module, so each module is searched alone, and seating cannot undo any placement decision.'
            ],
            sketch: [
              B(40, 80, 260, 70),
              ...bx(50, 90, 50, 50, 'a'), ...bx(110, 90, 50, 50, 'b'), ...bx(170, 90, 50, 50, 'c'),
              K([[75, 160], [140, 200], [195, 160]], { c: 'green' }),
              t(135, 235, 'swap slots', { c: 'green' }),
              t(470, 100, 'cost before: 40', { c: 'red' }),
              t(470, 160, 'cost after: 31', { c: 'green' }),
              t(470, 250, 'repeat until\nno swap helps')
            ],
            takeaway: 'Swap slots while total synthesis level falls. Five starts.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Start from a seating with cost 40.', show: 'C = 40' },
                { say: 'Try every pair of slots. Swapping b and c gives the biggest drop.', show: 'swap b, c: C = 31' },
                { say: 'Try every pair again. The best swap now lowers it a little.', show: 'swap a, empty: C = 29' },
                { say: 'No swap lowers the cost any more. Stop.', show: 'local best: 29' },
                { say: 'Repeat from four random seatings and keep the lowest.', show: 'best of five starts' }
              ]
            },
            check: {
              q: 'Why can seating not undo a placement decision?',
              options: ['It only moves qubits between slots of the same module', 'It runs before placement', 'It changes the factory', 'It is random'],
              answer: 0,
              why: 'Seating changes neither chains nor loads.'
            }
          },
          {
            title: 'Extra factories',
            buildsOn: 'Bottleneck 4 was a single busy factory. No compiler step makes one factory faster, so this tab changes the hardware.',
            leadsTo: 'Next tab teaches list scheduling on a classical example, before Paceline’s ordering uses it.',
            idea: [
              'Each extra factory costs 823 physical qubits, so results that use one are labelled. Layouts: one at each end, or one every third module.',
              'Each rotation uses the factory on either side of its support that needs fewer links. Ties go to the original end factory.',
              'On small machines every third module places the same factories as both ends. It differs on 5 of 6 T-light and 14 of 18 T-heavy programs.'
            ],
            sketch: [
              ...bx(20, 80, 60, 50, 'F'),
              B(100, 80, 60, 50), B(180, 80, 60, 50), B(260, 80, 60, 50), B(340, 80, 60, 50), B(420, 80, 60, 50),
              ...bx(500, 80, 60, 50, 'F'),
              t(290, 50, 'factory at each end'),
              B(40, 200, 330, 40),
              ...bx(160, 250, 50, 40, 'F'),
              ...bx(310, 250, 50, 40, 'F'),
              t(520, 230, 'one every\nthird module')
            ],
            takeaway: 'Extra factories, 823 qubits each. Each rotation uses the nearer one.',
            widget: null,
            check: {
              q: 'With several factories, which one does a rotation use?',
              options: ['The one on either side of its support that needs fewer links', 'Always the end factory', 'The least busy one at run time', 'A random one'],
              answer: 0,
              why: 'Fewer links keeps the chain short and its failure low.'
            }
          },
          {
            title: 'List scheduling, classically',
            buildsOn: 'Ordering comes last in the pipeline. Section 2 gave the laundry example of tasks that wait for tasks.',
            leadsTo: 'Next tab applies it to rotations, with module clocks and outcome waits.',
            idea: [
              'A kitchen: dishes, a few cooks, and rules like chop before fry.',
              'Keep a list of dishes whose earlier steps are done. Each time, start the one that can begin soonest.',
              'This is *list scheduling*. It is fast, and a dish that is free to go never waits behind a blocked one.'
            ],
            sketch: [
              t(140, 45, 'ready list', { size: 24 }),
              ...bx(40, 70, 200, 50, 'salad: now', { c: 'green' }),
              ...bx(40, 135, 200, 50, 'soup: in 5 min'),
              ...bx(40, 200, 200, 50, 'fry: in 9 min'),
              A(250, 95, 360, 95, { c: 'green' }),
              t(470, 100, 'start salad', { c: 'green' }),
              t(470, 220, 'blocked dishes\nwait their turn')
            ],
            takeaway: 'List scheduling: start the ready job that can begin soonest.',
            widget: null,
            check: {
              q: 'In list scheduling, which ready job starts next?',
              options: ['The one that can begin soonest', 'The one written first', 'The longest one', 'A random one'],
              answer: 0,
              why: 'Starting what can begin soonest keeps workers from idling.'
            }
          },
          {
            title: 'Commutation-aware ordering',
            buildsOn: 'List scheduling starts the ready job that can begin soonest. Section 4 gave every module a clock and every operation an outcome wait.',
            leadsTo: 'Next section measures every step of Paceline on 24 programs.',
            idea: [
              'An operation is *ready* once all its predecessors in the precedence graph have been issued.',
              'Its start sⱼ is the latest clock on its chain, and no earlier than the T outcome it waits for.',
              'Paceline issues the ready operation with the earliest start. Ties: longest remaining path to the end, then program order.',
              'So a free chain runs ahead of a blocked one, and with several factories, disjoint chains use different factories at once.'
            ],
            math: [
              { h: 'Start of a ready operation', eq: ['sⱼ = max( max clock on chain, rⱼ )'], why: 'rⱼ is when the T outcome that oⱼ waits for arrives.' },
              { h: 'Which one to issue', eq: ['pick the smallest (sⱼ, −bⱼ, j)'], why: 'bⱼ is the longest path from oⱼ to the end, each step weighted by its run time alone.' },
              { h: 'Keeping it fast', eq: ['ready set in a priority queue'], why: 'Starts only grow, so a key is recomputed only when it reaches the top.' }
            ],
            sketch: [
              ...bx(40, 60, 170, 56, 'o₃: 900', { c: 'red' }),
              ...bx(40, 140, 170, 56, 'o₄: 300', { c: 'green' }),
              ...bx(40, 220, 170, 56, 'o₆: 600'),
              t(125, 40, 'ready, with starts'),
              A(220, 168, 330, 168, { c: 'green' }),
              t(470, 160, 'issue o₄ first', { c: 'green' }),
              t(470, 240, 'tie: longest path\nto the end wins')
            ],
            takeaway: 'Issue the ready operation that can start earliest.',
            widget: {
              type: 'frames',
              frames: [
                { t: 'Program order', h: 210, parts: [...bx(40, 40, 250, 50, 'o₁ on m1 to m5', { c: 'blue' }), ...bx(320, 40, 280, 50, 'o₂ on m4 to m5: waits', { c: 'red' }),
                    ...bx(40, 120, 250, 50, 'o₃ on m6 to m8'), t(460, 150, 'o₃ waits behind o₂', { c: 'red', size: 22 })],
                  say: 'In program order o₂ waits for o₁ because they share m4 and m5. o₃ waits too, just because it is written later.' },
                { t: 'Ready set', h: 210, parts: [...bx(40, 40, 250, 50, 'o₂: start 2,500', { c: 'red' }), ...bx(40, 120, 250, 50, 'o₃: start 0', { c: 'green' }),
                    t(460, 100, 'no arrows from o₁ or o₂ to o₃', { size: 20 })],
                  say: 'Suppose o₃ commutes with o₁ and o₂, so nothing points into it. Its chain m6 to m8 is free now, so its start is 0.' },
                { t: 'Earliest start first', h: 210, parts: [...bx(40, 40, 250, 50, 'o₁', { c: 'blue' }), ...bx(40, 120, 250, 50, 'o₃', { c: 'green' }),
                    t(460, 100, 'side by side', { c: 'green', size: 24 })],
                  say: 'Paceline issues o₃ now. o₁ and o₃ run at the same time on disjoint chains. o₂ issues when m4 and m5 free up.' }
              ]
            },
            check: {
              q: 'Chain clocks say 900, and the awaited T outcome arrives at 1100. What is the start?',
              options: ['1100', '900', '200', '2000'],
              answer: 0,
              why: 'The start is the later of the latest chain clock and the awaited outcome.'
            }
          }
        ]
      },

      /* ============================ SECTION 9 (paper) ============================ */
      {
        title: 'The paper: results and limits',
        intro: 'The paper tests Paceline on 24 programs, step by step, with and without extra factories, and checks its own model.',
        bridge: 'You can now explain why bicycle machines wait, how Paceline overlaps work, and what extra factories add. The paper’s next step: choose each rotation’s factory by when it becomes free, for long T-heavy programs.',
        tabs: [
          {
            title: 'How it was tested',
            buildsOn: 'Section 8 finished Paceline. Section 4 defined the baseline and speed-up.',
            leadsTo: 'Next tab reads the first result: what each step buys on the reference machine.',
            idea: [
              '24 programs: 6 T-light (four adders, two multipliers) and 18 T-heavy (simulation, QFT, learning, swap-test).',
              'Paceline was designed on 6 of them, and the other 18 were *held out* to test it fairly. Machines have 3 to 40 modules.',
              'A *cell* is one program on one machine layout. Speed-ups are averaged with the *geometric mean*.'
            ],
            math: [
              { h: 'Geometric mean of speed-ups', eq: ['two programs: 2× and 8×', '√(2 × 8) = √16 = 4×'], why: 'Ratios multiply, so the n-th root of their product is the fair average. The plain mean would say 5×.' }
            ],
            sketch: [
              ...bx(40, 70, 170, 60, '6 T-light', { c: 'blue' }),
              ...bx(240, 70, 170, 60, '18 T-heavy', { c: 'red' }),
              ...bx(440, 70, 160, 60, '3 to 40 mod'),
              H(100, 175, 440, 44, { c: 'yellow' }),
              t(320, 206, '18 held out from the design'),
              t(320, 280, 'speed-up over the baseline, geometric mean')
            ],
            takeaway: '24 programs, 18 held out, compared against the baseline.',
            widget: null,
            check: {
              q: 'Speed-ups of 1× and 4×. What is their geometric mean?',
              options: ['2×', '2.5×', '4×', '5×'],
              answer: 0,
              why: '√(1 × 4) = √4 = 2.'
            }
          },
          {
            title: 'What each step buys',
            buildsOn: 'The bench is fixed. This tab adds Paceline’s steps one at a time on the reference machine, T-light programs.',
            leadsTo: 'Next tab reads the side effect on links and failure probability.',
            idea: [
              'Ordering alone: 1.25×, most on the multipliers and least on the smallest adder. Adding seating: 1.48×. Adding placement: 2.16×.',
              'Placement helps most on the 433-qubit adder, the largest machine at 40 modules, which reaches 2.71×.',
              'On T-heavy programs the same steps give only 1.02× on average (0.97 to 1.14×), since the factory sets the pace.'
            ],
            sketch: [
              L([[60, 280], [600, 280]]),
              B(100, 220, 100, 60, { c: 'blue' }), B(270, 180, 100, 100, { c: 'green' }), B(440, 90, 100, 190, { c: 'red' }),
              t(150, 210, '1.25×'), t(320, 170, '1.48×'), t(490, 80, '2.16×', { size: 30 }),
              t(150, 310, 'order'), t(320, 310, '+ seat'), t(490, 310, '+ place')
            ],
            takeaway: 'T-light: order 1.25×, + seat 1.48×, + place 2.16×.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Commutation-aware ordering alone.', show: '1.25×' },
                { say: 'Add level-aware seating.', show: '1.48×' },
                { say: 'Add time-balanced placement.', show: '2.16× (1.88 to 2.71× per program)' },
                { say: 'T-heavy, same steps, one factory.', show: '1.02× average (0.97 to 1.14×)' }
              ]
            },
            check: {
              q: 'Which step adds the most on T-light programs?',
              options: ['Placement, from 1.48× to 2.16×', 'Ordering, from 1× to 1.25×', 'Seating, from 1.25× to 1.48×', 'All add the same'],
              answer: 0,
              why: 'Placement multiplies 1.48× up to 2.16×, the biggest jump.'
            }
          },
          {
            title: 'Fewer links, lower failure',
            buildsOn: 'Paceline runs T-light programs 2.16× faster. Section 3 said failure is about Σ Nᵢ Pᵢ over instruction uses.',
            leadsTo: 'Next tab adds extra factories and measures compiler and hardware together.',
            idea: [
              'Paceline’s placement uses 22 to 49% fewer links than the baseline, so fewer inter-module measurements.',
              'Failure probability falls to 0.73 to 0.96 of the baseline’s, 0.88 on average.',
              'Ordering leaves failure unchanged. Seating lowers it by at most 1%.'
            ],
            sketch: [
              ...bx(40, 80, 220, 60, 'links: 22 to 49% fewer', { c: 'green' }),
              A(270, 110, 360, 110),
              ...bx(370, 80, 230, 60, 'failure × 0.88', { c: 'green' }),
              t(320, 50, 'placement'),
              t(150, 200, 'faster'),
              t(485, 200, 'and safer'),
              H(120, 240, 400, 44, { c: 'yellow' }),
              t(320, 272, 'speed costs no reliability')
            ],
            takeaway: 'Fewer links: T-light failure falls to 0.88 of the baseline.',
            widget: null,
            check: {
              q: 'Why does Paceline’s placement lower failure probability?',
              options: ['It uses fewer links, so fewer inter-module measurements', 'It adds more factories', 'It raises the code distance', 'It skips T injections'],
              answer: 0,
              why: 'Each inter-module measurement adds its error rate to the total.'
            }
          },
          {
            title: 'Compiler and factories together',
            buildsOn: 'Section 8 added extra factories. This tab compares factories alone, Paceline alone, and both.',
            leadsTo: 'Next tab asks whether the placement rules work on programs they were not tuned on.',
            idea: [
              'Factories alone help little: T-light 1.00× and 0.99×, T-heavy 1.08× and 1.18×. In program order operations still wait.',
              'Both together, two factories: T-light 2.82×, T-heavy 1.73×.',
              'One every third module: 3.47× and 2.37×, and 5.50× on the 196-qubit TFIM. Failure stays at most 0.2% above the baseline.'
            ],
            sketch: [
              L([[60, 280], [600, 280]]),
              B(90, 255, 70, 25), B(170, 250, 70, 30, { c: 'blue' }), B(250, 130, 70, 150, { c: 'green' }),
              t(205, 100, 'T-heavy, every third module', { size: 22 }),
              t(125, 245, '1.18×', { size: 20 }), t(205, 240, '1.02×', { size: 20 }),
              t(285, 160, '2.37×', { c: 'green' }),
              t(480, 130, 'factories alone'),
              t(480, 180, 'Paceline alone', { c: 'blue' }),
              t(480, 230, 'both', { c: 'green' })
            ],
            takeaway: 'Factories pay off only with a compiler that lets them overlap.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'T-heavy, factory on every third module, factories alone.', show: '1.18×' },
                { say: 'T-heavy, Paceline alone, one factory.', show: '1.02×' },
                { say: 'T-heavy, both together.', show: '2.37×' },
                { say: 'T-light, both together, every third module.', show: '3.47×' },
                { say: 'Best single program, the 196-qubit TFIM.', show: '5.50×' }
              ]
            },
            check: {
              q: 'Why do extra factories alone barely help?',
              options: ['In program order operations still wait on each other, so factories sit idle', 'Extra factories make more errors', 'They are too far from the host', 'They produce no magic states'],
              answer: 0,
              why: 'Factories only pay once operations can overlap, which ordering and placement allow.'
            }
          },
          {
            title: 'Does it hold on new programs',
            buildsOn: 'The speed-ups so far mix design and held-out programs. Section 8 picked two placement candidates.',
            leadsTo: 'Next tab checks the timing model itself, and the ordering against exact answers.',
            idea: [
              'Before any held-out run, the authors froze one rule: candidate 1 without its balance bound. It gave 1.96× on 4 held-out T-light programs.',
              'A cell has *headroom* if, with the reference placement plus Paceline’s order and seating, it still runs 1.25× above the floor.',
              'Over the 28 held-out cells with headroom, the frozen rule gave 1.94×.',
              'The two candidates, picked after those runs, give 2.17× and 2.21×, and beat a 600 s search on 14 of 26 cells.'
            ],
            keys: [
              { tone: 'x', h: 'Two criteria the frozen rule missed', t: 'One T-heavy program ran at 0.95×, below the 0.98× limit. Against a 600 s local search it was 19% slower at the 80th percentile, above the 15% limit. The two candidates close most of this gap.' }
            ],
            sketch: [
              ...bx(40, 70, 260, 70, 'frozen rule', { c: 'blue' }),
              ...bx(340, 70, 260, 70, 'two candidates', { c: 'green' }),
              t(170, 185, '1.96×, 1.94×', { c: 'blue' }),
              t(470, 185, '2.17×, 2.21×', { c: 'green' }),
              t(170, 240, 'fixed before', { size: 20 }), t(470, 240, 'chosen after', { size: 20 }),
              t(320, 295, 'held-out programs only')
            ],
            takeaway: 'A rule frozen in advance still gives about 1.95× on held-out work.',
            widget: null,
            check: {
              q: 'Why does the frozen rule’s result matter more than the two candidates’?',
              options: ['It was fixed before the held-out runs, so it was not tuned on them', 'It is faster', 'It uses more factories', 'It was tested on design programs only'],
              answer: 0,
              why: 'The candidates were chosen after seeing held-out results, so their numbers are post hoc.'
            }
          },
          {
            title: 'Checking the model',
            buildsOn: 'All run times so far come from the execution model of Section 4. This tab checks that model and the ordering rule.',
            leadsTo: 'Next tab runs the whole story once and lists what the paper leaves out.',
            idea: [
              'Exact timing of 6 cells gave speed-ups 1 to 3% above the model, so the model slightly understates the gains.',
              'On 37 small slices of 6 to 10 operations solved exactly, the ordering is 1.3% above optimal on average, 11% at worst.',
              'Program order on the same slices: 4.1% on average, 37% at worst. Placement takes a median of 5.9 s per cell.'
            ],
            sketch: [
              ...bx(30, 60, 180, 60, 'exact timing', { c: 'green' }),
              ...bx(230, 60, 180, 60, 'exact order', { c: 'blue' }),
              ...bx(430, 60, 180, 60, 'compile time'),
              t(120, 170, '+1 to 3%', { c: 'green' }), t(320, 170, '1.3% off', { c: 'blue' }), t(520, 170, '5.9 s median'),
              t(320, 260, 'model is slightly cautious', { c: 'green' })
            ],
            takeaway: 'The model slightly understates gains. The order is near optimal.',
            widget: null,
            check: {
              q: 'Exact timing gave speed-ups 1 to 3% above the model. What does that say?',
              options: ['The model slightly understates Paceline’s gains', 'The model overstates them', 'The model is useless', 'Exact timing has a bug'],
              answer: 0,
              why: 'Real speed-ups came out a little higher than predicted.'
            }
          },
          {
            title: 'The whole story, once',
            buildsOn: 'Every earlier section, in order. This tab runs the chain once and states what the paper leaves out.',
            leadsTo: 'Open question: choose each rotation’s factory by when it becomes free, the next step the paper names.',
            idea: [
              'Bicycle machines save qubits but run slowly. Most of a run is waiting, for four reasons.',
              'Program order: fix by ordering. Synthesis: fix by seating. Load near the host: fix by placement. One factory: add more.',
              'Limits: no decoding delay is modelled, most times come from the model, and factory choice ignores when a factory is free.'
            ],
            sketch: [
              ...bx(20, 50, 290, 50, 'program order', { c: 'red' }), ...bx(330, 50, 290, 50, 'ordering', { c: 'green' }),
              ...bx(20, 115, 290, 50, 'synthesis', { c: 'red' }), ...bx(330, 115, 290, 50, 'seating', { c: 'green' }),
              ...bx(20, 180, 290, 50, 'load near host', { c: 'red' }), ...bx(330, 180, 290, 50, 'placement', { c: 'green' }),
              ...bx(20, 245, 290, 50, 'one factory', { c: 'red' }), ...bx(330, 245, 290, 50, 'more factories', { c: 'green' })
            ],
            takeaway: 'Four bottlenecks, four answers. Run time depends on the compiler.',
            widget: null,
            check: {
              q: 'Which of these does the paper’s model leave out?',
              options: ['Decoding delay', 'Outcome waits', 'Synthesis level', 'Factory occupancy'],
              answer: 0,
              why: 'The paper says its model assumes no decoding delay, which would add to the outcome waits.'
            }
          }
        ]
      }
    ]
  });
})();
