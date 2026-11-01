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
            "term": "Blend",
            "hover": false,
            "means": "A small error written as mostly I plus a little X, Y or Z. A tilt by δ: cos(δ/2)·I − i·sin(δ/2)·X."
          },
          {
            "term": "Pile",
            "hover": false,
            "means": "Notebook word for one part of a drifted state: the clean pile (000, 111) or the flipped pile (010, 101). Each holds the same α : β."
          },
          {
            "term": "Discretisation of errors",
            "aka": ["discretisation"],
            "means": "Measuring the checks turns any small drift into either no error or one full flip. So fixing full flips is enough."
          },
          {
            "term": "Error zone",
            "means": "Patterns the code never uses. For the bit-flip code: everything except 000 and 111."
          },
          {
            "term": "Y error",
            "means": "X and Z together (up to an overall phase)."
          },
          {
            "term": "I",
            "hover": false,
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
            "aka": ["classical repetition"],
            "means": "Classical: 0 → 000, 1 → 111. A majority vote fixes one flip."
          },
          {
            "term": "Bit-flip code",
            "aka": ["bit-flip"],
            "means": "α|000⟩ + β|111⟩. Fixes one X error. Blind to Z errors."
          },
          {
            "term": "Phase-flip code",
            "aka": ["phase-flip"],
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
            "aka": ["distance"],
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
            "term": "Z1Z2",
            "aka": ["Z2Z3"],
            "means": "Z on q1 and Z on q2: a Z-type check. +1 when q1 and q2 match (parity 0), −1 when they differ (parity 1)."
          },
          {
            "term": "X1X2",
            "aka": ["X2X3"],
            "means": "X on q1 and X on q2: an X-type check. +1 when their signs (+ or −) match, −1 when they differ."
          },
          {
            "term": "±1",
            "hover": false,
            "means": "How QEC writes check answers. +1 = match = parity 0. −1 = differ = parity 1."
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
            "aka": ["ancilla qubit"],
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
        title: 'The full picture of errors',
        intro: 'Quantum basics ended with a three-qubit code that undoes one X flip. Real noise is messier than full X flips. This section names what else can happen.',
        bridge: 'You know the two basic errors, X and Z, and that small errors are blends of them. Section 2 takes the bit-flip code from Quantum basics and tests it against these.',
        tabs: [
          {
            title: 'Noise changes (α, β)',
            buildsOn: 'Quantum basics Section 4 showed one X error swapping α and β. Real noise is broader: any unwanted change to (α, β).',
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
              '*X error* (bit flip), the one Quantum basics handled: swaps α and β, so |0⟩ ↔ |1⟩.',
              '*Z error* (phase flip) flips the sign of β. A Z readout cannot see it.',
              'Both at once is *Y*, up to a factor i. X, Y, Z and "no error" are the Pauli errors.',
              'Real noise is rarely a full flip; it drifts. These four are the building blocks a drift is made of. Next tab.'
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
            title: 'Small errors are blends',
            buildsOn: 'The last tab named X, Y and Z as full flips. Real noise is usually a small nudge. This tab writes a nudge in terms of them.',
            leadsTo: 'Section 2 asks what the bit-flip code from Quantum basics does with these errors, starting with its checks in standard notation.',
            idea: [
              'Noise rarely does a full X. More often it drifts α and β a little: it tilts the qubit by a small angle δ.',
              'A tilt about x is a blend: *cos(δ/2) × (no error) − i·sin(δ/2) × (X error)*. Most of it is "no error".',
              'For δ = 20°: cos 10° = 0.985 and sin 10° = 0.174. Squared, that is about 97% clean and 3% X.',
              'Any small error splits like this into I, X, Y, Z parts. Like a tilted coin, Section 2 makes it fall flat: clean, or fully over.'
            ],
            sketch: [
              T(40, 60, 'small tilt', { size: 30, c: 'red' }),
              A(180, 52, 250, 52),
              T(264, 60, 'cos(δ/2)·none  −  i·sin(δ/2)·X', { size: 28 }),
              B(60, 120, 220, 70, { c: 'green' }), T(170, 164, '0.985 · none', { anchor: 'middle', size: 30, c: 'green' }),
              B(360, 120, 220, 70, { c: 'red' }), T(470, 164, '0.174 · X', { anchor: 'middle', size: 30, c: 'red' }),
              T(170, 226, '97% weight', { anchor: 'middle', size: 24 }),
              T(470, 226, '3% weight', { anchor: 'middle', size: 24 }),
              H(60, 256, 520, 44, { c: 'yellow' }),
              T(320, 288, 'a nudge = mostly nothing + a little X', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'A small error is mostly "no error" plus a little X, Y or Z.',
            widget: { type: 'steps', steps: [
              { say: 'Noise tilts the qubit by δ = 20° about the x axis.', show: 'tilt(20°)' },
              { say: 'Write the tilt as a blend of "no error" and X. A turn of δ uses δ/2 in the amplitudes, so 20° gives 10°.', show: 'cos(10°) · none  −  i · sin(10°) · X' },
              { say: 'Put in the numbers.', show: '0.985 · none  −  0.174i · X' },
              { say: 'Square the sizes to get the weights.', show: '0.985² ≈ 0.97 · 0.174² ≈ 0.03' },
              { say: 'So the nudge is about 97% "nothing happened" and 3% "X happened".', show: '97% none · 3% X' },
              { say: 'Tilts about other axes blend in Y or Z the same way.', show: 'any small error = a·I + b·X + c·Y + d·Z' }
            ] },
            check: {
              q: 'A tilt of δ = 20° about x. Roughly how much of it is an X error?',
              options: ['About 3%', 'About 50%', 'About 20%', 'All of it'],
              answer: 0,
              why: 'sin(10°) ≈ 0.174, and 0.174² ≈ 0.03. The other 97% is "no error".'
            }
          }
        ]
      },

      /* ============================ SECTION 2 ============================ */
      {
        title: 'The bit-flip code under real errors',
        intro: 'Quantum basics built the three-qubit bit-flip code and fixed one full X flip with it. Here: standard notation, small drifts, two flips, and its blind spot.',
        bridge: 'The bit-flip code fixes one X error and is blind to Z errors. Section 3 builds the mirror-image code for Z errors and joins the two.',
        tabs: [
          {
            title: 'Naming checks: Z1Z2 and ±1',
            buildsOn: 'Quantum basics found flips with two parity checks answering 0 or 1. QEC papers write the same checks as Z1Z2 and Z2Z3, answering +1 or −1.',
            leadsTo: 'Next, errors that are not full flips: what a small drift on one qubit does to the code state.',
            idea: [
              'Z leaves |0⟩ alone and turns |1⟩ into −|1⟩. So Z marks 0 with a + sign and 1 with a − sign.',
              '*Z1Z2* means Z on q1 and Z on q2. On a pattern the two signs multiply: 00 gives +, 11 gives (−)(−) = +, 01 and 10 give −.',
              'So Z1Z2 = +1 means q1 and q2 match (parity 0). Z1Z2 = −1 means they differ (parity 1). Same check, new name.',
              'The syndrome table becomes: (+1, +1) no flip, (−1, +1) q1, (−1, −1) q2, (+1, −1) q3.'
            ],
            sketch: [
              T(70, 50, 'q1 q2', { anchor: 'middle', size: 26 }), T(250, 50, 'signs', { anchor: 'middle', size: 26 }), T(430, 50, 'Z1Z2', { anchor: 'middle', size: 26 }),
              L([[20, 64], [500, 64]]),
              T(70, 104, '0 0', { anchor: 'middle', size: 28 }), T(250, 104, '(+)(+)', { anchor: 'middle', size: 26 }), T(430, 104, '+1  match', { anchor: 'middle', size: 26, c: 'green' }),
              T(70, 148, '1 1', { anchor: 'middle', size: 28 }), T(250, 148, '(−)(−)', { anchor: 'middle', size: 26 }), T(430, 148, '+1  match', { anchor: 'middle', size: 26, c: 'green' }),
              T(70, 192, '0 1', { anchor: 'middle', size: 28 }), T(250, 192, '(+)(−)', { anchor: 'middle', size: 26 }), T(430, 192, '−1  differ', { anchor: 'middle', size: 26, c: 'red' }),
              T(70, 236, '1 0', { anchor: 'middle', size: 28 }), T(250, 236, '(−)(+)', { anchor: 'middle', size: 26 }), T(430, 236, '−1  differ', { anchor: 'middle', size: 26, c: 'red' }),
              H(40, 260, 560, 44, { c: 'yellow' }),
              T(320, 292, 'parity 0 = +1,  parity 1 = −1', { anchor: 'middle', size: 28 })
            ],
            takeaway: 'Z1Z2 = +1: q1, q2 match. Z1Z2 = −1: they differ.',
            widget: { type: 'steps', steps: [
              { say: 'Z on one qubit: 0 keeps its sign, 1 picks up a minus.', show: 'Z|0⟩ = +|0⟩ · Z|1⟩ = −|1⟩' },
              { say: 'Z1Z2 applies Z to q1 and to q2. Try the pattern 10.', show: 'Z1Z2 |10⟩ = (−)(+) |10⟩ = −|10⟩' },
              { say: 'Try 11. Two minus signs cancel.', show: 'Z1Z2 |11⟩ = (−)(−) |11⟩ = +|11⟩' },
              { say: 'The sign is the answer of the check.', show: '+1 = match = parity 0 · −1 = differ = parity 1' },
              { say: 'On the code state both patterns give +1, so the whole state gives +1.', show: 'Z1Z2 (α|000⟩ + β|111⟩) = +1 · (α|000⟩ + β|111⟩)' }
            ] },
            check: {
              q: 'What does the check Z2Z3 give on the pattern |010⟩?',
              options: ['−1, q2 and q3 differ', '+1, they match', '0', '−1, q1 and q2 differ'],
              answer: 0,
              why: 'q2 = 1 gives −, q3 = 0 gives +. The product is −1: q2 and q3 differ.'
            }
          },
          {
            title: 'A tilt on q2 splits each pattern',
            buildsOn: 'Section 1 wrote a small tilt as mostly "no error" plus a little X. The naming tab gave the checks their ±1 answers. Now tilt one qubit of a real code state.',
            leadsTo: 'Next, the four new amplitudes sorted into two piles, and what survives in each.',
            idea: [
              'Noise gives q2 a small unwanted turn of 20°. A full 180° turn would be an X flip, so this is a small piece of an X.',
              'The turn acts on each pattern of the code on its own. Most of each pattern stays put. A little moves to the pattern with bit 2 flipped.',
              'So 000 keeps most of itself and leaks a little into 010. 111 keeps most of itself and leaks a little into 101.',
              'Every amplitude is scaled the same way: ×0.985 where it stays, ×0.174 where it leaks. Squared, that is 97% stays, 3% leaks.'
            ],
            sketch: [
              T(320, 36, 'tilt on q2: each pattern splits', { anchor: 'middle', size: 24, c: 'red' }),
              B(40, 66, 150, 64), T(115, 108, 'α · 000', { anchor: 'middle', size: 28 }),
              A(196, 86, 296, 78, { c: 'green' }), T(306, 86, '0.985 · α · 000', { size: 24, c: 'green' }),
              A(196, 112, 296, 122, { c: 'red' }), T(306, 130, '−0.174i · α · 010', { size: 24, c: 'red' }),
              B(40, 166, 150, 64), T(115, 208, 'β · 111', { anchor: 'middle', size: 28 }),
              A(196, 186, 296, 178, { c: 'green' }), T(306, 186, '0.985 · β · 111', { size: 24, c: 'green' }),
              A(196, 212, 296, 222, { c: 'red' }), T(306, 230, '−0.174i · β · 101', { size: 24, c: 'red' }),
              H(40, 262, 560, 44, { c: 'yellow' }),
              T(320, 294, 'only bit 2 can change: 000 → 010, 111 → 101', { anchor: 'middle', size: 22 })
            ],
            takeaway: 'Each pattern splits: 0.985 stays, 0.174 moves to bit 2 flipped.',
            widget: { type: 'steps', steps: [
              { say: 'Start: two patterns hold all the weight.', show: '000: 0.6 · 111: 0.8 · the other six: 0' },
              { say: 'The 20° tilt uses half the angle in its amplitudes, as in Section 1.', show: 'cos 10° = 0.985 · sin 10° = 0.174' },
              { say: 'The tilt on one qubit: each value keeps 0.985 of itself and sends −0.174i to the other value.', show: '|0⟩ → 0.985|0⟩ − 0.174i|1⟩ · |1⟩ → 0.985|1⟩ − 0.174i|0⟩' },
              { say: 'Pattern 000: bit 2 is 0. Apply the rule to bit 2 only. Bits 1 and 3 ride along unchanged.', show: '|000⟩ → 0.985|000⟩ − 0.174i|010⟩' },
              { say: 'Pattern 111: bit 2 is 1. The same rule, the same two numbers.', show: '|111⟩ → 0.985|111⟩ − 0.174i|101⟩' },
              { say: 'Now bring α = 0.6 in. It multiplies both halves of the 000 split.', show: '000: 0.6 × 0.985 = 0.591 · 010: 0.6 × (−0.174i) = −0.104i' },
              { say: 'And β = 0.8 multiplies both halves of the 111 split.', show: '111: 0.8 × 0.985 = 0.788 · 101: 0.8 × (−0.174i) = −0.139i' },
              { say: 'Four patterns now hold weight, where there were two.', show: '000: 0.591 · 111: 0.788 · 010: −0.104i · 101: −0.139i' },
              { say: 'Nothing lands on 001, 011, 100 or 110. Reaching them would need bit 1 or bit 3 to change.', show: 'a tilt on q2 only reaches the bit-2 flip of each pattern' }
            ] },
            math: [
              { h: 'The turn as a formula', eq: ['turn(δ) = cos(δ/2) · nothing  −  i · sin(δ/2) · X'], why: 'δ = 0 gives nothing. δ = 180° gives a full X. The i keeps all the chances adding up to 1.' },
              { h: 'Why 20° becomes 10°', eq: ['cos 10° = 0.985', 'sin 10° = 0.174'], why: '|0⟩ and |1⟩ are 180° apart on the sphere, but only 90° apart as amplitudes. Sphere angles are doubled.' },
              { h: 'On one qubit', eq: ['|0⟩  →  0.985|0⟩ − 0.174i|1⟩', '|1⟩  →  0.985|1⟩ − 0.174i|0⟩'], why: 'X just swaps 0 and 1, so both get the same two numbers. This is why α and β will leak alike.' },
              { h: 'On each pattern, bit 2 only', eq: ['|000⟩  →  0.985|000⟩ − 0.174i|010⟩', '|111⟩  →  0.985|111⟩ − 0.174i|101⟩'], why: 'Bits 1 and 3 ride along. These are rules for each pattern: fractions, not amounts yet.' },
              { h: 'Weight each rule by its amplitude', eq: ['0.6 × (0.985|000⟩ − 0.174i|010⟩)', '+ 0.8 × (0.985|111⟩ − 0.174i|101⟩)'], why: 'A gate on a sum acts on each term, and the number in front comes along. Like a 1.5% tax: on ₹600 you keep 0.985 × 600.' },
              { h: 'Result', eq: ['000: 0.591      010: −0.104i', '111: 0.788      101: −0.139i'], why: 'Chance = size squared: 34.9% + 62.1% + 1.1% + 1.9% = 100%. The −i turns a number but does not change its size.' }
            ],
            check: {
              q: 'The tilt hits q2 only. Which pattern can the 111 part leak into?',
              options: ['Only 101', '000', '101 and 110', 'All seven others'],
              answer: 0,
              why: 'A gate on q2 can only change bit 2. Flipping bit 2 of 111 gives 101. Reaching 000 would need all three bits to flip.'
            }
          },
          {
            title: 'Two piles, the same α and β',
            buildsOn: 'The last tab left four amplitudes: 0.591 and 0.788 on the codewords, −0.104i and −0.139i on 010 and 101.',
            leadsTo: 'Next, the step before any measurement: the CNOTs tag the clean pile and the flipped pile on the ancilla.',
            idea: [
              'Sort the four patterns into two piles. *Clean pile*: 000 and 111. *Flipped pile*: 010 and 101, in the error zone.',
              'Both piles hold the same 0.6 : 0.8. Only their sizes differ: the clean pile has 97% of the weight, the flipped pile 3%.',
              'Why: the turn treated 000 and 111 alike, so α and β shrank by the same factor. Like a flat tax on two accounts: the ratio stays.',
              'So the state did change, but what we stored, the ratio α : β, did not. The 3% is still there and must be cleaned up.'
            ],
            sketch: [
              T(320, 36, 'q2 tilted by 20°', { anchor: 'middle', size: 26, c: 'red' }),
              A(250, 50, 170, 88), A(390, 50, 470, 88, { c: 'red' }),
              B(50, 94, 240, 110, { c: 'green' }), T(170, 132, 'clean pile', { anchor: 'middle', size: 24, c: 'green' }),
              T(170, 166, '0.985 ×', { anchor: 'middle', size: 26 }), T(170, 194, '(0.6, 0.8)', { anchor: 'middle', size: 26, c: 'blue' }),
              B(350, 94, 240, 110, { c: 'red', dash: true }), T(470, 132, 'flipped pile', { anchor: 'middle', size: 24, c: 'red' }),
              T(470, 166, '−0.174i ×', { anchor: 'middle', size: 26 }), T(470, 194, '(0.6, 0.8)', { anchor: 'middle', size: 26, c: 'blue' }),
              H(80, 236, 480, 44, { c: 'yellow' }),
              T(320, 268, 'same 0.6 : 0.8 in both piles', { anchor: 'middle', size: 28 }),
              T(320, 312, 'pile weights: 97% and 3%', { anchor: 'middle', size: 22, c: 'green' })
            ],
            takeaway: 'The drift moves 3% of weight into the error zone. The ratio α : β is kept.',
            widget: { type: 'steps', steps: [
              { say: 'Sort the four amplitudes into the two piles.', show: 'clean: 000 0.591, 111 0.788 · flipped: 010 −0.104i, 101 −0.139i' },
              { say: 'Clean pile: both numbers share the factor 0.985.', show: '0.591 = 0.985 × 0.6 · 0.788 = 0.985 × 0.8' },
              { say: 'Flipped pile: both numbers share the factor −0.174i.', show: '−0.104i = −0.174i × 0.6 · −0.139i = −0.174i × 0.8' },
              { say: 'Check the ratio directly. All three give the same number.', show: '0.591 ÷ 0.788 = 0.75 · 0.104 ÷ 0.139 = 0.75 · 0.6 ÷ 0.8 = 0.75' },
              { say: 'Chance of a pattern = size squared. The −i only turns the number, so it drops out of the size.', show: '000: 34.9% · 111: 62.1% · 010: 1.1% · 101: 1.9%' },
              { say: 'Add up each pile. Together they are still 100%.', show: 'clean: 34.9 + 62.1 = 97% · flipped: 1.1 + 1.9 = 3%' },
              { say: 'The pile weights are just the two factors, squared.', show: '0.985² = 0.970 · 0.174² = 0.030' },
              { say: 'Compare one bare qubit with no code. There the same tilt mixes α and β into each other.', show: 'α → 0.985×0.6 − 0.174i×0.8 · β → 0.985×0.8 − 0.174i×0.6' },
              { say: 'Its odds move from 36 : 64 to 37 : 63, and nothing tells you what to undo. The code kept the ratio instead.', show: 'no code: α, β damaged · code: ratio kept, 3% leaked' },
              { say: 'The 3% is not removed yet. The next two tabs show how it goes away.', show: 'changed, but repairable' }
            ] },
            math: [
              { h: 'Pull out the common factor', eq: ['clean:    0.591,   0.788   =  0.985 × (0.6, 0.8)', 'flipped: −0.104i, −0.139i  = −0.174i × (0.6, 0.8)'], why: 'Each pile is a scaled copy of the stored pair.' },
              { h: 'Check the ratio', eq: ['0.591 ÷ 0.788 = 0.75', '0.104 ÷ 0.139 = 0.75', '0.6   ÷ 0.8   = 0.75'] },
              { h: 'Pile weights', eq: ['clean:   0.985² = 0.970  →  97%', 'flipped: 0.174² = 0.030  →   3%'], why: 'The two weights add up to 100%.' },
              { h: 'Without the code', eq: ['α  →  0.985 × 0.6 − 0.174i × 0.8', 'β  →  0.985 × 0.8 − 0.174i × 0.6'], why: 'On a bare qubit the turn mixes α into β. The odds go from 36 : 64 to 37 : 63, and nothing says what to undo.' }
            ],
            check: {
              q: 'After the 20° tilt on q2, what is the ratio of the 010 and 101 amplitudes?',
              options: ['0.6 : 0.8, the same as α : β', '0.985 : 0.174', '0.8 : 0.6', '1 : 1'],
              answer: 0,
              why: '010 has 0.6 × (−0.174i) and 101 has 0.8 × (−0.174i). The common factor drops out, leaving 0.6 : 0.8.'
            }
          },
          {
            title: 'The ancilla tags the two piles',
            buildsOn: 'The piles tab left two piles: clean, and q2 flipped. Before anything is read, the check circuit runs its CNOTs into the ancilla.',
            leadsTo: 'Next, the moment that matters: reading the ancilla, and what nature does with the two piles.',
            idea: [
              'Take the check on q1 and q2. Its ancilla starts at |0⟩ and is flipped once for each 1 among q1, q2. It ends at their parity.',
              'Clean pile: q1 and q2 match, so its ancilla is 0. Flipped pile: they differ, so its ancilla is 1.',
              'Now the clean pile sits with ancilla 0 and the flipped pile with ancilla 1. Each pile carries a tag.',
              'The CNOTs correct nothing. Both piles are still there. They are only labelled.'
            ],
            sketch: [
              B(50, 50, 240, 90, { c: 'green' }), T(170, 90, 'clean pile', { anchor: 'middle', size: 26, c: 'green' }),
              T(170, 124, 'q1 = q2', { anchor: 'middle', size: 22 }),
              B(350, 50, 240, 90, { c: 'red', dash: true }), T(470, 90, 'flipped pile', { anchor: 'middle', size: 26, c: 'red' }),
              T(470, 124, 'q1 ≠ q2', { anchor: 'middle', size: 22 }),
              L([[170, 140], [170, 180]], { c: 'green' }), L([[470, 140], [470, 180]], { c: 'red' }),
              O(170, 210, 30, { c: 'green' }), T(170, 218, 'a = 0', { anchor: 'middle', size: 22, c: 'green' }),
              O(470, 210, 30, { c: 'red' }), T(470, 218, 'a = 1', { anchor: 'middle', size: 22, c: 'red' }),
              H(110, 262, 420, 44, { c: 'yellow' }),
              T(320, 294, 'CNOTs: tag, not fix', { anchor: 'middle', size: 28 })
            ],
            takeaway: 'The CNOTs tag the piles. They do not fix anything.',
            widget: { type: 'steps', steps: [
              { say: 'Before the CNOTs: two piles, and the ancilla is 0 for both.', show: '0.985 × (clean)|0⟩  −  0.174i × (flipped)|0⟩' },
              { say: 'Clean pile: q1 q2 is 00 or 11, so the ancilla flips 0 or 2 times.', show: 'clean → ancilla 0' },
              { say: 'Flipped pile: q1 q2 is 01 or 10, so the ancilla flips once.', show: 'flipped → ancilla 1' },
              { say: 'After the CNOTs:', show: '0.985 × (clean)|0⟩  −  0.174i × (flipped)|1⟩' },
              { say: 'The drift is still fully there. It is now labelled by the ancilla.', show: 'tagged, not fixed' }
            ] },
            math: [
              { h: 'Start: the state after the tilt', eq: ['0.591|000⟩ + 0.788|111⟩', '− 0.104i|010⟩ − 0.139i|101⟩'], why: 'Four patterns, from the last two tabs.' },
              { h: 'Group the patterns into two piles', eq: ['(0.591|000⟩ + 0.788|111⟩)', '+ (−0.104i|010⟩ − 0.139i|101⟩)'], why: '000 and 111 are the codewords: the clean pile. 010 and 101 have bit 2 flipped: the flipped pile.' },
              { h: 'Pull out each pile’s common factor', eq: ['0.591  = 0.985 × 0.6      0.788  = 0.985 × 0.8', '−0.104i = −0.174i × 0.6   −0.139i = −0.174i × 0.8'], why: 'Each pile is the stored pair 0.6, 0.8 times one number.' },
              { h: 'Give the piles short names', eq: ['clean   = 0.6|000⟩ + 0.8|111⟩', 'flipped = 0.6|010⟩ + 0.8|101⟩', 'state   = 0.985 (clean) − 0.174i (flipped)'], why: 'Nothing physical happened. The same state is only regrouped, like writing 6 + 8 as 2 × (3 + 4).' },
              { h: 'Add the ancilla at |0⟩', eq: ['every pattern gains a 0:   |000⟩ → |000,0⟩', '0.985 (clean)|0⟩ − 0.174i (flipped)|0⟩'], why: 'The ancilla is |0⟩ with amplitude 1. Joining qubits multiplies amplitudes, so every number stays.' },
              { h: 'Run the CNOTs q1 → a and q2 → a', eq: ['000:  q1 q2 = 0 0  →  0 flips  →  a = 0', '111:  q1 q2 = 1 1  →  2 flips  →  a = 0', '010:  q1 q2 = 0 1  →  1 flip   →  a = 1', '101:  q1 q2 = 1 0  →  1 flip   →  a = 1'], why: 'Each CNOT flips a when its control is 1. Two flips undo each other.' },
              { h: 'After the CNOTs', eq: ['0.985 (clean)|0⟩ − 0.174i (flipped)|1⟩'], why: 'The amplitudes never changed. Only the tag bit did.' }
            ],
            check: {
              q: 'Right after the CNOTs, before the ancilla is read, is the drift gone?',
              options: ['No, both piles are still there, now tagged', 'Yes, the CNOTs removed it', 'Yes, but only on q2', 'No, and the CNOTs made it bigger'],
              answer: 0,
              why: 'The CNOTs only pair each pile with an ancilla value. Nothing is removed until the ancilla is read.'
            }
          },
          {
            title: 'Reading the ancilla: nature snaps it',
            buildsOn: 'The tagging tab paired the clean pile with ancilla 0 and the flipped pile with ancilla 1. Now the ancilla is read.',
            leadsTo: 'Next, what we actually do after each answer, and what a "no" can and cannot promise.',
            idea: [
              'Reading the ancilla gives 0 or 1. Nobody picks: nature does, with the pile sizes as odds. 0.985² ≈ 97% for 0, 0.174² ≈ 3% for 1.',
              'Like a die: told "it is even", 1, 3 and 5 are out, and 2, 4, 6 grow from 1/6 to 1/3 each. Same ratio, scaled up.',
              'Read 0: the flipped pile is gone. The clean pile is scaled back up to 100%, and its numbers are exactly 0.6 and 0.8 again.',
              'Read 1: only the flipped pile is left, exactly α|010⟩ + β|101⟩. Below, step through it and spin the wheel a few times.'
            ],
            sketch: [
              T(320, 34, 'nature spins', { anchor: 'middle', size: 24 }),
              O(320, 120, 70),
              L([[320, 120], [320, 50]]), L([[320, 120], [362, 64]], { c: 'red' }),
              A(320, 120, 268, 162),
              T(190, 104, '0: 97%', { anchor: 'middle', size: 26, c: 'green' }),
              T(462, 74, '1: 3%', { anchor: 'middle', size: 26, c: 'red' }),
              A(270, 192, 172, 236, { c: 'green' }), A(370, 192, 468, 236, { c: 'red' }),
              B(40, 242, 260, 60, { c: 'green' }), T(170, 280, 'clean pile kept: exact', { anchor: 'middle', size: 22, c: 'green' }),
              B(340, 242, 260, 60, { c: 'red' }), T(470, 280, 'full flip kept: one X', { anchor: 'middle', size: 22, c: 'red' })
            ],
            takeaway: 'Reading the ancilla makes nature keep one pile. No drift is left.',
            widget: { type: 'snap', a: 0.6, b: 0.8, drift: 20 },
            math: [
              { h: 'The odds', eq: ['P(0) = 0.591² + 0.788² = 0.970', 'P(1) = 0.104² + 0.139² = 0.030'], why: 'Add up the chances of the patterns that carry each tag.' },
              { h: 'Read 0: keep the clean pile', eq: ['0.591|000⟩ + 0.788|111⟩', 'its size: √0.970 = 0.985'] },
              { h: 'Scale it back up', eq: ['0.591 ÷ 0.985 = 0.6', '0.788 ÷ 0.985 = 0.8'], why: 'Rescaling makes the chances add up to 1 again. The ratio never changes.' },
              { h: 'Read 1: keep the flipped pile', eq: ['−0.104i|010⟩ − 0.139i|101⟩', '÷ 0.174  →  −i (0.6|010⟩ + 0.8|101⟩)'], why: 'The −i now sits on every term, so it changes nothing you can measure. Drop it.' }
            ],
            check: {
              q: 'The ancilla reads 0. What is the data now?',
              options: ['Exactly α|000⟩ + β|111⟩', 'Still slightly drifted', 'α|010⟩ + β|101⟩', 'Unknown until the data is read'],
              answer: 0,
              why: 'Reading 0 removes the flipped pile. The clean pile is scaled back to 100%, which gives exactly 0.6 and 0.8 again.'
            }
          },
          {
            title: 'What we do: nothing, or one X',
            buildsOn: 'The snap tab showed nature keeping one pile when the ancilla is read. Now the part that is up to us.',
            leadsTo: 'Next, how many full flips this code can survive. That limit is called the distance.',
            idea: [
              'Ancilla 0: we do *nothing*. The measurement already removed the drift. No gate is applied.',
              'Ancilla 1: q1 and q2 differ. The second check says q2 and q3 differ too, so q2 is the odd one out. Apply one X to q2.',
              'So fixing full flips is enough for every small drift. This is the *discretisation of errors*.',
              'A "no" means no flip that this check can see. It cannot rule out a Z error or two flips. Both come next.'
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
            takeaway: 'Read 0: do nothing. Read 1: one X. Drift never survives a check.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['RX2', 'X2'], syndrome: true, codeSpace: true, reset: true },
            math: [
              { h: 'Both checks together', eq: ['a1 = q1 ⊕ q2      a2 = q2 ⊕ q3', '010 or 101  →  a1 = 1, a2 = 1'], why: 'q2 disagrees with both neighbours, so both checks fire. Only q2 gives that pair.' },
              { h: 'The syndrome table', eq: ['00 → nothing      10 → X on q1', '11 → X on q2      01 → X on q3'], why: 'Each single flip gives its own pair of answers.' },
              { h: 'Apply X on q2', eq: ['0.6|010⟩ + 0.8|101⟩', '→  0.6|000⟩ + 0.8|111⟩'], why: 'X flips bit 2 in every pattern: 010 → 000 and 101 → 111. α and β come back exact.' },
              { h: 'Why full flips are enough', eq: ['20° drift  →  read  →  none (97%) or one X (3%)'], why: 'Reading turned a drift into one of two cases, and both are fixed exactly. That is the *discretisation of errors*.' }
            ],
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
            title: 'Distance: how many flips it fixes',
            buildsOn: 'The snap tabs reduced any small drift to none or one full flip. Here we ask what happens with two flips.',
            leadsTo: 'Next, a different failure: errors of a different type that these checks cannot see at all.',
            idea: [
              '*Distance d* is the smallest number of flips that turns one code state into another.',
              'Here d = 3: flipping all three qubits turns 000 into 111.',
              'A code of distance d fixes up to (d−1)/2 flips. For d = 3 that is one.',
              'Two flips at once is rare: if each qubit fails with chance p, it is about 3p². With p = 1%, about 0.03%.'
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
            math: [
              { h: 'Distance 3', eq: ['000  →  100  →  110  →  111'], why: 'Three flips turn one codeword into the other. No smaller number does.' },
              { h: 'Two flips fool the vote', eq: ['flip q1 and q2:   000  →  110', 'syndrome 01  →  blames q3', 'X on q3:   110  →  111'], why: 'The fix completes the wrong codeword. α and β end up swapped, and no check notices.' },
              { h: 'How rare that is', eq: ['pairs: q1q2, q1q3, q2q3  →  3 × p × p', 'p = 1%:  3 × 0.0001 = 0.03%'], why: 'One flip has a chance of about 3p = 3%, and the code fixes it. Only the rare two-flip case gets through.' }
            ],
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
              'The sign of β changed, so the stored qubit is damaged and nobody noticed.',
              'A small phase drift is a little Z, so it slips past too. Section 3 builds the checks that catch it.'
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
            math: [
              { h: 'Z on q1, pattern by pattern', eq: ['000: bit 1 = 0  →  +|000⟩', '111: bit 1 = 1  →  −|111⟩'], why: 'Z puts a minus sign on the patterns where its bit is 1.' },
              { h: 'The checks see nothing', eq: ['000 and 111 keep every bit', 'a1 = 0, a2 = 0  →  "fine"'], why: 'No bit changed, only a sign. Parity checks only look at bits.' },
              { h: 'A small z-turn', eq: ['000:  0.6 × (0.985 − 0.174i)', '111:  0.8 × (0.985 + 0.174i)'], why: 'No new patterns, so no leak and no tag. α and β are turned opposite ways, which damages them directly.' }
            ],
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
        intro: 'The bit-flip code is blind to Z. Its mirror image, built in the + and − view, catches Z but is blind to X. Nesting the two catches every single-qubit error.',
        bridge: 'You can protect against both X and Z with 9 qubits. Section 4 gives the general language that scales this up: stabilizers, syndromes and decoders.',
        tabs: [
          {
            title: 'The phase-flip code',
            buildsOn: 'Section 2 ended with Z errors escaping. Quantum basics showed that H swaps the 0/1 view and the +/− view, and that Z swaps + and −.',
            leadsTo: 'Next, the checks for this code. They are parity checks done after H.',
            idea: [
              'Z swaps + and −, the way X swaps 0 and 1. So repeat the qubit in the + and − view: *α|+++⟩ + β|−−−⟩*.',
              'Build it: make α|000⟩ + β|111⟩ with two CNOTs, then apply H to every qubit. H turns each 0 into + and each 1 into −.',
              'A Z error turns one |+⟩ into |−⟩. In this view it is a plain flip, which repetition can catch.',
              'It is the bit-flip code seen through H. Apply H to all three and you are back to α|000⟩ + β|111⟩.'
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
            takeaway: 'The phase-flip code is the bit-flip code seen through H.',
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
            buildsOn: 'The phase-flip code lives in the + and − view. Its checks must move there too: Z-type parity becomes X-type parity.',
            leadsTo: 'Next, the catch: the phase-flip code is blind to X errors, just as the bit-flip code is blind to Z.',
            idea: [
              'An X-type check asks: do q1 and q2 have matching signs (+ or −)? It is written X1X2. +1 means match, −1 means differ.',
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
            title: 'Each code is blind to the other error',
            buildsOn: 'The X-type checks tab caught Z errors on the phase-flip code. Section 2 showed the bit-flip code misses Z. The mirror problem is next.',
            leadsTo: 'Next, the fix: nest one code inside the other, so both kinds of check run at once.',
            idea: [
              'X leaves |+⟩ alone and turns |−⟩ into −|−⟩. So X on one qubit turns α|+++⟩ + β|−−−⟩ into α|+++⟩ − β|−−−⟩.',
              'Every sign comparison still matches, so every X-type check says +1. Yet the sign of β flipped.',
              'Bit-flip code: catches X, misses Z. Phase-flip code: catches Z, misses X. Hardware makes both.'
            ],
            sketch: [
              T(160, 44, 'bit-flip code', { anchor: 'middle', size: 26, c: 'blue' }),
              T(480, 44, 'phase-flip code', { anchor: 'middle', size: 26, c: 'blue' }),
              L([[320, 26], [320, 220]], { dash: true }),
              B(70, 70, 180, 56, { c: 'green' }), T(160, 106, 'X: caught', { anchor: 'middle', size: 26, c: 'green' }),
              B(70, 146, 180, 56, { c: 'red' }), T(160, 182, 'Z: missed', { anchor: 'middle', size: 26, c: 'red' }),
              B(390, 70, 180, 56, { c: 'green' }), T(480, 106, 'Z: caught', { anchor: 'middle', size: 26, c: 'green' }),
              B(390, 146, 180, 56, { c: 'red' }), T(480, 182, 'X: missed', { anchor: 'middle', size: 26, c: 'red' }),
              H(60, 246, 520, 44, { c: 'yellow' }),
              T(320, 278, 'we need both kinds of check at once', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'One code each is not enough. We need both checks at once.',
            widget: { type: 'multi', n: 3, presets: ['plog'], start: 'plog', slider: 'plog', ops: ['X1', 'Z1'], xparity: [[1, 2], [2, 3]], syndrome: 'x', codeSpace: 'x', reset: true },
            check: {
              q: 'An X error hits one qubit of α|+++⟩ + β|−−−⟩. What do the X-type checks show?',
              options: ['+1, +1: nothing seen', '−1 on one check', '−1 on both checks', 'The state collapses'],
              answer: 0,
              why: 'X only changes the sign in front of |−−−⟩. Every pair of signs still matches, so both checks say +1.'
            }
          },
          {
            title: 'Building the Shor code',
            buildsOn: 'The blind-spots tab showed each three-qubit code misses one error. The fix is to put one code inside the other.',
            leadsTo: 'Next, the checks of this 9-qubit code, and which errors each family catches.',
            idea: [
              'Start from the phase-flip code, α|+++⟩ + β|−−−⟩. It guards against Z, but each of its three qubits can still suffer X.',
              'So protect each of those three qubits with its own bit-flip triple: |+⟩ becomes (|000⟩ + |111⟩)/√2, |−⟩ becomes (|000⟩ − |111⟩)/√2.',
              'Three triples of three: *9 physical qubits* for one logical qubit.'
            ],
            sketch: [
              T(320, 44, 'α|+++⟩ + β|−−−⟩', { anchor: 'middle', size: 30 }),
              A(220, 64, 115, 110), A(320, 64, 320, 110), A(420, 64, 525, 110),
              B(30, 116, 170, 70), B(235, 116, 170, 70), B(440, 116, 170, 70),
              T(115, 160, '000 ± 111', { anchor: 'middle', size: 26 }),
              T(320, 160, '000 ± 111', { anchor: 'middle', size: 26 }),
              T(525, 160, '000 ± 111', { anchor: 'middle', size: 26 }),
              T(320, 218, 'each + or − becomes a bit-flip triple', { anchor: 'middle', size: 24, c: 'blue' }),
              H(180, 248, 280, 44, { c: 'yellow' }),
              T(320, 280, '3 × 3 = 9 qubits', { anchor: 'middle', size: 30 })
            ],
            takeaway: 'Shor code: a phase-flip code whose qubits are bit-flip triples.',
            widget: { type: 'steps', steps: [
              { say: 'Outer layer: the phase-flip code on three qubits.', show: 'α|+++⟩ + β|−−−⟩' },
              { say: 'Each |+⟩ is (|0⟩ + |1⟩)/√2. Protect its 0 and 1 by repetition.', show: '|+⟩  →  (|000⟩ + |111⟩)/√2' },
              { say: 'Same for |−⟩, keeping its minus sign.', show: '|−⟩  →  (|000⟩ − |111⟩)/√2' },
              { say: 'Put three of these side by side.', show: 'α (000+111)(000+111)(000+111) + β (000−111)(000−111)(000−111)' },
              { say: 'Count the qubits.', show: '3 blocks × 3 qubits = 9 physical qubits, 1 logical qubit' }
            ] },
            check: {
              q: 'In the Shor code, what replaces each |+⟩ of the phase-flip code?',
              options: ['(|000⟩ + |111⟩)/√2', '|+++⟩', '|000⟩', '(|000⟩ − |111⟩)/√2'],
              answer: 0,
              why: '|+⟩ is an equal mix of 0 and 1. Repeating each gives (|000⟩ + |111⟩)/√2. The minus version replaces |−⟩.'
            }
          },
          {
            title: 'The Shor code catches every single error',
            buildsOn: 'The building tab nested the bit-flip code inside the phase-flip code. Now we list its checks and what each one catches.',
            leadsTo: 'Section 4 steps back from this one code and names the pieces every code shares.',
            idea: [
              'Inside each triple: the Z-type checks of Section 2, two per triple. Six in all. They catch X errors.',
              'Across triples: compare the sign of triple 1 with triple 2, and 2 with 3. Each such X-type check touches 6 qubits. They catch Z errors.',
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
            buildsOn: 'Section 2 wrote checks as Z1Z2 = ±1. Those, the X-type checks of Section 3, and the Shor checks are all checks of one kind.',
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
              'It says which checks fired. Which qubit broke has to be worked out from it.',
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
            title: 'Why a grid',
            buildsOn: 'Section 4 gave the loop for any code. The Shor code needs checks across 6 qubits at once, spread over the chip.',
            leadsTo: 'Next, the surface code itself: data qubits on a grid with a check on every square between them.',
            idea: [
              'On a chip, a qubit can only do gates with the qubits right next to it.',
              'A check on far-apart qubits needs long chains of gates, and every gate can add errors.',
              'The surface code uses only checks on 2 or 4 neighbours. A bigger code is just a bigger grid with the same small checks.'
            ],
            sketch: [
              T(150, 40, 'far-apart check', { anchor: 'middle', size: 24, c: 'red' }),
              O(60, 110, 12), O(150, 110, 12), O(240, 110, 12),
              K([[60, 124], [150, 170], [240, 124]], { c: 'red', dash: true }),
              T(150, 210, 'long gate chains', { anchor: 'middle', size: 22, c: 'red' }),
              L([[320, 26], [320, 230]], { dash: true }),
              T(480, 40, 'grid check', { anchor: 'middle', size: 24, c: 'green' }),
              B(430, 80, 100, 100, { c: 'green' }),
              D(430, 80), D(530, 80), D(430, 180), D(530, 180),
              T(480, 210, '4 neighbours', { anchor: 'middle', size: 22, c: 'green' }),
              H(60, 252, 520, 44, { c: 'yellow' }),
              T(320, 284, 'only neighbours, however big the code', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'The surface code uses only checks between neighbours.',
            widget: { type: 'steps', steps: [
              { say: 'Bit-flip code: each check touches 2 qubits.', show: 'Z1Z2 · Z2Z3' },
              { say: 'Shor code: the checks across triples touch 6 qubits.', show: 'X1X2X3X4X5X6' },
              { say: 'A bigger Shor-style code needs even bigger checks.', show: 'more qubits → longer checks → more gates → more errors' },
              { say: 'Surface code: every check touches at most 4 neighbours.', show: 'distance 3, 5, 7, … · checks still ≤ 4 qubits' }
            ] },
            check: {
              q: 'Why does the surface code use only checks between neighbours?',
              options: ['On a chip, gates only reach nearby qubits', 'Neighbours never get errors', 'It needs fewer qubits than Shor', 'Checks on 4 qubits are always exact'],
              answer: 0,
              why: 'Far-apart checks need long chains of gates, and each gate can add errors. Neighbour checks keep the circuits short.'
            }
          },
          {
            title: 'Data qubits and checks on a grid',
            buildsOn: 'The grid tab said why: checks between neighbours only. Here are the qubits and checks of the smallest surface code.',
            leadsTo: 'Next, what happens on this grid when errors strike: which checks light up.',
            idea: [
              '*Data qubits* hold the information. *Ancilla qubits* measure the checks.',
              'Each ancilla checks the 2 or 4 data qubits next to it. Z-type catch X errors, X-type catch Z errors.',
              'A four-qubit Z-check is +1 when an even number of its four qubits are 1. X-checks do the same for signs.',
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
