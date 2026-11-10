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
        intro: 'Programs on this machine are written with Pauli products. This section builds the gate set: Paulis, when they commute, Clifford gates, and the T gate.',
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
            title: 'T needs a magic state',
            buildsOn: 'Clifford+T circuits can approximate any gate. This tab says where the T gates of an error-corrected machine come from.',
            leadsTo: 'Next section writes a whole program as rotations about Pauli products, which is how this machine sees it.',
            idea: [
              'On protected qubits a T gate is not applied directly. It uses up a *magic state*, a special prepared state.',
              'A *factory* module *distils* magic states: many noisy ones in, fewer clean ones out.',
              'A *T injection* measures a magic state jointly with the qubit. That applies T, up to a *Clifford correction* set by the outcome.'
            ],
            sketch: [
              ...bx(40, 110, 140, 70, 'factory', { c: 'pink' }),
              A(185, 145, 280, 145),
              O(310, 145, 22, { c: 'pink' }),
              t(310, 100, 'magic state', { c: 'pink' }),
              A(335, 145, 420, 145),
              ...bx(430, 110, 150, 70, 'qubit'),
              t(505, 230, 'T applied', { c: 'green' }),
              t(320, 285, 'outcome may ask for a Clifford fix', { c: 'red' })
            ],
            takeaway: 'Each T gate uses one magic state from a factory, via a T injection.',
            widget: null,
            check: {
              q: 'A T injection has run. What can its outcome change?',
              options: [
                'Whether a Clifford correction is needed',
                'Which factory made the magic state',
                'The code distance',
                'Nothing, T injections are deterministic'
              ],
              answer: 0,
              why: 'The injection applies T up to a Clifford correction set by its outcome.'
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
        intro: 'The paper’s machine stores many logical qubits per block and joins blocks in a line. This section builds it piece by piece and lists its four instructions.',
        bridge: 'You now hold modules on a line, each with 11 data slots, a pivot and an LPU, a factory on its host, and four timed instructions. Section 4 runs one rotation on this machine, step by step.',
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
              ...bx(50, 105, 50, 60, 'p', { c: 'pink' }),
              B(110, 105, 40, 60), B(155, 105, 40, 60), B(200, 105, 40, 60), B(245, 105, 40, 60),
              B(290, 105, 40, 60), B(335, 105, 40, 60), B(380, 105, 40, 60), B(425, 105, 40, 60),
              B(470, 105, 40, 60), B(515, 105, 40, 60), B(560, 105, 30, 60, { dash: true }),
              t(75, 60, 'pivot', { c: 'pink' }),
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
            leadsTo: 'Next tab lists the four instructions the machine runs, with their times.',
            idea: [
              'Modules sit on a line. *Couplers* link the LPUs of neighbouring modules only.',
              'A *factory* module distils magic states and connects to one code module, its *host*.',
              'The *reference machine*: M code modules and one factory at the end of the line.'
            ],
            sketch: [
              ...bx(30, 120, 90, 60, 'm1'), ...bx(150, 120, 90, 60, 'm2'), ...bx(270, 120, 90, 60, 'm3'),
              ...bx(390, 120, 90, 60, 'host', { c: 'blue' }),
              ...bx(520, 120, 90, 60, 'factory', { c: 'pink' }),
              L([[120, 150], [150, 150]], { c: 'green' }), L([[240, 150], [270, 150]], { c: 'green' }),
              L([[360, 150], [390, 150]], { c: 'green' }), L([[480, 150], [520, 150]], { c: 'pink' }),
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
            buildsOn: 'The machine is modules on a line with a factory on the host. This tab lists everything that machine can be told to do.',
            leadsTo: 'Next section uses these four instructions to run one rotation across several modules.',
            idea: [
              '*In-module measurement*: a Pauli on one module, through its LPU. *Shift automorphism*: shuffles a module’s qubits so the LPU can reach them.',
              '*Inter-module measurement*: a Pauli product across two neighbours. *T injection*: a magic state measured with the host’s pivot.',
              'Time counts *timesteps*, one per physical gate. Both measurements take 120. A T injection holds the factory 109 more.'
            ],
            keys: [
              { tone: 'main', h: 'How a run fails', t: 'Instruction failures are independent. A run fails with probability about *Σ Nᵢ Pᵢ*, where Nᵢ counts uses of instruction i and Pᵢ is its error rate. Fewer inter-module measurements means fewer failures.' }
            ],
            sketch: [
              ...bx(30, 40, 280, 56, 'in-module: 120', { c: 'blue' }),
              ...bx(330, 40, 280, 56, 'shift automorphism'),
              ...bx(30, 130, 280, 56, 'inter-module: 120', { c: 'green' }),
              ...bx(330, 130, 280, 56, 'T injection', { c: 'pink' }),
              t(470, 225, 'factory busy +109', { c: 'pink' }),
              t(320, 290, 'timesteps: one per physical gate')
            ],
            takeaway: 'Four instructions. Measurements 120 timesteps. T holds the factory longer.',
            widget: null,
            check: {
              q: 'A program uses fewer inter-module measurements. What happens to its failure probability?',
              options: ['It falls, since failure is about Σ Nᵢ Pᵢ', 'It rises', 'It is unchanged', 'It depends only on T injections'],
              answer: 0,
              why: 'Each use of an instruction adds its error rate to the total.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 (background) ============================ */
      {
        title: 'Background: running one rotation',
        intro: 'One rotation may touch qubits on several modules. This section follows it through the machine: chain, synthesis, task, and the reference compiler that runs them all.',
        bridge: 'You now hold the whole execution model and the baseline it is compared against. The paper itself starts next: Section 5 measures where the baseline’s time goes.',
        tabs: [
          {
            title: 'Split the Pauli by module',
            buildsOn: 'Section 3 put 11 program qubits on each module. A rotation’s Pauli product spans qubits on many modules.',
            leadsTo: 'Next tab joins the touched modules into one connected run, the chain, ending at the host.',
            idea: [
              'Write the Pauli as P = P₁ ⊗ P₂ ⊗ P₃ ⊗ …, one piece per module. *Pₘ* acts only on module m.',
              'Pₘ = I means module m holds none of the rotation’s qubits.',
              'Example: P = ZX on module 1, I on module 2, Y on module 3.'
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
            title: 'A chain to the host',
            buildsOn: 'Each module has a piece Pₘ. A rotation needs T injections, which happen only at the host from Section 3.',
            leadsTo: 'Next tab looks inside one module of the chain: how its piece Pₘ is measured.',
            idea: [
              'The *chain* runs over neighbouring modules from the host to the farthest module with Pₘ ≠ I.',
              'It prepares a *GHZ state* on the pivots of the chain. Each neighbouring pair is a *link*: one inter-module measurement.',
              'The chain may cross modules with Pₘ = I. On each module with Pₘ ≠ I, the pivot is measured jointly with Pₘ.'
            ],
            sketch: [
              ...bx(30, 120, 100, 60, 'P₁≠I', { c: 'blue' }),
              ...bx(160, 120, 100, 60, 'P₂=I'),
              ...bx(290, 120, 100, 60, 'P₃≠I', { c: 'blue' }),
              ...bx(420, 120, 100, 60, 'host'),
              ...bx(550, 120, 70, 60, 'F', { c: 'pink' }),
              H(30, 205, 490, 30, { c: 'mint' }),
              t(275, 228, 'chain: 4 modules, 3 links', { size: 22 }),
              L([[130, 150], [160, 150]], { c: 'green' }), L([[260, 150], [290, 150]], { c: 'green' }), L([[390, 150], [420, 150]], { c: 'green' }),
              t(210, 90, 'crossed but empty', { c: 'red' })
            ],
            takeaway: 'The chain runs from the farthest touched module to the host.',
            widget: null,
            check: {
              q: 'The host is module 5 and a rotation touches only module 2. How many modules does its chain hold?',
              options: ['4: modules 2, 3, 4, 5', '1: module 2', '2: modules 2 and 5', '5: every module'],
              answer: 0,
              why: 'The chain runs over neighbours from the farthest touched module to the host.'
            }
          },
          {
            title: 'Synthesis level',
            buildsOn: 'On each touched module the pivot is measured jointly with Pₘ. This tab asks how the LPU measures a Pₘ it cannot measure directly.',
            leadsTo: 'Next tab puts synthesis, joint measurement and T injections together into one timed task.',
            idea: [
              'Only a few Paulis are *native* to the LPU. Every other Pₘ must be *synthesised*.',
              'Synthesis wraps a native measurement in native Clifford rotations, one in-module measurement each, then undoes them.',
              'Their count is the Pauli’s *synthesis level*. It depends on which slots Pₘ touches. On the gross code: 18.5 on average.'
            ],
            sketch: [
              ...bx(30, 120, 120, 60, 'Clifford'),
              ...bx(170, 120, 120, 60, 'native', { c: 'green' }),
              ...bx(310, 120, 120, 60, 'undo'),
              A(150, 150, 168, 150), A(290, 150, 308, 150),
              t(90, 90, 'lead-in', { c: 'blue' }),
              t(370, 90, 'tail', { c: 'blue' }),
              t(530, 130, 'level =', { c: 'red' }),
              t(530, 170, 'measurements', { c: 'red' }),
              H(110, 235, 420, 40, { c: 'yellow' }),
              t(320, 264, 'slots touched set the level')
            ],
            takeaway: 'Synthesis level = in-module measurements spent. Set by the slots.',
            widget: null,
            check: {
              q: 'What decides the synthesis level of a module’s piece Pₘ?',
              options: ['Which slots Pₘ touches', 'How far the module is from the factory', 'The rotation angle', 'How many T gates the rotation needs'],
              answer: 0,
              why: 'The level depends on the slots the Pauli touches.'
            }
          },
          {
            title: 'One operation as a task',
            buildsOn: 'An operation has a chain, and on each module a synthesis level. This tab times all of it as one unit.',
            leadsTo: 'Next tab adds the one wait that ties consecutive operations together, the outcome wait.',
            idea: [
              'The model runs each operation as a *task*. On each module of its chain: a *lead-in*, its share of joint measurements, a *tail*.',
              'The host also runs the rotation’s *T stream*, its T injections.',
              'A task holds each module from its first instruction there to its last. Tasks never overlap on a module.'
            ],
            sketch: [
              t(60, 70, 'm1', { anchor: 'start' }), t(60, 140, 'm2', { anchor: 'start' }), t(60, 210, 'host', { anchor: 'start' }),
              B(130, 50, 90, 30, { c: 'blue' }), B(220, 50, 60, 30, { c: 'green' }), B(280, 50, 90, 30, { c: 'blue' }),
              B(130, 120, 70, 30, { c: 'blue' }), B(220, 120, 60, 30, { c: 'green' }), B(280, 120, 70, 30, { c: 'blue' }),
              B(130, 190, 60, 30, { c: 'blue' }), B(220, 190, 60, 30, { c: 'green' }), B(370, 190, 220, 30, { c: 'pink' }),
              t(480, 260, 'T stream', { c: 'pink' }),
              t(250, 300, 'lead-in, joint, tail')
            ],
            takeaway: 'A task holds each chain module from first to last instruction.',
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
              q: 'Can two tasks use the same module at overlapping times?',
              options: ['No, a task holds the module from its first to its last instruction there', 'Yes, if they commute', 'Yes, if one is a T stream', 'Only on the host'],
              answer: 0,
              why: 'In the model, tasks never overlap on a module.'
            }
          },
          {
            title: 'Waiting for an outcome',
            buildsOn: 'A task ends its T stream on the host. Section 1 said each T injection outcome may call for a Clifford correction.',
            leadsTo: 'Next tab shows the reference compiler, which runs these tasks in written order.',
            idea: [
              'A T injection outcome sets a Clifford correction. That correction changes the next operation that does not commute.',
              'So that next operation waits for the outcome of its predecessor’s last T injection: the *outcome wait*.',
              'The architecture’s *cost model* leaves this wait out. The paper puts it into every time it reports.'
            ],
            sketch: [
              ...bx(40, 90, 220, 60, 'o₁: T stream', { c: 'pink' }),
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
              q: 'Why does the outcome wait matter more with extra factories?',
              options: [
                'It makes program order look faster than it can run, and that error grows when operations could overlap',
                'Extra factories make T injections slower',
                'It applies only to commuting operations',
                'It removes the need for Clifford corrections'
              ],
              answer: 0,
              why: 'The paper says the omission barely matters with one factory, but hides real waits once more work can overlap.'
            }
          },
          {
            title: 'The reference compiler',
            buildsOn: 'Tasks, chains and outcome waits are the execution model. This tab shows how the architecture’s own compiler fills it in.',
            leadsTo: 'Next section starts the paper: it times this baseline on 24 programs and finds where the time goes.',
            idea: [
              'The *reference compiler* places qubits on modules in index order, 11 per module: the *reference placement*.',
              'It issues operations in program order. Each holds its whole chain while it runs.',
              'The *baseline*: this compiler on the reference machine, timed with outcome waits added.'
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
              q: 'Under the reference placement, where do qubits 12 to 22 go?',
              options: ['Module 2', 'Module 1', 'Spread over all modules', 'The host'],
              answer: 0,
              why: 'Index order, 11 per module: qubits 1 to 11 on module 1, 12 to 22 on module 2.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 (paper) ============================ */
      {
        title: 'The paper: time is the price',
        intro: 'With the background in hand, here is the paper’s question. Bicycle codes save qubits but pay in time, so run time decides whether they win.',
        bridge: 'You now know the baseline spends most of its run waiting, far above the floor on T-light programs. Section 6 names the four reasons, each one later removed by a step of Paceline.',
        tabs: [
          {
            title: 'Fewer qubits, more time',
            buildsOn: 'Section 4 ended with the baseline compiler. This tab starts the paper with the trade the bicycle machine makes.',
            leadsTo: 'Next tab names what existing compilers optimise, and the gap the paper fills.',
            idea: [
              'Recap: a bicycle machine runs rotations as tasks on chains of modules, fed by one factory.',
              'It uses about 10× fewer physical qubits than the surface code.',
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
                'Its time per T gate is over 10× higher, so time decides if the qubit savings pay off',
                'Bicycle codes use more qubits than the surface code',
                'Run time sets the code distance',
                'Failure probability cannot be measured'
              ],
              answer: 0,
              why: 'The architecture saves qubits but spends time. The paper attacks the time.'
            }
          },
          {
            title: 'What Paceline decides',
            buildsOn: 'Run time decides whether the machine wins. This tab asks which choices the architecture leaves open to a compiler.',
            leadsTo: 'Next tab gives a lower bound on run time, the floor, to measure how much is being lost.',
            idea: [
              'Earlier compilers for this machine cut logical error or compile time. How operations share modules and the factory got little study.',
              '*Paceline* keeps the architecture’s lowering of every operation unchanged.',
              'It makes three choices: which module each qubit goes to, which slot it takes, and when each operation runs.'
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
              options: ['Which slot each qubit takes', 'How each Pauli is synthesised', 'The instruction set', 'The GHZ chain lowering'],
              answer: 0,
              why: 'It keeps the lowering and instruction set, and picks placement, seating and schedule.'
            }
          },
          {
            title: 'A floor under run time',
            buildsOn: 'Paceline picks placement, seating and schedule. This tab gives a time no such choice can beat.',
            leadsTo: 'Next tab looks inside a baseline run to see what the modules do with the lost time.',
            idea: [
              'Bound 1: every rotation passes through a factory’s host, so the host’s load per factory bounds the run.',
              'Bound 2: the longest chain of non-commuting operations, each at its cheapest. The larger bound is the *floor*.',
              'Baseline T-light programs run 4.4 to 5.7× above the floor. T-heavy ones run within 1.01 to 1.22× of it.'
            ],
            sketch: [
              L([[60, 250], [600, 250]], { dash: true }),
              t(560, 240, 'floor', { anchor: 'end' }),
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
              options: [
                'Little time is left to win by compiling alone',
                'They waste the most time',
                'They have no T gates',
                'The floor is wrong for them'
              ],
              answer: 0,
              why: 'A run near its lower bound has almost no slack for a compiler to recover.'
            }
          },
          {
            title: 'Busy, held, free',
            buildsOn: 'T-light programs run far above the floor. This tab asks what a module is doing during that extra time.',
            leadsTo: 'Next section traces this waiting to four bottlenecks.',
            idea: [
              'On the 118-qubit adder, the average module is busy 32% of the run.',
              'It is held by an operation but idle 44% of the run, and free 24%.',
              'The longest dependency chain is only 8 to 12% of the baseline run time on T-light programs. The rest is waiting.'
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

      /* ============================ SECTION 6 (paper) ============================ */
      {
        title: 'The paper: four bottlenecks',
        intro: 'The paper traces the waiting to four causes. Each one is later removed by one step of Paceline.',
        bridge: 'You now hold four bottlenecks: program order, synthesis, load near the factory, and the factory itself. Section 7 builds Paceline, one step per bottleneck.',
        tabs: [
          {
            title: '1. Program order serialises',
            buildsOn: 'Modules are held but idle 44% of the run. This tab finds the first reason: operations block each other.',
            leadsTo: 'Next tab looks inside one operation, where synthesis takes most of the time.',
            idea: [
              'Each operation holds a long chain: 8.4 of 11 modules on the adder, 5.2 of 7 on the multiplier.',
              'So consecutive operations almost always share a module, and in program order the second waits for the first.',
              'Only 1.19 operations are in flight on average on the adder, 1.07 on the multiplier. Yet many of them commute.'
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
            title: '2. Synthesis dominates each operation',
            buildsOn: 'Operations run nearly one at a time. This tab asks what takes so long inside one of them.',
            leadsTo: 'Next tab shows that overlapping operations moves the problem onto the modules near the factory.',
            idea: [
              'Run alone, an adder operation takes 2,557 timesteps. In-module synthesis is 93% of it.',
              'Synthesis follows the level of each piece Pₘ, which depends on the slots. The reference placement seats by index.',
              'Seating the same qubits on the same modules by level cuts total synthesis level 28% on the adder, 27% on the multiplier.'
            ],
            keys: [
              { tone: 'fix', h: 'A free win', t: 'A seat never lengthens a chain or moves work between modules, so it *costs nothing at run time*. On T-heavy programs, though, synthesis is only 7 to 15% of an operation.' }
            ],
            sketch: [
              B(40, 80, 520, 50, { c: 'blue' }),
              B(560, 80, 40, 50),
              t(300, 113, 'synthesis 93%', { c: 'blue' }),
              t(320, 60, 'one adder operation: 2,557 timesteps'),
              A(300, 150, 300, 190),
              B(40, 200, 374, 50, { c: 'green' }),
              t(227, 233, 'seat by level: 28% less', { c: 'green' }),
              t(520, 233, 'same modules')
            ],
            takeaway: 'Synthesis is 93% of an adder op. Better seats cut it 28%, free.',
            widget: null,
            check: {
              q: 'Why does a better seating cost nothing at run time?',
              options: [
                'It never lengthens a chain or moves work between modules',
                'It removes all T gates',
                'It is done by the factory',
                'It only changes the angle of rotations'
              ],
              answer: 0,
              why: 'Seating only picks slots within the same module.'
            }
          },
          {
            title: '3. Load gathers around the factory',
            buildsOn: 'Overlap removes program-order waiting. Every chain still ends at the host, from Section 4.',
            leadsTo: 'Next tab looks at T-heavy programs, where the factory itself is the limit.',
            idea: [
              'Once operations overlap, the busiest module sets the pace. With an end factory, modules near the host do the most work.',
              'With commutation order, the busiest module’s share rises from 41% to 52% on the adder, 26% to 38% on 40 modules.',
              'Balancing total load is not enough. On the multiplier a placement 6% better balanced ran 1.16× slower.'
            ],
            sketch: [
              B(40, 220, 80, 40), B(140, 190, 80, 70), B(240, 160, 80, 100),
              B(340, 110, 80, 150, { c: 'red' }), B(440, 60, 80, 200, { c: 'red' }),
              ...bx(540, 200, 80, 60, 'F', { c: 'pink' }),
              t(480, 40, 'host', { c: 'red' }),
              t(180, 300, 'far from factory'),
              t(200, 90, 'busiest: 41% to 52%', { c: 'red' })
            ],
            takeaway: 'Every chain ends at the host, so work piles up next to it.',
            widget: null,
            check: {
              q: 'On the multiplier, a placement balanced total load 6% better yet ran 1.16× slower. Why?',
              options: [
                'In some stretches it piled the active work onto one module',
                'It used more T gates',
                'It removed the factory',
                'It broke commutation'
              ],
              answer: 0,
              why: 'The paper finds the host idled 1.9× longer: balance must hold over time, not only in total.'
            }
          },
          {
            title: '4. The factory bounds T-heavy programs',
            buildsOn: 'Load near the host is a placement problem. On T-heavy programs the limit is the factory itself.',
            leadsTo: 'Next section builds Paceline, with one step per bottleneck.',
            idea: [
              'A T-heavy rotation spends most of its time in its T stream. Each injection occupies the single factory.',
              'The factory is busy for up to 98% of the run. With one factory, Paceline reaches only 0.97 to 1.14× here.',
              'The fix is more T supply, which changes the hardware. Even T-light runs end up host-bound: busy 65 to 83%.'
            ],
            sketch: [
              ...bx(40, 110, 130, 70, 'factory', { c: 'pink' }),
              B(200, 120, 400, 50, { c: 'pink' }),
              H(200, 120, 392, 50, { c: 'pink' }),
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

      /* ============================ SECTION 7 (paper) ============================ */
      {
        title: 'The paper: the Paceline compiler',
        intro: 'Paceline answers each bottleneck with one step: ordering, seating, placement, and extra factories for T-heavy work.',
        bridge: 'You now hold Paceline: list-scheduled ordering, level-aware seating, two time-balanced placements and nearest-factory choice. Section 8 asks how much each step buys and whether the results hold.',
        tabs: [
          {
            title: 'The pipeline',
            buildsOn: 'Section 6 gave four bottlenecks. This tab lays out the compiler that answers them, in the order it runs.',
            leadsTo: 'Next tab opens the ordering step, which answers bottleneck 1.',
            idea: [
              'Paceline runs placement first, then seating, then factory choice, then ordering. Order depends on chains, chains on placement.',
              'It builds two placements, seats each by level, gives every rotation its nearest factory, and orders operations.',
              'It times both in the execution model and keeps the faster.'
            ],
            sketch: [
              ...bx(20, 120, 130, 56, 'placement', { c: 'blue' }),
              ...bx(170, 120, 130, 56, 'seating', { c: 'green' }),
              ...bx(320, 120, 130, 56, 'factory', { c: 'pink' }),
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
            title: 'Commutation-aware ordering',
            buildsOn: 'Bottleneck 1 was program order. Section 2 showed any order that keeps the precedence graph’s arrows is valid.',
            leadsTo: 'Next tab fixes the cost inside each operation by choosing slots, answering bottleneck 2.',
            idea: [
              'An operation is *ready* once all its predecessors have issued. Its start is the latest clock on its chain’s modules.',
              'It cannot start before the T outcome it waits for. Paceline issues the ready operation with the earliest start.',
              'Ties go to the longest remaining path to the end, then to program order. This is *list scheduling*.'
            ],
            sketch: [
              ...bx(40, 60, 160, 56, 'o₃: start 900', { c: 'red' }),
              ...bx(40, 140, 160, 56, 'o₄: start 300', { c: 'green' }),
              ...bx(40, 220, 160, 56, 'o₆: start 600'),
              t(120, 40, 'ready list'),
              A(210, 168, 330, 168, { c: 'green' }),
              t(470, 160, 'issue o₄ first', { c: 'green' }),
              t(470, 230, 'o₃ waits for its\nmodules to free up', { c: 'red' })
            ],
            takeaway: 'Issue the ready operation that can start earliest.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Program order: o₂ shares a module with o₁, so it waits, even though they commute.', show: 'o₁ … then o₂' },
                { say: 'o₃ touches only free modules and has no arrow from o₁ or o₂.', show: 'o₃ ready, start = now' },
                { say: 'Paceline issues o₃ ahead of the blocked o₂.', show: 'o₁ and o₃ run side by side' },
                { say: 'o₂ issues as soon as its modules free up.', show: 'more operations in flight' }
              ]
            },
            check: {
              q: 'Two ready operations both can start at the same time. Which does Paceline issue first?',
              options: ['The one with the longer remaining path to the end', 'The one with fewer T gates', 'Always the first in program order', 'A random one'],
              answer: 0,
              why: 'Ties go to the longest remaining path, then program order.'
            }
          },
          {
            title: 'Level-aware seating',
            buildsOn: 'Bottleneck 2 was synthesis, set by the slots each piece Pₘ touches. Placement has already fixed each qubit’s module.',
            leadsTo: 'Next tab returns to placement, the step that answers bottleneck 3.',
            idea: [
              'Paceline tabulates the level of all 4¹² Paulis on a module’s 12 logical qubits, once per code.',
              'A seating σ maps a module’s qubits to its 11 slots. Its cost Cₘ(σ) sums level(σ(Pₘ)) over every piece on module m.',
              'Local search: apply the slot swap that lowers the cost most, repeat until none helps. Try five starts, keep the best.'
            ],
            math: [
              { h: 'The cost of a seating', eq: ['Cₘ(σ) = Σ level(σ(Pₘ))', 'sum over every piece Pₘ on module m'], why: 'It counts the native rotations synthesis spends on module m over the whole program.' },
              { h: 'Why modules are separate', eq: ['C = C₁ + C₂ + C₃ + …'], why: 'A seat stays inside one module, so each Cₘ is minimised on its own.' },
              { h: 'Size of the table', eq: ['4¹² = 16,777,216 Paulis'], why: 'Four choices (I, X, Y, Z) on each of 12 logical qubits.' }
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
            takeaway: 'Swap slots while total synthesis level falls.',
            widget: null,
            check: {
              q: 'Why can Paceline optimise each module’s seating on its own?',
              options: ['A seat stays inside one module, so module costs add up separately', 'All modules have the same qubits', 'Seating is done after the run', 'The factory seats the host'],
              answer: 0,
              why: 'Modules are independent, so each Cₘ is minimised by local search on its own.'
            }
          },
          {
            title: 'Placement as a cut',
            buildsOn: 'Bottleneck 3 was load near the host, a placement problem. This tab writes placement as a known problem from chip design.',
            leadsTo: 'Next tab adds the timing: balance the load over the run, not just in total.',
            idea: [
              'Classical first: in VLSI chip design, *min-cut placement* splits a circuit across regions with few wires between them.',
              'Here each logical qubit is a vertex and each operation a *hyperedge* over its support. A module holds at most 11 vertices.',
              'Cost Σ wⱼ(λⱼ − 1): operation j touches λⱼ modules, and each extra module adds a lead-in, a tail and joint work.'
            ],
            math: [
              { h: 'The cost', eq: ['cost = Σⱼ wⱼ (λⱼ − 1)'], why: 'An operation on one module costs 0. Every extra module it spans adds wⱼ.' },
              { h: 'Example', eq: ['op on 3 modules, weight 2', 'adds 2 × (3 − 1) = 4'] },
              { h: 'Criticality weight', eq: ['wⱼ = (1 + tⱼ τT / τ₀)', '   × (longest path through j)', '   / (longest path in program)'], why: 'tⱼ T gates of length τT on a base length τ₀. Critical, T-heavy operations weigh more.' }
            ],
            sketch: [
              O(80, 120, 14), O(150, 90, 14), O(150, 170, 14), O(400, 110, 14), O(470, 160, 14), O(540, 100, 14),
              E(115, 130, 85, 70, { c: 'blue', dash: true }),
              E(470, 130, 110, 70, { c: 'blue', dash: true }),
              K([[150, 170], [300, 230], [470, 160]], { c: 'red' }),
              t(115, 240, 'module A', { c: 'blue' }),
              t(470, 240, 'module B', { c: 'blue' }),
              t(310, 290, 'cut operation: λ = 2', { c: 'red' }),
              t(320, 40, 'qubits = vertices')
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
            title: 'Balance over time',
            buildsOn: 'The cut keeps chains short. Bottleneck 3 showed total balance is not enough, since work can pile up in stretches.',
            leadsTo: 'Next tab combines these choices into Paceline’s two candidate placements.',
            idea: [
              'A module’s *load* is the number of operations that touch it. *Whole-run balance* keeps every load within 10% of its share.',
              '*Windowed balance* cuts the precedence graph by depth into four equal windows, and applies the same bound in each.',
              'Modules must also be ordered along the line, since the host end is busiest.'
            ],
            sketch: [
              B(40, 70, 560, 50),
              t(320, 103, 'whole run: within 10%'),
              B(40, 180, 140, 50, { c: 'green' }), B(180, 180, 140, 50, { c: 'green' }),
              B(320, 180, 140, 50, { c: 'green' }), B(460, 180, 140, 50, { c: 'green' }),
              t(110, 213, 'w1'), t(250, 213, 'w2'), t(390, 213, 'w3'), t(530, 213, 'w4'),
              t(320, 275, 'each window balanced too', { c: 'green' })
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
            title: 'Two candidates',
            buildsOn: 'Cut weights, balance rules and module orders can be combined in several ways. This tab says which two Paceline builds.',
            leadsTo: 'Next tab changes the hardware itself with extra factories, the answer to bottleneck 4.',
            idea: [
              'Candidate 1: criticality weights, whole-run balance, *recursive bisection* of the line.',
              'Candidate 2: count weights, windowed balance, modules ordered by Sethi et al.’s rule, least-used farthest from the factory.',
              'Neither dominates. Both are seated and ordered, and Paceline keeps the faster.'
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
              why: 'The windowed candidate won on 10 of 28 held-out cells with headroom, and on the two multipliers.'
            }
          },
          {
            title: 'Extra factories',
            buildsOn: 'Bottleneck 4 was a single busy factory. No compiler step makes it faster, so this tab changes the hardware.',
            leadsTo: 'Next section measures every step, with and without extra factories.',
            idea: [
              'Each extra factory adds 823 physical qubits. Two layouts: one factory at each end, or one beside every third module.',
              'Each rotation uses the nearest factory on either side of its support, the one with fewer links. Ties go to the end factory.',
              'Ordering now matters more: independent rotations can use different factories at once.'
            ],
            sketch: [
              ...bx(20, 80, 60, 50, 'F', { c: 'pink' }),
              B(100, 80, 60, 50), B(180, 80, 60, 50), B(260, 80, 60, 50), B(340, 80, 60, 50), B(420, 80, 60, 50),
              ...bx(500, 80, 60, 50, 'F', { c: 'pink' }),
              t(290, 50, 'factory at each end'),
              B(40, 200, 330, 40),
              ...bx(160, 250, 50, 40, 'F', { c: 'pink' }),
              ...bx(310, 250, 50, 40, 'F', { c: 'pink' }),
              t(520, 230, 'one every\nthird module')
            ],
            takeaway: 'Extra factories, each 823 qubits. Each rotation uses the nearest.',
            widget: null,
            check: {
              q: 'With several factories, which one does a rotation use?',
              options: ['The nearest one on either side of its support, needing fewer links', 'Always the end factory', 'The least busy one at run time', 'A random one'],
              answer: 0,
              why: 'Fewer links keeps the chain short and its failure low. Choosing by when a factory is free is future work.'
            }
          }
        ]
      },

      /* ============================ SECTION 8 (paper) ============================ */
      {
        title: 'The paper: results and limits',
        intro: 'The paper tests Paceline on 24 programs, step by step, with and without extra factories, and checks its own model.',
        bridge: 'You can now explain why bicycle machines wait, how Paceline overlaps work, and what extra factories add. Next for the field: choosing each rotation’s factory by when it becomes free, for long T-heavy programs.',
        tabs: [
          {
            title: 'How it was tested',
            buildsOn: 'Section 7 built Paceline. This tab fixes the test bench before any number is read.',
            leadsTo: 'Next tab reads the first result: what each step buys on the reference machine.',
            idea: [
              '24 programs: 6 T-light (four adders, two multipliers) and 18 T-heavy (simulation, QFT, learning, swap-test).',
              'Paceline was designed on 6 of them and *held out* the other 18. Machines have 3 to 40 modules, error rate 10⁻⁴.',
              'Every speed-up is over the baseline. Averages are *geometric means*.'
            ],
            math: [
              { h: 'Geometric mean of speed-ups', eq: ['two programs: 2× and 8×', '√(2 × 8) = √16 = 4×'], why: 'Ratios multiply, so the n-th root of their product is the fair average.' }
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
              q: 'Why hold programs out from the design?',
              options: ['To test on programs the rules were not tuned to', 'Because they were too large', 'To save compile time', 'Because they had no T gates'],
              answer: 0,
              why: 'Held-out programs show whether the rules generalise.'
            }
          },
          {
            title: 'What each step buys',
            buildsOn: 'The bench is fixed. This tab adds Paceline’s steps one at a time on the reference machine, T-light programs.',
            leadsTo: 'Next tab reads the side effect on failure probability and links.',
            idea: [
              'Ordering alone: 1.25×. Adding seating: 1.48×. Adding placement: 2.16× (geometric means over T-light programs).',
              'Placement helps most on the 433-qubit adder, the largest machine (40 modules): 2.71×.',
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
            buildsOn: 'Paceline runs T-light programs 2.16× faster. Section 3 said failure is about Σ Nᵢ Pᵢ over instruction uses.',
            leadsTo: 'Next tab adds extra factories and measures compiler and hardware together.',
            idea: [
              'Paceline’s placement uses 22 to 49% fewer links than the baseline.',
              'Fewer inter-module measurements, so failure probability falls to 0.73 to 0.96 of the baseline’s, 0.88 on average.',
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
            buildsOn: 'Section 7 added extra factories. This tab compares factories alone, Paceline alone, and both.',
            leadsTo: 'Next tab asks whether these numbers can be trusted.',
            idea: [
              'Factories alone help little: T-light 1.00× and 0.99×, T-heavy 1.08× and 1.18×. In program order, operations wait on each other.',
              'Both together, two factories: T-light 2.82×, T-heavy 1.73×.',
              'One every third module: 3.47× and 2.37×, and 5.50× on the 196-qubit TFIM. Failure stays at most 0.2% above the baseline.'
            ],
            sketch: [
              L([[60, 280], [600, 280]]),
              B(90, 255, 70, 25, { c: 'pink' }), B(170, 250, 70, 30, { c: 'blue' }), B(250, 130, 70, 150, { c: 'green' }),
              t(205, 120, 'T-heavy, every third module'),
              t(125, 245, '1.18×', { size: 20 }), t(205, 240, '1.02×', { size: 20 }),
              t(285, 160, '2.37×', { c: 'green' }),
              t(480, 130, 'factories alone', { c: 'pink' }),
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
              options: [
                'In program order, operations still wait on each other, so factories sit idle',
                'Extra factories make more errors',
                'They are too far from the host',
                'They produce no magic states'
              ],
              answer: 0,
              why: 'Factories only pay once operations can overlap, which ordering and placement allow.'
            }
          },
          {
            title: 'Can the numbers be trusted',
            buildsOn: 'The speed-ups come from the execution model and a design made on 6 programs. This tab checks both.',
            leadsTo: 'Next tab runs the whole story once and lists what the paper does not cover.',
            idea: [
              'Held out: a placement rule fixed before the runs gave 1.96× on held-out T-light programs, 1.94× over 28 cells with headroom.',
              'Exact timing of 6 cells: speed-ups 1 to 3% above the model, so the model slightly understates the gains.',
              'On 37 small slices solved exactly, the order is 1.3% above optimal on average, against 4.1% for program order.'
            ],
            keys: [
              { tone: 'x', h: 'Two criteria missed by the fixed rule', t: 'One T-heavy program ran at 0.95×, below the 0.98× limit. Against a 600 s local search it was 19% slower at the 80th percentile, above the 15% limit. The two candidates close most of this gap.' }
            ],
            sketch: [
              ...bx(30, 60, 180, 60, 'held out', { c: 'blue' }),
              ...bx(230, 60, 180, 60, 'exact timing', { c: 'green' }),
              ...bx(430, 60, 180, 60, 'exact order', { c: 'red' }),
              t(120, 170, '1.94×'), t(320, 170, '+1 to 3%'), t(520, 170, '1.3% off'),
              t(320, 260, 'placement: median 5.9 s per cell')
            ],
            takeaway: 'Gains hold on held-out programs, and the model slightly understates them.',
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
            leadsTo: 'Open question: choose each rotation’s factory by when it becomes free, the next step the paper names for long T-heavy programs.',
            idea: [
              'Bicycle machines save qubits but run slowly. Most run time is waiting, for four reasons.',
              'Program order serialises: fix by ordering. Synthesis: fix by seating. Load near the factory: fix by placement. Factory: add more.',
              'Limits: no decoding delay is modelled, all times come from the model, and factory choice ignores when a factory is free.'
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
