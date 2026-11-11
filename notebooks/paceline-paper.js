/* Notebook: the Paceline paper (cutting idle time on modular bicycle-code quantum computers).
   Sections 1 to 4 are background. Sections 5 to 8 are the paper.
   Note: a module-timeline widget (busy, held, free per module over a run) would suit Sections 5 to 7.
   It does not exist in the shell, so 'stack' and 'steps' are used instead. */
(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;
  const t = (x, y, s, o) => T(x, y, s, Object.assign({ anchor: 'middle', size: 24 }, o || {}));
  const bx = (x, y, w, h, s, o) => [B(x, y, w, h, o), t(x + w / 2, y + h / 2 + 8, s, o)];

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
          { term: 'bivariate bicycle code', aka: ['bicycle code', 'bicycle codes', 'bicycle-code'], means: 'A family of codes that store many logical qubits per block. About 10× fewer physical qubits than the surface code.' },
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
          { term: 'held but idle', means: 'A task holds the module, but the module does no work right now.' },
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
        title: 'Background: Paulis, Cliffords and T',
        intro: 'Programs on this machine are written with Pauli products. This section builds the gate set: Paulis, when they commute, Clifford gates, the T gate, and how T is injected.',
        bridge: 'You now hold Pauli products, the commute rule, Clifford gates and the T gate fed by magic states. Section 2 rewrites a whole program in these pieces, as a list of Pauli rotations.',
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
            title: 'Clifford gates',
            buildsOn: 'Pauli products and the commute rule are fixed. This tab adds gates that move one Pauli product into another.',
            leadsTo: 'Next tab shows that Clifford gates are not enough, and adds the one extra gate, T.',
            idea: [
              'A *Clifford gate* turns every Pauli product into another Pauli product. H, S and CNOT are Clifford.',
              '*H* swaps X and Z. *S*, a quarter turn about Z, turns X into Y.',
              'Circuits of only Clifford gates can be simulated fast on a laptop. So they cannot be all a quantum computer does.'
            ],
            sketch: [
              ...bx(60, 60, 80, 60, 'X', { c: 'red' }),
              A(150, 90, 270, 90),
              t(210, 70, 'H'),
              ...bx(280, 60, 80, 60, 'Z', { c: 'blue' }),
              ...bx(60, 170, 80, 60, 'X', { c: 'red' }),
              A(150, 200, 270, 200),
              t(210, 180, 'S'),
              ...bx(280, 170, 80, 60, 'Y'),
              t(510, 110, 'Pauli in,\nPauli out', { c: 'green' }),
              t(510, 230, 'H, S, CNOT')
            ],
            takeaway: 'Clifford gates turn Paulis into Paulis. Not enough on their own.',
            widget: { type: 'qubit', sliders: [], gates: ['H', 'S'], bloch: true, readouts: true, start: { theta: 90, phi: 0 } },
            check: {
              q: 'H is applied to a qubit. What does a Z on that qubit become?',
              options: ['X', 'Z', 'Y', 'A blend of X and Y'],
              answer: 0,
              why: 'H swaps X and Z, and Clifford gates keep Paulis as Paulis.'
            }
          },
          {
            title: 'The T gate',
            buildsOn: 'Clifford gates turn Paulis into Paulis and cannot run every program. This tab adds the gate that breaks that.',
            leadsTo: 'Next tab says how a T gate is done on protected qubits: with a magic state from a factory.',
            idea: [
              'The *T gate* turns a qubit by π/4 about Z. S is two T gates, a turn of π/2.',
              'T is not Clifford: it turns X into a blend of X and Y, not one Pauli.',
              'Clifford gates plus T can approximate any gate. These circuits are called *Clifford+T*.'
            ],
            sketch: [
              O(170, 170, 110),
              E(170, 170, 110, 32, { dash: true }),
              L([[170, 170], [280, 170]], { c: 'red' }),
              L([[170, 170], [248, 192]], { c: 'blue' }),
              t(300, 150, 'X', { c: 'red' }),
              t(270, 225, 'X after T', { c: 'blue' }),
              t(170, 40, 'turn π/4 about Z'),
              t(480, 130, 'not a Pauli:\na blend', { c: 'blue' }),
              H(380, 210, 200, 44, { c: 'yellow' }),
              t(480, 242, 'Clifford + T')
            ],
            takeaway: 'T is a π/4 turn about Z. Clifford plus T reaches any gate.',
            widget: { type: 'qubit', sliders: ['phi'], gates: ['H', 'S'], bloch: true, start: { theta: 90, phi: 45 } },
            check: {
              q: 'Why is T not a Clifford gate?',
              options: [
                'It turns X into a blend of X and Y, not a Pauli',
                'It acts on two qubits',
                'It is slower than CNOT',
                'It cannot be undone'
              ],
              answer: 0,
              why: 'A Clifford must send every Pauli to a Pauli. T sends X halfway between X and Y.'
            }
          },
          {
            title: 'Magic states and factories',
            buildsOn: 'The T gate tab showed T is a π/4 turn about Z and is not Clifford. This tab asks how a protected qubit gets that turn.',
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
        intro: 'This machine does not run a circuit gate by gate. It runs a list of rotations about Pauli products. This section builds that list and the rules for reordering it.',
        bridge: 'You now hold a program as a list of Pauli rotations, the precedence graph that limits reordering, and T-light against T-heavy. Section 3 builds the bicycle-code machine that runs the list.',
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
            title: 'Swap only if they commute',
            buildsOn: 'A program is now a list of Pauli rotations. Section 1 said commuting Paulis can be applied in either order.',
            leadsTo: 'Next tab draws all the must-stay-in-order pairs as one picture, the precedence graph.',
            idea: [
              'Two rotations whose Paulis *commute* can trade places. The program result is the same.',
              'Two rotations that do not commute must keep their written order.',
              'So the written order is one valid order among many. Running in that order is *program order*.'
            ],
            sketch: [
              ...bx(40, 70, 120, 56, 'ZZI', { c: 'blue' }),
              ...bx(190, 70, 120, 56, 'IIX', { c: 'blue' }),
              K([[100, 140], [180, 180], [250, 140]], { c: 'green' }),
              t(175, 215, 'commute: may swap', { c: 'green' }),
              ...bx(360, 70, 120, 56, 'ZZI', { c: 'red' }),
              ...bx(500, 70, 120, 56, 'XII', { c: 'red' }),
              A(482, 98, 498, 98, { c: 'red' }),
              t(490, 215, 'clash once: keep order', { c: 'red' })
            ],
            takeaway: 'Commuting rotations may swap. The others keep their order.',
            widget: null,
            check: {
              q: 'Rotations about ZZI and IIX appear in that order. May they swap?',
              options: ['Yes, they never clash', 'No, written order is always fixed', 'Only if both are T gates', 'No, they share qubit 2'],
              answer: 0,
              why: 'Their supports do not overlap, so there are zero clashes and they commute.'
            }
          },
          {
            title: 'Tasks that wait for tasks',
            buildsOn: 'Non-commuting rotations must keep their order. This tab collects all those rules into one graph.',
            leadsTo: 'Next tab asks how many T gates each rotation needs, which sets how long each dot lasts.',
            idea: [
              'Classical first: laundry. Wash before dry. Two loads can wash on two machines at once.',
              'Draw each operation as a dot. Arrow oⱼ → oₖ when j < k and their Paulis do not commute. This is the *precedence graph*.',
              'Its *longest path* bounds run time: even with endless hardware, that chain runs one after another.'
            ],
            sketch: [
              O(80, 160, 22), O(220, 90, 22), O(220, 230, 22), O(370, 90, 22), O(520, 160, 22),
              A(100, 150, 198, 98), A(100, 170, 198, 222), A(242, 90, 348, 90), A(390, 100, 498, 150),
              A(242, 228, 498, 168, { dash: true }),
              t(80, 210, 'o₁'), t(220, 60, 'o₂'), t(220, 285, 'o₃'), t(370, 60, 'o₄'), t(520, 210, 'o₅'),
              H(110, 22, 420, 30, { c: 'yellow' }),
              t(320, 46, 'longest path: o₁ o₂ o₄ o₅', { size: 22 })
            ],
            takeaway: 'Arrows join non-commuting pairs. The longest path bounds run time.',
            widget: null,
            check: {
              q: 'o₂ and o₃ have no arrow between them. What does that allow?',
              options: ['They may run at the same time', 'o₃ must wait for o₂', 'They must run on the same module', 'One of them can be deleted'],
              answer: 0,
              why: 'No arrow means no order rule between them, so they can overlap.'
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
        intro: 'The paper’s machine stores many logical qubits per block and joins blocks in a line. This section builds its hardware piece by piece.',
        bridge: 'You now hold modules on a line, each with 11 data slots, a pivot and an LPU, and a factory on its host. Section 4 shows what the machine does with them: it measures Pauli products.',
        tabs: [
          {
            title: 'Many logical qubits per block',
            buildsOn: 'Section 2 ended with a program as rotations on logical qubits. This tab asks what holds those logical qubits.',
            leadsTo: 'Next tab shows what this packing costs: one unit must perform every logical measurement on the block.',
            idea: [
              'A surface-code patch holds 1 logical qubit, and needs hundreds to thousands of physical qubits for it.',
              'A *bivariate bicycle code* packs many into one *block*. The *gross code* [[144, 12, 12]] holds 12 logical qubits.',
              'Same protection, about 10× fewer physical qubits than the surface code.'
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
            title: 'One LPU per block',
            buildsOn: 'A gross-code block packs 12 logical qubits together. This tab asks how a program touches one of them.',
            leadsTo: 'Next tab shows that one of the 12 logical qubits is given up as a helper, and the rest sit in slots.',
            idea: [
              'Each block is paired with a *logical processing unit*, the *LPU*. The block with its LPU is a *code module*.',
              'The LPU performs the block’s logical measurements. Every logical step on a module goes through it.',
              'So a module serves one operation at a time. Work that wants the same module waits.'
            ],
            sketch: [
              ...bx(60, 80, 220, 140, 'block: 12 logical', { c: 'green' }),
              ...bx(330, 115, 110, 70, 'LPU', { c: 'blue' }),
              L([[280, 150], [330, 150]], { c: 'blue' }),
              t(250, 270, 'code module = block + LPU'),
              t(545, 120, 'one op\nat a time', { c: 'red' }),
              A(445, 150, 490, 150, { c: 'red' })
            ],
            takeaway: 'Every logical step on a module goes through its one LPU.',
            widget: null,
            check: {
              q: 'Two operations both need module 3 at the same time. What happens?',
              options: ['One waits, since the LPU serves one at a time', 'Both run on half the block each', 'The LPU splits in two', 'They merge into one operation'],
              answer: 0,
              why: 'In the paper model, tasks never overlap on a module.'
            }
          },
          {
            title: 'Pivot and slots',
            buildsOn: 'All work on a module goes through the LPU. This tab looks at the 12 logical qubits inside a module.',
            leadsTo: 'Next tab lines modules up, joins them, and attaches the factory.',
            idea: [
              'Logical qubit 1 of each module is the *pivot*. It is the helper for every operation on that module.',
              'That leaves 11 places for program qubits. Each place is a *slot*.',
              'Which slot a qubit sits in matters. It sets how costly its measurements are, as Section 4 shows.'
            ],
            sketch: [
              B(40, 90, 560, 90),
              ...bx(50, 105, 50, 60, 'p', { c: 'ink' }),
              B(110, 105, 40, 60), B(155, 105, 40, 60), B(200, 105, 40, 60), B(245, 105, 40, 60),
              B(290, 105, 40, 60), B(335, 105, 40, 60), B(380, 105, 40, 60), B(425, 105, 40, 60),
              B(470, 105, 40, 60), B(515, 105, 40, 60), B(560, 105, 30, 60, { dash: true }),
              t(75, 60, 'pivot', { c: 'ink' }),
              t(340, 225, '11 data slots'),
              t(320, 290, 'the slot sets the measurement cost', { c: 'red' })
            ],
            takeaway: 'One pivot, 11 data slots per module. The slot sets the cost.',
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
            leadsTo: 'Next section asks what this machine actually does to its logical qubits: it measures Pauli products.',
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
          }
        ]
      },

      /* ============================ SECTION 4 (background) ============================ */
      {
        title: 'Background: logic by measuring',
        intro: 'This machine does almost all its logic by measuring Pauli products, not by applying gates. This section shows what such a measurement does, then each instruction that uses one.',
        bridge: 'You now hold: a Pauli measurement asks a ±1 question, a rotation is a joint measurement with a magic state, and the machine has four timed instructions. Section 5 runs one rotation that spans several modules.',
        tabs: [
          {
            title: 'Measuring a Pauli product',
            buildsOn: 'Section 3 ended with modules on a line. Section 1 defined Pauli products. This tab asks what it means to measure one.',
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
            title: 'Who measures: the LPU',
            buildsOn: 'A rotation needs a joint measurement of a Pauli product. Section 3 paired each block with an LPU. This tab gives the LPU its job.',
            leadsTo: 'Next tab shows that the LPU cannot reach every logical qubit as it sits, and the shuffle that fixes that.',
            idea: [
              'An *in-module measurement* measures a Pauli product on one module’s logical qubits. The module’s LPU performs it.',
              'Time on this machine is counted in *timesteps*. One timestep is the time of one physical gate.',
              'An in-module measurement takes 120 timesteps. An LPU performs one at a time.'
            ],
            sketch: [
              ...bx(40, 90, 260, 120, 'block: 12 logical', { c: 'green' }),
              ...bx(360, 115, 120, 70, 'LPU', { c: 'blue' }),
              L([[300, 150], [360, 150]], { c: 'blue' }),
              t(420, 90, 'measures Paulis', { c: 'blue', size: 22 }),
              t(560, 160, '120\ntimesteps'),
              t(320, 280, '1 timestep = 1 physical gate')
            ],
            takeaway: 'In-module measurement: one Pauli on one module, 120 timesteps.',
            widget: null,
            check: {
              q: 'What is one timestep?',
              options: ['The time of one physical gate', 'One round of checks', 'One in-module measurement', 'One microsecond'],
              answer: 0,
              why: 'The paper counts durations in timesteps, one per physical gate.'
            }
          },
          {
            title: 'Shift automorphism',
            buildsOn: 'The LPU performs in-module measurements on its block. This tab adds the one instruction that is not a measurement.',
            leadsTo: 'Next tab leaves one module and measures across two neighbouring modules.',
            idea: [
              'An *automorphism* of a code is a symmetry: shuffle the code’s physical qubits and the code looks the same.',
              'A *shift automorphism* uses such a symmetry to move the block’s logical qubits to new positions.',
              'It permutes the module’s logical qubits so that the LPU can reach the ones a measurement needs.',
              'So where a qubit sits changes how much work a measurement costs. Section 5 makes that cost a number.'
            ],
            sketch: [
              ...bx(40, 80, 70, 56, 'q₁'), ...bx(120, 80, 70, 56, 'q₂'), ...bx(200, 80, 70, 56, 'q₃'),
              A(285, 108, 345, 108),
              ...bx(360, 80, 70, 56, 'q₃', { c: 'green' }), ...bx(440, 80, 70, 56, 'q₁'), ...bx(520, 80, 70, 56, 'q₂'),
              t(155, 180, 'before'), t(475, 180, 'after a shift'),
              t(320, 250, 'same code, logical qubits moved', { c: 'green' })
            ],
            takeaway: 'A shift automorphism moves logical qubits within a block, losing nothing.',
            widget: null,
            check: {
              q: 'Why can a shift automorphism move logical qubits without damaging them?',
              options: ['It is a symmetry of the code, so the code looks the same after it', 'It measures each qubit first', 'It copies the qubits', 'It only acts on the pivot'],
              answer: 0,
              why: 'An automorphism maps the code onto itself, so the stored data survives the shuffle.'
            }
          },
          {
            title: 'Measuring across two modules',
            buildsOn: 'In-module measurements stay inside one block. Section 3 joined neighbouring modules with couplers.',
            leadsTo: 'Next tab places the last instruction, the T injection, on the module next to the factory.',
            idea: [
              'An *inter-module measurement* measures a Pauli product spread over two *neighbouring* modules, through the coupler.',
              'It also takes 120 timesteps. It holds both modules while it runs.',
              'Modules that are not neighbours cannot be measured together in one step. Section 5 shows how a longer reach is built.'
            ],
            sketch: [
              ...bx(40, 100, 150, 80, 'module 1'), ...bx(245, 100, 150, 80, 'module 2'), ...bx(450, 100, 150, 80, 'module 3'),
              L([[190, 140], [245, 140]], { c: 'green' }), L([[395, 140], [450, 140]], { c: 'green' }),
              K([[115, 100], [200, 50], [440, 50], [525, 100]], { c: 'red', dash: true }),
              t(320, 40, 'not in one step', { c: 'red', size: 22 }),
              t(218, 220, '120 timesteps', { c: 'green' }),
              t(320, 285, 'neighbours only')
            ],
            takeaway: 'Inter-module measurement: neighbours only, 120 timesteps.',
            widget: null,
            check: {
              q: 'Can one inter-module measurement join module 1 and module 3?',
              options: ['No, only neighbouring modules', 'Yes, any two modules', 'Yes, if module 2 is empty', 'Only through the factory'],
              answer: 0,
              why: 'Couplers join neighbours, so one inter-module measurement spans two neighbouring modules.'
            }
          },
          {
            title: 'T injection on this machine',
            buildsOn: 'A rotation is a joint measurement with a magic state. Section 3 put the factory next to one module, the host.',
            leadsTo: 'Next tab adds up the cost of all four instructions: time spent and chance of failure.',
            idea: [
              'The factory hands a magic state to its host. A *T injection* measures it jointly with the host’s *pivot*.',
              'So the T injection never touches a data slot. The rotation’s question must first be carried onto the host’s pivot.',
              'The measurement takes 120 timesteps. The factory stays occupied 109 timesteps more, so the next injection waits.'
            ],
            sketch: [
              ...bx(40, 100, 200, 90, 'host'),
              ...bx(60, 120, 50, 50, 'p', { c: 'blue' }),
              t(85, 90, 'pivot', { c: 'blue', size: 20 }),
              ...bx(420, 100, 180, 90, 'factory'),
              A(415, 145, 250, 145, { c: 'green' }),
              t(330, 130, '|T⟩', { c: 'green' }),
              t(140, 240, 'joint with the pivot', { c: 'blue', size: 22 }),
              t(510, 240, 'busy 120 + 109', { c: 'red', size: 22 })
            ],
            takeaway: 'A T injection meets the host’s pivot, never a data slot.',
            widget: {
              type: 'stack',
              unit: 'timesteps',
              segments: [
                { label: 'joint measurement with the pivot', v: 120 },
                { label: 'factory still occupied', v: 109 }
              ],
              note: 'One T injection holds the factory for 229 timesteps in all. A T-heavy rotation needs 24 to 94 of these in a row.'
            },
            check: {
              q: 'Which qubit does a T injection measure the magic state with?',
              options: ['The host’s pivot', 'The data qubit being rotated', 'Every qubit on the host', 'The factory’s own pivot'],
              answer: 0,
              why: 'The paper: a T injection measures a magic state jointly with the host’s pivot.'
            }
          },
          {
            title: 'Adding up time and failure',
            buildsOn: 'Four instructions now have their times. Each one, like any physical step, also has a small chance to fail.',
            leadsTo: 'Next section runs one real rotation, which needs many of these instructions on several modules.',
            idea: [
              'Time: an LPU does one instruction at a time, so the instructions on one module add up end to end.',
              'Failure: each use of instruction i fails with a small chance *Pᵢ*. Suppose it is used *Nᵢ* times.',
              'For small, independent chances, the chance that anything fails is about the sum: *Σ Nᵢ Pᵢ*.',
              'So using fewer inter-module measurements makes a run fail less often.'
            ],
            math: [
              { h: 'Why small chances add', eq: ['P(A or B) = P(A) + P(B) − P(A and B)', 'P(A and B) = P(A) P(B), tiny'], why: 'When both are rare, the overlap term is negligible, so the chances just add.' },
              { h: 'A made-up example', eq: ['1,000 uses at 10⁻⁶ → 10⁻³', '200 uses at 10⁻⁵ → 2 × 10⁻³', 'total ≈ 3 × 10⁻³'], why: 'These numbers only show the arithmetic. They are not the paper’s rates.' }
            ],
            sketch: [
              B(40, 70, 120, 50, { c: 'blue' }), B(160, 70, 120, 50, { c: 'blue' }), B(280, 70, 120, 50, { c: 'blue' }),
              t(220, 50, 'one module: times add', { c: 'blue', size: 22 }),
              t(100, 103, '120', { size: 22 }), t(220, 103, '120', { size: 22 }), t(340, 103, '120', { size: 22 }),
              t(520, 103, '= 360', { c: 'blue' }),
              H(150, 190, 340, 50, { c: 'yellow' }),
              t(320, 225, 'failure ≈ Σ Nᵢ Pᵢ', { size: 30 }),
              t(320, 290, 'fewer uses, fewer failures', { c: 'green', size: 22 })
            ],
            takeaway: 'Times add on a module. Failure ≈ Σ Nᵢ Pᵢ over instruction uses.',
            widget: null,
            check: {
              q: 'A compiler halves the number of inter-module measurements and changes nothing else. What happens to failure?',
              options: ['It falls, since that term of Σ Nᵢ Pᵢ halves', 'It doubles', 'It stays the same', 'It falls to zero'],
              answer: 0,
              why: 'Nᵢ for inter-module measurements halves, so its share of the sum halves.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 (background) ============================ */
      {
        title: 'Background: one rotation across modules',
        intro: 'A rotation’s Pauli usually touches qubits on several modules, and each LPU sees only its own. This section builds, one move at a time, how the machine still measures it.',
        bridge: 'You now hold the full lowering of one rotation: split P by module, glue a GHZ chain of pivots to the host, synthesise each piece, then inject T on the host. Section 6 times many rotations together.',
        tabs: [
          {
            title: 'A rotation that spans modules',
            buildsOn: 'Section 4 said a rotation about P is a joint measurement of P with a magic state, and each LPU measures only its own module.',
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
            title: 'Glue the helpers: a GHZ state',
            buildsOn: 'Measuring each piece alone learns too much. Each module has a helper qubit, the pivot, from Section 3.',
            leadsTo: 'Next tab builds that glued state along a line of modules, using inter-module measurements.',
            idea: [
              'Put the pivots of the modules into a *GHZ state*: all 0 and all 1 together, (|00…0⟩ + |11…1⟩)/√2.',
              'Then measure each piece Pₘ jointly with its own pivot, on its own module.',
              'Each module’s answer alone is now a coin flip and says nothing. Multiplied together, they give the answer for P.',
              'So the machine learns the product, and only the product. The data survives.'
            ],
            keys: [
              { tone: 'main', h: 'The idea to keep', t: 'The GHZ glue hides each piece’s answer inside the randomness of the pivots. Only the *product* of the module answers carries information, and it equals the answer for the whole P.' }
            ],
            sketch: [
              ...bx(40, 70, 160, 60, 'P₁ ⊗ pivot', { c: 'blue' }),
              ...bx(240, 70, 160, 60, 'P₂ ⊗ pivot', { c: 'blue' }),
              ...bx(440, 70, 160, 60, 'P₃ ⊗ pivot', { c: 'blue' }),
              K([[120, 140], [220, 175], [320, 140], [420, 175], [520, 140]], { c: 'green', dash: true }),
              t(320, 205, 'pivots glued: GHZ', { c: 'green' }),
              t(120, 250, 'coin', { size: 22 }), t(320, 250, 'coin', { size: 22 }), t(520, 250, 'coin', { size: 22 }),
              t(320, 300, 'product = answer for P', { c: 'green' })
            ],
            takeaway: 'Glued pivots: each answer is random, their product is P’s answer.',
            widget: null,
            check: {
              q: 'With the pivots in a GHZ state, what does one module’s answer alone tell you?',
              options: ['Nothing, it is a coin flip', 'The answer for the whole P', 'The value of α', 'Whether the factory is free'],
              answer: 0,
              why: 'Only the product of all the module answers carries the result.'
            }
          },
          {
            title: 'Building the chain',
            buildsOn: 'The pivots must be glued into a GHZ state. Section 4 said one inter-module measurement joins two neighbouring modules.',
            leadsTo: 'Next tab says where the chain must end, and why it can cross modules that hold none of P.',
            idea: [
              'Glue grows one neighbour at a time. One inter-module measurement joins two neighbouring pivots.',
              'The glued run of modules is the operation’s *chain*. Each neighbouring pair in it is a *link*.',
              'Each link costs one inter-module measurement. A chain of k modules has k − 1 links.'
            ],
            sketch: [
              ...bx(40, 110, 110, 60, 'p'), ...bx(190, 110, 110, 60, 'p'), ...bx(340, 110, 110, 60, 'p'), ...bx(490, 110, 110, 60, 'p'),
              L([[150, 140], [190, 140]], { c: 'green' }), L([[300, 140], [340, 140]], { c: 'green' }), L([[450, 140], [490, 140]], { c: 'green' }),
              t(170, 95, 'link', { c: 'green', size: 20 }), t(320, 95, 'link', { c: 'green', size: 20 }), t(470, 95, 'link', { c: 'green', size: 20 }),
              t(320, 230, '4 modules, 3 links'),
              t(320, 285, 'one inter-module measurement per link', { c: 'green', size: 22 })
            ],
            takeaway: 'A chain of k modules has k − 1 links, one measurement each.',
            widget: null,
            check: {
              q: 'A chain spans 6 neighbouring modules. How many inter-module measurements glue it?',
              options: ['5', '6', '1', '12'],
              answer: 0,
              why: 'k modules in a row have k − 1 neighbouring pairs, one link each.'
            }
          },
          {
            title: 'The chain ends at the host',
            buildsOn: 'A chain is glued pivots on neighbouring modules. Section 4 put the T injection on the host’s pivot.',
            leadsTo: 'Next tab looks inside one module of the chain, where its piece Pₘ must be measured with its pivot.',
            idea: [
              'The T injection happens at the host’s pivot, so the host must be in the GHZ glue.',
              'So the chain runs from the host to the farthest module with Pₘ ≠ I.',
              'Glue only joins neighbours, so the chain also crosses modules between them, even where Pₘ = I.',
              'On the reference machine the host is at the end of the line, so every chain reaches that end.'
            ],
            sketch: [
              ...bx(20, 120, 100, 60, 'P₁=I'),
              ...bx(140, 120, 100, 60, 'P₂≠I', { c: 'blue' }),
              ...bx(260, 120, 100, 60, 'P₃=I'),
              ...bx(380, 120, 100, 60, 'host'),
              ...bx(500, 120, 110, 60, 'factory'),
              H(140, 205, 340, 30, { c: 'mint' }),
              t(310, 228, 'chain: modules 2, 3, host', { size: 22 }),
              t(310, 95, 'crossed but empty', { c: 'red', size: 20 }),
              t(70, 270, 'not in chain', { size: 20 })
            ],
            takeaway: 'The chain runs from the farthest touched module to the host.',
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
            title: 'Not every piece is native',
            buildsOn: 'On each chain module with Pₘ ≠ I, the piece Pₘ is measured jointly with the pivot by an in-module measurement.',
            leadsTo: 'Next tab shows how a non-native piece is measured anyway, using a Clifford gate as a disguise.',
            idea: [
              'An LPU can measure only a few Pauli products directly. These are its *native* Paulis.',
              'Most pieces Pₘ a program needs are not native.',
              'Naive try: just ask the LPU to measure Pₘ. It cannot: that measurement is not in its list.'
            ],
            sketch: [
              ...bx(40, 80, 220, 140, 'native list', { c: 'green' }),
              t(150, 250, 'a few Paulis', { c: 'green', size: 22 }),
              ...bx(380, 120, 200, 60, 'Pₘ', { c: 'red' }),
              L([[300, 150], [370, 150]], { c: 'red', dash: true }),
              t(480, 230, 'not in the list', { c: 'red' }),
              t(320, 40, 'what the LPU can measure directly')
            ],
            takeaway: 'An LPU measures only native Paulis directly. Most pieces are not native.',
            widget: null,
            check: {
              q: 'What does native mean for a Pauli on this machine?',
              options: ['The LPU can measure it directly', 'It acts on the pivot only', 'It needs no magic state', 'It commutes with every other Pauli'],
              answer: 0,
              why: 'Native Paulis are the ones in the LPU’s direct list.'
            }
          },
          {
            title: 'Synthesis and its level',
            buildsOn: 'Most pieces are not native. Section 2 showed a Clifford gate turns one Pauli product into another.',
            leadsTo: 'Next section times a whole rotation, where these synthesis steps turn out to take most of the time.',
            idea: [
              'Pick Clifford steps C that turn Pₘ into a native Pauli N. Apply C, measure N, then undo C.',
              'Measuring N after C asks exactly the Pₘ question. This disguise is called *synthesis*.',
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
          }
        ]
      },

      /* ============================ SECTION 6 (background) ============================ */
      {
        title: 'Background: timing a whole program',
        intro: 'One rotation now has a full recipe. This section times many of them sharing the machine, and builds the baseline the paper compares against.',
        bridge: 'You now hold tasks, busy, held and free modules, per-module clocks, the outcome wait, and the baseline. The paper starts next: Section 7 measures how much of the baseline’s time is lost.',
        tabs: [
          {
            title: 'One rotation as a task',
            buildsOn: 'Section 5 gave one rotation’s recipe: GHZ chain, synthesis on each piece, T injection on the host.',
            leadsTo: 'Next tab asks what a module does while it waits inside a task.',
            idea: [
              'The paper’s model calls one operation a *task*. On each chain module it has a *lead-in*: the synthesis steps C.',
              'Then its share of the joint measurements, then a *tail*: the steps that undo C.',
              'The host also runs the rotation’s *T stream*, its T injections in a row.'
            ],
            sketch: [
              t(60, 70, 'm1', { anchor: 'start' }), t(60, 140, 'm2', { anchor: 'start' }), t(60, 210, 'host', { anchor: 'start' }),
              B(130, 50, 90, 30, { c: 'blue' }), B(220, 50, 60, 30, { c: 'green' }), B(280, 50, 90, 30, { c: 'blue' }),
              B(130, 120, 70, 30, { c: 'blue' }), B(220, 120, 60, 30, { c: 'green' }), B(280, 120, 70, 30, { c: 'blue' }),
              B(130, 190, 60, 30, { c: 'blue' }), B(220, 190, 60, 30, { c: 'green' }), B(370, 190, 220, 30, { c: 'red' }),
              t(480, 260, 'T stream', { c: 'red' }),
              t(250, 300, 'lead-in, joint, tail')
            ],
            takeaway: 'Task = lead-ins, joint measurements and tails, plus the host’s T stream.',
            widget: {
              type: 'stack',
              unit: 'timesteps',
              segments: [
                { label: 'in-module synthesis', v: 2378 },
                { label: 'everything else', v: 179 }
              ],
              note: 'One operation of the 118-qubit adder, run alone, takes 2,557 timesteps. In-module synthesis is 93% of that.'
            },
            check: {
              q: 'What is a task’s lead-in on a module?',
              options: ['The synthesis steps before the joint measurement', 'The T injections', 'The GHZ links', 'Waiting for the factory'],
              answer: 0,
              why: 'The lead-in synthesises the module’s piece. The tail undoes it.'
            }
          },
          {
            title: 'Busy, held, free',
            buildsOn: 'A task has work on several modules, and its parts must line up: joint measurements need every chain module at once.',
            leadsTo: 'Next tab gives each module a clock and says when a new task may start.',
            idea: [
              'A task *holds* each chain module from its first instruction there to its last. No other task may use it meanwhile.',
              'Inside that window a module can wait, for example while the host runs the T stream. It is *held but idle*.',
              'So at any moment a module is *busy* (working), held but idle, or *free* (no task holds it).'
            ],
            sketch: [
              t(60, 80, 'm1', { anchor: 'start' }), t(60, 170, 'host', { anchor: 'start' }),
              B(130, 60, 80, 30, { c: 'green' }), H(210, 60, 230, 30, { c: 'yellow' }), B(210, 60, 230, 30, { c: 'red', dash: true }), B(440, 60, 60, 30, { c: 'green' }),
              B(130, 150, 80, 30, { c: 'green' }), B(210, 150, 290, 30, { c: 'green' }),
              t(170, 120, 'busy', { c: 'green', size: 20 }), t(325, 120, 'held but idle', { c: 'red', size: 20 }), t(560, 80, 'free', { size: 20 }),
              t(355, 220, 'm1 waits for the host’s T stream', { size: 20 }),
              A(130, 280, 600, 280), t(590, 270, 'time', { anchor: 'end', size: 20 })
            ],
            takeaway: 'Busy works. Held but idle waits inside a task. Free has no task.',
            widget: null,
            check: {
              q: 'Module 1 finished its lead-in but must wait for the host’s T stream before its tail. What is it?',
              options: ['Held but idle', 'Busy', 'Free', 'Failed'],
              answer: 0,
              why: 'The task still holds it, but it does no work while it waits.'
            }
          },
          {
            title: 'Every module keeps a clock',
            buildsOn: 'Tasks hold modules and never overlap on one. This tab says when the next task may begin.',
            leadsTo: 'Next tab adds a second reason to wait, the T injection outcome from Section 1.',
            idea: [
              'Each module keeps its own *clock*: the time it becomes free.',
              'A new task needs every module of its chain, so it starts at the *latest* clock among them.',
              'Example: chain modules free at 300, 900 and 500. The task starts at 900. Two modules sit free until then.'
            ],
            sketch: [
              ...bx(40, 60, 160, 56, 'm1: 300'), ...bx(240, 60, 160, 56, 'm2: 900', { c: 'red' }), ...bx(440, 60, 160, 56, 'm3: 500'),
              A(320, 125, 320, 175, { c: 'red' }),
              ...bx(170, 180, 300, 56, 'task starts at 900', { c: 'red' }),
              t(320, 285, 'the slowest module decides')
            ],
            takeaway: 'A task starts when the last module of its chain is free.',
            widget: null,
            check: {
              q: 'A chain’s modules are free at 200, 700 and 400. When can the task start?',
              options: ['700', '200', '400', '1300'],
              answer: 0,
              why: 'It needs all of them, so it waits for the latest clock.'
            }
          },
          {
            title: 'The outcome wait',
            buildsOn: 'A task waits for its modules. Section 1 showed a T injection’s outcome decides a Clifford fix.',
            leadsTo: 'Next tab shows the compiler that the architecture ships with, which orders tasks as written.',
            idea: [
              'A T injection’s outcome sets a Clifford fix. That fix changes the next operation that does not commute with this one.',
              'So that next operation waits for its predecessor’s last T injection outcome: the *outcome wait*.',
              'The architecture’s *cost model* leaves this wait out. The paper adds it into every time it reports.'
            ],
            sketch: [
              ...bx(40, 90, 220, 60, 'o₁: T stream'),
              D(260, 120, { c: 'red' }),
              t(260, 75, 'last outcome', { c: 'red' }),
              A(262, 135, 330, 205, { c: 'red' }),
              ...bx(330, 180, 240, 60, 'o₂ (clashes o₁)', { c: 'blue' }),
              t(450, 280, 'o₂ cannot start earlier'),
              t(130, 230, 'outcome wait', { c: 'red' })
            ],
            takeaway: 'A non-commuting successor waits for the last T outcome.',
            widget: null,
            check: {
              q: 'Which operation must wait for o₁’s last T outcome?',
              options: ['The next operation that does not commute with o₁', 'Every later operation', 'Only operations on the host', 'None, outcomes are instant'],
              answer: 0,
              why: 'The fix changes only operations that do not commute with o₁.'
            }
          },
          {
            title: 'The reference compiler',
            buildsOn: 'Tasks, clocks and outcome waits are the timing rules. Something must still choose where qubits go and the order of tasks.',
            leadsTo: 'Next tab defines how run times are compared, and the baseline every result is measured against.',
            idea: [
              'The *reference compiler* places qubits on modules in index order, 11 per module: the *reference placement*.',
              'It seats each qubit in a slot by index too.',
              'It issues operations in *program order*, and each holds its whole chain while it runs.',
              'Its designers note the scheme forces all Pauli rotations to be performed serially.'
            ],
            sketch: [
              ...bx(40, 60, 160, 56, 'q1 to q11'), ...bx(240, 60, 160, 56, 'q12 to q22'), ...bx(440, 60, 160, 56, 'q23 to q33'),
              t(320, 150, 'index order placement'),
              ...bx(40, 200, 120, 50, 'o₁', { c: 'blue' }), ...bx(180, 200, 120, 50, 'o₂', { c: 'blue' }),
              ...bx(320, 200, 120, 50, 'o₃', { c: 'blue' }),
              A(162, 225, 178, 225), A(302, 225, 318, 225),
              t(540, 232, 'one by one', { c: 'red' })
            ],
            takeaway: 'Reference compiler: index placement, program order.',
            widget: null,
            check: {
              q: 'Under the reference placement, where do qubits 12 to 22 go?',
              options: ['Module 2', 'Module 1', 'Spread over all modules', 'The host'],
              answer: 0,
              why: 'Index order, 11 per module: qubits 1 to 11 on module 1, 12 to 22 on module 2.'
            }
          },
          {
            title: 'Run time, speed-up, baseline',
            buildsOn: 'The reference compiler gives one way to run a program. The paper needs a fair way to compare it with others.',
            leadsTo: 'Next section starts the paper: it times the baseline on 24 programs and asks how much time is lost.',
            idea: [
              '*Run time*: from the first instruction to the last.',
              '*Speed-up*: baseline run time divided by the new run time. 2× means the new run takes half as long.',
              'The *baseline*: the reference compiler on the reference machine, timed with outcome waits added.',
              'The paper checked its timing rules: replaying the reference compiler matches the cost model to the timestep in all 30 cases.'
            ],
            math: [
              { h: 'Speed-up', eq: ['speed-up = baseline time / new time', '1000 / 400 = 2.5×'], why: 'Above 1 is faster than the baseline. Below 1 is slower.' }
            ],
            sketch: [
              B(60, 80, 500, 50, { c: 'red' }),
              t(310, 113, 'baseline: 1000', { c: 'red' }),
              B(60, 170, 200, 50, { c: 'green' }),
              t(160, 203, 'new: 400', { c: 'green' }),
              H(300, 170, 260, 50, { c: 'yellow' }),
              t(430, 203, '1000 / 400 = 2.5×'),
              t(320, 280, 'speed-up over the baseline')
            ],
            takeaway: 'Speed-up = baseline time / new time.',
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

      /* ============================ SECTION 7 (paper) ============================ */
      {
        title: 'The paper: time is the price',
        intro: 'All the background is in place. Here is the paper’s question: bicycle codes save qubits but pay in time, so how much of that time is wasted?',
        bridge: 'You now know the baseline spends most of its run waiting, far above the floor on T-light programs. Section 8 names the four reasons.',
        tabs: [
          {
            title: 'Fewer qubits, more time',
            buildsOn: 'Section 6 ended with the baseline and speed-up. This tab starts the paper with the trade the bicycle machine makes.',
            leadsTo: 'Next tab says which choices a compiler can still make on this machine.',
            idea: [
              'Recap: a rotation is a task on a chain of modules, fed by one factory, timed against the baseline.',
              'The machine uses about 10× fewer physical qubits than the surface code.',
              'But its designers estimate over 10× more time per T gate. So run time decides whether the qubit savings pay off.'
            ],
            sketch: [
              L([[60, 270], [600, 270]]),
              B(130, 90, 100, 180, { c: 'blue' }), B(250, 240, 100, 30, { c: 'blue' }),
              t(240, 60, 'physical qubits', { c: 'blue' }),
              t(180, 300, 'surface'), t(300, 300, 'bicycle'),
              B(410, 240, 70, 30, { c: 'red' }), B(500, 80, 70, 190, { c: 'red' }),
              t(490, 60, 'time per T', { c: 'red' }),
              t(445, 300, 'surface'), t(535, 300, 'bicycle')
            ],
            takeaway: '10× fewer qubits, but over 10× more time per T gate.',
            widget: null,
            check: {
              q: 'Why does the paper focus on run time?',
              options: [
                'Time per T gate is over 10× higher, so time decides if the qubit savings pay off',
                'Bicycle codes use more qubits than the surface code',
                'Run time sets the code distance',
                'Failure probability cannot be measured'
              ],
              answer: 0,
              why: 'The architecture saves qubits but spends time. The paper attacks the time.'
            }
          },
          {
            title: 'What a compiler can still choose',
            buildsOn: 'Run time decides whether the machine wins. Section 5 fixed how each rotation is lowered: chain, synthesis, T injection.',
            leadsTo: 'Next tab finds a time no such choice can beat, the first of two lower bounds.',
            idea: [
              'Earlier compilers for this machine cut logical error or compile time. How operations share modules got little study.',
              'The paper’s compiler, *Paceline*, keeps the lowering of every operation as it is.',
              'It chooses the *placement* (which module each qubit goes to), the *seating* (which slot) and the *schedule* (when each runs).',
              'With several factories it also picks which factory each rotation uses.'
            ],
            sketch: [
              ...bx(40, 70, 170, 60, 'placement', { c: 'blue' }),
              ...bx(235, 70, 170, 60, 'seating', { c: 'green' }),
              ...bx(430, 70, 170, 60, 'schedule', { c: 'red' }),
              t(125, 170, 'which module'), t(320, 170, 'which slot'), t(515, 170, 'when'),
              H(120, 225, 400, 44, { c: 'yellow' }),
              t(320, 256, 'lowering stays the same')
            ],
            takeaway: 'Paceline picks module, slot and start time. Lowering is untouched.',
            widget: null,
            check: {
              q: 'Which of these does Paceline change?',
              options: ['Which slot each qubit takes', 'How each Pauli is synthesised', 'The instruction set', 'The GHZ chain recipe'],
              answer: 0,
              why: 'It keeps the lowering and instruction set, and picks placement, seating and schedule.'
            }
          },
          {
            title: 'Lower bound 1: the host',
            buildsOn: 'Paceline picks placement, seating and schedule. Section 5 said every chain ends at the host, where the T stream runs.',
            leadsTo: 'Next tab gives the second lower bound, from the precedence graph of Section 2.',
            idea: [
              'A *lower bound* is a time no schedule can beat.',
              'Every rotation passes through a factory’s host. The host runs its T stream and at least its cheapest pivot work.',
              'The host does one thing at a time. So the host’s total work per factory is a lower bound on run time.'
            ],
            sketch: [
              ...bx(40, 70, 120, 50, 'rot 1'), ...bx(170, 70, 120, 50, 'rot 2'), ...bx(300, 70, 120, 50, 'rot 3'), ...bx(430, 70, 120, 50, '…'),
              A(100, 125, 280, 185), A(230, 125, 300, 185), A(360, 125, 330, 185), A(490, 125, 360, 185),
              ...bx(230, 190, 180, 56, 'host', { c: 'red' }),
              t(320, 290, 'all of it, one at a time', { c: 'red' })
            ],
            takeaway: 'The host’s total work is a time no schedule can beat.',
            widget: null,
            check: {
              q: 'Why is the host’s total work a lower bound on run time?',
              options: ['Every rotation needs the host, and it does one thing at a time', 'The host is the slowest module', 'The host has no pivot', 'The host runs the precedence graph'],
              answer: 0,
              why: 'All rotations queue through the host, so its work cannot be squeezed below its sum.'
            }
          },
          {
            title: 'Lower bound 2 and the floor',
            buildsOn: 'The host gives one lower bound. Section 2 said the longest path in the precedence graph bounds run time too.',
            leadsTo: 'Next tab measures how far the baseline sits above these bounds.',
            idea: [
              'Bound 2: the longest chain of non-commuting operations, each timed at its cheapest. They must run one after another.',
              'The larger of the two bounds is the *floor*. No placement or order can run faster.',
              'It is not always reachable, but it shows how much time might be won back.'
            ],
            sketch: [
              O(80, 120, 20), O(220, 120, 20), O(360, 120, 20), O(500, 120, 20),
              A(100, 120, 198, 120), A(240, 120, 338, 120), A(380, 120, 478, 120),
              t(290, 70, 'longest non-commuting chain', { c: 'blue' }),
              L([[60, 230], [600, 230]], { dash: true }),
              t(320, 220, 'floor = larger bound', { size: 22 }),
              t(320, 285, 'host work, or this chain', { c: 'red', size: 22 })
            ],
            takeaway: 'Floor = the larger of host work and the longest chain.',
            widget: null,
            check: {
              q: 'Host work is 5,000 timesteps and the longest chain 8,000. What is the floor?',
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
            title: 'Where the time goes',
            buildsOn: 'T-light programs run far above the floor. Section 6 split a module’s time into busy, held but idle, and free.',
            leadsTo: 'Next section traces this waiting to four causes.',
            idea: [
              'On the 118-qubit adder, the average module is busy 32% of the run.',
              'It is held but idle 44% of the run, and free 24%.',
              'Its longest dependency chain is only 8 to 12% of the baseline run time on T-light programs. The rest is waiting.'
            ],
            sketch: [
              H(60, 110, 165, 60, { c: 'mint' }),
              B(60, 110, 165, 60, { c: 'green' }),
              B(225, 110, 226, 60, { c: 'red' }),
              B(451, 110, 124, 60),
              t(142, 148, 'busy 32%', { c: 'green' }),
              t(338, 148, 'held, idle 44%', { c: 'red' }),
              t(513, 148, 'free 24%'),
              t(320, 70, 'average module, 118-qubit adder'),
              t(320, 240, 'longest chain: 8 to 12% of the run', { c: 'blue' })
            ],
            takeaway: 'An average module works a third of the run. The rest is waiting.',
            widget: {
              type: 'stack',
              unit: '%',
              segments: [
                { label: 'busy', v: 32 },
                { label: 'held by an operation, idle', v: 44 },
                { label: 'free', v: 24 }
              ],
              note: 'Average module on the 118-qubit adder under the baseline.'
            },
            check: {
              q: 'On the 118-qubit adder, which share of the run is the largest for an average module?',
              options: ['Held but idle, 44%', 'Busy, 32%', 'Free, 24%', 'All equal'],
              answer: 0,
              why: 'Held but idle is 44%, busy 32%, free 24%.'
            }
          }
        ]
      },

      /* ============================ SECTION 8 (paper) ============================ */
      {
        title: 'The paper: four bottlenecks',
        intro: 'The paper traces the waiting to four causes. Each one is later removed by one step of Paceline.',
        bridge: 'You now hold four bottlenecks: program order, synthesis, load near the host, and the factory itself. Section 9 builds the first two fixes, ordering and seating.',
        tabs: [
          {
            title: 'Why chains are long',
            buildsOn: 'Section 7 found modules held but idle 44% of the run. Section 5 said every chain must reach the host.',
            leadsTo: 'Next tab shows what long chains do to operations run in program order.',
            idea: [
              'On the reference machine the host is at the end of the line, so every chain runs all the way to that end.',
              'Even a rotation on far modules holds every module in between.',
              'So chains are long: 8.4 of 11 modules on average on the adder, 5.2 of 7 on the multiplier.'
            ],
            sketch: [
              B(20, 120, 55, 50), B(80, 120, 55, 50), B(140, 120, 55, 50), B(200, 120, 55, 50), B(260, 120, 55, 50),
              B(320, 120, 55, 50), B(380, 120, 55, 50), B(440, 120, 55, 50), ...bx(500, 120, 55, 50, 'h'),
              ...bx(565, 120, 55, 50, 'F'),
              H(80, 185, 475, 30, { c: 'mint' }),
              t(318, 208, 'one chain, most of the line', { size: 22 }),
              t(108, 100, 'touched', { c: 'blue', size: 20 }),
              t(320, 280, 'adder: 8.4 of 11 modules')
            ],
            takeaway: 'With the factory at the end, chains cover most of the line.',
            widget: null,
            check: {
              q: 'Why does a rotation on module 2 hold modules 3 to 10 on an 11-module adder?',
              options: ['Its chain must reach the host at the end of the line', 'Those modules hold its qubits', 'Synthesis needs them', 'The factory is on module 2'],
              answer: 0,
              why: 'The chain runs from the farthest touched module to the host.'
            }
          },
          {
            title: '1. Program order serialises',
            buildsOn: 'Chains cover most modules. Section 6 said the reference compiler runs operations in program order.',
            leadsTo: 'Next tab looks inside one operation, where synthesis takes most of the time.',
            idea: [
              'Two consecutive operations almost always share a module. In program order, the second waits for the first.',
              'So only 1.19 operations are *in flight*, running at once, on the adder on average. On the multiplier, 1.07.',
              'Yet many of those operations commute. On disjoint chains they could run side by side.'
            ],
            sketch: [
              B(40, 70, 560, 50, { c: 'blue' }),
              t(320, 103, 'o₁ chain: 8.4 of 11 modules', { c: 'blue' }),
              B(100, 160, 500, 50, { c: 'red' }),
              t(350, 193, 'o₂ chain overlaps', { c: 'red' }),
              A(320, 125, 320, 155, { c: 'red' }),
              H(120, 245, 400, 44, { c: 'yellow' }),
              t(320, 276, '1.19 in flight')
            ],
            takeaway: 'Long chains overlap, so program order runs about one op at a time.',
            widget: null,
            check: {
              q: 'Why do operations in program order almost always wait for the one before?',
              options: ['Their long chains almost always share a module', 'Every pair of operations clashes', 'The factory is busy', 'Each needs 94 T gates'],
              answer: 0,
              why: 'Chains cover most modules, so neighbours in the list collide even when they commute.'
            }
          },
          {
            title: '2. Synthesis dominates',
            buildsOn: 'Operations run nearly one at a time. Section 5 said each piece costs its synthesis level in in-module measurements.',
            leadsTo: 'Next tab shows that where qubits sit inside a module changes this cost.',
            idea: [
              'Run alone, an adder operation takes 2,557 timesteps.',
              'In-module synthesis, the lead-ins and tails, is 93% of that.',
              'On T-heavy programs it is only 7 to 15%, because their T streams are so long.'
            ],
            sketch: [
              B(40, 80, 520, 50, { c: 'blue' }),
              B(560, 80, 40, 50),
              t(300, 113, 'synthesis 93%', { c: 'blue' }),
              t(320, 60, 'one adder operation: 2,557 timesteps'),
              B(40, 200, 80, 50, { c: 'blue' }), B(120, 200, 480, 50, { c: 'red' }),
              t(80, 280, '7 to 15%', { c: 'blue', size: 20 }),
              t(360, 233, 'T stream', { c: 'red' }),
              t(320, 180, 'T-heavy operation', { size: 22 })
            ],
            takeaway: 'Synthesis is 93% of an adder operation.',
            widget: null,
            check: {
              q: 'Why is synthesis a smaller share of a T-heavy operation?',
              options: ['Its long T stream takes most of the time', 'T-heavy Paulis are always native', 'T-heavy programs skip synthesis', 'Their chains are empty'],
              answer: 0,
              why: 'With 24 to 94 T injections in a row, the T stream dominates.'
            }
          },
          {
            title: 'Seats set the synthesis cost',
            buildsOn: 'Synthesis is most of a T-light operation. Section 5 said its level depends on which slots a piece touches.',
            leadsTo: 'Next tab removes the program-order wait and finds a new problem near the host.',
            idea: [
              'The reference compiler seats qubits by index, ignoring synthesis level.',
              'Keep the same qubits on the same modules, but seat them by level: total synthesis level drops 28% on the adder, 27% on the multiplier.',
              'A seat never lengthens a chain or moves work between modules, so this win *costs nothing* at run time.'
            ],
            sketch: [
              B(40, 70, 520, 50, { c: 'red' }),
              t(300, 103, 'seated by index', { c: 'red' }),
              A(300, 130, 300, 170),
              B(40, 180, 374, 50, { c: 'green' }),
              t(227, 213, 'seated by level: 28% less', { c: 'green' }),
              t(320, 280, 'same modules, same chains')
            ],
            takeaway: 'Better seats cut synthesis 28%, at no run-time cost.',
            widget: null,
            check: {
              q: 'Why does a better seating cost nothing at run time?',
              options: ['It never lengthens a chain or moves work between modules', 'It removes all T gates', 'It is done by the factory', 'It only changes rotation angles'],
              answer: 0,
              why: 'Seating only picks slots inside the same module.'
            }
          },
          {
            title: '3. Load gathers near the host',
            buildsOn: 'Fix program order and operations overlap. Every chain still ends at the host, from the first tab of this section.',
            leadsTo: 'Next tab shows why balancing total load is still not enough.',
            idea: [
              'Once operations overlap, the busiest module sets the pace.',
              'Every chain runs to the host, so modules near the host carry the most work.',
              'With commutation order, the busiest module’s share rises from 41% to 52% on the adder, and from 26% to 38% on 40 modules.'
            ],
            sketch: [
              B(40, 220, 80, 40), B(140, 190, 80, 70), B(240, 160, 80, 100),
              B(340, 110, 80, 150, { c: 'red' }), B(440, 60, 80, 200, { c: 'red' }),
              ...bx(540, 200, 80, 60, 'F'),
              t(480, 40, 'host', { c: 'red' }),
              t(180, 300, 'far from the factory'),
              t(200, 90, 'busiest: 41% to 52%', { c: 'red' })
            ],
            takeaway: 'Every chain ends at the host, so work piles up next to it.',
            widget: null,
            check: {
              q: 'After overlapping operations, what sets the run time?',
              options: ['The busiest module, near the host', 'The longest program', 'The free modules', 'The first module on the line'],
              answer: 0,
              why: 'Work that overlaps is limited by the module with the most of it.'
            }
          },
          {
            title: 'Total balance is not enough',
            buildsOn: 'Load piles up near the host. The obvious fix is to spread the total work evenly over modules.',
            leadsTo: 'Next tab turns to T-heavy programs, where the limit is the factory itself.',
            idea: [
              'On the multiplier, one placement balanced total load 6% better than another, yet ran 1.16× slower.',
              'In some stretches it piled the active work onto one module, and the operations that needed the factory queued behind it.',
              'The host then sat idle 1.9× longer. Balance must hold over time, not only in total.'
            ],
            sketch: [
              t(160, 45, 'balanced in total', { c: 'green', size: 22 }),
              B(60, 70, 60, 120, { c: 'green' }), B(130, 70, 60, 120, { c: 'green' }), B(200, 70, 60, 120, { c: 'green' }),
              t(480, 45, 'but at one moment', { c: 'red', size: 22 }),
              B(380, 70, 60, 120, { c: 'red' }), B(450, 160, 60, 30), B(520, 160, 60, 30),
              t(410, 215, 'jam', { c: 'red', size: 20 }),
              t(320, 270, 'host idles 1.9× longer', { c: 'red' })
            ],
            takeaway: 'Even total load can still jam one module at one moment.',
            widget: null,
            check: {
              q: 'A placement balances total load better but runs slower. Why?',
              options: ['It piles the work that runs at the same time onto one module', 'It uses fewer T gates', 'It removes the factory', 'It breaks commutation'],
              answer: 0,
              why: 'What matters is the load at each moment, not only the total.'
            }
          },
          {
            title: '4. The factory bounds T-heavy',
            buildsOn: 'Balance over time is a placement problem. On T-heavy programs the limit is the factory itself.',
            leadsTo: 'Next section builds Paceline, starting with the fix for program order.',
            idea: [
              'A T-heavy rotation spends most of its time in its T stream, and each injection holds the single factory.',
              'The factory is busy for up to 98% of the run. With one factory, Paceline reaches only 0.97 to 1.14× here.',
              'The fix is more T supply, which changes the hardware. Even T-light runs end up host-bound: busy 65 to 83%.'
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
              why: 'The T stream fills the factory, so the factory sets the pace.'
            }
          }
        ]
      },

      /* ============================ SECTION 9 (paper) ============================ */
      {
        title: 'The paper: ordering and seating',
        intro: 'Paceline answers the bottlenecks one step each. This section builds the first two: ordering, against program order, and seating, against synthesis cost.',
        bridge: 'You now hold list-scheduled ordering and level-aware seating. Section 10 builds the hardest step, placement, and adds extra factories.',
        tabs: [
          {
            title: 'The pipeline',
            buildsOn: 'Section 8 gave four bottlenecks. Section 7 said Paceline chooses placement, seating, factories and schedule.',
            leadsTo: 'Next tab teaches list scheduling on a classical example, before using it on rotations.',
            idea: [
              'Paceline runs placement first, then seating, then factory choice, then ordering.',
              'That order matters: the order of operations depends on their chains, and the chains depend on the placement.',
              'It builds two placements, runs every step on both, times both, and keeps the faster.'
            ],
            sketch: [
              ...bx(20, 120, 130, 56, 'placement', { c: 'blue' }),
              ...bx(170, 120, 130, 56, 'seating', { c: 'green' }),
              ...bx(320, 120, 130, 56, 'factory'),
              ...bx(470, 120, 150, 56, 'ordering', { c: 'red' }),
              A(150, 148, 168, 148), A(300, 148, 318, 148), A(450, 148, 468, 148),
              t(320, 70, 'two candidates through every step'),
              t(320, 250, 'time both, keep the faster', { c: 'green' })
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
            title: 'List scheduling, classically',
            buildsOn: 'Ordering comes last in the pipeline. Section 2 gave the laundry example of tasks that wait for tasks.',
            leadsTo: 'Next tab defines ready and start for rotations, the two numbers list scheduling needs.',
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
            title: 'Ready and start',
            buildsOn: 'List scheduling needs to know which jobs are ready and when each can begin. Sections 2 and 6 hold both rules.',
            leadsTo: 'Next tab runs the full rule, with ties, on a small example.',
            idea: [
              'An operation is *ready* once every operation with an arrow into it in the precedence graph has been issued.',
              'Its *start* is the latest clock among the modules of its chain, as in Section 6.',
              'It is also no earlier than the T injection outcome it waits for, the outcome wait.'
            ],
            sketch: [
              O(80, 90, 22), O(80, 210, 22), O(260, 150, 22, { c: 'green' }),
              A(100, 100, 238, 142), A(100, 200, 238, 158),
              t(80, 55, 'issued'), t(80, 270, 'issued'),
              t(260, 205, 'ready', { c: 'green' }),
              ...bx(370, 80, 230, 50, 'latest clock: 900'),
              ...bx(370, 170, 230, 50, 'outcome at: 700'),
              t(485, 270, 'start = 900', { c: 'red' })
            ],
            takeaway: 'Ready: predecessors issued. Start: latest clock, after its outcome.',
            widget: null,
            check: {
              q: 'Chain clocks say 900. The awaited T outcome arrives at 1100. When is the start?',
              options: ['1100', '900', '200', '2000'],
              answer: 0,
              why: 'The start is the later of the latest clock and the awaited outcome.'
            }
          },
          {
            title: 'Earliest start first',
            buildsOn: 'Every ready operation now has a start. This tab picks which one to issue.',
            leadsTo: 'Next tab moves to seating, the fix for synthesis cost.',
            idea: [
              'Paceline issues the ready operation with the *earliest start*.',
              'Ties go to the one with the longest remaining path to the end of the program, then to program order.',
              'So an operation whose chain is free runs ahead of one blocked behind a busy module. More operations are in flight.'
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
                  say: 'Suppose o₃ commutes with o₁ and o₂, so it has no arrow into it. Its chain m6 to m8 is free now, so its start is 0.' },
                { t: 'Earliest start first', h: 210, parts: [...bx(40, 40, 250, 50, 'o₁', { c: 'blue' }), ...bx(40, 120, 250, 50, 'o₃', { c: 'green' }),
                    t(460, 100, 'side by side', { c: 'green', size: 24 })],
                  say: 'Paceline issues o₃ now. o₁ and o₃ run at the same time on disjoint chains. o₂ issues when m4 and m5 free up.' }
              ]
            },
            check: {
              q: 'Two ready operations can both start at the same time. Which does Paceline issue first?',
              options: ['The one with the longer remaining path to the end', 'The one with fewer T gates', 'Always the first in program order', 'A random one'],
              answer: 0,
              why: 'Ties go to the longest remaining path, then program order.'
            }
          },
          {
            title: 'Seating as a cost',
            buildsOn: 'Section 8 found seats set the synthesis cost. Placement has already fixed each qubit’s module.',
            leadsTo: 'Next tab finds a good seating by swapping slots.',
            idea: [
              'Paceline first lists the synthesis level of every Pauli on a module’s 12 logical qubits: 4¹² of them, once per code.',
              'A *seating* σ puts a module’s qubits into its 11 slots. σ(Pₘ) is the piece Pₘ as it lands on those slots.',
              'Cost of a seating: Cₘ(σ) = the sum of level(σ(Pₘ)) over every piece the program measures on module m.'
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
            leadsTo: 'Next section builds placement, which decides the modules that seating works inside.',
            idea: [
              '*Local search*: try every swap of two slots, empty slots included. Apply the swap that lowers the cost most.',
              'Repeat until no swap lowers it. Do this from the current seating and from four random ones, and keep the best.',
              'A seat stays inside one module, so each module is searched on its own.'
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
            takeaway: 'Swap slots while total synthesis level falls. Try five starts.',
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
              q: 'Why can Paceline search each module’s seating on its own?',
              options: ['A seat stays inside one module, so module costs add up separately', 'All modules hold the same qubits', 'Seating is done after the run', 'The factory seats the host'],
              answer: 0,
              why: 'Modules are independent, so each Cₘ is minimised by its own local search.'
            }
          }
        ]
      },

      /* ============================ SECTION 10 (paper) ============================ */
      {
        title: 'The paper: placement and factories',
        intro: 'Placement decides which module each qubit goes to. That sets every chain and how work divides over modules. This section builds it from a classical idea, then adds factories.',
        bridge: 'You now hold the whole compiler: ordering, seating, two time-balanced placements and nearest-factory choice. Section 11 asks how much each step buys and whether the results hold.',
        tabs: [
          {
            title: 'Graphs and hypergraphs',
            buildsOn: 'Section 9 seated qubits inside modules. Placement must choose the modules first, and needs a picture of which qubits work together.',
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
            buildsOn: 'Qubits are dots and operations are hyperedges. Section 5 showed every extra module in a chain adds work.',
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
            leadsTo: 'Next tab adds balance rules, so the cut does not pile work on one module.',
            idea: [
              '*Count weights*: every operation weighs 1. Cut as few operations as possible.',
              '*Criticality weights*: an operation weighs more if it has many T gates, or lies on a long path of the precedence graph.',
              'So critical operations get short chains first.'
            ],
            math: [
              { h: 'Criticality weight', eq: ['wⱼ = (1 + tⱼ τT / τ₀)', '   × (longest path through j)', '   / (longest path in program)'], why: 'tⱼ T injections of length τT, on a base length τ₀. Long T streams and critical paths weigh more.' }
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
              options: ['One with many T gates on the longest path', 'One with no T gates', 'One on a single module', 'One at the end of the program'],
              answer: 0,
              why: 'The weight grows with T count and with how long a path passes through it.'
            }
          },
          {
            title: 'Balance in total and over time',
            buildsOn: 'The cut keeps chains short. Section 8 showed total balance alone still jams one module at one moment.',
            leadsTo: 'Next tab places the modules along the line, since the host end is the busiest.',
            idea: [
              'A module’s *load* is the number of operations that touch it. *Whole-run balance*: every load within 10% of its share.',
              'An operation’s *depth* is how far from the start it sits in the precedence graph.',
              '*Windowed balance* cuts the program by depth into four windows of equal size, and applies the 10% bound in each.'
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
              why: 'It applies the 10% bound in each of four depth windows, not only in total.'
            }
          },
          {
            title: 'Ordering modules along the line',
            buildsOn: 'The cut divides qubits into groups. Modules sit on a line with the host at one end, so which group goes where matters.',
            leadsTo: 'Next tab combines these choices into Paceline’s two candidate placements.',
            idea: [
              '*Recursive bisection*: split the line in two, divide the qubits between the halves, repeat on each half.',
              'An operation that already reaches one side pulls its other qubits toward it, to keep its chain short.',
              'Other way: cut into all modules at once, then order them by Sethi et al.’s rule: the least-used module goes farthest from the factory.'
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
              options: ['Farthest from the factory', 'Next to the factory', 'In the middle', 'Anywhere'],
              answer: 0,
              why: 'Busy modules sit near the host so their chains stay short.'
            }
          },
          {
            title: 'Two candidates',
            buildsOn: 'Weights, balance rules and module orders combine in several ways. This tab says which two Paceline builds.',
            leadsTo: 'Next tab changes the hardware itself with extra factories, the fix for bottleneck 4.',
            idea: [
              'Candidate 1: criticality weights, whole-run balance, recursive bisection. It keeps chains of critical operations short.',
              'Candidate 2: count weights, windowed balance, Sethi’s order. It guards the host against bursts of work.',
              'Neither always wins. Both are seated and ordered, and Paceline keeps the faster.'
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
              q: 'Why build two placements instead of one?',
              options: ['Neither dominates: each is faster on some programs', 'One is for T gates only', 'The second checks the first for errors', 'Two factories need two placements'],
              answer: 0,
              why: 'The windowed candidate won on 10 of 28 held-out test cases with room to improve, and on both multipliers.'
            }
          },
          {
            title: 'Extra factories',
            buildsOn: 'Bottleneck 4 was a single busy factory. No compiler step makes one factory faster, so this tab changes the hardware.',
            leadsTo: 'Next section measures every step, with and without extra factories.',
            idea: [
              'Each extra factory adds 823 physical qubits. Two layouts: one factory at each end, or one beside every third module.',
              'Each rotation uses the nearest factory on either side of its support, the one needing fewer links. Ties go to the end one.',
              'Now ordering matters more: independent rotations can use different factories at the same time.'
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
            takeaway: 'Extra factories, 823 qubits each. Each rotation uses the nearest.',
            widget: null,
            check: {
              q: 'With several factories, which one does a rotation use?',
              options: ['The nearest one on either side of its support, needing fewer links', 'Always the end factory', 'The least busy one at run time', 'A random one'],
              answer: 0,
              why: 'Fewer links keeps the chain short and its failure low.'
            }
          }
        ]
      },

      /* ============================ SECTION 11 (paper) ============================ */
      {
        title: 'The paper: results and limits',
        intro: 'The paper tests Paceline on 24 programs, step by step, with and without extra factories, and checks its own model.',
        bridge: 'You can now explain why bicycle machines wait, how Paceline overlaps work, and what extra factories add. The paper’s next step: choose each rotation’s factory by when it becomes free, for long T-heavy programs.',
        tabs: [
          {
            title: 'How it was tested',
            buildsOn: 'Section 10 finished Paceline. Section 6 defined the baseline and speed-up.',
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
              'Ordering alone: 1.25×. Adding seating: 1.48×. Adding placement: 2.16×. Geometric means over T-light programs.',
              'Placement helps most on the 433-qubit adder, the largest machine at 40 modules, which reaches 2.71×.',
              'On T-heavy programs the same steps give only 1.02× on average, since the factory sets the pace.'
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
            buildsOn: 'Paceline runs T-light programs 2.16× faster. Section 4 said failure is about Σ Nᵢ Pᵢ over instruction uses.',
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
            buildsOn: 'Section 10 added extra factories. This tab compares factories alone, Paceline alone, and both.',
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
            buildsOn: 'The speed-ups so far mix design and held-out programs. Section 10 built two placement candidates.',
            leadsTo: 'Next tab checks the timing model itself, and the ordering against exact answers.',
            idea: [
              'Before any held-out run, the authors froze one placement rule. It gave 1.96× on the 4 held-out T-light programs.',
              'A cell has *headroom* if, with the reference placement plus Paceline’s order and seating, it still runs 1.25× above the floor.',
              'Over the 28 held-out cells with headroom, the frozen rule gave 1.94×.',
              'The two candidates, chosen after those runs, give 2.17× and 2.21×, and are never slower than the reference placement.'
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
            buildsOn: 'All run times so far come from the execution model of Section 6. This tab checks that model and the ordering rule.',
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
