/* Notebook 3: the TandemQEC paper.
   Note: a queue and slot simulator widget would suit Sections 1 and 2 best. It does not exist in the shell,
   so the 'steps' widget is used there instead. */
(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;

  NB.register({
    id: 'tandemqec-paper',
    title: 'The TandemQEC paper',
    subtitle: 'Why QEC needs classical decoders, links and buffers sized together, and what the paper found.',
    category: 'Papers',
    cover: {
      palette: 3,
      art: [
        B(4, 42, 22, 22),
        A(26, 53, 37, 53),
        B(37, 42, 26, 22),
        A(63, 53, 74, 53),
        B(74, 42, 22, 22),
        K([[85, 42], [85, 22], [15, 22], [15, 42]]),
        D(15, 42, { r: 3.5 })
      ]
    },
    glossary: [
      {
        group: 'The quantum side',
        items: [
          { term: 'QPU', means: 'The quantum processor. It runs the circuit and holds the qubits.', aka: ['quantum processor'] },
          { term: 'syndrome', means: 'The list of check results from one QEC round. It hints where errors are.' },
          { term: 'QEC round', means: 'One pass of all the checks on a code. It makes one new syndrome.', aka: ['round'] },
          { term: 'ancilla', means: 'A helper qubit used to run a check. It is measured and reset each round.', aka: ['ancillas'] },
          { term: 'shot', means: 'One full run of a circuit: initialize, protect, read out, and finish the QEC drain.' },
          { term: 'circuit', hover: false, means: 'A fixed list of quantum operations. A job may run several circuits many times.' },
          { term: 'QEC drain', means: 'The wait after physical work ends, while the last decodes and feedback finish.' },
          { term: 'logical qubit', means: 'One protected qubit stored across many physical qubits.', aka: ['logical qubits'] },
          { term: 'surface code patch', means: 'One block of physical qubits that holds one logical qubit.', aka: ['patch', 'patches'] },
          { term: 'distance', means: 'How many errors a code can survive. Distance 3 fixes any one error.' },
          { term: 'Hadamard layer', means: 'A layer of Hadamard gates, which mix |0⟩ and |1⟩. It runs at the start and end of a round.' },
          { term: 'entangling layer', means: 'A layer of two-qubit gates that link data qubits to ancillas.' },
          { term: 'SX', means: 'A single-qubit gate, a quarter turn about X. It lasts 36 ns on the paper\'s IBM numbers.' },
          { term: 'CZ', means: 'A two-qubit gate that flips the sign when both qubits are 1. It lasts 80 ns here.' },
          { term: 'measurement', hover: false, means: 'Reading the qubits out. It takes 2,684 ns on the paper\'s IBM numbers.' },
          { term: 'reset', hover: false, means: 'Returning a qubit to |0⟩ so it can be reused. It takes 2,720 ns here.' }
        ]
      },
      {
        group: 'The classical side',
        items: [
          { term: 'decoder', means: 'The classical program that reads a syndrome and names the correction.' },
          { term: 'decoder pool', means: 'A set of decoder slots shared by all running jobs.', aka: ['pool'] },
          { term: 'decoder slot', means: 'One place in the pool. It serves one request at a time.', aka: ['slot'] },
          { term: 'request', hover: false, means: 'One piece of work sent to the decoder, such as a syndrome window.' },
          { term: 'feedback', means: 'The decoder\'s answer, sent back so the control system can act on it.' },
          { term: 'control system', means: 'The classical hardware that applies feedback to the QPU.' },
          { term: 'link', means: 'The wire that carries syndromes to the decoder and feedback back.' },
          { term: 'latency', means: 'The fixed delay before a message starts to arrive. Symbol L.' },
          { term: 'payload', means: 'The size of a message in bytes. Symbol V.' },
          { term: 'bandwidth', means: 'How many bytes per second a link carries. Symbol B.' },
          { term: 'queue', means: 'The line of requests waiting for a slot.' },
          { term: 'in-flight window', means: 'The requests a job has sent that are still waiting for an answer. The paper also calls it the in-flight allowance.', aka: ['in-flight allowance'] },
          { term: 'buffer', means: 'Waiting space with a fixed size K. It holds items between stages.', aka: ['buffers'] },
          { term: 'backlog setting', means: 'Buffer room for a job\'s waiting transfers. Backlog b allows b + 1 transfer entries.', aka: ['backlog 4', 'backlog 1'] },
          { term: 'backpressure', means: 'When a buffer is full, a sender must wait until space opens.' },
          { term: 'backlog', means: 'Work that has arrived and is still waiting. It grows if work arrives too fast.' },
          { term: 'throughput', means: 'Whether the decoder keeps pace with the arriving work.' },
          { term: 'non-preemptive', means: 'Once a request starts, it runs to the end without being paused.' },
          { term: 'FIFO', means: 'First in, first out. The oldest waiting request goes first.' }
        ]
      },
      {
        group: 'The model and its timeline',
        items: [
          { term: 'job', means: 'One run of a quantum application. It may repeat circuits over many shots.', aka: ['jobs'] },
          { term: 'operation', hover: false, means: 'One step in a job: a gate layer, a decode or a transfer.', aka: ['operations'] },
          { term: 'operation graph', means: 'The job drawn as steps with arrows for what must finish first.' },
          { term: 'ready time', means: 'When all an operation\'s earlier steps are done. Symbol r.' },
          { term: 'start time', means: 'When the operation actually begins. It is at or after r. Symbol s.' },
          { term: 'completion time', means: 'When it ends: c = s + d. Symbol c.' },
          { term: 'service duration', means: 'How long the operation runs once started. Symbol d.' },
          { term: 'capacity', means: 'How much of a resource exists. Symbol C.' },
          { term: 'release boundary', means: 'The moment a resource is freed after use.' },
          { term: 'window', hover: false, means: 'A few consecutive rounds decoded together. Windows overlap.', aka: ['windows'] },
          { term: 'stride', means: 'How far the next window moves forward.' },
          { term: 'committed frontier', means: 'The latest round with every needed result back.' },
          { term: 'joint provisioning', means: 'Choosing decoder, link and buffer capacity together.' },
          { term: 'service profile', means: 'Measured or declared decode times for one code, decoder and machine.' }
        ]
      },
      {
        group: 'Measuring',
        items: [
          { term: 'runtime', means: 'Completion time minus arrival time for a job. Symbol T.' },
          { term: 'utilization', means: 'The share of a resource\'s capacity in use, averaged over the run. Symbol U.' },
          { term: 'zero-decoder-service control', means: 'The same run with decode time set to zero. It shows delay caused by decoding.', aka: ['zero-service control', 'control run'] },
          { term: 'feasible', means: 'A design that meets every runtime and waiting limit.' },
          { term: 'near-best', means: 'A design whose runtime is within 5% of the best found.' },
          { term: 'p95', means: '95% of requests finish at least this fast.', aka: ['95th percentile'] },
          { term: 'relative error', means: '|predicted − measured| / |measured|. Symbol e.' },
          { term: 'ms', hover: false, means: 'Millisecond, a thousandth of a second.' },
          { term: 'µs', hover: false, means: 'Microsecond, a millionth of a second.' },
          { term: 'ns', hover: false, means: 'Nanosecond, a billionth of a second.' },
          { term: 'GB/s', hover: false, means: 'Gigabytes per second, a unit of bandwidth.' }
        ]
      },
      {
        group: 'Hardware types',
        items: [
          { term: 'modality', means: 'A kind of qubit hardware.', aka: ['modalities'] },
          { term: 'superconducting', means: 'Qubits made from circuits. Fast gates, so decoding keeps up with less slack.' },
          { term: 'trapped ion', means: 'Qubits held in ions. Slow physical steps, so decoding rarely limits.', aka: ['trapped-ion'] },
          { term: 'neutral atom', means: 'Qubits held in atoms. Two readout styles are studied.', aka: ['neutral-atom'] },
          { term: 'deferred readout', means: 'A neutral-atom style that uses fresh ancillas, so the footprint grows.' },
          { term: 'streaming reuse', means: 'A neutral-atom style that images, cools and reuses ancillas.' },
          { term: 'memory job', means: 'A job that keeps one logical qubit alive for a set number of rounds.', aka: ['memory program'] }
        ]
      }
    ],
    sections: [
      /* ============================ SECTION 1 ============================ */
      {
        title: 'The problem',
        intro: 'A quantum computer that corrects its own errors depends on a classical computer answering in time. This section shows why that is hard and what the paper proposes.',
        bridge: 'You now see the stakes: a late answer stalls the quantum side, and sharing makes it worse. Section 2 names each classical part and when it is freed.',
        tabs: [
          {
            title: 'Quantum work waits for answers',
            buildsOn: 'QEC basics showed that checks produce a syndrome and a decoder turns it into a fix. Here we ask how fast that must happen.',
            leadsTo: 'Next, a plain classical picture of the same trouble: work that arrives faster than it can be served.',
            idea: [
              'A *syndrome* is the list of check results from one QEC round. A *decoder* is the classical program that reads it and names a fix.',
              'The *QPU* (quantum processor) repeats QEC rounds, each a few microseconds long. Every round makes a new syndrome.',
              'Some operations must wait for the decoder\'s answer. If it is late, the QPU pauses.'
            ],
            sketch: [
              B(30, 70, 150, 90, { c: 'blue' }),
              T(105, 125, 'QPU', { anchor: 'middle', size: 34 }),
              A(185, 95, 330, 95, { c: 'blue' }),
              T(258, 80, 'syndrome', { anchor: 'middle', size: 24, c: 'blue' }),
              B(335, 70, 150, 90),
              T(410, 125, 'decoder', { anchor: 'middle', size: 30 }),
              A(330, 140, 185, 140, { c: 'red' }),
              T(258, 175, 'answer', { anchor: 'middle', size: 24, c: 'red' }),
              H(40, 225, 400, 44, { c: 'yellow' }),
              T(50, 258, 'late answer = QPU waits', { size: 30 })
            ],
            takeaway: 'A late decoder answer pauses the QPU.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'A QEC round ends. The QPU measures its check qubits.', show: 'syndrome ready' },
                { say: 'The syndrome travels to the decoder.', show: 'QPU  →  decoder' },
                { say: 'The decoder works out the fix.', show: 'decoding' },
                { say: 'The answer travels back.', show: 'decoder  →  QPU' },
                { say: 'Only now can the operation that needed it run.', show: 'late answer = idle QPU' }
              ]
            },
            check: {
              q: 'What happens if the decoder\'s answer is late?',
              options: [
                'The QPU has to pause the operation that needs it',
                'The qubits are copied to a backup',
                'The syndrome is thrown away',
                'The code distance goes up'
              ],
              answer: 0,
              why: 'Some operations cannot run until the answer arrives, so the QPU idles.'
            }
          },
          {
            title: 'A classical cousin: one cook',
            buildsOn: 'A late decoder answer pauses the QPU. The cause can be as simple as work arriving faster than it is finished.',
            leadsTo: 'Next, two different questions you can ask about such a system: does it keep pace, and how long does one item take.',
            idea: [
              'Picture a kitchen with one cook. Orders arrive, and the cook finishes one at a time.',
              'If orders arrive faster than the cook works, a line forms. That line is the *backlog*, and it only grows.',
              'The decoder is the cook. Syndromes are the orders.'
            ],
            sketch: [
              T(30, 55, 'orders', { size: 26 }),
              A(30, 80, 120, 80),
              B(130, 55, 50, 50), B(190, 55, 50, 50), B(250, 55, 50, 50),
              T(190, 140, 'the line (backlog)', { anchor: 'middle', size: 24, c: 'red' }),
              A(305, 80, 370, 80),
              O(420, 80, 45),
              T(420, 88, 'cook', { anchor: 'middle', size: 26 }),
              T(30, 230, 'orders arrive faster than served', { size: 28 }),
              T(30, 280, 'so the line only grows', { size: 28, c: 'red' })
            ],
            takeaway: 'Work arriving faster than service builds a growing line.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'An order arrives every 2 minutes. The cook needs 3 minutes for each.', show: 'arrive: 1 per 2 min   serve: 1 per 3 min' },
                { say: 'At 2 minutes, order 2 arrives while the cook is still on order 1.', show: 'waiting: 1' },
                { say: 'At 8 minutes, orders 1 to 5 have arrived. The cook finished two and is on the third.', show: 'waiting: 2' },
                { say: 'Order 2 waited 1 minute. Order 3 waited 2. Order 4 will wait 3.', show: 'each order waits 1 minute longer' }
              ]
            },
            check: {
              q: 'Orders arrive every 2 minutes. One cook needs 3 minutes each. What happens to the line?',
              options: ['It keeps growing', 'It settles at one order', 'It empties after a while', 'It stays at zero'],
              answer: 0,
              why: 'Work arrives faster than it is finished, so each order waits one minute longer than the last.'
            }
          },
          {
            title: 'Throughput versus latency',
            buildsOn: 'The cook showed that a line grows when arrivals outpace service. That is one question. A second, separate question is how long one order takes.',
            leadsTo: 'Next, the setting of the paper: many jobs sharing one decoder pool and one link.',
            idea: [
              '*Throughput* asks: does the decoder keep pace with the stream of syndromes? If not, the backlog grows.',
              '*Latency* asks: how long until the answer to one particular syndrome is back?',
              'A decoder can keep pace and still answer too slowly for the operation waiting on it. Both matter.'
            ],
            sketch: [
              T(170, 50, 'throughput', { anchor: 'middle', size: 28, c: 'blue' }),
              D(40, 110, { c: 'blue' }), D(80, 110, { c: 'blue' }), D(120, 110, { c: 'blue' }),
              A(135, 110, 195, 110, { c: 'blue' }),
              B(200, 80, 80, 60),
              T(170, 180, 'keeps pace?', { anchor: 'middle', size: 24 }),
              T(480, 50, 'latency', { anchor: 'middle', size: 28, c: 'red' }),
              D(360, 110, { c: 'red' }),
              A(370, 110, 590, 110, { c: 'red' }),
              T(480, 180, 'how long for one?', { anchor: 'middle', size: 24 }),
              H(60, 230, 500, 44, { c: 'yellow' }),
              T(70, 262, 'can keep pace and still answer late', { size: 28 })
            ],
            takeaway: 'Keeping pace and answering fast are different questions.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Suppose a syndrome arrives every 6 µs. This is an illustration, not the paper\'s numbers.', show: 'arrival: 1 per 6 µs' },
                { say: 'The decoder needs 2 µs for each one. It keeps pace, so there is no backlog.', show: 'throughput: fine' },
                { say: 'But one answer needs 2 µs to decode plus 10 µs of travel.', show: 'latency: 12 µs' },
                { say: 'The operation waiting on that answer idles for 12 µs.', show: 'fast enough in volume, too slow in time' }
              ]
            },
            check: {
              q: 'A decoder finishes each syndrome before the next arrives, but each answer takes long to come back. Which is poor?',
              options: ['Latency', 'Throughput', 'Both', 'Neither'],
              answer: 0,
              why: 'It keeps pace (throughput is fine), but one answer takes too long (latency is poor).'
            }
          },
          {
            title: 'Many jobs share one pool and one link',
            buildsOn: 'Latency and throughput apply to any decoder. In practice a lab runs several quantum jobs at once on shared classical hardware.',
            leadsTo: 'Next, the paper\'s headline test: what happens when you upgrade only the decoder, or only the link.',
            idea: [
              'A *job* is one run of a quantum application. It may repeat circuits over many *shots* (full runs).',
              'A *decoder pool* is a set of decoders. A *link* is the wire that carries syndromes in and answers out.',
              'Each job has its own qubits, but all jobs share the same pool and link. One job\'s syndromes can sit behind another\'s.'
            ],
            sketch: [
              B(30, 40, 80, 50), T(70, 74, 'job A', { anchor: 'middle', size: 24 }),
              B(30, 120, 80, 50), T(70, 154, 'job B', { anchor: 'middle', size: 24 }),
              B(30, 200, 80, 50), T(70, 234, 'job C', { anchor: 'middle', size: 24 }),
              A(115, 65, 225, 140), A(115, 145, 225, 145), A(115, 225, 225, 150),
              B(230, 110, 90, 70, { c: 'blue' }), T(275, 152, 'link', { anchor: 'middle', size: 28, c: 'blue' }),
              A(325, 145, 400, 145),
              B(405, 100, 90, 40), T(450, 128, 'slot', { anchor: 'middle', size: 24 }),
              B(405, 150, 90, 40), T(450, 178, 'slot', { anchor: 'middle', size: 24 }),
              T(450, 90, 'pool', { anchor: 'middle', size: 26, c: 'red' })
            ],
            takeaway: 'Jobs share one link and one pool, so they can block each other.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Job A and job B each send a syndrome at the same moment.', show: 'two requests arrive together' },
                { say: 'They share one link. One goes first and the other waits.', show: 'wait 1: the link' },
                { say: 'Both reach the pool. If only one slot is free, the second waits again.', show: 'wait 2: the pool' },
                { say: 'Each wait is idle time on a QPU that is holding its place.', show: 'cost lands on the quantum side' }
              ]
            },
            check: {
              q: 'Why can one job slow another down?',
              options: [
                'They share the link and the decoder pool',
                'Their qubits interfere',
                'They run the same circuit',
                'The code distance is shared'
              ],
              answer: 0,
              why: 'Requests from all jobs wait for the same link and the same slots.'
            }
          },
          {
            title: 'Fixing one side alone does nothing',
            buildsOn: 'Shared links and pools create two places where requests can wait. The obvious fix is to upgrade one of them.',
            leadsTo: 'Next, the name the paper gives to sizing both together, and the three things it contributes.',
            idea: [
              'The test: 32 jobs. Baseline is 2 decoder slots and a 1 GB/s link (gigabytes per second). Runtime is in ms (milliseconds).',
              '8 times more decoder slots alone: runtime stays 1,932.471 ms. 8 times more link bandwidth alone: 1,891.916 ms, only 2.1% better.',
              'Both together: 463.682 ms. That is a 76.0% cut, or 4.17 times faster.',
              'Each side hides the other: extra slots sit idle behind a slow link, and a faster link just moves the wait to decoding.'
            ],
            sketch: [
              T(320, 40, '32 jobs: runtime in ms', { anchor: 'middle', size: 28 }),
              B(60, 130, 100, 140),
              B(220, 134, 100, 136),
              B(380, 236, 100, 34, { c: 'green' }),
              T(110, 122, '1,932', { anchor: 'middle', size: 24 }),
              T(270, 126, '1,892', { anchor: 'middle', size: 24 }),
              T(430, 228, '464', { anchor: 'middle', size: 24, c: 'green' }),
              T(110, 300, 'slots ×8', { anchor: 'middle', size: 24 }),
              T(270, 300, 'link ×8', { anchor: 'middle', size: 24 }),
              T(430, 300, 'both ×8', { anchor: 'middle', size: 24, c: 'green' })
            ],
            takeaway: 'Only upgrading decoder and link together paid off.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Baseline for 32 jobs: 2 decoder slots and 1 GB/s, 0.1 µs latency.', show: '1,932.471 ms' },
                { say: 'Make decoding 8 times bigger (16 slots) and leave the link alone.', show: '1,932.471 ms   (no change)' },
                { say: 'Make the link 8 times bigger (8 GB/s) and leave decoding alone.', show: '1,891.916 ms   (2.1% better)' },
                { say: 'Upgrade both.', show: '463.682 ms   (76.0% cut, 4.17× faster)' },
                { say: 'Why: each side hides the other. Idle slots sit behind a slow link, and a faster link just moves the wait to decoding.', show: 'the bottleneck moves' },
                { say: 'The gain grows with the number of jobs: the joint upgrade cuts 30.1% at 8 jobs and 61.9% at 16.', show: '8 jobs: −30.1% · 16: −61.9% · 32: −76.0%' }
              ]
            },
            check: {
              q: 'In the 32-job test, what did 8 times more decoder slots alone do to runtime?',
              options: ['Left it unchanged', 'Cut it by 76%', 'Cut it in half', 'Doubled it'],
              answer: 0,
              why: 'The link was the limit, so extra slots sat idle. Runtime stayed at 1,932.471 ms.'
            }
          },
          {
            title: 'Joint provisioning and the three contributions',
            buildsOn: 'Fixing one side alone did nothing, because the wait just moved to the other side. The cure is to size all parts at once.',
            leadsTo: 'Next, the plain parts of the model: slots, queues, buffers and links, and when each is freed.',
            idea: [
              '*Joint provisioning* means choosing decoder, link and buffer capacity (limited waiting space) together, not one at a time.',
              'Contribution 1: a model that keeps three moments apart: a decoder finishes, a resource is freed, quantum work may resume.',
              'Contribution 2: an analysis of which decoder, link and buffer mixes meet a runtime target.',
              'Contribution 3: checks against real decoders, and studies on 5 code families, 4 physical protocols and 3 hardware types.'
            ],
            sketch: [
              B(30, 60, 170, 90), T(115, 112, 'model', { anchor: 'middle', size: 32 }),
              B(235, 60, 170, 90), T(320, 112, 'analysis', { anchor: 'middle', size: 32 }),
              B(440, 60, 170, 90), T(525, 112, 'studies', { anchor: 'middle', size: 32 }),
              A(205, 105, 230, 105), A(410, 105, 435, 105),
              T(115, 190, 'how QEC work\nflows', { anchor: 'middle', size: 22 }),
              T(320, 190, 'which capacities\nmeet targets', { anchor: 'middle', size: 22 }),
              T(525, 190, 'real codes and\nhardware', { anchor: 'middle', size: 22 })
            ],
            takeaway: 'Size decoders, links and buffers together, then test the mix.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Model: describe jobs, decodes, transfers and buffers on one timeline.', show: 'this notebook, Sections 2 and 3' },
                { say: 'Checks: compare the model with real decoder runs.', show: 'this notebook, Section 4' },
                { say: 'Analysis and studies: which decoder, link and buffer mixes meet a target, on real codes and hardware.', show: 'this notebook, Sections 5 and 6' },
                { say: 'The three hardware types are superconducting, trapped-ion and neutral-atom.', show: 'called modalities' }
              ]
            },
            check: {
              q: 'What does joint provisioning mean?',
              options: [
                'Choosing decoder, link and buffer capacity together',
                'Sharing one qubit between two jobs',
                'Decoding two syndromes at once',
                'Running two codes on one patch'
              ],
              answer: 0,
              why: 'The paper sizes all the classical parts at once, because fixing one alone just moves the wait.'
            }
          }
        ]
      },

      /* ============================ SECTION 2 ============================ */
      {
        title: 'Resources and when they free up',
        intro: 'A request needs several resources at once. Each is held for a different stretch of time, and that timing explains most of the waiting.',
        bridge: 'You now know the parts and the moment each one is freed. Section 3 puts them on a timeline with a few simple equations.',
        tabs: [
          {
            title: 'A decoder slot serves one request',
            buildsOn: 'Section 1 showed that requests wait at the link and at the pool. Now we look inside the pool.',
            leadsTo: 'Next, the line of requests waiting for a slot, and the limit each job puts on its own outstanding requests.',
            idea: [
              'So far: a syndrome crosses a link, is decoded, and the answer crosses back. Each stage can make it wait.',
              'A *decoder slot* is one place in the pool. It handles one *request* (one piece of decoding work) at a time.',
              'Two slots serve two requests in parallel. A third must wait.',
              'Once started, a request is not paused (*non-preemptive*). It runs for its full service time.'
            ],
            sketch: [
              B(40, 50, 120, 60), T(100, 90, 'slot 1', { anchor: 'middle', size: 26 }),
              B(40, 130, 120, 60), T(100, 170, 'slot 2', { anchor: 'middle', size: 26 }),
              D(100, 70, { c: 'blue' }), D(100, 150, { c: 'blue' }),
              T(180, 78, 'serving request 1', { size: 24, c: 'blue' }),
              T(180, 158, 'serving request 2', { size: 24, c: 'blue' }),
              B(40, 220, 120, 60, { c: 'red', dash: true }),
              T(100, 258, 'request 3', { anchor: 'middle', size: 26, c: 'red' }),
              T(180, 250, 'waits for a free slot', { size: 24, c: 'red' })
            ],
            takeaway: 'A slot serves one request at a time, start to finish.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Two slots, three requests arrive together.', show: 'slots: 2   requests: 3' },
                { say: 'Requests 1 and 2 start at once, one per slot.', show: 'running: 2   waiting: 1' },
                { say: 'Request 3 cannot interrupt them. It waits for the first to finish.', show: 'non-preemptive' },
                { say: 'When a slot frees, request 3 starts.', show: 'running: 2   waiting: 0' }
              ]
            },
            check: {
              q: 'Two slots are busy and a third request arrives. What happens?',
              options: [
                'It waits until a slot finishes',
                'It interrupts the shorter request',
                'It splits across both slots',
                'It is dropped'
              ],
              answer: 0,
              why: 'A started request runs to the end, so the newcomer waits for a free slot.'
            }
          },
          {
            title: 'The queue and the in-flight window',
            buildsOn: 'A slot serves one request at a time, so the others wait somewhere. This tab names that place and a second limit on top of it.',
            leadsTo: 'Next, the buffers that hold items between stages, and what happens when one is full.',
            idea: [
              'A *queue* holds requests waiting for a slot.',
              'Each job also has an *in-flight window* (the paper also says in-flight allowance): requests sent whose answer is not back yet.',
              'A request stays in the window until its answer is back. A full window blocks the next send, even if a decoder slot sits idle.'
            ],
            sketch: [
              B(30, 70, 120, 70, { c: 'blue' }), T(90, 112, 'job', { anchor: 'middle', size: 30 }),
              A(155, 105, 300, 105, { c: 'blue' }),
              T(228, 90, 'request 1', { anchor: 'middle', size: 22, c: 'blue' }),
              B(305, 70, 130, 70), T(370, 112, 'decoder', { anchor: 'middle', size: 28 }),
              T(370, 165, 'idle', { anchor: 'middle', size: 26, c: 'red' }),
              B(30, 190, 120, 50, { c: 'red', dash: true }),
              T(90, 224, 'request 2', { anchor: 'middle', size: 22, c: 'red' }),
              T(170, 218, 'blocked: window full', { size: 24, c: 'red' })
            ],
            takeaway: 'A full window holds a job back even when a slot is idle.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'The window holds 1 request. The job sends request 1.', show: 'window: 1 of 1 used' },
                { say: 'The decoder finishes. The answer is still on its way back.', show: 'window still held' },
                { say: 'Request 2 is ready but cannot be sent. The decoder sits idle.', show: 'decoder idle, request 2 waits' },
                { say: 'The answer arrives. The window frees. Request 2 goes.', show: 'window: 1 of 1 used again' }
              ]
            },
            check: {
              q: 'A job\'s window is full and a decoder slot is idle. Can the job send another request?',
              options: [
                'No, it must wait for an answer first',
                'Yes, the idle slot takes it',
                'Yes, but only to the queue',
                'Only if the buffer is empty'
              ],
              answer: 0,
              why: 'The window limits outstanding requests, so the job waits for an answer to free it.'
            }
          },
          {
            title: 'Buffers and backpressure',
            buildsOn: 'The queue and window limit who may send. Between stages, items also wait in fixed-size spaces.',
            leadsTo: 'Next, how long a message takes on the link, since a message holds the link while it travels.',
            idea: [
              'A *buffer* is waiting space with room for K items. The count b(t) at time t must stay between 0 and K.',
              'b(t) = b(0) + A(t) − R(t), where A(t) is arrivals so far and R(t) is releases so far.',
              'When a buffer is full, *backpressure* applies: the sender\'s request stays pending until space opens.',
              'Plain cousin: a full inbox. New mail waits at the door.'
            ],
            sketch: [
              B(60, 100, 90, 80), B(160, 100, 90, 80), B(260, 100, 90, 80, { c: 'red' }),
              T(105, 150, 'item', { anchor: 'middle', size: 24 }),
              T(205, 150, 'item', { anchor: 'middle', size: 24 }),
              T(305, 85, 'K = 3', { anchor: 'middle', size: 26, c: 'red' }),
              A(10, 140, 55, 140, { c: 'blue' }),
              T(30, 125, 'new', { anchor: 'middle', size: 22, c: 'blue' }),
              A(355, 140, 410, 140),
              T(480, 150, 'leaves', { anchor: 'middle', size: 24 }),
              T(60, 240, 'full: the sender waits', { size: 28, c: 'red' })
            ],
            takeaway: 'A full buffer makes the sender wait. That is backpressure.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'A buffer with room for 2 items starts empty.', show: 'K = 2   b = 0' },
                { say: 'Two items arrive.', show: 'A = 2, R = 0   b = 2 (full)' },
                { say: 'A third item tries to enter and must wait. This is backpressure.', show: 'third item pending' },
                { say: 'One item leaves.', show: 'R = 1   b = 1' },
                { say: 'The third item enters.', show: 'A = 3, R = 1   b = 2' }
              ]
            },
            check: {
              q: 'A buffer holds K = 2 items and is full. A third arrives. What happens?',
              options: [
                'It waits until an item leaves',
                'The oldest item is deleted',
                'The buffer grows to 3',
                'It skips the buffer'
              ],
              answer: 0,
              why: 'The size is fixed, so the new item stays pending until space opens.'
            }
          },
          {
            title: 'Link time: latency plus size over speed',
            buildsOn: 'Buffers hold items between stages. Moving an item from one stage to the next takes time on the link.',
            leadsTo: 'Next, a table of which event frees which resource, with the link transfer as one of the events.',
            idea: [
              'Sending a message takes a fixed *latency* L (delay before data starts to arrive) plus the time to push the data through.',
              'The data time is the *payload* V (message size in bytes) divided by the *bandwidth* B (bytes per second).',
              'Transfer time = L + V / B. In the paper\'s sweeps, a transfer holds the shared link for this whole time.',
              'A big message on a slow link is ruled by V / B. A tiny message on a fast link is ruled by L.'
            ],
            sketch: [
              T(320, 45, 'transfer time = L + V / B', { anchor: 'middle', size: 30 }),
              L([[60, 140], [120, 140]], { c: 'red' }),
              T(90, 120, 'L', { anchor: 'middle', size: 28, c: 'red' }),
              T(90, 175, 'wait', { anchor: 'middle', size: 22, c: 'red' }),
              L([[120, 140], [500, 140]], { c: 'blue' }),
              T(310, 120, 'V / B', { anchor: 'middle', size: 28, c: 'blue' }),
              T(310, 175, 'push the bytes through', { anchor: 'middle', size: 22, c: 'blue' }),
              T(60, 250, 'bigger message or slower link: longer', { size: 26 })
            ],
            takeaway: 'Transfer time is latency plus size divided by bandwidth.',
            widget: {
              type: 'stack',
              unit: 'µs',
              segments: [
                { label: 'Latency L', v: 0.1 },
                { label: 'Payload over bandwidth V / B', v: 1.0 }
              ],
              note: 'Illustration: a 1,024-byte syndrome on a 1 GB/s link with 0.1 µs latency takes about 1.1 µs.'
            },
            check: {
              q: 'Latency is 1 µs, the payload is 1,000 bytes and the bandwidth is 1,000 bytes per µs. How long is the transfer?',
              options: ['2 µs', '1 µs', '1,001 µs', '0.5 µs'],
              answer: 0,
              why: 'L = 1 µs and V / B = 1,000 / 1,000 = 1 µs, so the total is 2 µs.'
            }
          },
          {
            title: 'Which event frees which resource',
            buildsOn: 'You now know the slot, the window, the buffers and the link. A request holds several of them at once, each for a different stretch.',
            leadsTo: 'Next, how decoder windows finish out of order and what that means for progress.',
            idea: [
              'A request holds several resources at once. Each is freed at its own moment, its *release boundary*.',
              'QPU partition (the job\'s share of qubits): freed when its task and its *QEC drain* finish. The drain is the wait for the last decodes.',
              'Decoder slot: freed when decoding ends. In-flight window: freed when the feedback transfer ends.',
              'Syndrome buffer: freed when the decoder takes the item. Feedback buffer: freed when the control system applies it.'
            ],
            sketch: [
              L([[40, 150], [600, 150]]),
              D(60, 150), D(170, 150), D(280, 150), D(390, 150), D(500, 150),
              T(60, 120, 'in', { anchor: 'middle', size: 22 }),
              T(170, 120, 'decoder\ntakes it', { anchor: 'middle', size: 20, c: 'blue' }),
              T(280, 120, 'decode\nends', { anchor: 'middle', size: 20, c: 'blue' }),
              T(390, 120, 'transfer\nends', { anchor: 'middle', size: 20, c: 'blue' }),
              T(500, 120, 'control\napplies', { anchor: 'middle', size: 20, c: 'blue' }),
              T(170, 200, 'syndrome\nbuffer', { anchor: 'middle', size: 20, c: 'red' }),
              T(280, 200, 'slot', { anchor: 'middle', size: 22, c: 'red' }),
              T(390, 200, 'window', { anchor: 'middle', size: 22, c: 'red' }),
              T(500, 200, 'feedback\nbuffer', { anchor: 'middle', size: 20, c: 'red' })
            ],
            takeaway: 'Each resource frees at its own event, not all at the end.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'A syndrome enters the syndrome buffer.', show: 'buffer space taken' },
                { say: 'The decoder admits it. Buffer space frees and a slot is taken.', show: 'syndrome buffer: freed' },
                { say: 'Decoding ends.', show: 'slot: freed' },
                { say: 'The feedback crosses the link. The in-flight window is still held.', show: 'window: held' },
                { say: 'The transfer ends and the feedback waits for the control system.', show: 'window: freed' },
                { say: 'The control system applies it.', show: 'feedback buffer: freed' }
              ]
            },
            check: {
              q: 'When is the decoder slot freed?',
              options: [
                'When decoding ends',
                'When the control system applies the feedback',
                'When the shot ends',
                'When the syndrome is measured'
              ],
              answer: 0,
              why: 'The slot is held only while the decoder works. The feedback transfer is covered by the in-flight window.'
            }
          },
          {
            title: 'Windows and the committed frontier',
            buildsOn: 'Resources are freed at different events. Decoding itself also has structure: it works on stretches of rounds that may finish out of order.',
            leadsTo: 'Next, how the model gives every operation a ready, start and completion time.',
            idea: [
              'A decoder reads a *window*: a few consecutive rounds at once. Windows overlap, and each steps forward by a *stride*.',
              'The *committed frontier* is the latest round for which every needed result is back.',
              'Windows over rounds 1 to 4 and 3 to 6 settle rounds 1 to 2 and 3 to 4.',
              'If window 2 finishes first, progress still waits for window 1.'
            ],
            sketch: [
              L([[40, 150], [600, 150]]),
              D(80, 150), D(170, 150), D(260, 150), D(350, 150), D(440, 150), D(530, 150),
              T(80, 180, '1', { anchor: 'middle', size: 22 }), T(170, 180, '2', { anchor: 'middle', size: 22 }),
              T(260, 180, '3', { anchor: 'middle', size: 22 }), T(350, 180, '4', { anchor: 'middle', size: 22 }),
              T(440, 180, '5', { anchor: 'middle', size: 22 }), T(530, 180, '6', { anchor: 'middle', size: 22 }),
              K([[70, 130], [70, 100], [360, 100], [360, 130]], { c: 'blue' }),
              T(215, 85, 'window 1', { anchor: 'middle', size: 24, c: 'blue' }),
              K([[250, 120], [250, 235], [540, 235], [540, 190]], { c: 'red' }),
              T(395, 265, 'window 2', { anchor: 'middle', size: 24, c: 'red' })
            ],
            takeaway: 'Progress stops at the first gap, even if a later window is done.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Window 1 covers rounds 1 to 4 and settles rounds 1 to 2.', show: 'window 1 → rounds 1, 2' },
                { say: 'Window 2 covers rounds 3 to 6 and settles rounds 3 to 4.', show: 'window 2 → rounds 3, 4' },
                { say: 'Window 2 finishes first. Rounds 3 and 4 are known, but rounds 1 and 2 are not.', show: 'frontier: still at the start' },
                { say: 'Window 1 finishes. Now rounds 1 to 4 are all settled.', show: 'frontier: round 4' }
              ]
            },
            check: {
              q: 'Window 2 finishes before window 1. Where is the committed frontier?',
              options: [
                'Still before round 1, because of the gap',
                'At round 4',
                'At round 6',
                'At round 2'
              ],
              answer: 0,
              why: 'The frontier needs every result up to it. Rounds 1 and 2 are missing, so it cannot move.'
            }
          }
        ]
      },

      /* ============================ SECTION 3 ============================ */
      {
        title: 'The model: a timeline for every step',
        intro: 'The paper models a job as steps with times attached. A few equations turn the parts from Section 2 into a timeline you can read off.',
        bridge: 'You can now follow one request through the model, from ready time to release. Section 4 shows how the paper measures results and checks the model against real decoders.',
        tabs: [
          {
            title: 'A job is a graph of operations',
            buildsOn: 'Section 2 gave you the parts: slots, queues, buffers and links. Now we order the work that uses them.',
            leadsTo: 'Next, three times attached to every operation: when it is ready, when it starts and when it ends.',
            idea: [
              'An *operation* is one step: a gate layer, a decode or a transfer.',
              'A job is an *operation graph*: steps joined by arrows for what must finish first. Some steps fork, others join.',
              'An operation cannot start before every step it depends on is done.'
            ],
            sketch: [
              B(30, 120, 90, 50), T(75, 154, 'prepare', { anchor: 'middle', size: 22 }),
              A(125, 135, 190, 80), A(125, 155, 190, 210),
              B(195, 55, 90, 50), T(240, 89, 'run A', { anchor: 'middle', size: 22 }),
              B(195, 185, 90, 50), T(240, 219, 'run B', { anchor: 'middle', size: 22 }),
              A(290, 80, 355, 135), A(290, 210, 355, 160),
              B(360, 120, 90, 50), T(405, 154, 'join', { anchor: 'middle', size: 22 }),
              T(75, 100, 'fork', { anchor: 'middle', size: 22, c: 'red' }),
              T(500, 150, 'waits for\nboth', { size: 22, c: 'red' })
            ],
            takeaway: 'A step waits for every step it depends on.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Prepare finishes. Two steps, run A and run B, can start.', show: 'fork' },
                { say: 'Run A and run B may take different times.', show: 'A: 5 µs   B: 9 µs' },
                { say: 'The join step needs both. It must wait for the slower one.', show: 'join starts after 9 µs' }
              ]
            },
            check: {
              q: 'A join step depends on two steps that take 5 µs and 9 µs. When can it start?',
              options: ['After 9 µs', 'After 5 µs', 'After 14 µs', 'Immediately'],
              answer: 0,
              why: 'It needs both, so it waits for the slower one.'
            }
          },
          {
            title: 'Ready, start, completion',
            buildsOn: 'Each step waits for the steps before it. We now give that waiting a name and a number.',
            leadsTo: 'Next, how long one QEC round lasts, which is the basic duration the whole model builds on.',
            idea: [
              'An operation\'s *ready time* r is the latest completion time among the steps it depends on.',
              'Its *start time* s is at or after r. Its *completion time* is c = s + d, where d is its *service duration*.',
              'The gap s − r is waiting. It happens when the operation must wait for admission, capacity or its turn in order.'
            ],
            sketch: [
              L([[40, 150], [600, 150]]),
              D(100, 150, { c: 'blue' }), T(100, 120, 'r', { anchor: 'middle', size: 30, c: 'blue' }),
              D(230, 150, { c: 'red' }), T(230, 120, 's', { anchor: 'middle', size: 30, c: 'red' }),
              D(480, 150, { c: 'green' }), T(480, 120, 'c', { anchor: 'middle', size: 30, c: 'green' }),
              K([[100, 175], [100, 190], [230, 190], [230, 175]], { c: 'red' }),
              T(165, 225, 'waiting s − r', { anchor: 'middle', size: 24, c: 'red' }),
              K([[230, 175], [230, 190], [480, 190], [480, 175]], { c: 'green' }),
              T(355, 225, 'service d', { anchor: 'middle', size: 24, c: 'green' })
            ],
            takeaway: 'Completion c equals start s plus duration d. Waiting is s − r.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'The two earlier steps end at 10 µs and 14 µs.', show: 'r = max(10, 14) = 14 µs' },
                { say: 'A needed resource is busy until 17 µs. The operation cannot start earlier.', show: 's = 17 µs' },
                { say: 'It runs for 5 µs.', show: 'd = 5 µs   c = 17 + 5 = 22 µs' },
                { say: 'It waited from 14 to 17.', show: 'waiting = s − r = 3 µs' }
              ]
            },
            check: {
              q: 'r = 14 µs, s = 17 µs and d = 5 µs. What are the completion time and the waiting?',
              options: [
                'c = 22 µs, waiting 3 µs',
                'c = 19 µs, waiting 3 µs',
                'c = 22 µs, waiting 5 µs',
                'c = 17 µs, waiting 0'
              ],
              answer: 0,
              why: 'c = s + d = 17 + 5 = 22 µs, and the waiting is s − r = 3 µs.'
            }
          },
          {
            title: 'How long a round lasts',
            buildsOn: 'Every operation has a duration d. The most important duration is that of one QEC round, which is itself built from gate layers.',
            leadsTo: 'Next, the same rule with the real gate times from the paper, which gives 6.084 µs.',
            idea: [
              'A round is built from *layers*. Gates in one layer run at the same time.',
              'A layer lasts as long as its slowest gate.',
              'Round time = the sum, over layers, of each layer\'s slowest gate.'
            ],
            sketch: [
              B(40, 50, 260, 40), T(50, 80, 'layer 1:  30 ns and 50 ns', { size: 22 }),
              B(40, 110, 260, 40), T(50, 140, 'layer 2:  80 ns', { size: 22 }),
              B(40, 170, 260, 40), T(50, 200, 'layer 3:  20 ns and 20 ns', { size: 22 }),
              A(310, 70, 370, 70, { c: 'blue' }), T(380, 78, '50', { size: 26, c: 'blue' }),
              A(310, 130, 370, 130, { c: 'blue' }), T(380, 138, '80', { size: 26, c: 'blue' }),
              A(310, 190, 370, 190, { c: 'blue' }), T(380, 198, '20', { size: 26, c: 'blue' }),
              H(40, 245, 400, 40, { c: 'yellow' }),
              T(50, 275, 'round = 50 + 80 + 20 = 150 ns', { size: 26 })
            ],
            takeaway: 'Round time is the sum of each layer\'s slowest gate.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Layer 1 has gates of 30 ns and 50 ns. They run together. This is an illustration.', show: 'layer 1 = max(30, 50) = 50 ns' },
                { say: 'Layer 2 has one gate.', show: 'layer 2 = 80 ns' },
                { say: 'Layer 3 has two gates of 20 ns.', show: 'layer 3 = 20 ns' },
                { say: 'Add the layers.', show: 'round = 50 + 80 + 20 = 150 ns' }
              ]
            },
            check: {
              q: 'A layer has gates of 40 ns and 70 ns that run at the same time. How long is the layer?',
              options: ['70 ns', '40 ns', '110 ns', '55 ns'],
              answer: 0,
              why: 'Gates in a layer run together, so the layer lasts as long as the slowest one.'
            }
          },
          {
            title: 'A real round: 6.084 µs',
            buildsOn: 'Round time is the sum of each layer\'s slowest gate. Now put in the real gate times the paper uses.',
            leadsTo: 'Next, the rule that decides whether an operation may start: it needs room in every resource at once.',
            idea: [
              'A distance-3 rotated surface patch has 9 data qubits and 8 *ancillas* (helper qubits that run the checks).',
              'One round: 2 Hadamard layers, 4 entangling layers (24 two-qubit gates), one measurement and one reset.',
              'Paper numbers (an IBM calibration): SX gate 36 ns, CZ gate 80 ns, measurement 2,684 ns, reset 2,720 ns.',
              'Round = 2(36) + 4(36 + 80 + 36) + 2,684 + 2,720 = 6,084 ns = 6.084 µs.'
            ],
            sketch: [
              B(30, 60, 30, 50), B(70, 60, 120, 50, { c: 'blue' }), B(200, 60, 280, 50, { c: 'green' }), B(490, 60, 100, 50, { c: 'red' }),
              T(45, 140, 'H', { anchor: 'middle', size: 22 }),
              T(130, 140, 'gates', { anchor: 'middle', size: 22, c: 'blue' }),
              T(340, 140, 'measurement', { anchor: 'middle', size: 22, c: 'green' }),
              T(540, 140, 'reset', { anchor: 'middle', size: 22, c: 'red' }),
              A(340, 205, 340, 115, { c: 'green' }),
              T(340, 235, 'syndrome is ready here', { anchor: 'middle', size: 24, c: 'green' }),
              T(560, 235, 'still\nresetting', { anchor: 'middle', size: 22, c: 'red' })
            ],
            takeaway: 'One distance-3 round lasts 6.084 µs on IBM numbers.',
            widget: {
              type: 'stack',
              unit: 'ns',
              segments: [
                { label: 'Hadamard layers', v: 72 },
                { label: 'Entangling layers (4 × 152)', v: 608 },
                { label: 'Measurement', v: 2684 },
                { label: 'Reset', v: 2720 }
              ],
              note: 'The syndrome is available after measurement, so decoding can start while the ancillas reset.'
            },
            check: {
              q: 'Why can decoding start before the round fully ends?',
              options: [
                'The syndrome is ready after measurement, before reset ends',
                'Reset is not needed',
                'Decoding does not need the syndrome',
                'The gates are skipped'
              ],
              answer: 0,
              why: 'Measurement produces the syndrome. Reset only matters for reusing the ancillas.'
            }
          },
          {
            title: 'Admission needs room everywhere',
            buildsOn: 'An operation has a ready time and a duration. Whether it can start at its ready time depends on what it needs from the shared resources.',
            leadsTo: 'Next, how a shot ends only when both the physical work and the QEC drain are done.',
            idea: [
              'An operation may start only if every resource it needs has room at that moment.',
              'For each resource, what active operations use must stay at or below its *capacity* C.',
              'If one resource is full, the operation waits, even when all the others are free.'
            ],
            sketch: [
              B(30, 100, 130, 70), T(95, 142, 'operation', { anchor: 'middle', size: 26 }),
              A(165, 120, 270, 70), A(165, 135, 270, 135), A(165, 150, 270, 205),
              B(275, 45, 150, 50), T(350, 79, 'slot: free', { anchor: 'middle', size: 24, c: 'green' }),
              B(275, 110, 150, 50), T(350, 144, 'link: free', { anchor: 'middle', size: 24, c: 'green' }),
              B(275, 180, 150, 50, { c: 'red' }), T(350, 214, 'buffer: full', { anchor: 'middle', size: 24, c: 'red' }),
              T(450, 214, 'waits', { size: 28, c: 'red' })
            ],
            takeaway: 'One full resource is enough to hold an operation back.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'An operation needs 1 decoder slot, 1 link and 1 buffer entry.', show: 'needs: slot, link, buffer' },
                { say: 'A slot is free and the link is free.', show: 'slot ok   link ok' },
                { say: 'The buffer is full.', show: 'buffer: no room' },
                { say: 'The operation cannot start. It waits until the buffer has room.', show: 'start delayed' }
              ]
            },
            check: {
              q: 'A slot and a link are free, but the buffer is full. Can the operation start?',
              options: [
                'No, it needs room in every resource',
                'Yes, two of three is enough',
                'Yes, the buffer is optional',
                'Only if the slot is the fastest'
              ],
              answer: 0,
              why: 'Admission checks all simultaneous requirements. One full resource blocks the start.'
            }
          },
          {
            title: 'A shot ends with the QEC drain',
            buildsOn: 'Admission rules decide when each operation starts. Now we see how those delays roll up into the end of a shot.',
            leadsTo: 'Next, the ordering rules for when several requests want the same resource.',
            idea: [
              'A *shot* is one full run of a circuit: initialization, protected execution, readout and the QEC drain.',
              'The *QEC drain* is the extra time after physical work ends while decoding and feedback are still outstanding.',
              'The next shot in sequence starts only after both the physical work and the drain are done.',
              'So a slow decoder delays the next shot, not just the end of this one.'
            ],
            sketch: [
              B(30, 90, 250, 50, { c: 'blue' }), T(155, 125, 'physical work', { anchor: 'middle', size: 24, c: 'blue' }),
              B(280, 90, 110, 50, { c: 'red', dash: true }), T(335, 125, 'drain', { anchor: 'middle', size: 24, c: 'red' }),
              B(400, 90, 200, 50), T(500, 125, 'next shot', { anchor: 'middle', size: 24 }),
              A(335, 170, 335, 145, { c: 'red' }),
              T(335, 200, 'waits for decoding and feedback', { anchor: 'middle', size: 22, c: 'red' }),
              T(155, 70, 'shot 1', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'The next shot waits for the physical work and the drain.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Shot 1 finishes its physical work.', show: 'physical: done' },
                { say: 'Decoding and feedback for the last rounds are still running.', show: 'drain: running' },
                { say: 'Shot 2 cannot start yet.', show: 'next shot: blocked' },
                { say: 'The drain ends. Shot 2 starts.', show: 'next shot: starts' }
              ]
            },
            check: {
              q: 'Physical work for shot 1 is finished but its drain is not. When can shot 2 start?',
              options: [
                'After the drain ends',
                'Right away',
                'Halfway through the drain',
                'When shot 1 is restarted'
              ],
              answer: 0,
              why: 'The next shot waits for both the physical work and the required QEC drain.'
            }
          },
          {
            title: 'Who goes first',
            buildsOn: 'A shot waits when a decode or transfer is delayed. When several requests want one resource at the same moment, a rule must pick the order.',
            leadsTo: 'Next, how the paper measures runtime, utilization and the cost of decoding delays.',
            idea: [
              'Requests are served *FIFO* (first in, first out): by time they joined the queue, then sequence number, then a stable id.',
              'Application work and QEC work have equal priority.',
              'If the first request is blocked, a later request that fits may be served instead.',
              'Service times can vary. Each is drawn from a *service profile*: measured, constant or declared values.'
            ],
            sketch: [
              B(30, 100, 70, 50, { c: 'red' }), T(65, 133, '1', { anchor: 'middle', size: 28, c: 'red' }),
              B(110, 100, 70, 50), T(145, 133, '2', { anchor: 'middle', size: 28 }),
              B(190, 100, 70, 50), T(225, 133, '3', { anchor: 'middle', size: 28 }),
              T(65, 85, 'blocked', { anchor: 'middle', size: 22, c: 'red' }),
              K([[145, 95], [145, 55], [400, 55], [400, 100]], { c: 'blue' }),
              T(270, 45, '2 fits, so it goes', { anchor: 'middle', size: 24, c: 'blue' }),
              B(340, 100, 120, 60), T(400, 138, 'slot', { anchor: 'middle', size: 26 }),
              T(30, 230, 'oldest first, unless it cannot run', { size: 28 })
            ],
            takeaway: 'Oldest first, but a blocked request does not stall the rest.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Three requests wait in order: 1, 2, 3.', show: 'queue: 1, 2, 3' },
                { say: 'Request 1 needs a buffer entry that is full, so it is blocked.', show: '1: blocked' },
                { say: 'Request 2 fits, so it is admitted ahead of request 1.', show: '2 goes first' },
                { say: 'When room opens, request 1 is still the oldest and goes next.', show: 'then 1, then 3' }
              ]
            },
            check: {
              q: 'The oldest request is blocked and the next one fits. What does the model do?',
              options: [
                'Serves the next one that fits',
                'Waits for the oldest',
                'Drops the oldest',
                'Serves the newest'
              ],
              answer: 0,
              why: 'Admission may pass a blocked candidate to serve a later one that fits.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 ============================ */
      {
        title: 'Measuring and trusting',
        intro: 'A model is useful only if its numbers mean something and match reality. This section covers the metrics, the control run and the checks.',
        bridge: 'You now know how results are measured and how far the model can be trusted. Section 5 reads the first findings: which capacities to size together.',
        tabs: [
          {
            title: 'Runtime and utilization',
            buildsOn: 'The model gives every operation a start and completion time. From those we can read off two summary numbers.',
            leadsTo: 'Next, a special control run that isolates the delay caused by decoding.',
            idea: [
              '*Runtime* of a job is its completion time minus its arrival time: T = c − a.',
              '*Utilization* U of a resource is the share of its capacity in use, averaged over the run.',
              'U = (total in-use amount over time) / (C × T), where C is capacity. Total over time means the area under the in-use curve.',
              'A resource near full utilization is a likely bottleneck.'
            ],
            sketch: [
              L([[60, 40], [60, 250], [580, 250]]),
              T(70, 60, 'in use', { size: 22 }),
              K([[60, 200], [200, 200], [200, 120], [380, 120], [380, 180], [580, 180]], { c: 'blue' }),
              L([[60, 90], [580, 90]], { c: 'red', dash: true }),
              T(440, 78, 'capacity C', { size: 22, c: 'red' }),
              T(320, 285, 'time T', { anchor: 'middle', size: 24 }),
              T(290, 230, 'area under blue / (C × T) = U', { anchor: 'middle', size: 22, c: 'blue' })
            ],
            takeaway: 'Utilization is the share of capacity used over the whole run.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'A pool has capacity 2 slots. The run lasts 10 ms. This is an illustration.', show: 'C = 2   T = 10 ms' },
                { say: 'One slot is busy for 4 ms.', show: '1 × 4 = 4 slot-ms' },
                { say: 'Both slots are busy for 6 ms.', show: '2 × 6 = 12 slot-ms' },
                { say: 'Add the in-use amounts and divide by C × T.', show: 'U = (4 + 12) / (2 × 10) = 0.8' }
              ]
            },
            check: {
              q: 'C = 2 slots, T = 10 ms, and 16 slot-ms were used. What is U?',
              options: ['0.8', '1.6', '0.5', '8'],
              answer: 0,
              why: 'U = 16 / (2 × 10) = 0.8.'
            }
          },
          {
            title: 'The zero-service control',
            buildsOn: 'Runtime and utilization tell how a run went. They do not say how much of the delay was the decoder\'s fault.',
            leadsTo: 'Next, how to tell delay inside a shot from delay between shots using the same control.',
            idea: [
              'To isolate the cost of decoding, rerun the same job with decode time set to zero.',
              'That run is the *zero-decoder-service control*: same circuits, links and admission rules, no decoder cost.',
              'If every quantum operation runs at the same time in both runs, the decoder capacity is enough.',
              'Any difference is delay caused by decoding.'
            ],
            sketch: [
              T(30, 60, 'control (zero decode)', { size: 24, c: 'green' }),
              L([[30, 90], [600, 90]], { c: 'green' }),
              D(150, 90, { c: 'green' }), D(300, 90, { c: 'green' }), D(450, 90, { c: 'green' }),
              T(30, 170, 'real decoder', { size: 24, c: 'red' }),
              L([[30, 200], [600, 200]], { c: 'red' }),
              D(150, 200, { c: 'red' }), D(340, 200, { c: 'red' }), D(520, 200, { c: 'red' }),
              A(300, 100, 340, 190, { c: 'red', dash: true }),
              T(320, 270, 'gap = delay caused by decoding', { anchor: 'middle', size: 24 })
            ],
            takeaway: 'Compare to a run with free decoding. The gap is decoder delay.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Run the job as usual. Record when each quantum operation ran.', show: 'real timeline' },
                { say: 'Run it again with decode time set to zero. Record the same.', show: 'control timeline' },
                { say: 'Compare the two for every job.', show: 'same times?' },
                { say: 'If they match, that decoder capacity preserves the quantum timeline.', show: 'capacity is enough' }
              ]
            },
            check: {
              q: 'The real run and the zero-service control have identical quantum timelines. What does that show?',
              options: [
                'Decoder capacity was enough to cause no delay',
                'Decoding is free',
                'The code distance is too small',
                'The link is too fast'
              ],
              answer: 0,
              why: 'Only the decoder differs between the runs, so a match means it caused no delay.'
            }
          },
          {
            title: 'Inside a shot or between shots',
            buildsOn: 'The control run shows whether decoding delayed the quantum side. We can also ask where the delay landed.',
            leadsTo: 'Next, how the paper picks designs: feasible, near-best, and smallest.',
            idea: [
              'Delay can land inside a shot, or in the gap before the next shot starts.',
              'Align every shot to its own start (initialization) and compare to the control. A match means no delay inside shots.',
              'Then compare absolute times. A mismatch there means shots started late.'
            ],
            sketch: [
              T(30, 55, 'control', { size: 24, c: 'green' }),
              B(30, 70, 150, 30, { c: 'green' }), B(200, 70, 150, 30, { c: 'green' }),
              T(30, 150, 'real', { size: 24, c: 'red' }),
              B(30, 165, 150, 30, { c: 'red' }), B(235, 165, 150, 30, { c: 'red' }),
              K([[180, 205], [180, 220], [235, 220], [235, 205]], { c: 'red' }),
              T(300, 245, 'shot 2 started late', { anchor: 'middle', size: 24, c: 'red' }),
              T(140, 125, 'same inside each shot', { anchor: 'middle', size: 22 })
            ],
            takeaway: 'Aligning shots splits inside-shot delay from between-shot delay.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Real run: shot 1 matches the control inside. Shot 2 starts 5 ms later. This is an illustration.', show: 'inside: same   start: +5 ms' },
                { say: 'Align each shot at its own start.', show: 'timelines match' },
                { say: 'Compare absolute times.', show: 'timelines differ by 5 ms' },
                { say: 'So the delay came between shots, not inside them.', show: 'between-shot delay' }
              ]
            },
            check: {
              q: 'Shots match the control when aligned at initialization, but start late in absolute time. Where did the delay land?',
              options: [
                'Between shots',
                'Inside each shot',
                'Nowhere',
                'In the physical gates'
              ],
              answer: 0,
              why: 'Inside each shot the timelines agree. The offset appears only in absolute start times.'
            }
          },
          {
            title: 'Feasible, near-best, smallest',
            buildsOn: 'We can now measure the delay for one design. The next question is how to choose among many designs.',
            leadsTo: 'Next, a quick calculation that gives a minimum slot count before running anything.',
            idea: [
              'A *design* x is one choice of decoder slots, link and buffer sizes. Try a list of them.',
              '*Feasible*: meets the limits on runtime and waiting for every job.',
              '*Near-best*: runtime within 5% of the best design found, T(x) ≤ 1.05 × T*, where T* is the best runtime.',
              'Among the near-best designs, take the smallest.'
            ],
            sketch: [
              L([[60, 40], [60, 250], [580, 250]]),
              T(70, 60, 'runtime', { size: 22 }),
              T(320, 285, 'cost of the design', { anchor: 'middle', size: 24 }),
              D(120, 70), D(200, 130), D(300, 160, { c: 'green' }), D(420, 150, { c: 'green' }), D(520, 140, { c: 'green' }),
              L([[60, 150], [580, 150]], { c: 'red', dash: true }),
              T(450, 138, 'best × 1.05', { size: 22, c: 'red' }),
              T(300, 200, 'smallest under the line', { anchor: 'middle', size: 22, c: 'green' })
            ],
            takeaway: 'Pick the smallest design within 5% of the best runtime.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Four designs, with made-up runtimes. The best is 100 ms.', show: 'A 140   B 104   C 100   D 103' },
                { say: 'The limit is 105 ms (100 × 1.05).', show: 'near-best: B, C, D' },
                { say: 'Suppose B has 2 slots, C has 8 and D has 4.', show: 'sizes: B 2, C 8, D 4' },
                { say: 'Take the smallest near-best design.', show: 'pick B (2 slots, 104 ms)' }
              ]
            },
            check: {
              q: 'The best runtime is 100 ms. Which runtimes are near-best?',
              options: ['100 to 105 ms', '100 to 110 ms', '95 to 105 ms', 'Only 100 ms'],
              answer: 0,
              why: 'Near-best means within 5% of the best, so up to 1.05 × 100 = 105 ms.'
            }
          },
          {
            title: 'A quick check on slot counts',
            buildsOn: 'Choosing a design means trying many. For the decoder, a short calculation gives a lower limit on the slot count.',
            leadsTo: 'Next, how well the full model agrees with real decoders.',
            idea: [
              'Suppose J jobs each send one request every t_p, and each request needs a fixed service time d.',
              'One slot handles 1 / d requests per unit time. Demand is J / t_p. So the slots m must satisfy m ≥ J × d / t_p.',
              'If service times vary, use the mean: arrival rate λ times mean service time E[S] must stay below m.',
              'This is necessary, not enough: links, buffers and per-job windows can still cause waits. Simulation checks the rest.'
            ],
            sketch: [
              T(320, 45, 'demand  J / t_p', { anchor: 'middle', size: 28, c: 'red' }),
              T(320, 90, 'one slot  1 / d', { anchor: 'middle', size: 28, c: 'blue' }),
              L([[200, 115], [440, 115]]),
              T(320, 160, 'slots m  ≥  J × d / t_p', { anchor: 'middle', size: 30 }),
              H(130, 200, 380, 40, { c: 'yellow' }),
              T(320, 230, 'necessary, not sufficient', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'Slots ≥ jobs × service time / request gap. Necessary, not enough.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Four jobs each send a request every 8 µs. Each takes 3 µs to decode. This is an illustration.', show: 'J = 4   t_p = 8 µs   d = 3 µs' },
                { say: 'Multiply jobs by service time.', show: 'J × d = 12 µs' },
                { say: 'Divide by the gap between requests.', show: '12 / 8 = 1.5' },
                { say: 'Slots must be at least 1.5, so round up.', show: 'm ≥ 2' },
                { say: 'Two slots can keep pace on average. Whether requests still wait is for the simulation to say.', show: 'a floor, not a guarantee' }
              ]
            },
            check: {
              q: 'J = 4, d = 3 µs and t_p = 8 µs. What is the fewest slots that can keep pace?',
              options: ['2', '1', '3', '4'],
              answer: 0,
              why: 'J × d / t_p = 12 / 8 = 1.5, and slots come in whole numbers, so at least 2.'
            }
          },
          {
            title: 'Does the model match reality',
            buildsOn: 'The model predicts latency and buffer use. Before trusting its design advice, the paper compares it with real decoders.',
            leadsTo: 'Next, the first set of findings, which use this model to size decoders, links and buffers.',
            idea: [
              'Decode times come from 1,908 calibration runs (599,040 measured windows). The model is then compared with separate test runs.',
              'Error is the *relative error*: |predicted − measured| / |measured|.',
              'Native GPU and CPU runs (960): median error 1.06% on median latency and 1.74% on p95 (the time 95% of requests beat).',
              'CPU window runs (900) are rougher: 9.84% and 11.95%. Errors grow near saturation and with tight buffers.'
            ],
            sketch: [
              L([[60, 40], [60, 250], [580, 250]]),
              T(70, 60, 'model', { size: 22 }),
              T(320, 285, 'measured', { anchor: 'middle', size: 24 }),
              L([[60, 250], [560, 60]], { c: 'blue', dash: true }),
              D(150, 205, { c: 'green' }), D(240, 170, { c: 'green' }), D(330, 140, { c: 'green' }), D(420, 100, { c: 'green' }),
              T(450, 200, 'close to the line', { size: 22, c: 'green' })
            ],
            takeaway: 'The model tracks real decoders closely, with rougher edge cases.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Build the decode-time profiles from real runs: 1,908 runs, 599,040 windows.', show: 'model inputs' },
                { say: 'Freeze the model, then compare it with 960 native GPU and CPU test runs.', show: 'median error 1.06% (median) · 1.74% (p95)' },
                { say: 'Of these, 851 meet all three criteria: median within 10%, p95 within 20%, throughput within 10%.', show: '851 of 960' },
                { say: 'CPU windows are less precise near saturation and with tight buffers.', show: '900 runs: 9.84% and 11.95%' },
                { say: 'Average buffer use is predicted well. Rare peaks are predicted less well.', show: 'means good, peaks rougher' }
              ]
            },
            check: {
              q: 'Where does the model agree least with CPU measurements?',
              options: [
                'Near saturation and with tight buffers',
                'When the system is idle',
                'With one job',
                'At the lowest latency'
              ],
              answer: 0,
              why: 'The paper notes that CPU window errors grow near saturation and under tight buffering.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 ============================ */
      {
        title: 'Findings 1: size the parts together',
        intro: 'The first research question: which decoder, link and buffer capacities must grow together to meet a runtime target?',
        bridge: 'You saw which capacity mixes work for runtime. Section 6 asks what keeps quantum progress intact, and what happens when hardware gets faster.',
        tabs: [
          {
            title: 'The test workload',
            buildsOn: 'Section 4 gave the model and its checks. Here is the workload the first experiments run on.',
            leadsTo: 'Next, the first result: how much a second decoder slot helps.',
            idea: [
              'Each job has 4 distance-3 patches (68 physical qubits) and runs 5 circuits of 64 shots each.',
              'Each shot protects for 1 ms: 165 rounds of 6.084 µs, or 1,003.86 µs in all.',
              'A decode takes 2.2 µs. Messages: 1,024 bytes of syndrome and 256 bytes of feedback.',
              'Sweeps: slots 1, 2, 4, 8; bandwidth 0.5 to 4 GB/s; latency 0.1, 1 and 4 µs.'
            ],
            sketch: [
              B(30, 50, 170, 70), T(115, 92, '4 patches', { anchor: 'middle', size: 28 }),
              B(230, 50, 170, 70), T(315, 92, '5 × 64 shots', { anchor: 'middle', size: 26 }),
              B(430, 50, 170, 70), T(515, 92, '1 ms each', { anchor: 'middle', size: 28 }),
              A(205, 85, 225, 85), A(405, 85, 425, 85),
              T(515, 160, '165 rounds', { anchor: 'middle', size: 26, c: 'blue' }),
              T(315, 230, '2.2 µs decode', { anchor: 'middle', size: 26, c: 'red' }),
              T(315, 280, '1,024 B out, 256 B back', { anchor: 'middle', size: 24 })
            ],
            takeaway: 'Each shot protects for 1 ms: 165 rounds of 6.084 µs.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Protect for 1 ms. Each round lasts 6.084 µs.', show: '1000 / 6.084 = 164.4' },
                { say: 'Only whole rounds count, so round up.', show: '165 rounds' },
                { say: '165 rounds take slightly longer than 1 ms.', show: '165 × 6.084 = 1,003.86 µs' },
                { say: 'Each round makes one syndrome, so one shot makes about 165 sets of check results to decode.', show: 'work per shot' }
              ]
            },
            check: {
              q: 'Why is the number of rounds per shot 165 and not 164?',
              options: [
                'Only whole rounds count, so 164.4 rounds up to 165',
                '165 is an arbitrary choice',
                'The first round is free',
                'Reset adds one round'
              ],
              answer: 0,
              why: '1 ms / 6.084 µs is about 164.4, and only complete rounds are run.'
            }
          },
          {
            title: 'A second slot helps, more do not',
            buildsOn: 'The workload runs 165 rounds per shot, so decoding work is steady. We now vary the slot count at a fixed fast link.',
            leadsTo: 'Next, what happens when the link has long latency instead.',
            idea: [
              'Four jobs, latency 0.1 µs, bandwidth 1 GB/s.',
              'One slot: 494.659 ms. Two slots: 352.983 ms, a 28.6% cut.',
              'Four or eight slots: no further gain. The remaining time is spent elsewhere, not waiting for a slot.',
              'At 0.5 GB/s, two slots take 483.809 ms instead: the link must deliver enough work for a second slot to help.'
            ],
            sketch: [
              L([[60, 40], [60, 250], [580, 250]]),
              B(100, 80, 70, 170), B(200, 140, 70, 110, { c: 'green' }), B(300, 140, 70, 110), B(400, 140, 70, 110),
              T(135, 290, '1', { anchor: 'middle', size: 24 }), T(235, 290, '2', { anchor: 'middle', size: 24 }),
              T(335, 290, '4', { anchor: 'middle', size: 24 }), T(435, 290, '8', { anchor: 'middle', size: 24 }),
              T(135, 70, '494.7', { anchor: 'middle', size: 22 }),
              T(235, 130, '353.0', { anchor: 'middle', size: 22, c: 'green' }),
              T(500, 100, 'slots →', { size: 24 })
            ],
            takeaway: 'One extra slot cut runtime 28.6%. More slots gave nothing.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'One slot, four jobs, 1 GB/s.', show: '494.659 ms' },
                { say: 'Add a second slot.', show: '352.983 ms   (28.6% cut)' },
                { say: 'Go to four slots, then eight.', show: 'no further gain' },
                { say: 'Past two slots, something other than slot count sets the pace.', show: 'the wait moved' },
                { say: 'Halve the bandwidth to 0.5 GB/s and two slots lose most of their gain.', show: '483.809 ms' }
              ]
            },
            check: {
              q: 'Four jobs, fast link. Going from 2 slots to 8 slots does what?',
              options: [
                'Gives no further gain',
                'Cuts runtime another 28.6%',
                'Doubles runtime',
                'Cuts runtime in half'
              ],
              answer: 0,
              why: 'The paper found no further gain at 4 or 8 slots once there were 2.'
            }
          },
          {
            title: 'A long latency makes slots irrelevant',
            buildsOn: 'With a fast link, two slots were enough. Change the link\'s latency and the answer changes.',
            leadsTo: 'Next, how the paper turns these curves into a smallest-design rule.',
            idea: [
              'At 4 µs latency, slot count makes no difference to runtime.',
              'Each transfer holds the link for its full duration, so latency eats link capacity.',
              'Bandwidth is the lever: raising it from 0.5 to 4 GB/s cuts runtime from 1,307 to 929 ms.'
            ],
            sketch: [
              B(30, 90, 90, 60), T(75, 128, 'jobs', { anchor: 'middle', size: 26 }),
              A(125, 120, 300, 120, { c: 'red' }),
              T(210, 100, 'link: long delay', { anchor: 'middle', size: 24, c: 'red' }),
              B(305, 70, 100, 40), B(305, 130, 100, 40),
              T(355, 98, 'slot', { anchor: 'middle', size: 22 }), T(355, 158, 'slot', { anchor: 'middle', size: 22 }),
              T(480, 98, 'idle', { anchor: 'middle', size: 26, c: 'red' }),
              T(480, 158, 'idle', { anchor: 'middle', size: 26, c: 'red' }),
              T(30, 240, 'the link, not the pool, sets the pace', { size: 28 })
            ],
            takeaway: 'When latency is long, bandwidth matters and slots do not.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Set latency to 4 µs. Vary slots from 1 to 8.', show: 'runtime does not move' },
                { say: 'Each transfer reserves the link for its whole duration, latency included.', show: 'latency lowers link capacity' },
                { say: 'Vary bandwidth from 0.5 to 4 GB/s instead.', show: '1,307 ms  →  929 ms' },
                { say: 'The link is the limit here, so spending on slots is wasted.', show: 'upgrade the link' }
              ]
            },
            check: {
              q: 'At 4 µs latency, which upgrade changes runtime?',
              options: ['More link bandwidth', 'More decoder slots', 'Both equally', 'Neither'],
              answer: 0,
              why: 'Slot count made no difference, but bandwidth from 0.5 to 4 GB/s cut runtime from 1,307 to 929 ms.'
            }
          },
          {
            title: 'The smallest design within 5%',
            buildsOn: 'Short latency wants slots, long latency wants bandwidth. The near-best rule from Section 4 turns that into a concrete pick.',
            leadsTo: 'Next, how the number of jobs changes the slot count you need.',
            idea: [
              'Target: runtime within 5% of the best found.',
              'Short latency: 2 slots with a 1 GB/s link is enough.',
              'Long latency: 1 slot with a 4 GB/s link is enough.',
              'The right small design depends on the link, so decide jointly.'
            ],
            sketch: [
              B(40, 60, 250, 90), T(165, 95, 'short latency', { anchor: 'middle', size: 28, c: 'blue' }),
              T(165, 135, '2 slots + 1 GB/s', { anchor: 'middle', size: 26 }),
              B(340, 60, 250, 90), T(465, 95, 'long latency', { anchor: 'middle', size: 28, c: 'red' }),
              T(465, 135, '1 slot + 4 GB/s', { anchor: 'middle', size: 26 }),
              H(60, 200, 500, 44, { c: 'yellow' }),
              T(70, 232, 'same target, different smallest design', { size: 28 })
            ],
            takeaway: 'The cheapest design that works depends on the link.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Find the best runtime across all tested designs.', show: 'T*' },
                { say: 'Keep the designs within 5% of it.', show: 'near-best set' },
                { say: 'At short latency, the smallest near-best design is 2 slots and 1 GB/s.', show: '2 slots, 1 GB/s' },
                { say: 'At long latency, it is 1 slot and 4 GB/s.', show: '1 slot, 4 GB/s' }
              ]
            },
            check: {
              q: 'Which is the smallest within-5% design at long latency?',
              options: [
                '1 slot with 4 GB/s',
                '2 slots with 1 GB/s',
                '8 slots with 0.5 GB/s',
                '4 slots with 1 GB/s'
              ],
              answer: 0,
              why: 'With long latency the link is the limit, so one slot and a fast link is enough.'
            }
          },
          {
            title: 'More jobs need more slots',
            buildsOn: 'The smallest design depends on the link. It also depends on how many jobs share the pool.',
            leadsTo: 'Next, how a rare slow decode can be absorbed by spare buffer room.',
            idea: [
              'A *memory job* keeps one logical qubit alive for a set number of rounds. Here each shot has 3 decoder windows.',
              'A single memory job gets nothing from extra slots: completion is identical with 1, 2 or 8 slots.',
              'Four memory jobs: going from 1 to 8 slots gave a 3.57 to 3.95 times speedup across fifteen code-family and size pairs.'
            ],
            sketch: [
              T(150, 50, '1 job', { anchor: 'middle', size: 28, c: 'blue' }),
              B(60, 80, 180, 40), B(60, 140, 180, 40), B(60, 200, 180, 40),
              T(150, 107, '1 slot', { anchor: 'middle', size: 22 }),
              T(150, 167, '2 slots', { anchor: 'middle', size: 22 }),
              T(150, 227, '8 slots', { anchor: 'middle', size: 22 }),
              T(470, 50, '4 jobs', { anchor: 'middle', size: 28, c: 'red' }),
              T(470, 130, '1 → 8 slots', { anchor: 'middle', size: 26 }),
              T(470, 180, '3.57 to 3.95× faster', { anchor: 'middle', size: 24, c: 'green' })
            ],
            takeaway: 'One job needs no extra slots. Four jobs gain nearly 4 times.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'One job: completion is identical at 1, 2 or 8 slots. Its own windows come one after another.', show: 'no gain' },
                { say: 'Four memory jobs share the pool. One slot makes them queue.', show: 'long queue' },
                { say: 'Go from 1 to 8 slots across fifteen code-family and size pairs.', show: '3.57× to 3.95× faster' },
                { say: 'Largest case, the hypergraph product code at its biggest size: 2.072 s down to 0.580 s.', show: '2.072 s  →  0.580 s' }
              ]
            },
            check: {
              q: 'A single job runs with 1, 2 and 8 decoder slots. What changes?',
              options: [
                'Nothing, completion is identical',
                'Runtime drops 8 times',
                'Runtime drops 2 times',
                'Runtime rises'
              ],
              answer: 0,
              why: 'One job does not compete for slots, so extra slots sit idle.'
            }
          },
          {
            title: 'Buffer room absorbs slow decodes',
            buildsOn: 'More jobs mean more requests in flight. Real decode times vary, and a rare slow decode can back up a small buffer.',
            leadsTo: 'Next, the second research question: what decoder capacity preserves quantum progress.',
            idea: [
              'Two decoders with the same mean time of 2.2 µs. Moderate: 1.1 or 3.3 µs equally often. Tail: 1.1 µs 95% of the time, else 23.1 µs.',
              'Setup: two jobs, two slots, 2 GB/s, 0.1 µs. A constant 2.2 µs decoder gives 352.979 ms.',
              'Tail with *backlog setting* 4: 354.092 ms (+0.32%). With backlog 1: 366.711 ms (+3.89%).',
              'Spare buffer room absorbs rare slow decodes that a comparison of means would hide.'
            ],
            sketch: [
              T(30, 55, 'moderate', { size: 24, c: 'green' }),
              D(60, 80, { c: 'green' }), D(110, 80, { c: 'green' }), D(160, 80, { c: 'green' }), D(210, 80, { c: 'green' }),
              T(30, 150, 'tail', { size: 24, c: 'red' }),
              D(60, 175, { c: 'red' }), D(110, 175, { c: 'red' }), D(160, 175, { c: 'red' }),
              O(280, 175, 20, { c: 'red' }),
              T(380, 100, 'room for 4:  +0.32%', { size: 24, c: 'green' }),
              T(380, 180, 'room for 1:  +3.89%', { size: 24, c: 'red' }),
              T(30, 270, 'same mean, different tail', { size: 26 })
            ],
            takeaway: 'Spare buffer room makes rare slow decodes cheap.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Both decoders average 2.2 µs. Moderate: 1.1 or 3.3 µs, each half the time.', show: '(1.1 + 3.3) / 2 = 2.2' },
                { say: 'Tail: 1.1 µs with probability 0.95, else 23.1 µs.', show: '0.95 × 1.1 + 0.05 × 23.1 = 2.2' },
                { say: 'Run with backlog 4. The tail costs little.', show: '+0.32%' },
                { say: 'Run with backlog 1. A slow decode now blocks everything behind it.', show: '+3.89%' }
              ]
            },
            check: {
              q: 'Two decoders share a mean time but one has a heavy tail. What protects runtime against the tail?',
              options: [
                'More buffer room',
                'A lower code distance',
                'Fewer jobs',
                'A slower link'
              ],
              answer: 0,
              why: 'With room for more backlog, a slow decode no longer stalls the requests queued behind it.'
            }
          }
        ]
      },

      /* ============================ SECTION 6 ============================ */
      {
        title: 'Findings 2 and 3, and the limits',
        intro: 'What decoder capacity keeps quantum progress intact, what faster hardware demands, and what the paper does not claim.',
        bridge: 'You have now read the paper end to end. A natural next step is the simulator itself: how these queues, slots and timelines are written as code.',
        tabs: [
          {
            title: 'Fast qubits need more slots',
            buildsOn: 'Section 5 sized the parts for runtime. The second research question asks for the capacity that leaves the quantum timeline untouched.',
            leadsTo: 'Next, how slower qubit types change the answer.',
            idea: [
              'Test: the memory program on *superconducting* qubits (circuit-based, fast gates), four jobs, against the zero-service control.',
              'One slot: 205.879 ms. Four slots: 53.272 ms. Eight and sixteen slots stay on that plateau.',
              'The zero-service control takes 2.707 ms, so the plateau sits 50.565 ms above it.',
              'Slots remove competition between jobs, but each job still waits for its own decodes and feedback, one after another.'
            ],
            sketch: [
              L([[60, 40], [60, 250], [580, 250]]),
              B(100, 60, 60, 190), B(200, 185, 60, 65, { c: 'green' }), B(300, 185, 60, 65), B(400, 185, 60, 65),
              L([[60, 247], [580, 247]], { c: 'red', dash: true }),
              T(480, 236, 'control 2.7', { size: 22, c: 'red' }),
              T(130, 290, '1', { anchor: 'middle', size: 24 }), T(230, 290, '4', { anchor: 'middle', size: 24 }),
              T(330, 290, '8', { anchor: 'middle', size: 24 }), T(430, 290, '16', { anchor: 'middle', size: 24 }),
              T(130, 50, '206', { anchor: 'middle', size: 22 }),
              T(230, 175, '53', { anchor: 'middle', size: 22, c: 'green' })
            ],
            takeaway: 'More slots help, then flatten far above the zero-service floor.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Four superconducting memory jobs, one decoder slot.', show: '205.879 ms' },
                { say: 'Four slots.', show: '53.272 ms' },
                { say: 'Eight and sixteen slots stay on the same plateau.', show: 'about 53 ms' },
                { say: 'The zero-service control sits far lower.', show: '2.707 ms   (plateau is 50.565 ms above it)' },
                { say: 'Each response still has to be decoded and returned in order. Slots cannot shorten that.', show: 'serial response cost remains' }
              ]
            },
            check: {
              q: 'Past 4 slots the superconducting runtime stops falling. Why?',
              options: [
                'Slots cannot remove the serial cost of each response',
                'The qubits stop working',
                'The link gets slower',
                'The code distance changes'
              ],
              answer: 0,
              why: 'Each response takes a fixed time to decode and return, and extra slots cannot shorten that.'
            }
          },
          {
            title: 'Slow qubits need fewer slots',
            buildsOn: 'Fast superconducting qubits leave little slack. Other qubit types run their physical steps far more slowly.',
            leadsTo: 'Next, the third question: what happens as rounds themselves get faster.',
            idea: [
              '*Trapped-ion* qubits (held in ions): four slots give 40.534 s against a 40.517 s control. Physical steps dominate.',
              'No step inside these shots needs a decoded result, so delay lands between shots. One slot keeps each shot itself on time.',
              '*Neutral-atom* qubits (held in atoms) with deferred readout (fresh ancillas): 1 slot for 1 or 2 jobs, 2 slots for 4 jobs.',
              'Neutral atoms with streaming reuse (ancillas imaged and reused): one slot was enough at every tested job count.'
            ],
            sketch: [
              T(170, 50, 'superconducting', { anchor: 'middle', size: 24, c: 'red' }),
              B(40, 70, 260, 40, { c: 'red' }), T(170, 98, 'slots help, then plateau', { anchor: 'middle', size: 20 }),
              T(170, 160, 'trapped ion', { anchor: 'middle', size: 24, c: 'blue' }),
              B(40, 180, 260, 40, { c: 'blue' }), T(170, 208, 'slots barely matter', { anchor: 'middle', size: 20 }),
              T(470, 160, 'neutral atom', { anchor: 'middle', size: 24, c: 'green' }),
              B(340, 180, 260, 40, { c: 'green' }), T(470, 208, '1 to 2 slots: no delay', { anchor: 'middle', size: 20 }),
              T(320, 280, 'slower hardware, more slack for decoding', { anchor: 'middle', size: 24 })
            ],
            takeaway: 'Slower physical steps leave decoding far more time.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Trapped ion, four slots: 40.534 s. Control: 40.517 s.', show: 'gap 17.5 ms out of 40.5 s' },
                { say: 'Physical execution dominates, so decoding rarely delays it.', show: 'one slot is enough inside shots' },
                { say: 'Neutral atoms with deferred readout need slots as jobs grow.', show: '1 slot for 1 or 2 jobs, 2 for 4' },
                { say: 'Neutral atoms with streaming reuse stayed fine with one slot.', show: 'one slot at every tested count' }
              ]
            },
            check: {
              q: 'Why does trapped-ion hardware need so few decoder slots?',
              options: [
                'Its physical execution is slow, so decoding is rarely the limit',
                'It has no errors',
                'Its decoder is faster',
                'It uses no syndromes'
              ],
              answer: 0,
              why: 'Physical steps take so long that decoding easily keeps up.'
            }
          },
          {
            title: 'Faster rounds create more work',
            buildsOn: 'Different hardware needs different slot counts today. The third question looks ahead: what if the rounds themselves get shorter.',
            leadsTo: 'Next, how a faster decoder can stand in for extra slots.',
            idea: [
              'Protection is fixed at 1 ms per shot. Round time 6.084, 3.042 and 1.521 µs gives 165, 329 and 658 rounds.',
              'Four jobs, reference 352.983 ms. Halve the round: 493.255 ms, slower. A 2× faster decoder brings it to 351.145 ms.',
              'Quarter round: 956.479 ms. A 2× decoder: 545.467 ms. 4× or 8× do no better: the link and admission now set the pace.',
              'Faster rounds make more syndromes, so decoding must speed up too.'
            ],
            sketch: [
              T(30, 55, '6.084 µs', { size: 24 }),
              L([[200, 50], [240, 50]], { dash: true }),
              T(30, 125, '3.042 µs', { size: 24 }),
              L([[200, 120], [280, 120]], { dash: true }),
              T(30, 195, '1.521 µs', { size: 24 }),
              L([[200, 190], [360, 190]], { dash: true }),
              T(420, 60, '165 rounds', { size: 22, c: 'blue' }),
              T(420, 130, '329 rounds', { size: 22, c: 'blue' }),
              T(420, 200, '658 rounds', { size: 22, c: 'red' }),
              T(30, 275, 'decoders must keep up', { size: 28 })
            ],
            takeaway: 'Faster hardware makes more syndromes. Decoding must keep pace.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Rounds per 1 ms at three round times.', show: '6.084 µs: 165   3.042 µs: 329   1.521 µs: 658' },
                { say: 'Halve the round with an unchanged decoder.', show: '352.983 → 493.255 ms' },
                { say: 'Double the decoder speed.', show: '351.145 ms' },
                { say: 'Quarter the round. A 2× decoder gets 545.467 ms.', show: '956.479 → 545.467 ms' },
                { say: '4× or 8× decoder speed do no better: communication and admission are now the limit.', show: 'still 1.55× above reference' }
              ]
            },
            check: {
              q: 'The round time is halved but the decoder is unchanged. What happens to runtime?',
              options: [
                'It rises, because there is more decoding work',
                'It halves',
                'It stays the same',
                'It drops to zero'
              ],
              answer: 0,
              why: 'Twice as many rounds mean twice as many syndromes to decode, so runtime went up to 493.255 ms.'
            }
          },
          {
            title: 'A faster decoder can replace slots',
            buildsOn: 'Faster rounds raise the decoding load. There are two ways to meet the load: more slots, or a faster decoder.',
            leadsTo: 'Next, why one upgrade plan does not suit every hardware type.',
            idea: [
              'Take rounds of 1.521 µs and a 4 GB/s link.',
              'Four slots with a 2× faster decoder: 350.863 ms. Two slots with a 4× faster decoder: 350.713 ms.',
              'Both match the 352.983 ms reference. A faster decoder can substitute for slots.'
            ],
            sketch: [
              B(40, 60, 240, 80), T(160, 95, '4 slots', { anchor: 'middle', size: 28 }),
              T(160, 125, 'decoder 2× faster', { anchor: 'middle', size: 22, c: 'blue' }),
              B(340, 60, 240, 80), T(460, 95, '2 slots', { anchor: 'middle', size: 28 }),
              T(460, 125, 'decoder 4× faster', { anchor: 'middle', size: 22, c: 'blue' }),
              A(160, 150, 160, 200, { c: 'green' }), A(460, 150, 460, 200, { c: 'green' }),
              T(160, 235, '350.9 ms', { anchor: 'middle', size: 28, c: 'green' }),
              T(460, 235, '350.7 ms', { anchor: 'middle', size: 28, c: 'green' })
            ],
            takeaway: 'Fewer slots with a faster decoder can reach the same runtime.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Fix rounds at 1.521 µs and bandwidth at 4 GB/s. The target is the 352.983 ms reference.', show: 'target: 352.983 ms' },
                { say: 'Option 1: four slots, decoder 2× faster.', show: '350.863 ms' },
                { say: 'Option 2: two slots, decoder 4× faster.', show: '350.713 ms' },
                { say: 'Both reach the target. Which is cheaper depends on what hardware costs.', show: 'a tradeoff, not a rule' }
              ]
            },
            check: {
              q: 'With rounds of 1.521 µs, which pair reaches about 350.7 ms?',
              options: [
                'Two slots, decoder 4× faster',
                'One slot, decoder 1× speed',
                'Eight slots, decoder 1× speed',
                'Four slots, decoder 8× slower'
              ],
              answer: 0,
              why: 'The paper reports 350.713 ms for two slots with a 4× faster decoder.'
            }
          },
          {
            title: 'No single upgrade plan fits all',
            buildsOn: 'A faster decoder or more slots can meet higher load. Which upgrade pays off depends on what limits each hardware type.',
            leadsTo: 'Next, one full run through the whole system in order.',
            idea: [
              'Superconducting: 4× faster decoding gives 3.75× speedup. 2× faster physical stages alone give 1.01×. Both give 3.91×.',
              'Trapped ion: nearly 2× from faster physical stages.',
              'Neutral atoms: deferred readout gives 1.85×. Streaming reuse gives only 1.54×, capped by an unchanged 10 ms of classical processing.'
            ],
            sketch: [
              T(30, 55, 'superconducting', { size: 24 }),
              B(250, 40, 300, 24, { c: 'red' }), T(560, 60, '3.9×', { size: 22 }),
              T(30, 115, 'trapped ion', { size: 24 }),
              B(250, 100, 100, 24, { c: 'blue' }), T(360, 120, '~2×', { size: 22 }),
              T(30, 175, 'neutral atom, deferred', { size: 24 }),
              B(250, 160, 190, 24, { c: 'green' }), T(450, 180, '1.85×', { size: 22 }),
              T(30, 235, 'neutral atom, streaming', { size: 24 }),
              B(250, 220, 150, 24, { c: 'green', dash: true }), T(410, 240, '1.54×', { size: 22 }),
              T(30, 290, 'one plan does not fit all', { size: 26 })
            ],
            takeaway: 'Each hardware type has a different bottleneck to fix.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Superconducting: decoding is the limit. 4× faster decoding helps most.', show: '3.75×' },
                { say: 'Speeding up the physical stages alone barely helps it.', show: '1.01×' },
                { say: 'Trapped ion: physical steps are the limit.', show: 'nearly 2× from physical gains' },
                { say: 'Neutral atoms with streaming reuse hit an unchanged 10 ms classical processing budget.', show: '1.54× cap' }
              ]
            },
            check: {
              q: 'What caps the gain for neutral atoms with streaming reuse?',
              options: [
                'An unchanged 10 ms classical processing budget',
                'The link bandwidth',
                'The code distance',
                'The number of jobs'
              ],
              answer: 0,
              why: 'The paper attributes the 1.54× limit to the classical processing budget that the upgrade leaves unchanged.'
            }
          },
          {
            title: 'One full run, in order',
            buildsOn: 'You have met every piece and every finding. Now run the whole system once, from a round to the next shot.',
            leadsTo: 'Next, what the paper does not claim.',
            idea: [
              'A round runs for 6.084 µs. Measurement ends and the syndrome is ready.',
              'The syndrome enters the buffer, crosses the link (L + V / B), and waits for a slot.',
              'The decoder works. Feedback crosses back and the control system applies it. The frontier moves up.',
              'Once all results are in, the drain ends and the next shot starts.'
            ],
            sketch: [
              B(20, 100, 80, 50), T(60, 133, 'round', { anchor: 'middle', size: 22 }),
              A(105, 125, 125, 125),
              B(130, 100, 80, 50), T(170, 133, 'buffer', { anchor: 'middle', size: 22 }),
              A(215, 125, 235, 125),
              B(240, 100, 70, 50), T(275, 133, 'link', { anchor: 'middle', size: 22 }),
              A(315, 125, 335, 125),
              B(340, 100, 80, 50), T(380, 133, 'slot', { anchor: 'middle', size: 22 }),
              A(425, 125, 445, 125),
              B(450, 100, 80, 50), T(490, 133, 'back', { anchor: 'middle', size: 22 }),
              A(535, 125, 555, 125),
              B(560, 100, 60, 50), T(590, 133, 'next', { anchor: 'middle', size: 20 }),
              T(320, 240, 'each stop can wait', { anchor: 'middle', size: 28, c: 'red' })
            ],
            takeaway: 'Every stop in the loop can wait, and the QPU feels all of it.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'A round runs for 6.084 µs and measurement produces a syndrome.', show: 'syndrome ready' },
                { say: 'It enters the syndrome buffer, waiting if the buffer is full.', show: 'backpressure' },
                { say: 'It crosses the link in L + V / B, waiting if the link is busy.', show: 'link time' },
                { say: 'The decoder admits it when a slot and room are free, then decodes.', show: 'slot busy' },
                { say: 'Feedback crosses back and the control system applies it. The frontier moves up.', show: 'window and buffer freed' },
                { say: 'When all results are in, the drain ends and the next shot may start.', show: 'next shot' }
              ]
            },
            check: {
              q: 'Which stop in the loop can make the QPU wait?',
              options: [
                'Any of them: buffer, link, slot, or feedback',
                'Only the decoder',
                'Only the link',
                'None of them'
              ],
              answer: 0,
              why: 'Each stop can queue, and the QPU waits on the sum.'
            }
          },
          {
            title: 'What the paper does not claim',
            buildsOn: 'The full loop shows where time goes. A careful reading also needs the limits of the evidence.',
            leadsTo: 'This is the end of the paper. A natural next read is the simulator code, or the related work the paper compares against.',
            idea: [
              'Accuracy varies by pipeline. CPU-window errors grow near saturation and with tight buffers.',
              'Zero-wait results hold for the tested workloads and durations only.',
              'Placement, routing and correlated noise need more inputs. Programs whose control depends on outcomes are future work.',
              'The takeaway: track when decoding ends, when resources free, and when quantum work may resume.'
            ],
            sketch: [
              B(40, 50, 250, 70), T(165, 95, 'tested', { anchor: 'middle', size: 28, c: 'green' }),
              B(340, 50, 250, 70, { dash: true }), T(465, 95, 'not tested', { anchor: 'middle', size: 28, c: 'red' }),
              T(165, 160, 'tested workloads\nand durations', { anchor: 'middle', size: 22 }),
              T(465, 160, 'placement, routing,\ncorrelated noise,\nadaptive programs', { anchor: 'middle', size: 22 }),
              H(40, 245, 540, 44, { c: 'yellow' }),
              T(50, 278, 'three times: decode end, release, resume', { size: 28 })
            ],
            takeaway: 'Trust the tested regimes. Track decode, release and resume separately.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Decode end: when a decoder finishes.', show: 'service completion' },
                { say: 'Release: when a resource is freed.', show: 'release boundary' },
                { say: 'Resume: when quantum work is allowed to continue.', show: 'permission to resume' },
                { say: 'These can differ. The paper says to keep them separate.', show: 'three different times' }
              ]
            },
            check: {
              q: 'Which of these is future work in the paper?',
              options: [
                'Programs whose control depends on measurement outcomes',
                'Surface code timing',
                'Buffer sizing',
                'Zero-service controls'
              ],
              answer: 0,
              why: 'The paper lists adaptive, outcome-dependent control programs as future work.'
            }
          }
        ]
      }
    ]
  });
})();
