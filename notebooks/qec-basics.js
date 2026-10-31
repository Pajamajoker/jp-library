(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;

  NB.register({
    id: 'qec-basics',
    title: 'QEC basics',
    subtitle: 'Errors, the bit-flip and phase-flip codes, stabilizers, decoders, and the surface code in time.',
    cover: {
      art: [
        B(2, 14, 72, 72),
        L([[38, 14], [38, 86]]),
        L([[2, 50], [74, 50]]),
        K([[2, 14], [20, 0], [38, 14]], { dash: true }),
        K([[38, 86], [56, 100], [74, 86]], { dash: true }),
        K([[2, 50], [-12, 68], [2, 86]], { dash: true }),
        K([[74, 14], [88, 32], [74, 50]], { dash: true }),
        O(20, 32, 5), O(56, 32, 5), O(20, 68, 5), O(56, 68, 5),
        D(2, 14, { r: 4.5 }), D(38, 14, { r: 4.5 }), D(74, 14, { r: 4.5 }),
        D(2, 50, { r: 4.5 }), D(38, 50, { r: 4.5 }), D(74, 50, { r: 4.5 }),
        D(2, 86, { r: 4.5 }), D(38, 86, { r: 4.5 }), D(74, 86, { r: 4.5 })
      ]
    },
    glossary: [
      {
        "group": "Errors",
        "items": [
          {
            "term": "Noise",
            "means": "Anything that changes (α, β) without being asked: heat, stray fields, imperfect gates."
          },
          {
            "term": "X error",
            "means": "Bit flip. Swaps α and β, so |0⟩ ↔ |1⟩."
          },
          {
            "term": "Z error",
            "means": "Phase flip. Flips the sign of β, so |+⟩ ↔ |−⟩. Invisible to the 0/1 readout."
          },
          {
            "term": "Y error",
            "means": "X and Z together (up to an overall phase)."
          },
          {
            "term": "I",
            "means": "No error."
          },
          {
            "term": "I, X, Y, Z",
            "means": "Any small error is a blend of these four. A check forces the blend to become one of them."
          },
          {
            "term": "No copying",
            "means": "An unknown qubit cannot be copied, so QEC spreads it out instead of backing it up."
          },
          {
            "term": "No peeking",
            "means": "Reading a qubit collapses it, so checks ask about relations between qubits, never the data itself."
          }
        ]
      },
      {
        "group": "Codes",
        "items": [
          {
            "term": "Repetition",
            "means": "Classical: 0 → 000, 1 → 111. A majority vote fixes one flip."
          },
          {
            "term": "Bit-flip code",
            "means": "α|000⟩ + β|111⟩. Fixes one X error. Blind to Z errors."
          },
          {
            "term": "Phase-flip code",
            "means": "α|+++⟩ + β|−−−⟩. Fixes one Z error. Blind to X errors. The bit-flip code seen through H."
          },
          {
            "term": "Shor code",
            "means": "9 qubits: a phase-flip code built from three bit-flip blocks. Fixes any single-qubit error."
          },
          {
            "term": "Physical qubit",
            "means": "One real hardware qubit."
          },
          {
            "term": "Logical qubit",
            "means": "The one protected qubit stored across many physical qubits."
          },
          {
            "term": "Distance d",
            "means": "The fewest single-qubit errors that change the stored qubit with every check quiet.",
            "more": "A distance-d code fixes up to (d − 1)/2 errors. Distance 3 fixes 1."
          },
          {
            "term": "Logical error",
            "means": "An error chain the checks cannot see that changes the stored qubit."
          }
        ]
      },
      {
        "group": "Checks",
        "items": [
          {
            "term": "Z-type check",
            "means": "Do these qubits agree in the 0/1 view? Catches X errors."
          },
          {
            "term": "X-type check",
            "means": "Do they agree in the +/− view? Catches Z errors. Same as H on each, then a parity check."
          },
          {
            "term": "Stabilizer",
            "means": "A check the code state always passes. A code is defined by its list of stabilizers."
          },
          {
            "term": "Syndrome",
            "means": "The list of check results. Points at the error without revealing α or β."
          },
          {
            "term": "Decoder",
            "means": "Turns a syndrome into a fix. It sees only the syndrome, never the errors themselves."
          }
        ]
      },
      {
        "group": "Surface code",
        "items": [
          {
            "term": "Surface code",
            "means": "Qubits on a grid; every check touches only neighbours. Distance d uses d² data and d² − 1 ancilla qubits."
          },
          {
            "term": "Data qubit",
            "means": "Holds the stored information."
          },
          {
            "term": "Ancilla",
            "means": "A helper qubit that measures one check and reports it, then is reset for the next round."
          },
          {
            "term": "Round",
            "means": "One pass of measuring every check. Rounds repeat on a fixed clock."
          },
          {
            "term": "Detection event",
            "means": "A check result that changed since the last round. Decoders work from these."
          },
          {
            "term": "Threshold",
            "means": "The physical error rate below which bigger codes help. Above it, more qubits make things worse."
          }
        ]
      }
    ],
    sections: [
      /* ============================ SECTION 1 ============================ */
      {
        title: 'Why qubits need protecting',
        intro: 'Qubits are fragile, cannot be copied, and cannot be peeked at. Errors come in two basic kinds, and every other error is a mix of them.',
        bridge: 'You now know the two basic errors, X and Z, and that a check forces any error to become one of them. Section 2 builds the first code, which catches X errors.',
        tabs: [
          {
            title: 'Noise changes (α, β)',
            buildsOn: 'Quantum basics described a qubit as a pair (α, β). Noise is anything that changes that pair without being asked.',
            leadsTo: 'Next, the two simplest ways the pair can change: swap the amplitudes, or flip the sign of β.',
            idea: [
              'Real qubits drift. Heat, stray fields and imperfect gates all nudge (α, β).',
              'Every gate and every readout also has a small chance of going wrong.',
              'QEC exists because small errors pile up over a long computation.'
            ],
            sketch: [
              O(170, 170, 100),
              E(170, 170, 100, 28, { dash: true }),
              A(170, 170, 225, 100, { c: 'blue' }),
              D(225, 100, { c: 'blue' }),
              K([[245, 112], [262, 128], [258, 150]], { c: 'red', dash: true }),
              D(258, 150, { c: 'red' }),
              T(300, 70, 'what you wanted', { size: 26, c: 'blue' }),
              T(300, 200, 'what noise did', { size: 26, c: 'red' }),
              A(296, 190, 268, 156, { c: 'red' }),
              T(300, 250, 'heat, stray fields,\nbad gates, bad readouts', { size: 24 }),
              H(36, 290, 300, 30, { c: 'yellow' }),
              T(40, 314, 'small errors add up', { size: 28 })
            ],
            takeaway: 'Noise nudges (α, β). Small nudges add up.',
            widget: { type: 'qubit', sliders: ['theta', 'phi'], bloch: true, start: { theta: 50, phi: 30 } },
            check: {
              q: 'What does noise do to a qubit?',
              options: [
                'It changes (α, β) without being asked',
                'It makes the qubit a classical bit',
                'It only matters during readout',
                'It adds more qubits'
              ],
              answer: 0,
              why: 'Noise is any unwanted change to the state, so it moves the point on the Bloch sphere.'
            }
          },
          {
            title: 'Two basic errors: X and Z',
            buildsOn: 'The noise tab said noise changes (α, β). The simplest changes are the gates X and Z from Quantum basics, used as errors.',
            leadsTo: 'Next, why these two are enough: any small error is a blend of them.',
            idea: [
              '*X error* (bit flip) swaps α and β. It turns |0⟩ into |1⟩.',
              '*Z error* (phase flip) flips the sign of β. A Z readout cannot see it.',
              'Both at once is *Y*, up to a factor i. X, Y, Z and "no error" are the Pauli errors.'
            ],
            sketch: [
              B(30, 40, 160, 70), T(110, 86, '(α, β)', { anchor: 'middle', size: 34 }),
              A(200, 75, 280, 75, { c: 'red' }), T(240, 58, 'X', { anchor: 'middle', size: 30, c: 'red' }),
              B(290, 40, 160, 70), T(370, 86, '(β, α)', { anchor: 'middle', size: 34 }),
              T(470, 86, 'bit flip', { size: 26, c: 'red' }),
              B(30, 150, 160, 70), T(110, 196, '(α, β)', { anchor: 'middle', size: 34 }),
              A(200, 185, 280, 185, { c: 'blue' }), T(240, 168, 'Z', { anchor: 'middle', size: 30, c: 'blue' }),
              B(290, 150, 160, 70), T(370, 196, '(α, −β)', { anchor: 'middle', size: 34 }),
              T(470, 196, 'phase flip', { size: 26, c: 'blue' }),
              H(30, 250, 440, 40, { c: 'yellow' }),
              T(40, 280, 'Y = X and Z together (times i)', { size: 30 })
            ],
            takeaway: 'X swaps α and β. Z flips the sign of β. Y is both.',
            widget: { type: 'qubit', sliders: [], bloch: true, gates: ['X', 'Y', 'Z'], readouts: true, start: { theta: 60, phi: 40 } },
            check: {
              q: 'Which error can a plain 0/1 readout never see?',
              options: ['X (bit flip)', 'Z (phase flip)', 'Both', 'Neither'],
              answer: 1,
              why: 'Z only changes the sign of β, which leaves the odds of 0 and 1 untouched.'
            }
          },
          {
            title: 'Any error is a blend of four',
            buildsOn: 'The last tab named X, Y and Z. This tab says why QEC only has to handle those and not every possible nudge.',
            leadsTo: 'Next, a different obstacle: you cannot copy a qubit or look at it, so how do you check anything?',
            idea: [
              'A small drift is a blend: mostly "no error", a little bit of X, Y or Z.',
              'Example: a small tilt of angle δ about x is cos(δ/2) · (no error) − i·sin(δ/2) · X.',
              'A check forces the blend to pick one: clean, or fully flipped. So fixing X, Y and Z fixes every error.'
            ],
            sketch: [
              T(40, 60, 'small drift', { size: 30, c: 'red' }),
              A(180, 52, 250, 52, { c: 'ink' }),
              T(264, 60, 'cos(δ/2)·none  −  i·sin(δ/2)·X', { size: 28 }),
              H(262, 70, 340, 4, { c: 'yellow' }),
              A(330, 84, 150, 166, { c: 'blue' }), A(400, 84, 340, 166, { c: 'blue' }),
              T(440, 150, 'check finds:', { size: 26, c: 'blue' }),
              B(40, 170, 170, 60), T(125, 210, 'no error', { anchor: 'middle', size: 30 }),
              B(250, 170, 170, 60), T(335, 210, 'full X flip', { anchor: 'middle', size: 30, c: 'red' }),
              T(125, 262, 'big chance', { anchor: 'middle', size: 24, c: 'green' }),
              T(335, 262, 'small chance', { anchor: 'middle', size: 24, c: 'green' }),
              H(36, 280, 500, 36, { c: 'mint' }),
              T(40, 308, 'either way, we can fix it', { size: 30 })
            ],
            takeaway: 'A check turns a messy error into a clean one we can fix.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['RX2'], syndrome: true, codeSpace: true, reset: true },
            check: {
              q: 'A small partial error hits one qubit. The syndrome is read. What is the qubit now?',
              options: [
                'Still partly flipped',
                'Either not flipped, or fully flipped',
                'Always fully flipped',
                'Unchanged and unreadable'
              ],
              answer: 1,
              why: 'The check projects onto "no error" or "full flip". Both can be repaired.'
            }
          },
          {
            title: 'No copying, no peeking',
            buildsOn: 'The last tab said checks force errors into clean cases. But checking means reading, and Quantum basics showed that reading collapses a qubit.',
            leadsTo: 'Section 2 shows the way out: spread the state over several qubits and read only relations between them.',
            idea: [
              '*No-cloning*: an unknown state cannot be copied. "Keep three copies" is not an option.',
              'Reading the qubit collapses it, so "look and fix" destroys α and β.',
              'Way out: spread the state over several qubits and read only relations between them.'
            ],
            sketch: [
              B(30, 50, 140, 60), T(100, 92, 'α|0⟩+β|1⟩', { anchor: 'middle', size: 28 }),
              A(180, 80, 260, 80),
              B(266, 50, 120, 60), T(326, 92, 'copier', { anchor: 'middle', size: 28 }),
              L([[270, 54], [382, 106]], { c: 'red' }), L([[382, 54], [270, 106]], { c: 'red' }),
              T(410, 90, 'not allowed', { size: 28, c: 'red' }),
              O(100, 200, 34, { c: 'ink' }), O(100, 200, 12, { c: 'ink' }),
              L([[50, 160], [150, 240]], { c: 'red' }), L([[150, 160], [50, 240]], { c: 'red' }),
              T(180, 206, 'looking destroys the state', { size: 28, c: 'red' }),
              H(30, 270, 560, 40, { c: 'yellow' }),
              T(40, 300, 'spread it out, ask only about relations', { size: 30 })
            ],
            takeaway: 'We cannot copy or look. We spread the state and ask about relations.',
            widget: null,
            check: {
              q: 'Why is "store three copies and vote" impossible for an unknown qubit?',
              options: [
                'Qubits are too small',
                'Votes are slow',
                'An unknown state cannot be copied',
                'Three copies would be entangled'
              ],
              answer: 2,
              why: 'No-cloning forbids copying an unknown quantum state.'
            }
          }
        ]
      },

      /* ============================ SECTION 2 ============================ */
      {
        title: 'The bit-flip code',
        intro: 'Three qubits, one parity trick, and one error type handled. Every later code is a bigger version of this one.',
        bridge: 'The bit-flip code fixes one X error and is blind to Z errors. Section 3 builds the mirror-image code for Z errors and joins the two.',
        tabs: [
          {
            title: 'Classical repetition',
            buildsOn: 'Section 1 ended with "spread the state". The oldest way to spread a bit is the classical repetition code.',
            leadsTo: 'The quantum version cannot vote by reading bits, so the next tab replaces voting with parity checks.',
            idea: [
              'Send each bit three times: 0 → 000, 1 → 111.',
              'If one copy flips, a majority vote recovers the bit.',
              'Two flips fool the vote. One flip is the limit.'
            ],
            sketch: [
              T(40, 60, '1', { size: 40 }), A(80, 52, 150, 52),
              B(160, 24, 140, 56), T(230, 62, '1 1 1', { anchor: 'middle', size: 36 }),
              A(310, 52, 380, 52, { c: 'red' }), T(345, 36, 'noise', { anchor: 'middle', size: 22, c: 'red' }),
              B(390, 24, 140, 56), T(460, 62, '1 0 1', { anchor: 'middle', size: 36, c: 'red' }),
              A(460, 90, 460, 140, { c: 'green' }), T(486, 124, 'majority vote', { size: 26, c: 'green' }),
              T(460, 180, '1', { anchor: 'middle', size: 44, c: 'green' }),
              H(30, 220, 320, 40, { c: 'pink' }),
              T(36, 250, 'two flips: 1 0 0  →  vote says 0', { size: 28 }),
              T(36, 296, 'one flip is the limit', { size: 28, c: 'red' })
            ],
            takeaway: 'Repeat and vote. It fixes one flip, not two.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Encode the bit 1 as three copies.', show: '1  →  1 1 1' },
                { say: 'Noise flips the middle copy.', show: '1 1 1  →  1 0 1' },
                { say: 'Majority vote reads two 1s and one 0.', show: 'vote = 1   (fixed)' },
                { say: 'Now suppose two copies flip.', show: '1 1 1  →  0 0 1' },
                { say: 'The vote now gives the wrong answer.', show: 'vote = 0   (wrong)' }
              ]
            },
            check: {
              q: 'Three copies of a bit, and exactly two get flipped. What does a majority vote give?',
              options: ['The right bit', 'The wrong bit', 'A random bit', 'No answer'],
              answer: 1,
              why: 'Two flipped copies outvote the one good copy.'
            }
          },
          {
            title: 'Parity checks find the flipped qubit',
            buildsOn: 'Classical voting needs to read every bit. A qubit cannot be read, so we ask parity questions, as in Quantum basics.',
            leadsTo: 'Next, how many flips this code can survive. That limit is called the distance.',
            idea: [
              'Check Z1Z2: do q1 and q2 match? Check Z2Z3: do q2 and q3 match?',
              'Each check answers +1 (match) or −1 (differ). The pair of answers is the *syndrome*.',
              'One flipped qubit gives a unique syndrome, so you know which one to flip back.'
            ],
            sketch: [
              B(40, 50, 90, 80), B(160, 50, 90, 80, { c: 'red' }), B(280, 50, 90, 80),
              T(85, 102, 'q1', { anchor: 'middle', size: 32 }), T(205, 102, 'q2', { anchor: 'middle', size: 32, c: 'red' }), T(325, 102, 'q3', { anchor: 'middle', size: 32 }),
              K([[85, 140], [100, 172], [190, 172], [205, 140]], { c: 'blue' }),
              T(145, 206, 'Z1Z2 = −1', { anchor: 'middle', size: 26, c: 'blue' }),
              K([[205, 140], [220, 172], [310, 172], [325, 140]], { c: 'blue' }),
              T(265, 240, 'Z2Z3 = −1', { anchor: 'middle', size: 26, c: 'blue' }),
              A(400, 110, 470, 110, { c: 'green' }),
              H(476, 76, 150, 50, { c: 'yellow' }),
              T(482, 110, 'q2 flipped', { size: 28 }),
              T(40, 300, 'both checks fire: the shared qubit is the culprit', { size: 26, c: 'green' })
            ],
            takeaway: 'Two parity checks name the flipped qubit.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X1', 'X2', 'X3'], syndrome: true, codeSpace: true, reset: true },
            check: {
              q: 'Z1Z2 = +1 and Z2Z3 = −1. Which qubit flipped?',
              options: ['q1', 'q2', 'q3', 'None'],
              answer: 2,
              why: 'q1 and q2 still match, but q2 and q3 differ, so q3 is the odd one out.'
            }
          },
          {
            title: 'Distance: how many flips it fixes',
            buildsOn: 'The last tab fixed one flip. Here we ask what happens with two.',
            leadsTo: 'Next, a different failure: errors of a different type that these checks cannot see at all.',
            idea: [
              '*Distance d* is the smallest number of flips that turns one code state into another.',
              'Here d = 3: flipping all three qubits turns 000 into 111.',
              'A code of distance d fixes up to (d−1)/2 flips. For d = 3 that is one.'
            ],
            sketch: [
              B(40, 60, 120, 60), T(100, 102, '000', { anchor: 'middle', size: 36 }),
              B(420, 60, 120, 60), T(480, 102, '111', { anchor: 'middle', size: 36 }),
              A(170, 90, 410, 90, { c: 'red' }),
              T(290, 70, '3 flips', { anchor: 'middle', size: 30, c: 'red' }),
              T(290, 140, 'distance d = 3', { anchor: 'middle', size: 28, c: 'blue' }),
              T(40, 200, '1 flip:  closer to 000  →  fixed', { size: 28, c: 'green' }),
              T(40, 246, '2 flips: closer to 111  →  "fixed" the wrong way', { size: 28, c: 'red' }),
              H(36, 266, 560, 40, { c: 'yellow' }),
              T(40, 296, 'fixes up to (d−1)/2 flips', { size: 30 })
            ],
            takeaway: 'Distance d fixes up to (d−1)/2 flips.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X1', 'X2', 'X3'], syndrome: true, codeSpace: true, reset: true },
            check: {
              q: 'A code has distance 5. How many flips can it surely fix?',
              options: ['1', '2', '3', '5'],
              answer: 1,
              why: '(5−1)/2 = 2.'
            }
          },
          {
            title: 'Phase flips slip past',
            buildsOn: 'The bit-flip checks are Z-type parity questions. Section 1 said a Z error is invisible to anything that only reads 0 and 1.',
            leadsTo: 'Section 3 fixes this with the mirror-image code that catches Z errors, then joins both.',
            idea: [
              'Z on q1 turns α|000⟩ + β|111⟩ into α|000⟩ − β|111⟩.',
              'Parity checks only see 0s and 1s. Both patterns keep their parity, so every check says "fine".',
              'The sign of β changed, so the stored qubit is damaged and nobody noticed.'
            ],
            sketch: [
              T(40, 60, 'before', { size: 26, c: 'blue' }), T(130, 60, 'α|000⟩ + β|111⟩', { size: 32 }),
              A(300, 82, 300, 124, { c: 'red' }), T(318, 110, 'Z on q1', { size: 26, c: 'red' }),
              T(40, 160, 'after', { size: 26, c: 'blue' }), T(130, 160, 'α|000⟩ ', { size: 32 }), T(255, 160, '− β|111⟩', { size: 32, c: 'red' }),
              H(250, 130, 160, 40, { c: 'pink' }),
              B(40, 200, 200, 60), T(140, 240, 'parity checks:', { anchor: 'middle', size: 26 }),
              T(260, 240, 'all quiet', { size: 32, c: 'green' }),
              T(40, 300, 'damage done, nobody told', { size: 30, c: 'red' })
            ],
            takeaway: 'Bit-flip checks cannot see a phase flip.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['Z1', 'Z2', 'Z3'], syndrome: true, codeSpace: true, reset: true },
            check: {
              q: 'You apply Z to one qubit of α|000⟩ + β|111⟩ and read the bit-flip syndrome. What shows?',
              options: ['(1,0)', '(0,1)', '(1,1)', '(0,0)'],
              answer: 3,
              why: 'Both patterns keep their parities, so the syndrome is (0,0) and the error goes unseen.'
            }
          }
        ]
      },

      /* ============================ SECTION 3 ============================ */
      {
        title: 'Phase flips and the Shor code',
        intro: 'The mirror image of the bit-flip code catches Z errors. Stacking the two catches every single-qubit error.',
        bridge: 'You can protect against both X and Z with 9 qubits. Section 4 gives the general language that scales this up: stabilizers, syndromes and decoders.',
        tabs: [
          {
            title: 'The phase-flip code',
            buildsOn: 'The last tab showed Z errors escape. Quantum basics showed H swaps the Z and X views, so we repeat the bit-flip code in the H basis.',
            leadsTo: 'Next, the checks for this code. They are parity checks done after H.',
            idea: [
              'Encode in the H basis: *α|+++⟩ + β|−−−⟩*.',
              'A Z error turns |+⟩ into |−⟩. That is a flip, in the basis we now look in.',
              'It is the bit-flip code seen through H. Apply H to all three qubits and you are back to α|000⟩ + β|111⟩.'
            ],
            sketch: [
              B(30, 40, 200, 60), T(130, 82, 'α|000⟩+β|111⟩', { anchor: 'middle', size: 28 }),
              A(240, 70, 330, 70, { c: 'red' }), T(285, 52, 'H on all', { anchor: 'middle', size: 24, c: 'red' }),
              B(340, 40, 220, 60), T(450, 82, 'α|+++⟩+β|−−−⟩', { anchor: 'middle', size: 28 }),
              T(40, 150, 'bit-flip code:', { size: 26, c: 'blue' }), T(250, 150, 'X error flips 0 ↔ 1', { size: 26 }),
              T(40, 196, 'phase-flip code:', { size: 26, c: 'blue' }), T(250, 196, 'Z error flips + ↔ −', { size: 26 }),
              H(30, 226, 420, 38, { c: 'yellow' }),
              T(36, 254, 'same code, other basis', { size: 30 })
            ],
            takeaway: 'The phase-flip code is the bit-flip code in the H basis.',
            widget: { type: 'multi', n: 3, presets: ['plog', 'log'], start: 'plog', slider: 'plog', ops: ['Z1', 'Z2', 'H1', 'H2', 'H3'], codeSpace: 'x', reset: true },
            check: {
              q: 'In the phase-flip code, a Z error on one qubit does what?',
              options: [
                'Swaps 0 and 1 on that qubit',
                'Swaps + and − on that qubit',
                'Does nothing',
                'Swaps all three qubits'
              ],
              answer: 1,
              why: 'Z sends |+⟩ to |−⟩ and |−⟩ to |+⟩.'
            }
          },
          {
            title: 'X-type checks',
            buildsOn: 'The phase-flip code tab put the code in the H basis. The checks must move there too: Z-type parity becomes X-type parity.',
            leadsTo: 'Next, one code that uses both families of checks to cover every single-qubit error.',
            idea: [
              'An X-type check asks: do q1 and q2 have matching signs? It is written X1X2.',
              'To measure it: apply H to every qubit, take the parity, then apply H again.',
              'Z errors fire X-type checks. X errors fire Z-type checks. Two families, one for each error.'
            ],
            sketch: [
              T(40, 60, 'Z-type check', { size: 28, c: 'blue' }), T(40, 96, 'reads 0 / 1 parity', { size: 24 }), T(40, 130, 'catches X errors', { size: 26, c: 'red' }),
              T(340, 60, 'X-type check', { size: 28, c: 'red' }), T(340, 96, 'reads + / − parity', { size: 24 }), T(340, 130, 'catches Z errors', { size: 26, c: 'blue' }),
              L([[320, 40], [320, 150]], { dash: true }),
              B(40, 190, 90, 56), T(85, 228, 'H', { anchor: 'middle', size: 30, c: 'green' }),
              A(140, 218, 200, 218), B(210, 190, 130, 56), T(275, 228, 'parity', { anchor: 'middle', size: 28 }),
              A(350, 218, 410, 218), B(420, 190, 90, 56), T(465, 228, 'H', { anchor: 'middle', size: 30, c: 'green' }),
              H(30, 270, 540, 36, { c: 'mint' }),
              T(36, 298, 'X-check = H, parity, H', { size: 30 })
            ],
            takeaway: 'X-type checks catch Z errors. Z-type checks catch X errors.',
            widget: { type: 'multi', n: 3, presets: ['plog'], start: 'plog', slider: 'plog', ops: ['Z1', 'Z2', 'Z3'], xparity: [[1, 2], [2, 3]], syndrome: 'x', codeSpace: 'x', reset: true },
            check: {
              q: 'Which kind of check fires when a Z error hits a qubit?',
              options: ['Z-type', 'X-type', 'Both', 'Neither'],
              answer: 1,
              why: 'Z errors flip signs, which X-type checks compare.'
            }
          },
          {
            title: "Shor's 9-qubit code",
            buildsOn: 'The last six tabs gave one code for X errors and one for Z errors. This tab stacks them.',
            leadsTo: 'Section 4 steps back from this one code and names the pieces every code shares.',
            idea: [
              'Take the phase-flip code on three qubits, then encode each of those qubits in its own bit-flip triple: 3 × 3 = 9 qubits.',
              'Bit-flip checks inside each triple catch X errors. Phase-flip checks across triples catch Z errors.',
              'Any single-qubit error is corrected. Y is X and Z together, so it is covered too.'
            ],
            sketch: [
              B(30, 50, 170, 80), B(230, 50, 170, 80), B(430, 50, 170, 80),
              O(70, 90, 14), O(115, 90, 14), O(160, 90, 14),
              O(270, 90, 14), O(315, 90, 14), O(360, 90, 14),
              O(470, 90, 14), O(515, 90, 14), O(560, 90, 14),
              T(115, 160, 'triple 1', { anchor: 'middle', size: 24 }), T(315, 160, 'triple 2', { anchor: 'middle', size: 24 }), T(515, 160, 'triple 3', { anchor: 'middle', size: 24 }),
              T(115, 40, 'bit-flip checks inside', { anchor: 'middle', size: 22, c: 'red' }),
              K([[115, 180], [200, 214], [430, 214], [515, 180]], { c: 'blue' }),
              T(315, 254, 'phase-flip checks across', { anchor: 'middle', size: 26, c: 'blue' }),
              H(180, 272, 280, 36, { c: 'yellow' }),
              T(320, 300, '9 qubits, any single error', { anchor: 'middle', size: 30 })
            ],
            takeaway: 'Nested codes: bit-flip inside, phase-flip across. 9 qubits.',
            widget: null,
            check: {
              q: 'In the 9-qubit code, which checks catch X errors?',
              options: [
                'Checks across the triples',
                'Bit-flip checks inside each triple',
                'There are none',
                'Only the final readout'
              ],
              answer: 1,
              why: 'X errors flip bits, which the parity checks inside a triple compare.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 ============================ */
      {
        title: 'Stabilizers, syndromes, decoders',
        intro: 'One language for every code: a list of checks, the pattern of answers they give, and a rule that turns the pattern into a fix.',
        bridge: 'You now have the whole loop: checks, syndrome, decoder, correction. Section 5 applies it to the surface code, where the loop also repeats in time.',
        tabs: [
          {
            title: 'Stabilizers',
            buildsOn: 'Z1Z2 and Z2Z3 from the bit-flip code, and X1X2 and X2X3 from the phase-flip code, are all checks of one kind.',
            leadsTo: 'Next, the pattern of answers that a set of stabilizers gives: the syndrome.',
            idea: [
              'A *stabilizer* is a check whose answer is +1 on every valid code state.',
              'Bit-flip code: Z1Z2 and Z2Z3. Phase-flip code: X1X2 and X2X3.',
              'Measuring a stabilizer reveals errors but not α and β, because all code states give the same answer.'
            ],
            sketch: [
              B(30, 40, 250, 100), T(155, 76, 'code states', { anchor: 'middle', size: 28, c: 'blue' }), T(155, 118, 'α|000⟩+β|111⟩', { anchor: 'middle', size: 28 }),
              A(290, 90, 370, 90, { c: 'green' }),
              B(380, 50, 200, 80), T(480, 88, 'Z1Z2', { anchor: 'middle', size: 32 }), T(480, 118, 'always +1', { anchor: 'middle', size: 26, c: 'green' }),
              A(480, 140, 480, 190, { c: 'red' }),
              T(480, 222, 'X1 hits:  −1', { anchor: 'middle', size: 30, c: 'red' }),
              H(30, 236, 330, 38, { c: 'yellow' }),
              T(36, 264, 'same answer for all codewords', { size: 28 }),
              T(36, 298, 'so we learn about errors,', { size: 24 }), T(36, 324, 'and nothing about α, β', { size: 24, c: 'green' })
            ],
            takeaway: 'A stabilizer says +1 on every code state. A change means an error.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Z1Z2 asks: do q1 and q2 match?', show: 'Z1Z2 |000⟩ = +1 · |000⟩' },
                { say: 'The same for the other code pattern.', show: 'Z1Z2 |111⟩ = +1 · |111⟩' },
                { say: 'So any mix of the two patterns also gives +1, and nothing collapses.', show: 'Z1Z2 (α|000⟩ + β|111⟩) = +1 · (α|000⟩ + β|111⟩)' },
                { say: 'After a bit flip on q1 the answer changes.', show: 'Z1Z2 (X1 |000⟩) = −1 · (X1 |000⟩)' }
              ]
            },
            check: {
              q: 'Why does measuring a stabilizer not disturb α and β?',
              options: [
                'It is measured very gently',
                'Every code state gives the same answer, so it cannot tell them apart',
                'It is measured on a copy',
                'It only runs when there is an error'
              ],
              answer: 1,
              why: 'A readout only separates states it gives different answers for.'
            }
          },
          {
            title: 'The syndrome',
            buildsOn: 'Stabilizers each give +1 or −1. A code has several, and we read all of them.',
            leadsTo: 'Next, the rule that maps a syndrome to a correction: the decoder.',
            idea: [
              'The list of answers from all stabilizers is the *syndrome*.',
              'It says which checks fired. It does not say which qubit broke.',
              'Different errors can give the same syndrome. Codes are built so likely errors give different ones.'
            ],
            sketch: [
              T(40, 50, 'error', { size: 28, c: 'red' }), T(220, 50, 'Z1Z2', { size: 28, c: 'blue' }), T(340, 50, 'Z2Z3', { size: 28, c: 'blue' }),
              L([[30, 62], [450, 62]]),
              T(40, 100, 'none', { size: 28 }), T(240, 100, '+', { size: 30 }), T(360, 100, '+', { size: 30 }),
              T(40, 146, 'X on q1', { size: 28 }), T(240, 146, '−', { size: 30, c: 'red' }), T(360, 146, '+', { size: 30 }),
              T(40, 192, 'X on q2', { size: 28 }), T(240, 192, '−', { size: 30, c: 'red' }), T(360, 192, '−', { size: 30, c: 'red' }),
              T(40, 238, 'X on q3', { size: 28 }), T(240, 238, '+', { size: 30 }), T(360, 238, '−', { size: 30, c: 'red' }),
              H(30, 156, 430, 44, { c: 'yellow' }),
              T(40, 296, 'every row is different, so each is fixable', { size: 26, c: 'green' })
            ],
            takeaway: 'Syndrome = the pattern of fired checks.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'No error: both checks say +1.', show: 'syndrome (+, +)' },
                { say: 'X on q1 flips only the pair (q1, q2).', show: 'syndrome (−, +)' },
                { say: 'X on q2 flips both pairs.', show: 'syndrome (−, −)' },
                { say: 'X on q3 flips only the pair (q2, q3).', show: 'syndrome (+, −)' },
                { say: 'Four cases, four different patterns. Every single flip is identified.', show: '' }
              ]
            },
            check: {
              q: 'The syndrome is (−, −). Which single X error explains it?',
              options: ['q1', 'q2', 'q3', 'None'],
              answer: 1,
              why: 'Only q2 sits in both checked pairs.'
            }
          },
          {
            title: 'The decoder',
            buildsOn: 'The syndrome tab gave a table from errors to patterns. The decoder runs that table backwards.',
            leadsTo: 'Section 5 scales the code up, and then the decoder becomes the hard part: it must keep up with the checks.',
            idea: [
              'A *decoder* maps a syndrome to a correction.',
              'For 3 qubits it is a four-row lookup. For big codes it is a real algorithm on a classical computer.',
              'It picks the most likely error that explains the syndrome, usually the one with the fewest flips.'
            ],
            sketch: [
              B(30, 50, 170, 70), T(115, 94, 'syndrome', { anchor: 'middle', size: 30, c: 'blue' }),
              A(210, 85, 280, 85),
              B(290, 40, 160, 90), T(370, 82, 'decoder', { anchor: 'middle', size: 32, c: 'red' }), T(370, 114, '(classical)', { anchor: 'middle', size: 24 }),
              A(460, 85, 530, 85),
              T(560, 94, 'fix', { anchor: 'middle', size: 30, c: 'green' }),
              H(30, 170, 580, 40, { c: 'yellow' }),
              T(36, 200, '(−,−): X on q2 (1 flip) or X on q1 and q3 (2 flips)', { size: 26 }),
              T(36, 250, 'pick the smaller: X on q2', { size: 30, c: 'green' })
            ],
            takeaway: 'Decoder: syndrome in, most likely fix out.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'The syndrome is (−, −).', show: 'candidates: X2   or   X1 and X3 together' },
                { say: 'X2 is one flip. X1 and X3 together are two flips.', show: 'X2 has 1 flip,  X1 X3 has 2 flips' },
                { say: 'One flip is more likely than two when errors are rare.', show: 'choose X2' },
                { say: 'The decoder tells the machine to apply X on q2.', show: 'correction = X2' }
              ]
            },
            check: {
              q: 'Two different errors give the same syndrome. How does the decoder choose?',
              options: [
                'At random',
                'It picks the most likely one, usually the one with fewer flips',
                'It refuses to decode',
                'It picks the one with more flips'
              ],
              answer: 1,
              why: 'When errors are rare, fewer flips is more probable.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 ============================ */
      {
        title: 'The surface code in time',
        intro: 'The surface code lays qubits on a grid so every check touches only neighbours. The checks repeat every round, and the decoder reads the stream.',
        bridge: 'You know the loop and the code. The next notebook reads the TandemQEC paper, which asks what hardware (links, buffers, decoders) keeps that loop on time.',
        tabs: [
          {
            title: 'Data qubits and checks on a grid',
            buildsOn: 'Section 4 gave stabilizers. The surface code arranges them on a grid so each one involves only neighbouring qubits.',
            leadsTo: 'Next, what happens on this grid when errors strike: which checks light up.',
            idea: [
              '*Data qubits* hold the information. *Ancilla qubits* measure the checks.',
              'Each ancilla checks the 2 or 4 data qubits next to it. Z-type checks catch X errors, X-type checks catch Z errors.',
              'Distance 3 uses 9 data and 8 ancilla qubits. Distance d uses d² data and d²−1 ancillas.'
            ],
            sketch: [
              O(110, 90, 14), O(190, 90, 14), O(270, 90, 14),
              O(110, 170, 14), O(190, 170, 14), O(270, 170, 14),
              O(110, 250, 14), O(190, 250, 14), O(270, 250, 14),
              B(124, 104, 52, 52, { c: 'blue', dash: true }), B(204, 184, 52, 52, { c: 'blue', dash: true }),
              B(204, 104, 52, 52, { c: 'red', dash: true }), B(124, 184, 52, 52, { c: 'red', dash: true }),
              T(350, 80, 'data qubit', { size: 28 }), A(345, 74, 288, 88),
              T(350, 150, 'Z-check (blue)', { size: 26, c: 'blue' }),
              T(350, 190, 'X-check (red)', { size: 26, c: 'red' }),
              H(346, 214, 250, 40, { c: 'yellow' }),
              T(350, 244, '9 data + 8 ancillas', { size: 28 })
            ],
            takeaway: 'Grid of data qubits, checks on the squares between them.',
            widget: { type: 'surface' },
            check: {
              q: 'How many data and ancilla qubits does a distance-3 surface code patch use?',
              options: ['9 and 8', '9 and 9', '3 and 8', '17 and 8'],
              answer: 0,
              why: 'd² = 9 data qubits and d² − 1 = 8 ancillas.'
            }
          },
          {
            title: 'Errors light up checks',
            buildsOn: 'The last tab laid out the grid. Here we put errors on it and watch which checks fire.',
            leadsTo: 'Next, errors that keep happening: checks are not run once but again and again, round after round.',
            idea: [
              'A single X error lights the Z-checks next to it. A single Z error lights the X-checks next to it.',
              'The decoder sees only the lit checks, and has to guess the errors from them.',
              'Some patterns light nothing. A chain of d errors across the patch is a *logical error* and flips the stored qubit.'
            ],
            sketch: [
              O(110, 100, 14), O(190, 100, 14), O(270, 100, 14),
              O(110, 180, 14, { c: 'red' }), O(190, 180, 14), O(270, 180, 14),
              T(110, 186, 'X', { anchor: 'middle', size: 22, c: 'red' }),
              D(150, 140, { c: 'blue', r: 9 }), D(150, 220, { c: 'blue', r: 9 }),
              A(330, 140, 160, 140, { c: 'blue' }),
              T(340, 130, 'lit checks', { size: 28, c: 'blue' }),
              H(30, 262, 560, 40, { c: 'pink' }),
              T(36, 292, 'a chain of 3 across the patch lights nothing', { size: 28 }),
              T(340, 180, 'one error, two lit', { size: 24, c: 'red' })
            ],
            takeaway: 'Errors light checks. A chain across the patch hides.',
            widget: { type: 'surface' },
            check: {
              q: 'Three X errors in a row from edge to edge of a distance-3 patch. What do the checks show?',
              options: [
                'Three lit checks',
                'Every check quiet, yet the stored qubit is flipped',
                'The patch resets',
                'Only one lit check'
              ],
              answer: 1,
              why: 'A chain of length d across the patch commutes with every check, so it is a logical error.'
            }
          },
          {
            title: 'Rounds and detection events',
            buildsOn: 'Errors keep arriving, so the checks are measured again and again. Each pass through all ancillas is one round.',
            leadsTo: 'Next, why we want more distance, and how fast the logical error rate drops as we add it.',
            idea: [
              'One pass over all ancillas is a *round*. Rounds repeat for the whole computation.',
              'An error shows up as a change from the previous round. A change is a *detection event*.',
              'The decoder reads a stream of detection events, one batch per round, and must keep up with it.'
            ],
            sketch: [
              T(40, 50, 'round', { size: 26 }), T(150, 50, '1', { size: 28 }), T(220, 50, '2', { size: 28 }), T(290, 50, '3', { size: 28 }), T(360, 50, '4', { size: 28 }), T(430, 50, '5', { size: 28 }),
              L([[30, 62], [470, 62]]),
              T(40, 110, 'check A', { size: 26, c: 'blue' }),
              T(150, 112, '0', { size: 30 }), T(220, 112, '0', { size: 30 }), T(290, 112, '1', { size: 30, c: 'red' }), T(360, 112, '1', { size: 30 }), T(430, 112, '1', { size: 30 }),
              O(290, 100, 20, { c: 'red' }),
              T(40, 170, 'events', { size: 26, c: 'green' }),
              T(150, 172, '0', { size: 30 }), T(220, 172, '0', { size: 30 }), T(290, 172, '1', { size: 30, c: 'red' }), T(360, 172, '0', { size: 30 }), T(430, 172, '0', { size: 30 }),
              A(290, 236, 290, 190, { c: 'red' }),
              T(290, 266, 'error hits here', { anchor: 'middle', size: 26, c: 'red' }),
              H(30, 280, 470, 36, { c: 'yellow' }),
              T(36, 308, 'event = change from the last round', { size: 28 })
            ],
            takeaway: 'Detection event = a check that changed since the last round.',
            widget: {
              type: 'steps',
              steps: [
                { say: 'Round 1. All checks quiet.', show: 'round 1   checks 0 0   events 0 0' },
                { say: 'Round 2. Still quiet.', show: 'round 2   checks 0 0   events 0 0' },
                { say: 'An X error hits a data qubit between two Z-checks. Round 3 sees both fire.', show: 'round 3   checks 1 1   events 1 1' },
                { say: 'Round 4. The checks stay lit, but nothing changed, so there are no new events.', show: 'round 4   checks 1 1   events 0 0' },
                { say: 'The decoder works from the events at round 3, finds the error, and the machine fixes it.', show: 'decode: events (round 3, A), (round 3, B)  →  X on the qubit between them' }
              ]
            },
            check: {
              q: 'A check reads 1 in round 3 and stays 1 in round 4. How many detection events does it give in round 4?',
              options: ['1', '0', '2', 'It depends on the decoder'],
              answer: 1,
              why: 'A detection event is a change from the previous round. No change, no event.'
            }
          },
          {
            title: 'Distance and the threshold',
            buildsOn: 'Rounds make errors a stream. Now the question is how much a bigger patch, with more distance, helps.',
            leadsTo: 'Next, one round on real hardware in nanoseconds, which sets the clock the decoder has to match.',
            idea: [
              'Bigger distance d means more qubits and more checks, but fewer logical errors.',
              'Below a *threshold* physical error rate, each step up in d cuts the logical rate by a constant factor. Above it, bigger is worse.',
              'For the surface code the threshold is around 1% per operation. Treat that as a rough figure.'
            ],
            sketch: [
              L([[60, 40], [60, 270], [560, 270]]),
              T(70, 34, 'logical error', { size: 24 }), T(560, 300, 'physical error', { anchor: 'end', size: 24 }),
              K([[60, 236], [185, 200], [310, 170], [435, 140], [560, 108]], { c: 'red' }), T(470, 150, 'd = 3', { size: 26, c: 'red' }),
              K([[60, 264], [185, 230], [310, 170], [435, 104], [560, 40]], { c: 'blue' }), T(430, 58, 'd = 7', { size: 26, c: 'blue' }),
              L([[310, 112], [310, 270]], { dash: true, c: 'green' }),
              T(316, 106, 'threshold', { size: 26, c: 'green' }),
              T(70, 100, 'below: bigger d wins', { size: 24, c: 'green' }),
              H(326, 206, 270, 36, { c: 'yellow' }),
              T(332, 234, 'above: bigger d loses', { size: 26 })
            ],
            takeaway: 'Below threshold, more distance means exponentially fewer errors.',
            widget: { type: 'scaling' },
            check: {
              q: 'The physical error rate is above the threshold. What does a bigger code do?',
              options: [
                'Lowers the logical error rate',
                'Makes it worse',
                'Makes no difference',
                'Removes all errors'
              ],
              answer: 1,
              why: 'Above threshold, extra qubits add more errors than the code can remove.'
            }
          },
          {
            title: 'One round on real hardware',
            buildsOn: 'Section 4 and this section described the loop. This tab puts a time on one pass of it, from the TandemQEC paper.',
            leadsTo: 'The next notebook reads the paper itself: syndromes arrive every few microseconds, and links, buffers and decoders must keep up.',
            idea: [
              'A distance-3 rotated surface round has 9 data and 8 ancilla qubits and 24 two-qubit gates (paper, Sec 3.2).',
              'In the paper, one round takes 6.084 µs. Measurement (2,684 ns) and reset (2,720 ns) are most of it.',
              'A new batch of syndrome bits appears every round, so the whole pipeline after the measurement has a few microseconds per batch.'
            ],
            sketch: [
              B(30, 60, 80, 56), B(110, 60, 90, 56), B(200, 60, 230, 56), B(430, 60, 160, 56),
              T(70, 96, 'H', { anchor: 'middle', size: 26 }), T(155, 96, 'gates', { anchor: 'middle', size: 26 }),
              T(315, 96, 'measure', { anchor: 'middle', size: 30, c: 'blue' }), T(510, 96, 'reset', { anchor: 'middle', size: 30, c: 'red' }),
              K([[30, 140], [320, 160], [590, 140]], { c: 'green' }),
              T(310, 192, 'one round: 6.084 µs', { anchor: 'middle', size: 32, c: 'green' }),
              H(30, 224, 560, 40, { c: 'yellow' }),
              T(36, 254, 'syndromes arrive every ~6 µs', { size: 30 }),
              T(36, 296, 'the decoder has to keep pace', { size: 28, c: 'red' })
            ],
            takeaway: 'One round is about 6 µs. Syndromes keep arriving on that clock.',
            widget: {
              type: 'stack', unit: 'ns',
              segments: [
                { label: 'Hadamard layers', v: 72 },
                { label: 'Entangling layers (4 × 152)', v: 608 },
                { label: 'Measurement', v: 2684 },
                { label: 'Reset', v: 2720 }
              ],
              note: 'From the paper: T_round = 2(36) + 4(36 + 80 + 36) + 2684 + 2720 = 6084 ns.'
            },
            check: {
              q: 'In the paper\'s timing, which part of the 6.084 µs round is biggest?',
              options: [
                'The two-qubit gates',
                'Measurement plus reset',
                'The Hadamard layers',
                'The decoder'
              ],
              answer: 1,
              why: 'Measurement (2,684 ns) and reset (2,720 ns) together are 5,404 ns of the 6,084 ns round.'
            }
          }
        ]
      }
    ]
  });
})();
