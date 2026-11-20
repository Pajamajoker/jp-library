/* Notebook: inside the TandemQEC simulator (parallel_sqc), the event loop, and Engine V2 versus V3.
   Note: a live event-queue stepper widget would suit Section 3 best. It does not exist in the shell,
   so 'steps' and 'frames' are used instead. Code snippets sit in the math panels (monospace). */
(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;

  NB.register({
    id: 'tandemqec-simulator',
    title: 'Inside the simulator',
    subtitle: 'Trace a demo run through the repo and its event loop, and explain what Engine V3 changed.',
    category: 'Papers',
    cover: {
      palette: 5,
      art: [
        L([[0, 70], [100, 70]]),
        D(14, 70, { r: 4 }),
        D(38, 70, { r: 4 }),
        D(70, 70, { r: 4 }),
        K([[14, 60], [26, 38], [38, 60]]),
        K([[38, 60], [54, 26], [70, 60]]),
        B(60, 8, 34, 22),
        A(77, 30, 72, 58)
      ]
    },
    glossary: [
      {
        group: 'The repo and its parts',
        items: [
          { term: 'parallel_sqc', means: 'The shared research repo with the simulator. The paper calls the work TandemQEC; the repo calls it StreamingQEC.' },
          { term: 'simulator', means: 'A program that runs a hardware design as a model and reports when every step starts and ends.' },
          { term: 'hybridqc', means: 'The Python package in src/hybridqc. It builds inputs, runs many simulations and analyses results.' },
          { term: 'engine', means: 'The Rust code that owns the clock: it orders events, hands out resources and records times.', aka: ['Rust engine'] },
          { term: 'hcu_native_rs', means: 'The compiled Python extension. Python calls the Rust engine through it.' },
          { term: 'hcu_native_core', means: 'The Rust crate that holds the engine, under extensions/hcu_native_rust/crates.' },
          { term: 'hcu_evidence_check', means: 'The Rust crate of the independent checker, a separate program that verifies finished runs.' },
          { term: 'worktree', means: 'A second checkout of the same git repo in another folder, with its own branch.' }
        ]
      },
      {
        group: 'The input',
        items: [
          { term: 'request', means: 'The full input of one run: a dict with config and jobs.' },
          { term: 'config', means: 'The hardware and settings part of a request: graph, runtime, policy and sim.' },
          { term: 'jobs', means: 'The work part of a request. Demo 1 has one job with 8 shots.' },
          { term: 'knobs', means: 'The slider values of a demo (Knobs in scenario.py), turned into a request by request().', aka: ['Knobs'] },
          { term: 'node', means: 'A device type in config.graph, with a count num_devices.' },
          { term: 'num_devices', means: 'How many copies of a node exist. Each copy serves one step at a time.' },
          { term: 'decoder slot', means: 'One decoder that can run one decode at a time. Demo 1 sets it as num_devices of CPU_0.' },
          { term: 'edge', means: 'A link between two nodes, with latency_s and bandwidth_Bps.' },
          { term: 'latency_s', means: 'Fixed delay of a link in seconds, paid by every message.', aka: ['latency'] },
          { term: 'bandwidth_Bps', means: 'Link speed in bytes per second. Transfer time adds bytes / bandwidth.', aka: ['bandwidth'] },
          { term: 'DQC_0, DQC_CTRL_0, CPU_0', means: 'Demo 1 nodes: the QPU, its controller, and the decoder pool.' },
          { term: 'QPU', means: 'The quantum processor. It runs the QEC rounds.' },
          { term: 'rounds', means: 'QEC rounds per shot. Demo 1 uses 12.' },
          { term: 'window_rounds', means: 'How many rounds one decoder window reads. Demo 1 uses 6.' },
          { term: 'overlap_rounds', means: 'How many rounds two neighbouring windows share. Demo 1 uses 3.' },
          { term: 'parallel_windows', means: 'In-flight limit: how many windows of one stream may be admitted at once. Demo 1 uses 1.', aka: ['in-flight'] },
          { term: 'backlog_limit', means: 'Bound on the syndrome buffer, the backpressure setting. Demo 1 uses 8.' },
          { term: 'shot', means: 'One full run of the protected circuit. Demo 1 runs 8 shots.' },
          { term: 'stage', means: 'The name of a kind of step, such as QEC_DECODE or init.' },
          { term: 'QEC_READOUT, QEC_SYNDROME_TX', means: 'Per round: read the checks, then send the syndrome over the link.' },
          { term: 'QEC_DECODE, QEC_FEEDBACK_TX', means: 'Per window: decode it, then send the correction back.' },
          { term: 'QEC_CTRL_APPLY, QEC_COMMIT', means: 'Per round: apply the correction at the controller, then commit the round.' },
          { term: 'init, data_readout, logical_result', means: 'Per shot: prepare at the start, read data qubits and report the result at the end.' },
          { term: 'execution graph', means: 'Which steps must finish before others may start.' },
          { term: 'resource graph', means: 'Which devices and links exist and what each step occupies.' },
          { term: 'policy', means: 'The rule that ranks ready steps competing for a resource.' },
          { term: 'operation_fifo_v1', means: 'The FIFO policy of the demos: the step that queued first goes first.', aka: ['FIFO'] },
          { term: 'seed', means: 'Starting number for random draws. Same seed, same run.' },
          { term: 'capacity_pilot.json', means: 'The repo fixture in tests/native/fixtures/quantum_protocol that Demo 1 copies.' }
        ]
      },
      {
        group: 'The algorithm',
        items: [
          { term: 'discrete-event simulation', means: 'Time jumps from one event to the next. Nothing is computed for the empty time between.' },
          { term: 'tick', means: 'The engine unit of time: one picosecond (ps), stored as an integer.' },
          { term: 'event', means: 'A time plus what happens then, such as Complete(decode W1) at 6 µs.' },
          { term: 'event queue', means: 'All future events, kept so the earliest is taken first.' },
          { term: 'min-heap', means: 'A tree where every parent is earlier than its children, so the earliest sits on top.', aka: ['binary heap'] },
          { term: 'Arrival, Complete, Ready', means: 'Event kinds: a job enters, a step ends, a delayed step may now queue.' },
          { term: 'EventKey', means: 'The sort key of an event: (at, phase, sequence), compared in that order.' },
          { term: 'phase', means: 'Tie breaker at equal time: Topology, Completion, Materialization, Arrival, Admission, Dispatch, Accounting.' },
          { term: 'sequence', means: 'An insertion counter, the last tie breaker.' },
          { term: 'ready set', means: 'Steps whose inputs are done and that wait for resources.' },
          { term: 'winner()', means: 'Ranks ready steps that could start now and returns the best one.', aka: ['winner'] },
          { term: 'admit()', means: 'Claims a step’s resources and pushes its Complete event at now + duration.', aka: ['admit'] },
          { term: 'complete()', means: 'Frees a finished step’s resources and readies the steps after it.' },
          { term: 'next_time()', means: 'The earliest time over all event queues. The clock jumps there.' },
          { term: 'now', means: 'The current simulated time inside a session.' }
        ]
      },
      {
        group: 'Running and output',
        items: [
          { term: 'lowering', means: 'Checks a request and turns it into a fixed internal program of steps and resources.' },
          { term: 'prepared model', means: 'The result of lowering. It never changes; each start() reuses it.' },
          { term: 'session', means: 'Live state of one run: clock, queues, ready set, resources.' },
          { term: 'prepare_simulation_obj', means: 'Python call that runs lowering on (config, jobs) and returns the prepared model.' },
          { term: 'start()', means: 'Creates a fresh session with now = 0.' },
          { term: 'step()', means: 'Advances a session by one boundary.' },
          { term: 'step_many', means: 'Calls step many times inside Rust, to save Python overhead.' },
          { term: 'finish()', means: 'Ends a finished session and returns the result with its trace.' },
          { term: 'snapshot()', means: 'Returns the live state: tick, events, ready, running, resources.' },
          { term: 'boundary', means: 'One observable stopping point. It can hold several internal transitions.' },
          { term: 'run_request', means: 'The demo helper in experiments/viz/export.py: prepare, start, step, finish.' },
          { term: 'reservation_trace', means: 'Output rows, one per step on a resource: stage, enqueued_s, start_s, done_s.', aka: ['reservation trace', 'trace'] },
          { term: 'enqueued_s, start_s, done_s', means: 'When a step joined the queue, started service and finished, in seconds.' },
          { term: 'zero-decoder control', means: 'The same run with decode time set to 0, to measure what decoding adds.' },
          { term: 'simulated time', means: 'The clock inside the model. Demo 1 lasts 656.4 µs.' },
          { term: 'host time', means: 'How long the computer takes to run the simulation.' }
        ]
      },
      {
        group: 'Engines',
        items: [
          { term: 'V2', means: 'The previous engine. It made every Demo 1 and Demo 2 number. Now called the reference backend.', aka: ['reference backend', 'reference'] },
          { term: 'V3', means: 'The new engine, the compact backend, default on main since 16 Nov 2026.', aka: ['compact backend', 'compact'] },
          { term: 'Engine V3.3.1', means: 'The current release name of the V3 line on main.' },
          { term: 'SchedulerState', means: 'The V2 state object: large, with many indexes and journals.' },
          { term: 'CompactState', means: 'The V3 state object: dense arrays of live steps plus a shared compiled program.' },
          { term: 'readiness cache', means: 'V3 keeps each ready step’s rank and re-ranks only the dirty ones before a pick.' },
          { term: 'dirty', means: 'Marked as touched by the last change, so its rank must be computed again.' },
          { term: 'microstep', means: 'V2 mode that runs the plain loop, one step at a time. The demos used it.' },
          { term: 'Accelerated', means: 'Optional V2 mode that applied a proven repeating pattern many times in one jump.', aka: ['Accelerated mode'] },
          { term: 'recurrence', means: 'A repeating pattern of steps, like QEC rounds with the same gaps.' },
          { term: 'step_before_inner', means: 'The V3 loop function in execution_compact/kernel/transitions.rs.' },
          { term: 'digest', means: 'A fingerprint (hash) of all service records. Equal digests mean equal records.' },
          { term: 'GF multiplier', means: 'Large benchmark circuit: a multiplier over the finite field GF(2¹⁰), with QEC.', aka: ['GF'] },
          { term: 'Ising', means: 'Benchmark circuit from a physics spin model. The slowest of the three tests.' },
          { term: 'checkpoint', means: 'A saved copy of a run’s state so it can continue after a crash. Linux only (DMTCP).', aka: ['checkpoints'] },
          { term: 'independent checker', means: 'A separate program that re-derives the rules and verifies a finished run.', aka: ['checker'] },
          { term: 'trace analyzer', means: 'V3.3 tool that summarises long runs: resource use, backlog, latency, episodes.', aka: ['analyzer'] },
          { term: 'NERSC', means: 'A US national supercomputing centre where the team runs large campaigns.' },
          { term: 'Shuwen', means: 'Lab member who asked for the algorithm and the engine update to be presented.' },
          { term: 'Panayiotis', means: 'Owner of parallel_sqc. Merged Engine V3.3.1 into main.' }
        ]
      }
    ],
    sections: [
      /* ============================ SECTION 1 ============================ */
      {
        title: 'The repo and its parts',
        intro: 'The TandemQEC paper and both demos run on one simulator in the parallel_sqc repo. This section names its parts and how a demo reaches them.',
        bridge: 'Every run starts from one input object, the request. Section 2 opens it field by field, using the Demo 1 baseline.',
        tabs: [
          {
            title: 'Why a simulator',
            buildsOn: 'The TandemQEC paper asked how many decoder slots, how much link speed and how much buffer room a QEC system needs.',
            leadsTo: 'Next, what the simulator actually computes: times on a timeline, not quantum states.',
            idea: [
              'The paper asks sizing questions: how many *decoder slots*, how fast a link, how much buffer room.',
              'Building hardware for every design is impossible. A *simulator* runs each design as a model instead.',
              'Demo 1 swept decoder speed, latency and in-flight windows. Demo 2 ran 1 to 32 streams. Each point was one simulator run.'
            ],
            sketch: [
              B(30, 40, 150, 50), T(105, 73, 'decoder slots', { anchor: 'middle', size: 20 }),
              B(30, 135, 150, 50), T(105, 168, 'link speed', { anchor: 'middle', size: 20 }),
              B(30, 230, 150, 50), T(105, 263, 'buffer room', { anchor: 'middle', size: 20 }),
              A(185, 65, 270, 150), A(185, 160, 270, 160), A(185, 255, 270, 170),
              B(275, 120, 150, 80), T(350, 168, 'simulator', { anchor: 'middle', size: 24 }),
              A(430, 160, 500, 160),
              H(505, 132, 120, 40, { c: 'yellow' }), T(565, 160, 'job time', { anchor: 'middle', size: 22, c: 'green' }),
              T(565, 215, '+ waits', { anchor: 'middle', size: 20 })
            ],
            takeaway: 'One simulator run answers one design question.',
            widget: null,
            check: {
              q: 'Why does the sizing study use a simulator?',
              options: [
                'Trying every decoder, link and buffer design on real hardware is not feasible',
                'Simulators compute the logical error rate exactly',
                'Real QPUs cannot run QEC rounds',
                'The decoder code only runs inside the simulator'
              ],
              answer: 0,
              why: 'Each design point becomes a cheap program run instead of new hardware.'
            }
          },
          {
            title: 'Timing, not physics',
            buildsOn: 'A simulator replaces hardware for the sizing questions from the paper. This tab says which part of reality it copies.',
            leadsTo: 'Next, the two languages the repo uses for this timing work, and which one owns the clock.',
            idea: [
              'The simulator never stores α and β. It does not compute amplitudes or error rates.',
              'Inputs are *durations*: a decode takes 2.2 µs, a link adds 1 µs of latency.',
              'Outputs are *start* and *end* times for every step, so you can see who waited and for how long.'
            ],
            keys: [
              { tone: 'main', h: 'What the simulator answers', t: 'When does each step start and end, which resource was busy, and how long did work wait? It does not say whether a decoder found the right correction.' }
            ],
            sketch: [
              O(130, 150, 70),
              L([[75, 95], [185, 205]], { c: 'red' }), L([[185, 95], [75, 205]], { c: 'red' }),
              T(130, 260, 'amplitudes', { anchor: 'middle', size: 22 }),
              L([[300, 240], [610, 240]]),
              B(320, 185, 110, 30, { c: 'blue' }), T(330, 175, 'decode', { size: 18, c: 'blue' }),
              B(440, 135, 90, 30, { c: 'green' }), T(450, 125, 'link', { size: 18, c: 'green' }),
              B(540, 185, 60, 30, { c: 'blue' }),
              T(455, 285, 'start, end times', { anchor: 'middle', size: 22 })
            ],
            takeaway: 'It simulates time and busy resources, not quantum states.',
            widget: null,
            check: {
              q: 'Which of these can the simulator report?',
              options: [
                'When each decode started and ended',
                'The amplitudes of the logical qubit after each round',
                'Whether the decoder picked the right correction',
                'The physical error rate of the QPU'
              ],
              answer: 0,
              why: 'It tracks timing and resource use only.'
            }
          },
          {
            title: 'Python on top, Rust underneath',
            buildsOn: 'The simulator turns durations into start and end times. Someone must build the inputs and someone must run the clock.',
            leadsTo: 'Next, the folders where each of these two parts lives in the repo.',
            idea: [
              'The Python package *hybridqc* builds inputs, runs many simulations and analyses results.',
              'The *engine* is Rust code that owns the clock: it orders events, hands out resources and records times.',
              'Python calls the engine through a compiled extension, *hcu_native_rs*. There is no backup simulator in Python.'
            ],
            sketch: [
              B(170, 30, 300, 80), T(320, 66, 'Python: hybridqc', { anchor: 'middle', size: 24 }),
              T(320, 96, 'build, run many, analyse', { anchor: 'middle', size: 18 }),
              A(260, 115, 260, 195), T(250, 160, 'request', { anchor: 'end', size: 20, c: 'blue' }),
              A(380, 195, 380, 115), T(390, 160, 'trace', { size: 20, c: 'green' }),
              T(455, 190, 'via hcu_native_rs', { size: 16 }),
              B(170, 200, 300, 80, { c: 'red' }), T(320, 236, 'Rust engine', { anchor: 'middle', size: 24, c: 'red' }),
              T(320, 266, 'owns the clock', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Python prepares and analyses. The Rust engine runs the clock.',
            widget: null,
            check: {
              q: 'A demo script changes the decoder slot count. Where is the resulting waiting time computed?',
              options: [
                'In the Rust engine',
                'In the Python demo script',
                'In the HTML demo page',
                'In a Python fallback simulator'
              ],
              answer: 0,
              why: 'Python only builds the request. The engine computes all times.'
            }
          },
          {
            title: 'The folders',
            buildsOn: 'The repo has a Python layer that prepares runs and a Rust engine that runs the clock.',
            leadsTo: 'Next, the path one run takes through these folders, from inputs to a finished trace.',
            idea: [
              '*src/hybridqc/*: Python models, input building, the wrapper around the engine, and analysis.',
              '*extensions/hcu_native_rust/*: the engine crate hcu_native_core, the Python bridge, and the checker crate.',
              '*experiments/*: study scripts, including our demo1-single-job and demo2-scale-out. *tests/native/fixtures/*: small inputs.'
            ],
            sketch: [
              T(40, 50, 'parallel_sqc/', { size: 24 }),
              L([[60, 62], [60, 280]]),
              L([[60, 100], [90, 100]]), T(100, 108, 'src/hybridqc', { size: 22, c: 'blue' }), T(330, 108, 'Python side', { size: 18 }),
              L([[60, 160], [90, 160]]), T(100, 168, 'extensions/hcu_native_rust', { size: 22, c: 'red' }), T(430, 168, 'Rust engine', { size: 18 }),
              L([[60, 220], [90, 220]]), T(100, 228, 'experiments', { size: 22, c: 'green' }), T(330, 228, 'demo scripts', { size: 18 }),
              L([[60, 280], [90, 280]]), T(100, 288, 'tests/native/fixtures', { size: 22 }), T(400, 288, 'small inputs', { size: 18 })
            ],
            takeaway: 'Python in src, the engine in extensions, demos in experiments.',
            widget: null,
            check: {
              q: 'Where does the code that decides when a decode starts live?',
              options: [
                'extensions/hcu_native_rust',
                'src/hybridqc/analysis',
                'experiments/demo1-single-job',
                'tests/native/fixtures'
              ],
              answer: 0,
              why: 'Timing decisions are made in the Rust engine crate.'
            }
          },
          {
            title: 'One run, end to end',
            buildsOn: 'The folders split the work: Python in src/hybridqc, the engine in extensions/hcu_native_rust.',
            leadsTo: 'Next, where our two demos enter this pipeline and which functions they call.',
            idea: [
              'A *request* describes the hardware and the jobs. *Lowering* checks it and turns it into a fixed internal program.',
              'That program is the *prepared model*. Starting it gives a fresh *session*: live state with the clock at zero.',
              'Stepping the session to the end gives the *reservation trace*: one row per step, with its times.'
            ],
            sketch: [
              T(70, 95, 'dict', { anchor: 'middle', size: 16 }),
              B(20, 120, 100, 70), T(70, 162, 'request', { anchor: 'middle', size: 20 }),
              A(122, 155, 143, 155),
              B(145, 120, 100, 70), T(195, 162, 'lowering', { anchor: 'middle', size: 20 }),
              A(247, 155, 268, 155),
              B(270, 120, 100, 70), T(320, 162, 'prepared', { anchor: 'middle', size: 20 }),
              A(372, 155, 393, 155),
              B(395, 120, 100, 70), T(445, 162, 'session', { anchor: 'middle', size: 20 }),
              A(497, 155, 518, 155),
              B(520, 120, 100, 70, { c: 'green' }), T(570, 162, 'trace', { anchor: 'middle', size: 20, c: 'green' }),
              T(445, 230, 'Rust clock', { anchor: 'middle', size: 18, c: 'red' })
            ],
            takeaway: 'request → lowering → prepared model → session → trace.',
            widget: null,
            math: [
              {
                h: 'The same pipeline in Python',
                eq: [
                  'prep = engine.prepare_simulation_obj(cfg, jobs)',
                  's = prep.start()',
                  'while not s.snapshot()["terminal"]: s.step_many(10000)',
                  'result = s.finish()'
                ],
                why: 'This is what run_request in experiments/viz/export.py does.'
              }
            ],
            check: {
              q: 'What does start() create?',
              options: [
                'A fresh session with live state and the clock at zero',
                'The request dict',
                'The finished reservation trace',
                'A new compiled copy of the Rust engine'
              ],
              answer: 0,
              why: 'Each start() gives new state. The prepared model stays unchanged.'
            }
          },
          {
            title: 'Where the demos plug in',
            buildsOn: 'One run goes request, lowering, prepared model, session, trace.',
            leadsTo: 'The bridge to Section 2: the request the demo builds, opened field by field.',
            idea: [
              'experiments/demo1-single-job/scenario.py: *request(knobs, template)* turns slider values (*knobs*) into a request.',
              'experiments/viz/export.py: *run_request* prepares, starts, steps and finishes one run.',
              'The demo pages only draw saved JSON. No simulation runs in the browser.'
            ],
            sketch: [
              B(20, 40, 150, 60), T(95, 78, 'knobs', { anchor: 'middle', size: 22 }),
              A(95, 105, 95, 140),
              B(20, 145, 150, 60), T(95, 183, 'request()', { anchor: 'middle', size: 22, c: 'blue' }),
              A(175, 175, 235, 175),
              T(325, 125, 'engine runs here', { anchor: 'middle', size: 18, c: 'red' }),
              B(240, 145, 170, 60), T(325, 183, 'run_request()', { anchor: 'middle', size: 20, c: 'blue' }),
              A(415, 175, 465, 175),
              B(470, 145, 140, 60), T(540, 183, 'JSON', { anchor: 'middle', size: 22 }),
              A(540, 210, 540, 245),
              B(470, 250, 140, 50, { c: 'green' }), T(540, 283, 'demo page', { anchor: 'middle', size: 20, c: 'green' })
            ],
            takeaway: 'Demos build a request, run it, save JSON, then draw it.',
            widget: null,
            math: [
              {
                h: 'Demo 1 baseline knobs (Knobs defaults)',
                eq: [
                  'decode_us=2.2   decoder_slots=1',
                  'link_latency_us=1.0   link_gbps=1.0',
                  'in_flight=1   backlog=8   shots=8',
                  'rounds=12  window_rounds=6  overlap_rounds=3'
                ],
                why: 'From the Knobs dataclass in experiments/demo1-single-job/scenario.py.'
              }
            ],
            check: {
              q: 'You move a slider on the Demo 2 page. What happens?',
              options: [
                'The page shows a different saved run. Nothing is simulated in the browser',
                'The browser calls the Rust engine',
                'Python reruns the engine live',
                'The page interpolates between amplitudes'
              ],
              answer: 0,
              why: 'Pages only draw JSON that the scripts saved earlier.'
            }
          }
        ]
      },

      /* ============================ SECTION 2 ============================ */
      {
        title: 'The input: a request',
        intro: 'A request is a nested dict with two keys, config and jobs. This section reads the Demo 1 baseline request.',
        bridge: 'A request lists work and resources but no start times. Section 3 builds the algorithm that computes those times.',
        tabs: [
          {
            title: 'config and jobs',
            buildsOn: 'Section 1 ended with request(knobs, template) building the input for one run.',
            leadsTo: 'Next, the first part of config: the hardware, written as a graph of nodes.',
            idea: [
              'A *request* is a dict. *config* says what hardware exists and how it behaves. *jobs* says what work to run.',
              'config holds graph (hardware), runtime (QEC and scheduler settings), policy (who goes first) and sim (seed).',
              'Demo 1 copies a repo fixture, *capacity_pilot.json*, and overwrites only the knob fields.'
            ],
            sketch: [
              B(20, 30, 600, 270), T(40, 62, 'request', { size: 24 }),
              B(40, 80, 330, 200, { c: 'blue' }), T(55, 110, 'config', { size: 22, c: 'blue' }),
              T(70, 150, 'graph', { size: 20 }), T(200, 150, 'hardware', { size: 16 }),
              T(70, 185, 'runtime', { size: 20 }), T(200, 185, 'QEC, scheduler', { size: 16 }),
              T(70, 220, 'policy', { size: 20 }), T(200, 220, 'who goes first', { size: 16 }),
              T(70, 255, 'sim', { size: 20 }), T(200, 255, 'seed', { size: 16 }),
              B(400, 80, 200, 200, { c: 'red' }), T(415, 110, 'jobs', { size: 22, c: 'red' }),
              T(420, 160, 'job 1', { size: 20 }), T(420, 195, '8 shots', { size: 18 })
            ],
            takeaway: 'request = config (hardware, settings) + jobs (work).',
            widget: null,
            check: {
              q: 'Which part of the request says how many decoder slots exist?',
              options: ['config', 'jobs', 'the reservation trace', 'the demo page'],
              answer: 0,
              why: 'Hardware lives in config, under graph.'
            }
          },
          {
            title: 'Hardware as a graph',
            buildsOn: 'config.graph is the hardware part of the request, next to runtime, policy and sim.',
            leadsTo: 'Next, the edges between these nodes, which carry latency and bandwidth.',
            idea: [
              'Each *node* is a device type with a count, *num_devices*. Each copy can serve one step at a time.',
              'Demo 1: DQC_0 is the *QPU*, DQC_CTRL_0 its controller, CPU_0 the decoder pool.',
              'The decoder_slots knob sets CPU_0 num_devices. One *decoder slot* means one decode at a time.'
            ],
            sketch: [
              O(110, 160, 60), T(110, 155, 'DQC_0', { anchor: 'middle', size: 20 }), T(110, 182, 'QPU', { anchor: 'middle', size: 16 }),
              O(320, 160, 60), T(320, 155, 'DQC_CTRL_0', { anchor: 'middle', size: 16 }), T(320, 182, 'controller', { anchor: 'middle', size: 16 }),
              T(530, 80, 'decoder slots', { anchor: 'middle', size: 18, c: 'blue' }),
              O(530, 160, 60, { c: 'blue' }), T(530, 155, 'CPU_0', { anchor: 'middle', size: 20, c: 'blue' }), T(530, 182, 'decoders', { anchor: 'middle', size: 16 }),
              H(455, 248, 150, 36, { c: 'yellow' }), T(530, 273, 'num_devices = 1', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Decoder slots = num_devices of the CPU_0 node.',
            widget: null,
            check: {
              q: 'In Demo 1, what does setting decoder_slots to 2 change?',
              options: [
                'CPU_0 num_devices becomes 2, so two decodes can run at once',
                'Each decode becomes twice as fast',
                'The link gets a second lane',
                'The QPU runs two rounds at once'
              ],
              answer: 0,
              why: 'scenario.py writes the knob into num_devices of CPU_0.'
            }
          },
          {
            title: 'Links: latency plus size over speed',
            buildsOn: 'The nodes are DQC_0, DQC_CTRL_0 and CPU_0, each with a device count.',
            leadsTo: 'Next, the QEC settings in config.runtime, which decide how many transfers and decodes there are.',
            idea: [
              'An *edge* joins two nodes and has *latency_s* and *bandwidth_Bps* (bytes per second).',
              'Transfer time = latency + bytes / bandwidth. Demo 1 link between DQC_CTRL_0 and CPU_0: 1 µs and 1 GB/s.',
              'A 1024 byte syndrome takes 1 + 1.024 = 2.024 µs. A 256 byte feedback takes 1.256 µs.'
            ],
            sketch: [
              B(30, 110, 150, 70), T(105, 152, 'DQC_CTRL_0', { anchor: 'middle', size: 18 }),
              B(460, 110, 150, 70, { c: 'blue' }), T(535, 152, 'CPU_0', { anchor: 'middle', size: 20, c: 'blue' }),
              A(185, 130, 455, 130, { c: 'red' }), T(320, 115, 'syndrome 1024 B', { anchor: 'middle', size: 18, c: 'red' }),
              A(455, 165, 185, 165, { c: 'green' }), T(320, 195, 'feedback 256 B', { anchor: 'middle', size: 18, c: 'green' }),
              H(110, 238, 420, 40, { c: 'yellow' }), T(320, 265, 'time = latency + bytes / bandwidth', { anchor: 'middle', size: 20 })
            ],
            takeaway: 'Link time = latency + bytes / bandwidth.',
            widget: null,
            math: [
              { h: 'Syndrome transfer', eq: ['1024 B / 1e9 B/s = 1.024 µs', '1 µs + 1.024 µs = 2.024 µs'] },
              { h: 'Feedback transfer', eq: ['256 B / 1e9 B/s = 0.256 µs', '1 µs + 0.256 µs = 1.256 µs'] },
              {
                h: 'Checked against the Demo 1 baseline run',
                eq: ['96 syndrome transfers: 194.304 µs in total', '194.304 / 96 = 2.024 µs each', '32 feedbacks: 40.192 / 32 = 1.256 µs each'],
                why: 'Totals are stage_service_time_s from the baseline result on the V2 engine.'
              }
            ],
            check: {
              q: 'Latency 1 µs, bandwidth 1 GB/s. How long does a 2048 byte message take?',
              options: ['3.048 µs', '2.048 µs', '1 µs', '2.024 µs'],
              answer: 0,
              why: '1 µs + 2048 B / 1e9 B/s = 1 + 2.048 = 3.048 µs.'
            }
          },
          {
            title: 'QEC settings',
            buildsOn: 'Links turn message sizes into transfer times. The QEC settings decide how many messages there are.',
            leadsTo: 'Next, how these settings turn one job into named stages, each one a kind of step.',
            idea: [
              'config.runtime.qec holds *rounds* per shot (12), *window_rounds* (6) and *overlap_rounds* (3).',
              'Windows start every 6 − 3 = 3 rounds: at rounds 0, 3, 6 and 9. So each *shot* has 4 decoder windows.',
              '*parallel_windows* is the in-flight limit (1). *backlog_limit* (8) bounds the syndrome buffer.'
            ],
            sketch: [
              L([[40, 90], [600, 90]]),
              T(40, 75, 'round 0', { size: 16 }), T(600, 75, '12', { anchor: 'end', size: 16 }),
              L([[40, 130], [320, 130]], { c: 'blue' }), T(45, 123, 'W1', { size: 16, c: 'blue' }),
              L([[180, 165], [460, 165]], { c: 'red' }), T(185, 158, 'W2', { size: 16, c: 'red' }),
              L([[320, 200], [600, 200]], { c: 'blue' }), T(325, 193, 'W3', { size: 16, c: 'blue' }),
              L([[460, 235], [600, 235]], { c: 'red' }), T(465, 228, 'W4', { size: 16, c: 'red' }),
              H(140, 262, 360, 40, { c: 'yellow' }), T(320, 290, 'stride = 6 − 3 = 3 rounds', { anchor: 'middle', size: 20 })
            ],
            takeaway: 'Windows of 6 rounds every 3 rounds give 4 windows per shot.',
            widget: null,
            math: [
              {
                h: 'Window starts',
                eq: ['stride = window_rounds − overlap_rounds', 'stride = 6 − 3 = 3', 'starts: 0, 3, 6, 9 (all below 12)', 'windows per shot = 4'],
                why: 'The last window is cut short at round 12, so it reads rounds 9 to 11.'
              },
              {
                h: 'Whole job',
                eq: ['8 shots × 12 rounds = 96 rounds', '8 shots × 4 windows = 32 windows'],
                why: 'The run reports 96 QEC_SYNDROME_TX and 32 QEC_DECODE steps.'
              }
            ],
            check: {
              q: 'rounds = 12, window_rounds = 4, overlap_rounds = 2. How many windows per shot?',
              options: ['6', '3', '4', '12'],
              answer: 0,
              why: 'stride = 2, so windows start at 0, 2, 4, 6, 8 and 10.'
            }
          },
          {
            title: 'A job becomes stages',
            buildsOn: 'The QEC settings fix 96 rounds and 32 windows for the 8 shots of Demo 1.',
            leadsTo: 'Next, the two conditions a step must meet before it can start.',
            idea: [
              'Lowering expands the job into steps. Each step has a *stage* name, a duration and the resources it needs.',
              'Per round: QEC_READOUT, QEC_SYNDROME_TX, QEC_CTRL_APPLY, QEC_COMMIT. Per window: QEC_DECODE, QEC_FEEDBACK_TX.',
              'Per shot: init at the start, data_readout and logical_result at the end, plus two barrier steps.'
            ],
            sketch: [
              B(20, 50, 170, 50), T(105, 82, 'QEC_READOUT', { anchor: 'middle', size: 16 }),
              A(195, 75, 230, 75),
              B(235, 50, 190, 50), T(330, 82, 'QEC_SYNDROME_TX', { anchor: 'middle', size: 16, c: 'red' }),
              A(430, 75, 465, 75),
              B(470, 50, 150, 50, { c: 'blue' }), T(545, 82, 'QEC_DECODE', { anchor: 'middle', size: 16, c: 'blue' }),
              A(545, 105, 545, 160),
              B(450, 165, 170, 50), T(535, 197, 'QEC_FEEDBACK_TX', { anchor: 'middle', size: 15, c: 'green' }),
              A(445, 190, 410, 190),
              B(220, 165, 185, 50), T(312, 197, 'QEC_CTRL_APPLY', { anchor: 'middle', size: 16 }),
              A(215, 190, 180, 190),
              B(20, 165, 155, 50), T(97, 197, 'QEC_COMMIT', { anchor: 'middle', size: 16 }),
              T(320, 270, 'per round ×96, per window ×32', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Each round and each window becomes a few named steps.',
            widget: null,
            math: [
              {
                h: 'Stage counts in the baseline run',
                eq: ['QEC_READOUT 96    QEC_SYNDROME_TX 96', 'QEC_CTRL_APPLY 96    QEC_COMMIT 96', 'QEC_DECODE 32    QEC_FEEDBACK_TX 32', 'init 8   data_readout 8   logical_result 8'],
                why: 'From stage_count in the Demo 1 baseline result. The two barrier stages also appear 8 times each.'
              }
            ],
            check: {
              q: 'Why are there 96 QEC_SYNDROME_TX steps but only 32 QEC_DECODE steps?',
              options: [
                'Syndromes are sent once per round, decodes run once per window',
                'The decoder drops two thirds of the syndromes',
                'Each decode runs on three slots',
                'The link merges three rounds by accident'
              ],
              answer: 0,
              why: '8 shots × 12 rounds = 96, and 8 shots × 4 windows = 32.'
            }
          },
          {
            title: 'Two conditions to start',
            buildsOn: 'Lowering produced stage steps such as QEC_DECODE, each with a duration and a resource need.',
            leadsTo: 'The bridge to Section 3: an algorithm that checks these two conditions again and again while moving the clock.',
            idea: [
              'The *execution graph* says which steps must finish first. The *resource graph* says what each step occupies.',
              'A step is *ready* when the steps before it are done. It *starts* only when its resources are also free.',
              'If several ready steps want one slot, the *policy* picks. Demo 1 uses *operation_fifo_v1*: first queued, first served.'
            ],
            keys: [
              { tone: 'main', h: 'Durations in, times out', t: 'The request gives durations and capacities only. The engine computes every start time from dependencies, free resources and the policy.' }
            ],
            sketch: [
              B(30, 120, 140, 60), T(100, 157, 'decode W2', { anchor: 'middle', size: 20 }),
              A(175, 150, 235, 150),
              T(300, 90, 'execution graph', { anchor: 'middle', size: 16 }),
              E(300, 150, 62, 40), T(300, 147, 'inputs', { anchor: 'middle', size: 16 }), T(300, 167, 'done?', { anchor: 'middle', size: 16 }),
              A(365, 150, 420, 150),
              T(485, 90, 'resource graph', { anchor: 'middle', size: 16, c: 'blue' }),
              E(485, 150, 62, 40, { c: 'blue' }), T(485, 147, 'slot', { anchor: 'middle', size: 16, c: 'blue' }), T(485, 167, 'free?', { anchor: 'middle', size: 16, c: 'blue' }),
              A(485, 193, 485, 240, { c: 'green' }), T(485, 272, 'start', { anchor: 'middle', size: 22, c: 'green' })
            ],
            takeaway: 'Start needs two things: inputs done and resources free.',
            widget: null,
            check: {
              q: 'Window W2 has all its syndromes, but the only decoder slot is busy. What is W2?',
              options: ['Ready but not started', 'Started', 'Not ready', 'Finished'],
              answer: 0,
              why: 'Ready means its inputs are done. Starting also needs a free slot.'
            }
          }
        ]
      },

      /* ============================ SECTION 3 ============================ */
      {
        title: 'The algorithm: discrete events',
        intro: 'The engine uses discrete-event simulation. This section builds it from a naive clock up to the exact loop.',
        bridge: 'Section 4 shows this loop inside the V2 engine, which produced every number in Demo 1 and Demo 2.',
        tabs: [
          {
            title: 'The naive clock',
            buildsOn: 'Section 2 ended with two start conditions, inputs done and resources free, that must be checked whenever something changes.',
            leadsTo: 'Next, a classical cousin that skips the empty time: a cook with a list of timers.',
            idea: [
              'Naive try: advance a clock one *tick* at a time and check every step at every tick.',
              'The engine counts time in integer picoseconds (ps). Demo 1 lasts 656.4 µs, which is 656,400,000 ticks.',
              'Almost all of those ticks change nothing. The V2 engine finished the same run in 577 steps.'
            ],
            sketch: [
              T(30, 60, 'fixed clock', { size: 20 }),
              L([[30, 110], [610, 110]], { c: 'red', dash: true }),
              T(320, 90, '656,400,000 ticks', { anchor: 'middle', size: 22, c: 'red' }),
              T(30, 190, 'jump to events', { size: 20 }),
              L([[30, 220], [610, 220]], { c: 'green' }),
              D(70, 220, { c: 'green' }), D(160, 220, { c: 'green' }), D(300, 220, { c: 'green' }), D(450, 220, { c: 'green' }), D(580, 220, { c: 'green' }),
              T(320, 275, '577 steps', { anchor: 'middle', size: 22, c: 'green' })
            ],
            takeaway: 'Ticking every picosecond wastes nearly all the work.',
            widget: null,
            math: [
              { h: 'How many ticks', eq: ['1 µs = 1,000,000 ps', '656.4 µs × 1,000,000 = 656,400,000 ps'], why: 'One tick is one picosecond, so a fixed clock would loop 656 million times.' },
              { h: 'Compared with event steps', eq: ['656,400,000 / 577 ≈ 1.14 million'], why: 'Each real step stands in for over a million empty ticks.' }
            ],
            check: {
              q: 'Why does the engine not advance one tick at a time?',
              options: [
                'Nothing changes between events, so ticking through empty time wastes work',
                'Picoseconds are too coarse',
                'Ticking would change the results',
                'Rust cannot count to 656 million'
              ],
              answer: 0,
              why: 'State only changes at events, so jumping between events gives the same answer.'
            }
          },
          {
            title: 'A cook with timers',
            buildsOn: 'A fixed picosecond clock wastes almost every tick, because nothing changes between events.',
            leadsTo: 'Next, the same idea in the engine: events with times, kept in a sorted queue.',
            idea: [
              'A cook puts rice on (done 12:10) and soup on (done 12:25), and writes both times on a list.',
              'The cook does not watch the clock. Jump to the earliest time on the list, handle it, add any new timers.',
              'This is *discrete-event simulation*: time jumps from one event to the next.'
            ],
            sketch: [
              B(40, 40, 250, 220), T(60, 80, 'timer list', { size: 22 }),
              T(70, 130, '12:10 rice done', { size: 20, c: 'green' }),
              T(70, 175, '12:25 soup done', { size: 20 }),
              T(70, 220, '12:30 serve', { size: 20, c: 'blue' }),
              L([[340, 250], [610, 250]]),
              D(390, 250), D(480, 250), D(590, 250),
              T(390, 285, '12:10', { anchor: 'middle', size: 16 }), T(480, 285, '12:25', { anchor: 'middle', size: 16 }),
              K([[390, 235], [435, 195], [480, 235]], { c: 'red' }), T(435, 185, 'jump', { anchor: 'middle', size: 18, c: 'red' })
            ],
            takeaway: 'Jump to the earliest timer, handle it, add new timers.',
            widget: null,
            check: {
              q: 'The list holds 12:10 rice and 12:25 soup. Handling the rice adds 12:15 plate rice. What comes next?',
              options: ['12:15 plate rice', '12:25 soup', '12:10 rice again', 'Whichever timer was written first'],
              answer: 0,
              why: 'Always take the earliest time on the list.'
            }
          },
          {
            title: 'Events and the event queue',
            buildsOn: 'The cook handles the earliest timer on a list and adds new timers as work starts.',
            leadsTo: 'Next, what happens when two events share the same time, which needs an exact tie rule.',
            idea: [
              'An *event* is a time plus what happens then, for example Complete(decode W1) at 6 µs.',
              'The *event queue* keeps future events in a *min-heap*: the earliest is always on top and cheap to take.',
              'Kinds to know first: Arrival (a job enters), Complete (a step ends), Ready (a delayed step may now queue).'
            ],
            sketch: [
              O(320, 70, 38, { c: 'green' }), T(320, 77, '2 µs', { anchor: 'middle', size: 18, c: 'green' }),
              T(470, 77, 'earliest on top', { size: 20, c: 'green' }),
              L([[293, 95], [225, 145]]), L([[347, 95], [415, 145]]),
              O(200, 170, 38), T(200, 177, '6 µs', { anchor: 'middle', size: 18 }),
              O(440, 170, 38), T(440, 177, '4 µs', { anchor: 'middle', size: 18 }),
              L([[180, 198], [155, 236]]),
              O(140, 265, 34), T(140, 272, '9 µs', { anchor: 'middle', size: 16 }),
              T(500, 265, 'pop, handle, push', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Future events sit in a min-heap. The earliest is always on top.',
            widget: null,
            math: [
              {
                h: 'Event kinds in the V3 code (enum Event)',
                eq: ['Arrival(job)   Complete(slot)   Ready(slot)', 'Materialize(job, ..)   Retry(job, ..)', 'BatchTimeout(..)   Topology(slot)', 'FactoryCadence(..)   FactoryDeadline(..)'],
                why: 'From execution_compact/kernel/mod.rs on main. The heap itself is in execution_compact/order.rs.'
              }
            ],
            check: {
              q: 'Why keep events in a min-heap instead of an unsorted list?',
              options: [
                'The earliest event can be taken quickly without scanning every event',
                'A heap stores events in fewer bytes',
                'A heap removes duplicate events',
                'A heap runs events in parallel'
              ],
              answer: 0,
              why: 'The smallest key always sits at the root.'
            }
          },
          {
            title: 'Ties at the same time',
            buildsOn: 'The event queue always hands out the earliest event, ordered by its time.',
            leadsTo: 'Next, the other half of each step: choosing which ready step gets a free resource.',
            idea: [
              'Two events often share one time: a decode ends at the exact moment a syndrome arrives.',
              'The order is fixed by an *EventKey* = (at, phase, sequence). Compare time, then *phase*, then *sequence*.',
              'Phase order: Topology, Completion, Materialization, Arrival, Admission, Dispatch, Accounting. Ends come before starts.',
              'Time is an integer count of picoseconds, so equal times are exactly equal. No rounding of decimal seconds.'
            ],
            keys: [
              { tone: 'main', h: 'Same input, same order, same result', t: 'The tie rule plus integer ticks make every run deterministic. This is what lets the team compare two engines record by record.' }
            ],
            sketch: [
              B(110, 60, 190, 60, { c: 'green' }), T(205, 97, '1. Completion', { anchor: 'middle', size: 20, c: 'green' }),
              B(340, 60, 190, 60, { c: 'blue' }), T(435, 97, '2. Arrival', { anchor: 'middle', size: 20, c: 'blue' }),
              A(205, 125, 310, 190, { c: 'green' }), A(435, 125, 330, 190, { c: 'blue' }),
              L([[40, 200], [600, 200]]), D(320, 200), T(320, 240, 't = 6 µs', { anchor: 'middle', size: 20 }),
              H(130, 262, 380, 40, { c: 'yellow' }), T(320, 290, 'key = (at, phase, sequence)', { anchor: 'middle', size: 20 })
            ],
            takeaway: 'Ties break by phase, then by sequence number. Always the same way.',
            widget: null,
            math: [
              { h: 'Why integer ticks', eq: ['floats:   0.1 + 0.2 = 0.30000000000000004', 'ticks:    100000 + 200000 = 300000 ps'], why: 'Decimal seconds can round. 0.1 µs and 0.2 µs as integer picoseconds add exactly.' },
              { h: 'The key in Rust (foundation/timeline.rs)', eq: ['struct EventKey {', '  at: Tick, phase: EventPhase,', '  sequence: SequenceId }'], why: 'Rust compares the fields in this order, so time wins, then phase, then sequence.' }
            ],
            check: {
              q: 'A decode Completion and a job Arrival share the same tick. Which is handled first?',
              options: [
                'The Completion, because its phase comes earlier',
                'The Arrival, because new work has priority',
                'Whichever was pushed into the queue first',
                'A random one, chosen by the seed'
              ],
              answer: 0,
              why: 'Phase is compared before sequence, and Completion comes before Arrival.'
            }
          },
          {
            title: 'Ready set, winner, admit',
            buildsOn: 'Events come out in exact EventKey order, so the engine always knows what changed and when.',
            leadsTo: 'Next, these pieces joined into one loop: handle events, start work, move the clock.',
            idea: [
              'The *ready set* holds steps whose inputs are done and that wait for resources.',
              '*winner()* asks the policy to rank the ready steps that could start now, and returns the top one.',
              '*admit()* claims its resources and pushes Complete at now + duration. *complete()* frees them and readies successors.'
            ],
            sketch: [
              T(105, 70, 'ready set', { anchor: 'middle', size: 20 }),
              B(30, 80, 150, 150), T(105, 130, 'W2', { anchor: 'middle', size: 22 }), T(105, 180, 'W3', { anchor: 'middle', size: 22 }),
              A(185, 155, 250, 155),
              E(310, 155, 55, 35, { c: 'blue' }), T(310, 162, 'winner', { anchor: 'middle', size: 18, c: 'blue' }),
              A(368, 155, 420, 155),
              B(425, 125, 90, 60, { c: 'green' }), T(470, 162, 'admit', { anchor: 'middle', size: 20, c: 'green' }),
              A(470, 190, 470, 240),
              B(360, 245, 260, 50), T(490, 277, 'push Complete at now + d', { anchor: 'middle', size: 16 })
            ],
            takeaway: 'Policy picks a winner. admit starts it. complete ends it.',
            widget: null,
            check: {
              q: 'What does admit() put into the event queue?',
              options: [
                'A Complete event at now plus the step duration',
                'An Arrival event for the next job',
                'Nothing, it only marks the step ready',
                'A Ready event at time zero'
              ],
              answer: 0,
              why: 'Starting a step fixes when it will end.'
            }
          },
          {
            title: 'One step of the loop',
            buildsOn: 'admit starts a ready winner and complete ends it, with events taken in exact key order.',
            leadsTo: 'Next, the whole loop run by hand on a tiny example with one decoder slot.',
            idea: [
              'Each call to *step()* makes one change and returns. A run is step() repeated until every job has finished.',
              'Order inside a step: handle an event due now, else start a winner, else move the clock to the next event.',
              'If work remains but no event exists, the engine stops with an error instead of hanging.'
            ],
            sketch: [
              E(140, 60, 115, 35), T(140, 67, 'event due now?', { anchor: 'middle', size: 18 }),
              A(255, 60, 350, 60), T(300, 50, 'yes', { anchor: 'middle', size: 16, c: 'green' }),
              B(355, 35, 230, 50, { c: 'green' }), T(470, 67, 'handle it', { anchor: 'middle', size: 18 }),
              A(140, 95, 140, 135),
              E(140, 170, 100, 35), T(140, 177, 'winner?', { anchor: 'middle', size: 18 }),
              A(240, 170, 350, 170), T(300, 160, 'yes', { anchor: 'middle', size: 16, c: 'green' }),
              B(355, 145, 230, 50, { c: 'blue' }), T(470, 177, 'admit it', { anchor: 'middle', size: 18 }),
              A(140, 205, 140, 240),
              B(30, 245, 560, 50), T(310, 277, 'now = time of next event', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Event due now, else start a winner, else jump the clock.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Pending control work, such as releasing a barrier, goes first.', show: 'if control work is pending: do it, return' },
                { say: 'If every job has finished, the run is over.', show: 'if is_terminal(): return terminal' },
                { say: 'An event due right now is handled, one per step, in key order.', show: 'if events.peek().at == now: handle it, return' },
                { say: 'Otherwise try to start work: the policy picks a ready winner.', show: 'if winner() exists: admit(it), return' },
                { say: 'Nothing can happen now, so the clock moves to the next event.', show: 'now = next_time(), return' },
                { say: 'No next event while work remains means the model is stuck. The engine raises an error.', show: 'error: unfinished work without an executable event' }
              ]
            },
            math: [
              {
                h: 'Where this lives in V3 (simplified above)',
                eq: ['execution_compact/kernel/transitions.rs', 'fn step_before_inner(&mut self, stop) {', '  loop { ... }', '}'],
                why: 'Paths are under extensions/hcu_native_rust/crates/hcu_native_core/src/engine_v2.'
              }
            ],
            check: {
              q: 'At now = 6 µs an event is due and a ready step could also start. What does the next step() do?',
              options: ['Handles the due event', 'Starts the ready step', 'Moves the clock forward', 'Both at once in one step'],
              answer: 0,
              why: 'Events due now come before starting new work.'
            }
          },
          {
            title: 'A full run by hand',
            buildsOn: 'One step handles a due event, else admits a winner, else jumps the clock.',
            leadsTo: 'The bridge to Section 4: the real engine, V2, running exactly this loop on Demo 1.',
            idea: [
              'Toy numbers: one decoder slot, each decode takes 4 µs. Window A arrives at 2 µs, window B at 4 µs.',
              'B is ready at 4 µs but starts at 6 µs, when A frees the slot. Its wait is 6 − 4 = 2 µs.',
              'The loop gives every start and end time with no guessing. Limit: it is only as true as the durations fed in.'
            ],
            sketch: [
              T(30, 122, 'slot', { size: 18 }),
              B(160, 90, 200, 50, { c: 'blue' }), T(260, 122, 'decode A', { anchor: 'middle', size: 18, c: 'blue' }),
              B(360, 90, 200, 50, { c: 'green' }), T(460, 122, 'decode B', { anchor: 'middle', size: 18, c: 'green' }),
              L([[260, 190], [360, 190]], { c: 'red', dash: true }), T(310, 180, 'B waits', { anchor: 'middle', size: 16, c: 'red' }),
              L([[60, 250], [600, 250]]), D(260, 250, { c: 'red' }),
              T(160, 280, '2', { anchor: 'middle', size: 16 }), T(260, 280, '4', { anchor: 'middle', size: 16 }),
              T(360, 280, '6', { anchor: 'middle', size: 16 }), T(560, 280, '10 µs', { anchor: 'middle', size: 16 })
            ],
            takeaway: 'B arrives at 4 µs, starts at 6 µs, ends at 10 µs.',
            widget: {
              type: 'frames',
              frames: [
                {
                  t: 'Start', h: 200,
                  parts: [
                    B(20, 30, 280, 140), T(35, 60, 'event queue', { size: 18 }),
                    T(40, 100, '2 µs  Arrival A', { size: 18 }), T(40, 140, '4 µs  Arrival B', { size: 18 }),
                    T(340, 90, 'now = 0', { size: 22 }), T(340, 135, 'slot free', { size: 18, c: 'green' })
                  ],
                  eq: ['now = 0   ready = { }'],
                  say: 'Nothing is due at 0 and nothing is ready, so the clock jumps to 2 µs.'
                },
                {
                  t: 'A arrives', h: 200,
                  parts: [
                    B(20, 30, 280, 140), T(35, 60, 'event queue', { size: 18 }),
                    T(40, 100, '4 µs  Arrival B', { size: 18 }), T(40, 140, '6 µs  Complete A', { size: 18, c: 'blue' }),
                    T(340, 90, 'now = 2 µs', { size: 22 }), T(340, 135, 'slot busy: A', { size: 18, c: 'blue' })
                  ],
                  eq: ['winner() = A', 'admit A: Complete A at 2 + 4 = 6 µs'],
                  say: 'A arrives and is ready. The slot is free, so A wins and starts. Its end is pushed at 6 µs.'
                },
                {
                  t: 'B arrives', h: 200,
                  parts: [
                    B(20, 30, 280, 140), T(35, 60, 'event queue', { size: 18 }),
                    T(40, 100, '6 µs  Complete A', { size: 18, c: 'blue' }),
                    T(340, 90, 'now = 4 µs', { size: 22 }), T(340, 135, 'slot busy: A', { size: 18, c: 'blue' }),
                    T(340, 170, 'ready = { B }', { size: 18, c: 'red' })
                  ],
                  eq: ['winner() = none, the slot is busy'],
                  say: 'B is ready but the only slot is busy. Nothing can start, so the clock jumps to 6 µs.'
                },
                {
                  t: 'A ends', h: 200,
                  parts: [
                    B(20, 30, 280, 140), T(35, 60, 'event queue', { size: 18 }),
                    T(40, 100, '10 µs  Complete B', { size: 18, c: 'green' }),
                    T(340, 90, 'now = 6 µs', { size: 22 }), T(340, 135, 'slot busy: B', { size: 18, c: 'green' })
                  ],
                  eq: ['wait of B = 6 − 4 = 2 µs', 'admit B: Complete B at 6 + 4 = 10 µs'],
                  say: 'A ends and frees the slot. B wins at once and starts.'
                },
                {
                  t: 'B ends', h: 200,
                  parts: [
                    B(20, 30, 280, 140), T(35, 60, 'event queue', { size: 18 }),
                    T(40, 100, '(empty)', { size: 18 }),
                    T(340, 90, 'now = 10 µs', { size: 22 }), T(340, 135, 'all done', { size: 18, c: 'green' })
                  ],
                  eq: ['terminal at 10 µs'],
                  say: 'B ends. The queue is empty and all work is done, so the run is terminal.'
                }
              ]
            },
            check: {
              q: 'Same toy, but with two decoder slots. When does B start?',
              options: ['4 µs', '6 µs', '2 µs', '10 µs'],
              answer: 0,
              why: 'A second slot is free when B arrives, so B starts at once.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 ============================ */
      {
        title: 'Engine V2: what the demos ran',
        intro: 'Every Demo 1 and Demo 2 number came from the V2 engine, driven from Python. This section shows its API, its state and its one shortcut.',
        bridge: 'On 16 Nov 2026 the repo replaced V2 as the default engine. Section 5 covers what changed, which is what Shuwen asked about.',
        tabs: [
          {
            title: 'Driving a session from Python',
            buildsOn: 'Section 3 built the loop: handle a due event, else admit a winner, else jump the clock.',
            leadsTo: 'Next, a look inside a live session partway through Demo 1, using snapshot().',
            idea: [
              '*prepare_simulation_obj(config, jobs)* runs lowering once. *start()* makes a session with now = 0.',
              '*step()* advances one *boundary*: one observable point, which can hold several internal transitions.',
              '*step_many*(10000) runs up to 10,000 steps inside Rust, saving Python overhead. *finish()* returns the result.'
            ],
            sketch: [
              B(30, 40, 260, 250), T(160, 70, 'Python', { anchor: 'middle', size: 22 }),
              T(50, 120, 'prepare_simulation_obj', { size: 16 }), T(50, 165, 'start()', { size: 16 }),
              T(50, 210, 'step_many(10000)', { size: 16, c: 'blue' }), T(50, 255, 'finish()', { size: 16, c: 'green' }),
              A(295, 115, 345, 115), A(295, 205, 345, 205),
              B(350, 40, 260, 250, { c: 'red' }), T(480, 70, 'Rust engine', { anchor: 'middle', size: 22, c: 'red' }),
              T(370, 120, 'lowering', { size: 16 }), T(370, 165, 'new state, now = 0', { size: 16 }),
              T(370, 210, 'loop 10,000 steps', { size: 16, c: 'blue' }), T(370, 255, 'result + trace', { size: 16, c: 'green' })
            ],
            takeaway: 'Prepare once, start, step_many until terminal, finish.',
            widget: null,
            math: [
              {
                h: 'run_request in experiments/viz/export.py',
                eq: ['session = engine.prepare_simulation_obj(', '    cfg, jobs).start()', 'while not session.snapshot()["terminal"]:', '    session.step_many(10_000)'],
                why: 'Then session.finish() returns total_time_s and reservation_trace.'
              }
            ],
            check: {
              q: 'Why call step_many(10000) instead of step() in a Python loop?',
              options: [
                'Fewer crossings between Python and Rust, so it runs faster',
                'step() gives different results',
                'step_many skips events',
                'step() only works in the browser'
              ],
              answer: 0,
              why: 'The same steps run, but the loop stays inside Rust.'
            }
          },
          {
            title: 'A snapshot mid-run',
            buildsOn: 'A session advances one boundary per step() and can be paused between calls.',
            leadsTo: 'Next, the output the demos draw: the reservation trace returned by finish().',
            idea: [
              '*snapshot()* returns the live state: tick, events, ready, running, resources and more.',
              'Demo 1 baseline after 40 steps: tick 45,988,000 (45.988 µs). One event queued, 2 steps ready, 1 running.',
              'The queued event is a Completion at tick 48,672,000. If nothing can start, the clock jumps there next.'
            ],
            sketch: [
              B(40, 30, 560, 260), T(60, 65, 'snapshot() after 40 steps', { size: 20 }),
              T(70, 110, 'tick', { size: 18 }), T(250, 110, '45,988,000 ps', { size: 18, c: 'blue' }),
              H(240, 130, 300, 30, { c: 'yellow' }),
              T(70, 150, 'events', { size: 18 }), T(250, 150, 'Complete at 48,672,000', { size: 18, c: 'green' }),
              T(70, 190, 'ready', { size: 18 }), T(250, 190, '2 steps waiting', { size: 18, c: 'red' }),
              T(70, 230, 'running', { size: 18 }), T(250, 230, '1 step, since 45,988,000', { size: 18 })
            ],
            takeaway: 'snapshot() shows the event queue, ready set and running steps.',
            widget: null,
            math: [
              {
                h: 'Real snapshot, trimmed',
                eq: ['events: [{ key: { tick: 48672000,', '  phase: completion, sequence: 155 },', '  payload_kind: complete }]', 'execution: microstep'],
                why: 'Demo 1 baseline on the V2 engine, after 40 calls to step().'
              },
              {
                h: 'Ticks to microseconds',
                eq: ['45,988,000 ps / 1,000,000 = 45.988 µs', '48,672,000 − 45,988,000 = 2,684,000 ps', '2,684,000 ps = 2.684 µs'],
                why: 'The running step ends 2.684 µs after it started.'
              }
            ],
            check: {
              q: 'The only queued event is at tick 48,672,000 and nothing can start. What is the next value of now?',
              options: ['48,672,000', '45,988,000', '45,988,001', '0'],
              answer: 0,
              why: 'The clock jumps straight to the next event time.'
            }
          },
          {
            title: 'The reservation trace',
            buildsOn: 'A snapshot shows the live state. finish() returns everything that happened.',
            leadsTo: 'Next, the V2 code that produced these rows.',
            idea: [
              'Each row of *reservation_trace* is one step on one resource: stage, job, enqueued_s, start_s, done_s.',
              'wait = start − enqueued. service = done − start. The demo timelines draw one bar per row.',
              'Demo 1 baseline: 880 rows, total 656.4 µs. The *zero-decoder control* (decode time 0) gives 628.1 µs.'
            ],
            sketch: [
              B(20, 30, 600, 110), L([[20, 75], [620, 75]]),
              T(35, 62, 'stage', { size: 16 }), T(200, 62, 'enqueued', { size: 16 }), T(330, 62, 'start', { size: 16 }), T(440, 62, 'done', { size: 16 }),
              T(35, 110, 'init', { size: 16 }), T(200, 110, '0.0 µs', { size: 16 }), T(330, 110, '0.0 µs', { size: 16 }), T(440, 110, '2.72 µs', { size: 16 }),
              L([[60, 260], [600, 260]]),
              L([[120, 220], [260, 220]], { c: 'red', dash: true }), T(190, 205, 'wait', { anchor: 'middle', size: 16, c: 'red' }),
              B(260, 200, 220, 40, { c: 'blue' }), T(370, 227, 'service', { anchor: 'middle', size: 16, c: 'blue' })
            ],
            takeaway: 'One trace row per step: enqueued, start, done. Bars come from it.',
            widget: null,
            math: [
              { h: 'From one row to one bar', eq: ['wait    = start_s − enqueued_s', 'service = done_s − start_s'] },
              {
                h: 'What decoding adds in Demo 1',
                eq: ['baseline total       656.4 µs', 'zero-decoder total   628.1 µs', 'difference            28.3 µs'],
                why: 'The control sets decode time to 0, so the gap is the cost of decoding.'
              }
            ],
            check: {
              q: 'A row has enqueued_s = 10 µs, start_s = 13 µs, done_s = 15.2 µs. What are the wait and the service?',
              options: ['3 µs and 2.2 µs', '2.2 µs and 3 µs', '13 µs and 15.2 µs', '5.2 µs and 0'],
              answer: 0,
              why: 'wait = 13 − 10 and service = 15.2 − 13.'
            }
          },
          {
            title: 'Inside V2',
            buildsOn: 'finish() returned a trace built by the V2 engine stepping its state one boundary at a time.',
            leadsTo: 'Next, the optional shortcut mode inside V2, and why the demos never used it.',
            idea: [
              'V2 keeps everything in one large *SchedulerState* (scheduler/state/model.rs) with many indexes and journals.',
              'Its step lives in scheduler/kernel/execution.rs, called from runtime/session.rs. It is the Section 3 loop.',
              'Timing a large test circuit (*GF multiplier*), 27% of V2 profile samples were admission and ownership work.'
            ],
            sketch: [
              B(40, 40, 360, 240, { c: 'red' }), T(220, 75, 'SchedulerState', { anchor: 'middle', size: 22, c: 'red' }),
              B(65, 100, 90, 40), T(110, 126, 'indexes', { anchor: 'middle', size: 14 }),
              B(170, 100, 90, 40), T(215, 126, 'journals', { anchor: 'middle', size: 14 }),
              B(275, 100, 100, 40), T(325, 126, 'queues', { anchor: 'middle', size: 14 }),
              B(65, 160, 140, 40), T(135, 186, 'resources', { anchor: 'middle', size: 14 }),
              B(220, 160, 155, 40), T(297, 186, 'recurrence', { anchor: 'middle', size: 14 }),
              K([[420, 200], [560, 200], [560, 90], [430, 90]]), A(440, 90, 405, 90),
              T(560, 240, 'step()', { anchor: 'middle', size: 20 })
            ],
            takeaway: 'V2 runs the same loop on a large, heavy state object.',
            widget: null,
            check: {
              q: 'According to the profile, what made V2 slow?',
              options: [
                'Heavy bookkeeping, such as admission and ownership work',
                'Ticking every picosecond',
                'Running Python code inside the loop',
                'Computing quantum amplitudes'
              ],
              answer: 0,
              why: 'It already jumped between events. The cost was in handling its state.'
            }
          },
          {
            title: 'V2 shortcut: recurrence',
            buildsOn: 'V2 runs the plain loop on SchedulerState, one boundary per step.',
            leadsTo: 'The bridge to Section 5: the new engine drops this shortcut and makes the plain loop fast instead.',
            idea: [
              'QEC is repetitive: round after round, the same steps with the same gaps.',
              'V2 had an *Accelerated* mode. When a *recurrence* (repeating pattern) was proven safe, it applied many repeats in one jump.',
              'The demo requests ask for *microstep* mode, the plain loop. So no demo number used the shortcut.'
            ],
            keys: [
              { tone: 'fix', h: 'Checked on our runs', t: 'The Demo 1 request sets runtime.scheduler.execution = microstep, and a live snapshot reports execution: microstep. Demo 2 builds on the same request.' }
            ],
            sketch: [
              B(40, 150, 80, 40), T(80, 177, 'R1', { anchor: 'middle', size: 18 }),
              B(130, 150, 80, 40), T(170, 177, 'R2', { anchor: 'middle', size: 18 }),
              B(220, 150, 80, 40), T(260, 177, 'R3', { anchor: 'middle', size: 18 }),
              B(310, 150, 80, 40), T(350, 177, 'R4', { anchor: 'middle', size: 18 }),
              B(400, 150, 80, 40), T(440, 177, 'R5', { anchor: 'middle', size: 18 }),
              K([[80, 140], [260, 70], [440, 140]], { c: 'red' }), T(260, 58, 'Accelerated: jump', { anchor: 'middle', size: 18, c: 'red' }),
              A(80, 215, 170, 215, { c: 'green' }), T(125, 250, 'microstep', { anchor: 'middle', size: 18, c: 'green' })
            ],
            takeaway: 'V2 could skip repeats. Our demos ran the plain loop.',
            widget: null,
            math: [
              {
                h: 'The setting in the Demo 1 request',
                eq: ['runtime.scheduler = {', '  certified: true,', '  execution: "microstep",', '  parallel_domains: false }'],
                why: 'Copied from capacity_pilot.json by scenario.py.'
              }
            ],
            check: {
              q: 'Did any Demo 1 or Demo 2 number come from V2 skipping repeated rounds?',
              options: [
                'No, the demos used microstep mode, the plain loop',
                'Yes, every run used Accelerated mode',
                'Only the 32-stream runs',
                'Only the zero-decoder control'
              ],
              answer: 0,
              why: 'The request sets execution to microstep and the snapshot confirms it.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 ============================ */
      {
        title: 'Engine V3: what changed',
        intro: 'This is the change Shuwen pointed at. Engine V3.3.1 became the default on main on 16 Nov 2026. This section covers what V3 is and what it is not.',
        bridge: 'Section 6 turns this into the presentation: what to say, and the Demo 2 check that shows it on our own runs.',
        tabs: [
          {
            title: 'What landed on main',
            buildsOn: 'Section 4 showed V2, the engine behind all demo numbers, and its unused shortcut mode.',
            leadsTo: 'Next, the most important fact about V3: it computes exactly the same timeline as V2.',
            idea: [
              'On 16 Nov 2026 Panayiotis merged *Engine V3.3.1* into main. Our demo branch sits on the 8 Oct commit, with V2.',
              'V3 is the *compact* backend and now the default. V2 stays as the *reference* backend, to reproduce old runs.',
              'Names: V3 (compact core, 2 Nov), V3.2 (checkpoints, checker, 9 Nov), V3.3 (analyzer, 12 Nov), V3.3.1 (fixes).'
            ],
            sketch: [
              L([[30, 170], [610, 170]]),
              D(60, 170, { c: 'red' }), T(60, 215, '8 Oct', { anchor: 'middle', size: 16 }), T(45, 140, 'our demos, V2', { size: 16, c: 'red' }),
              D(240, 170), T(240, 215, '2 Nov', { anchor: 'middle', size: 16 }), T(240, 140, 'V3', { anchor: 'middle', size: 18 }),
              D(360, 170), T(360, 215, '9 Nov', { anchor: 'middle', size: 16 }), T(360, 140, 'V3.2', { anchor: 'middle', size: 18 }),
              D(460, 170), T(460, 215, '12 Nov', { anchor: 'middle', size: 16 }), T(460, 140, 'V3.3', { anchor: 'middle', size: 18 }),
              D(580, 170, { c: 'green' }), T(580, 215, '16 Nov', { anchor: 'middle', size: 16 }), T(580, 140, 'V3.3.1', { anchor: 'middle', size: 18, c: 'green' })
            ],
            takeaway: 'Main now runs V3 by default. Our demos ran V2.',
            widget: null,
            math: [
              {
                h: 'Choosing the backend in Python (V3 code)',
                eq: ['session = prepared.start()   # compact, V3', 'session = prepared.start(backend="reference")'],
                why: 'The reference choice prints a DeprecationWarning: V2 is kept only as a comparator.'
              }
            ],
            check: {
              q: 'Which call reproduces an old V2 run on today’s main?',
              options: ['start(backend="reference")', 'start()', 'start(backend="compact")', 'step_many(0)'],
              answer: 0,
              why: 'start() now selects compact. The reference backend must be named.'
            }
          },
          {
            title: 'Same timeline, exactly',
            buildsOn: 'Main switched its default from the V2 reference backend to the V3 compact backend.',
            leadsTo: 'Next, the difference between the time inside the model and the time your computer spends.',
            idea: [
              'V3 is an exact discrete-event engine: same model, same EventKey order, same loop as Section 3.',
              'It has no shortcuts at all. The repo states there is no event-skipping step in the compact path.',
              'Checked on 3 workloads × 5 seeds × 3 repeats = 45 comparisons. Same work, same final tick, same *digest* of records.'
            ],
            keys: [
              { tone: 'main', h: 'In one line', t: 'V3 changes how fast the timeline is computed, not what the timeline is.' }
            ],
            sketch: [
              B(40, 40, 180, 70, { c: 'red' }), T(130, 82, 'V2 reference', { anchor: 'middle', size: 18, c: 'red' }),
              B(40, 200, 180, 70, { c: 'blue' }), T(130, 242, 'V3 compact', { anchor: 'middle', size: 18, c: 'blue' }),
              A(225, 75, 330, 140), A(225, 235, 330, 170),
              B(335, 110, 150, 90, { c: 'green' }), T(410, 150, 'same', { anchor: 'middle', size: 20, c: 'green' }), T(410, 178, 'timeline', { anchor: 'middle', size: 18, c: 'green' }),
              T(500, 95, 'final tick', { size: 15 }), T(500, 160, 'records', { size: 15 }), T(500, 225, 'digest', { size: 15 })
            ],
            takeaway: 'V3 gives the same timeline as V2. Only the speed differs.',
            widget: null,
            math: [
              { h: 'What must match per comparison', eq: ['workload bytes    reached work', 'service digest    terminal tick', 'random draws'], why: 'From the 2026-11-01 qualification report on main.' },
              { h: 'Count', eq: ['3 workloads × 5 seeds × 3 repeats = 45'], why: 'Plus 15 full pipeline comparisons that include input, output and checking.' }
            ],
            check: {
              q: 'V3 reports a smaller total_time_s than V2 for the same request. What does that mean?',
              options: [
                'Something is wrong: both engines must give the same simulated time',
                'V3 is faster, so simulated jobs finish sooner',
                'V3 skipped some events, which is allowed',
                'The seed changed between runs'
              ],
              answer: 0,
              why: 'total_time_s is simulated time, and the engines must agree on it exactly.'
            }
          },
          {
            title: 'Two kinds of time',
            buildsOn: 'V3 and V2 produce the same timeline, checked down to the final tick.',
            leadsTo: 'Next, why V3 needs less computer time for that same timeline.',
            idea: [
              '*Simulated time* is the clock inside the model: Demo 1 lasts 656.4 µs. It is an output of the engine.',
              '*Host time* is how long your computer takes to compute it: about 0.2 s for Demo 1 on V2.',
              'A faster engine cuts host time only. Simulated time must stay identical.'
            ],
            sketch: [
              T(160, 50, 'inside the model', { anchor: 'middle', size: 18 }),
              O(160, 150, 80, { c: 'blue' }), L([[160, 150], [160, 95]], { c: 'blue' }), L([[160, 150], [205, 175]], { c: 'blue' }),
              T(160, 265, 'simulated: 656.4 µs', { anchor: 'middle', size: 18, c: 'blue' }),
              T(480, 50, 'your computer', { anchor: 'middle', size: 18 }),
              O(480, 150, 80, { c: 'red' }), L([[480, 150], [480, 95]], { c: 'red' }), L([[480, 150], [440, 120]], { c: 'red' }),
              T(480, 265, 'host: about 0.2 s', { anchor: 'middle', size: 18, c: 'red' })
            ],
            takeaway: 'Faster engine = less host time. Simulated time never changes.',
            widget: null,
            check: {
              q: 'Suppose V3 runs Demo 1 in 0.05 s of host time instead of 0.2 s. What is the simulated total?',
              options: ['656.4 µs, unchanged', '164.1 µs, four times shorter', '0.05 s', 'It depends on the seed'],
              answer: 0,
              why: 'Only host time changes between engines.'
            }
          },
          {
            title: 'Where the speed comes from',
            buildsOn: 'V3 needs less host time while the simulated time stays identical to V2.',
            leadsTo: 'Next, the measured speedups on the three test workloads.',
            idea: [
              'V3 keeps state in *CompactState*: dense arrays of live steps, plus a compiled program that is shared, never copied.',
              'Its *readiness cache* keeps each ready step’s rank and re-ranks only the *dirty* ones before picking a winner.',
              'On the GF test, admission and ownership work fell from 27.3% of V2 profile samples to 7.2% in V3.'
            ],
            sketch: [
              T(155, 50, 'V2 state', { anchor: 'middle', size: 18, c: 'red' }),
              B(30, 60, 250, 200, { c: 'red' }),
              K([[60, 100], [120, 150], [90, 210], [200, 120], [250, 230]], { c: 'red' }),
              T(155, 290, 'many indexes', { anchor: 'middle', size: 16 }),
              T(465, 90, 'V3 dense array', { anchor: 'middle', size: 18, c: 'blue' }),
              B(340, 120, 50, 50, { c: 'blue' }), B(390, 120, 50, 50, { c: 'blue' }), B(440, 120, 50, 50, { c: 'blue' }),
              B(490, 120, 50, 50, { c: 'blue' }), B(540, 120, 50, 50, { c: 'blue' }),
              D(415, 145, { c: 'red' }), D(515, 145, { c: 'red' }),
              T(465, 220, 're-rank only dirty', { anchor: 'middle', size: 16, c: 'red' })
            ],
            takeaway: 'Same work, leaner state, fewer re-checks, fewer copies.',
            widget: {
              type: 'stack', unit: '%',
              segments: [
                { label: 'transitions, scheduling', v: 45.6 },
                { label: 'admission, ownership', v: 27.3 },
                { label: 'identity, copying', v: 19.8 },
                { label: 'observer and other', v: 7.3 }
              ],
              note: 'Share of V2 profile samples on the GF test. In V3 the admission and ownership share is 7.2%.'
            },
            math: [
              {
                h: 'Profile shares on the GF test',
                eq: ['                  V2       V3', 'transitions      45.6%    53.4%', 'admission        27.3%     7.2%', 'identity, copy   19.8%    15.0%'],
                why: 'Shares within each run. The V3 run is also about 4.7 times shorter in host time.'
              }
            ],
            check: {
              q: 'Which of these is NOT part of how V3 got faster?',
              options: [
                'Skipping repeated QEC rounds',
                'Dense arrays for live state',
                'Re-ranking only changed ready steps',
                'A shared compiled program that is never copied'
              ],
              answer: 0,
              why: 'V3 has no event skipping. Every event is still processed.'
            }
          },
          {
            title: 'The measured speedups',
            buildsOn: 'V3 gets its speed from leaner state and fewer re-checks, with every event still processed.',
            leadsTo: 'Next, the V3 loop in its own code, mapping Section 3 onto real files.',
            idea: [
              'Three test workloads, timed on one machine: the *GF multiplier*, an *Ising* model circuit and a stochastic physical circuit.',
              'GF 21.8 s → 4.6 s (4.75×). Ising 414.1 s → 29.0 s (14.30×). Stochastic 19.3 s → 4.6 s (4.20×).',
              'These are large runs. Ours take under a second on V2, so their speedup stays unknown until measured.'
            ],
            sketch: [
              T(40, 40, 'V3 speedup over V2', { size: 18 }),
              L([[60, 270], [600, 270]]),
              B(110, 199, 90, 71, { c: 'blue' }), T(155, 190, '4.75×', { anchor: 'middle', size: 20 }), T(155, 300, 'GF', { anchor: 'middle', size: 18 }),
              B(275, 56, 90, 214, { c: 'blue' }), T(320, 47, '14.30×', { anchor: 'middle', size: 20 }), T(320, 300, 'Ising', { anchor: 'middle', size: 18 }),
              B(440, 207, 90, 63, { c: 'blue' }), T(485, 198, '4.20×', { anchor: 'middle', size: 20 }), T(485, 300, 'stochastic', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Big runs got 4× to 14× faster. Ours are not yet measured.',
            widget: null,
            math: [
              {
                h: 'Mean host seconds, direct simulation',
                eq: ['GF           21.834 →  4.599    4.75×', 'Ising       414.054 → 28.950   14.30×', 'Stochastic   19.270 →  4.585    4.20×'],
                why: 'Speedup is the geometric mean of matched ratios (2026-11-01 qualification report).'
              }
            ],
            check: {
              q: 'Ising went from 414.054 s to 28.950 s. What does that say about our Demo 2 runs?',
              options: [
                'Nothing exact yet: small runs must be timed on their own',
                'They will be exactly 14.30× faster',
                'They will be slower on V3',
                'Their simulated times will shrink by 14.30×'
              ],
              answer: 0,
              why: 'Speedup depends on the workload, and only host time changes.'
            }
          },
          {
            title: 'The V3 loop in code',
            buildsOn: 'V3 keeps the Section 3 loop and makes each pass cheaper, giving 4× to 14× on large runs.',
            leadsTo: 'Next, the extra machinery V3.2 and V3.3 added around this loop for long cluster runs.',
            idea: [
              'The loop is *step_before_inner* in execution_compact/kernel/transitions.rs. It returns after one change.',
              'Two queues: events (a binary heap keyed by EventKey) and resource_events, which finish first at equal time.',
              '*next_time()* is the earliest time over all queues. If it is earlier than now, the engine stops: time never runs backwards.'
            ],
            sketch: [
              B(140, 20, 360, 40), T(320, 47, 'Python: session.step()', { anchor: 'middle', size: 16 }),
              A(320, 62, 320, 82),
              B(140, 85, 360, 40), T(320, 112, 'runtime/compact.rs: step()', { anchor: 'middle', size: 16 }),
              A(320, 127, 320, 147),
              B(140, 150, 360, 40), T(320, 177, 'evidence/execution.rs: advance_one', { anchor: 'middle', size: 16 }),
              A(320, 192, 320, 212),
              B(140, 215, 360, 40), T(320, 242, 'kernel/boundary.rs: advance_toward', { anchor: 'middle', size: 16 }),
              A(320, 257, 320, 277),
              B(140, 280, 360, 40, { c: 'green' }), T(320, 307, 'transitions.rs: step_before_inner', { anchor: 'middle', size: 16, c: 'green' })
            ],
            takeaway: 'session.step() → advance_one → advance_toward → step_before_inner.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Parent jobs waiting for admission, barrier releases, refills and factory resumes come first.', show: 'control work → do it, return' },
                { say: 'If every job is done, return the terminal step.', show: 'is_terminal() → return' },
                { say: 'Internally timed resources due now complete first.', show: 'resource_events.peek().at == now → complete' },
                { say: 'Then ordinary events due now, by kind: Arrival, Complete, Ready, Materialize and others.', show: 'events.peek().at == now → handle' },
                { say: 'Then the policy picks a winner and it is admitted.', show: 'winner() → admit(key)' },
                { say: 'Otherwise the clock moves to the earliest next time.', show: 'now = next_time()' }
              ]
            },
            math: [
              {
                h: 'The clock move, from the V3 source',
                eq: ['let Some(at) = self.next_time() else { error };', 'if at < self.now { error "event time regressed" }', 'self.advance_work(at)?; self.now = at;', 'self.ready.invalidate_all();'],
                why: 'After a jump every ready step is re-ranked once, since time-dependent checks may change.'
              }
            ],
            check: {
              q: 'next_time() returns a time earlier than now. What does V3 do?',
              options: [
                'Stops with an error: event time regressed',
                'Sets now to that earlier time',
                'Skips that event silently',
                'Waits for Python to fix it'
              ],
              answer: 0,
              why: 'Time must never go backwards in a discrete-event run.'
            }
          },
          {
            title: 'Around the loop: V3.2 and V3.3',
            buildsOn: 'The V3 loop lives in step_before_inner and processes every event one at a time.',
            leadsTo: 'The bridge to Section 6: what to present to Shuwen and how to show the change on Demo 2.',
            idea: [
              'V3.2: output saved in packed pages, *checkpoints* that save and continue, and resumable checking.',
              'The *independent checker* (crate hcu_evidence_check) is a separate program that re-derives the rules and verifies a run.',
              'V3.3: a *trace analyzer* that summarises long runs: resource use, backlog, latency and selected episodes.',
              'These serve multi-hour cluster runs at *NERSC*. None change simulated times. Our small demos do not need them.'
            ],
            sketch: [
              O(320, 165, 60, { c: 'blue' }), T(320, 160, 'V3 loop', { anchor: 'middle', size: 18, c: 'blue' }), T(320, 182, 'unchanged', { anchor: 'middle', size: 14 }),
              B(30, 40, 190, 50), T(125, 72, 'packed evidence', { anchor: 'middle', size: 16 }),
              B(420, 40, 190, 50), T(515, 72, 'checkpoints', { anchor: 'middle', size: 16 }),
              B(30, 240, 190, 50), T(125, 272, 'independent checker', { anchor: 'middle', size: 15 }),
              B(420, 240, 190, 50), T(515, 272, 'trace analyzer', { anchor: 'middle', size: 16 }),
              A(222, 80, 268, 130), A(418, 80, 372, 130), A(222, 250, 268, 200), A(418, 250, 372, 200)
            ],
            takeaway: 'V3.2 and V3.3 add saving, checking and analysis, not new physics.',
            widget: null,
            check: {
              q: 'What does the independent checker do?',
              options: [
                'Re-derives the rules separately and verifies the records of a finished run',
                'Runs the simulation again with a different seed',
                'Speeds up the event loop',
                'Decodes syndromes'
              ],
              answer: 0,
              why: 'It is a separate program that verifies the evidence the engine wrote.'
            }
          }
        ]
      },

      /* ============================ SECTION 6 ============================ */
      {
        title: 'Presenting it, and the Demo 2 check',
        intro: 'Shuwen asked for the simulator algorithm and the engine update next to Demo 1 and Demo 2. This section turns Sections 3 to 5 into that.',
        bridge: 'Next step: build V3 in a separate worktree, run the Demo 2 cells on both backends, and add the result to Demo 2 once approved.',
        tabs: [
          {
            title: 'Reading the request',
            buildsOn: 'V3 runs the same loop as V2, faster, with checkpoints, a checker and an analyzer around it.',
            leadsTo: 'Next, the one-minute explanation of the algorithm for the presentation.',
            idea: [
              'Our reading: "the simulator algorithm" is the discrete-event loop of Section 3, where every demo number comes from.',
              '"Panayiotis updated the engine" is V2 → V3.3.1 on main. Demo 1 and Demo 2 were made on V2.',
              'So the question to answer: what did V3 change, and do the demo numbers still hold on V3?'
            ],
            keys: [
              { tone: 'fix', h: 'Confirm with Shuwen', t: 'This reading comes from a short message. One line to Shuwen confirms it: the event loop, V2 versus V3, shown on Demo 2.' }
            ],
            sketch: [
              B(170, 20, 300, 60), T(320, 57, 'the request', { anchor: 'middle', size: 20 }),
              A(250, 85, 140, 150), A(390, 85, 500, 150),
              B(30, 155, 220, 60, { c: 'blue' }), T(140, 192, 'algorithm', { anchor: 'middle', size: 20, c: 'blue' }),
              B(390, 155, 220, 60, { c: 'red' }), T(500, 192, 'engine update', { anchor: 'middle', size: 20, c: 'red' }),
              T(140, 250, 'event loop', { anchor: 'middle', size: 18 }), T(500, 250, 'V2 → V3.3.1', { anchor: 'middle', size: 18 }),
              H(170, 270, 300, 40, { c: 'yellow' }), T(320, 297, 'do the demos still hold?', { anchor: 'middle', size: 18 })
            ],
            takeaway: 'Explain the loop, then show V2 and V3 agree on our runs.',
            widget: null,
            check: {
              q: 'Which engine produced the numbers on the current Demo 1 and Demo 2 pages?',
              options: ['V2, in microstep mode', 'V3 compact', 'V2 in Accelerated mode', 'The trace analyzer'],
              answer: 0,
              why: 'The demo branch predates V3, and its requests use microstep.'
            }
          },
          {
            title: 'The one-minute explanation',
            buildsOn: 'The request splits into the algorithm and the engine update, both checked against our demos.',
            leadsTo: 'Next, how to run the same request on both engines.',
            idea: [
              'Algorithm: keep a time-sorted event queue. Handle the earliest event, start any ready work that fits, jump the clock.',
              'Inputs are durations and capacities. Outputs are start and end times, so waiting shows up as a gap.',
              'Engine update: V3 runs the same loop with leaner state. Same timeline, 4× to 14× less host time on big runs.'
            ],
            sketch: [
              T(105, 80, 'event queue', { anchor: 'middle', size: 18 }),
              B(20, 90, 170, 120), T(40, 135, '2 µs  A', { size: 16 }), T(40, 165, '4 µs  B', { size: 16 }), T(40, 195, '6 µs  done A', { size: 16 }),
              A(195, 150, 245, 150),
              O(320, 150, 65, { c: 'blue' }), T(320, 145, 'handle,', { anchor: 'middle', size: 16 }), T(320, 168, 'start, jump', { anchor: 'middle', size: 16 }),
              A(390, 150, 440, 150),
              T(532, 80, 'trace', { anchor: 'middle', size: 18, c: 'green' }),
              B(445, 90, 175, 120, { c: 'green' }), L([[465, 130], [540, 130]], { c: 'blue' }), L([[520, 165], [600, 165]], { c: 'green' }),
              T(320, 275, 'same on V2 and V3', { anchor: 'middle', size: 20, c: 'red' })
            ],
            takeaway: 'Event queue, start what fits, jump the clock. V3: same, faster.',
            widget: null,
            check: {
              q: 'Which sentence describes V3 correctly?',
              options: [
                'The same event loop and results as V2, with less host time',
                'A new approximate algorithm that skips QEC rounds',
                'A Python rewrite of the engine',
                'A decoder that is 14 times faster'
              ],
              answer: 0,
              why: 'It is an exact rewrite of the state handling, not a new model.'
            }
          },
          {
            title: 'Switching backends',
            buildsOn: 'The presentation claims V2 and V3 give the same timeline. Our own runs should show it.',
            leadsTo: 'Next, exactly what the Demo 2 check runs and what it reports.',
            idea: [
              'Build main in a separate git *worktree*, so the demo branch stays untouched.',
              'In V3, start() runs compact and start(backend="reference") runs V2, from the same prepared model.',
              'The V3 session keeps step_many and finish, so run_request may need only a backend argument. Untested so far.'
            ],
            sketch: [
              B(220, 30, 200, 60), T(320, 67, 'prepared model', { anchor: 'middle', size: 18 }),
              A(270, 95, 150, 160, { c: 'blue' }), A(370, 95, 490, 160, { c: 'red' }),
              T(195, 118, 'start()', { anchor: 'end', size: 16, c: 'blue' }), T(450, 118, 'backend="reference"', { size: 16, c: 'red' }),
              B(40, 165, 220, 60, { c: 'blue' }), T(150, 202, 'V3 compact', { anchor: 'middle', size: 18, c: 'blue' }),
              B(380, 165, 220, 60, { c: 'red' }), T(490, 202, 'V2 reference', { anchor: 'middle', size: 18, c: 'red' }),
              A(150, 230, 280, 280), A(490, 230, 360, 280),
              T(320, 305, 'compare', { anchor: 'middle', size: 20, c: 'green' })
            ],
            takeaway: 'One prepared model, two backends, compare the traces.',
            widget: null,
            math: [
              {
                h: 'Planned change to run_request (not yet run)',
                eq: ['def run_request(engine, request, backend="compact"):', '  prep = engine.prepare_simulation_obj(cfg, jobs)', '  s = prep.start(backend=backend)', '  ...same stepping, then s.finish()'],
                why: 'A sketch: V3 is not built on this machine yet, so details may change.'
              }
            ],
            check: {
              q: 'Why build V3 in a separate worktree?',
              options: [
                'The demo branch stays exactly as it is while V3 is tested',
                'Worktrees make the engine faster',
                'V3 refuses to build in the main folder',
                'It pushes the build to GitHub'
              ],
              answer: 0,
              why: 'A worktree is a second checkout, isolated from the first.'
            }
          },
          {
            title: 'The Demo 2 check',
            buildsOn: 'One prepared model can start on V3 compact or on V2 reference.',
            leadsTo: 'Next, the whole plan in order, with what is still unknown.',
            idea: [
              'Take the Demo 2 cells (1, 2, 4, 8 and 32 streams) and run each on both backends.',
              'Compare total_time_s, the per-stream numbers and the trace rows. Expected: identical.',
              'Time each run on the host. Report the speedup we see, even if small: our runs are tiny next to GF or Ising.'
            ],
            keys: [
              { tone: 'main', h: 'If results differ', t: 'A mismatch is a finding to report to Panayiotis with the request, not something to round away. V3 also rejects features it lacks with "compact capability not implemented".' }
            ],
            sketch: [
              B(20, 30, 600, 260), L([[20, 75], [620, 75]]),
              T(35, 62, 'streams', { size: 16 }), T(150, 62, 'sim time', { size: 16 }), T(280, 62, 'match?', { size: 16 }),
              T(400, 62, 'host V2', { size: 16 }), T(510, 62, 'host V3', { size: 16 }),
              T(35, 115, '1', { size: 16 }), T(35, 165, '4', { size: 16 }), T(35, 215, '32', { size: 16 }),
              T(280, 115, 'expected ✓', { size: 16, c: 'green' }), T(430, 165, 'to measure', { size: 16, c: 'red' })
            ],
            takeaway: 'Same sim times expected. Host speedup measured, not assumed.',
            widget: null,
            check: {
              q: 'The check finds the 32-stream V3 total_time_s differs from V2 by 0.1 µs. What is the right next step?',
              options: [
                'Report it with the request, since the engines should match exactly',
                'Round it away, 0.1 µs is tiny',
                'Use the V3 number and drop V2',
                'Average the two numbers'
              ],
              answer: 0,
              why: 'Exact equality is the claim, so any gap is a real finding.'
            }
          },
          {
            title: 'The plan, in order',
            buildsOn: 'The Demo 2 check compares simulated times across backends and measures host time.',
            leadsTo: 'After this notebook: run the plan, then add one explainer panel and the check result to Demo 2.',
            idea: [
              '1. Build main in a worktree. 2. Run the Demo 1 baseline on both backends as a quick smoke test.',
              '3. Run the Demo 2 cells on both. 4. Add one panel to Demo 2: the event loop, V2 versus V3, and the check table.',
              'Unknowns: whether V3 supports every feature our requests use, and how large the host speedup is for small runs.'
            ],
            sketch: [
              O(80, 150, 40), T(80, 158, '1', { anchor: 'middle', size: 24 }), T(80, 230, 'build V3', { anchor: 'middle', size: 16 }),
              A(122, 150, 198, 150),
              O(240, 150, 40), T(240, 158, '2', { anchor: 'middle', size: 24 }), T(240, 230, 'Demo 1 smoke', { anchor: 'middle', size: 16 }),
              A(282, 150, 358, 150),
              O(400, 150, 40), T(400, 158, '3', { anchor: 'middle', size: 24 }), T(400, 230, 'Demo 2 cells', { anchor: 'middle', size: 16 }),
              A(442, 150, 518, 150),
              O(560, 150, 40, { c: 'green' }), T(560, 158, '4', { anchor: 'middle', size: 24, c: 'green' }), T(560, 230, 'add panel', { anchor: 'middle', size: 16, c: 'green' })
            ],
            takeaway: 'Build, smoke test, run Demo 2 on both, add one panel.',
            widget: null,
            check: {
              q: 'Why run the Demo 1 baseline before the Demo 2 cells?',
              options: [
                'It is one small run that shows quickly whether V3 accepts our requests',
                'Demo 2 needs Demo 1 results as input',
                'V3 can only run Demo 1',
                'It warms up the decoder'
              ],
              answer: 0,
              why: 'A cheap smoke test catches API or feature gaps before the big sweep.'
            }
          }
        ]
      }
    ]
  });
})();
