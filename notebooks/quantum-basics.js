(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;

  NB.register({
    id: 'quantum-basics',
    title: 'Quantum basics',
    subtitle: 'From one qubit to the three-qubit repetition code. Only what QEC needs.',
    glossary: [
      {
        "group": "Notation",
        "note": "How to read the symbols.",
        "items": [
          {
            "term": "|…⟩",
            "means": "A label for a state. |0⟩ means \"the qubit that reads 0\". Say it as \"ket\"."
          },
          {
            "term": "α, β",
            "means": "The two numbers of one qubit, called amplitudes. α goes with readout 0, β with readout 1.",
            "more": "Chance of 0 is |α|², chance of 1 is |β|². They always add to 1."
          },
          {
            "term": "|α|²",
            "means": "Amplitude squared = the chance of that readout. 0.707² = 0.5, so 0.707 means 50%."
          },
          {
            "term": "1/√2",
            "means": "About 0.707. Shows up whenever two patterns share a state equally, because 0.707² = 0.5."
          },
          {
            "term": "a₀₀ … a₁₁",
            "means": "Two qubits: one amplitude per readout pattern 00, 01, 10, 11. Squared, the chance of that pattern."
          },
          {
            "term": "|+⟩|0⟩",
            "means": "Two states side by side = two *separate* qubits: qubit 1 is |+⟩, qubit 2 is |0⟩.",
            "more": "Multiply out to get the four amplitudes, like the coin table."
          },
          {
            "term": "θ, φ",
            "means": "Bloch sphere angles. θ: how far from |0⟩ down towards |1⟩. φ: how far round the equator.",
            "more": "α = cos(θ/2) and |β| = sin(θ/2)."
          },
          {
            "term": "i",
            "means": "The square root of −1. Used in |+i⟩, |−i⟩ and the Y readout."
          }
        ]
      },
      {
        "group": "One-qubit states",
        "items": [
          {
            "term": "|0⟩",
            "means": "α = 1, β = 0. Always reads 0. Top of the Bloch sphere."
          },
          {
            "term": "|1⟩",
            "means": "α = 0, β = 1. Always reads 1. Bottom of the Bloch sphere."
          },
          {
            "term": "|+⟩",
            "means": "(|0⟩ + |1⟩)/√2. A fair coin in the 0/1 readout. Always + in the X readout.",
            "more": "On the equator. H turns |0⟩ into |+⟩."
          },
          {
            "term": "|−⟩",
            "means": "(|0⟩ − |1⟩)/√2. Also a fair coin in 0/1, but always − in the X readout.",
            "more": "Opposite |+⟩ on the equator. Only the sign of β differs. H turns |1⟩ into |−⟩."
          },
          {
            "term": "|+i⟩, |−i⟩",
            "means": "(|0⟩ ± i|1⟩)/√2. Fair coins in 0/1 and in X. Always +i or −i in the Y readout.",
            "more": "On the equator, a quarter turn from |+⟩ and |−⟩."
          },
          {
            "term": "α|0⟩ + β|1⟩",
            "means": "Any one-qubit state, with |α|² + |β|² = 1."
          }
        ]
      },
      {
        "group": "Readouts",
        "items": [
          {
            "term": "Z readout",
            "means": "The normal readout: 0 or 1, with chances |α|² and |β|²."
          },
          {
            "term": "X readout",
            "means": "+ or −. Asks whether the state leans to |+⟩ or |−⟩. Same as H, then the Z readout."
          },
          {
            "term": "Y readout",
            "means": "+i or −i. Asks whether the state leans to |+i⟩ or |−i⟩."
          },
          {
            "term": "Collapse",
            "means": "After a readout the qubit becomes the state it reported. Reading again gives the same answer."
          },
          {
            "term": "Phase",
            "means": "A sign on the whole state changes nothing. A sign on β alone (relative phase) changes the X and Y readouts."
          }
        ]
      },
      {
        "group": "Gates",
        "items": [
          {
            "term": "X",
            "aka": ["X gate"],
            "means": "Swaps α and β. |0⟩ ↔ |1⟩. A bit flip.",
            "more": "Half turn about the x axis of the Bloch sphere."
          },
          {
            "term": "Z",
            "aka": ["Z gate"],
            "means": "Flips the sign of β. |+⟩ ↔ |−⟩. A phase flip: the 0/1 readout cannot see it.",
            "more": "Half turn about the z axis."
          },
          {
            "term": "H",
            "aka": ["H gate"],
            "means": "|0⟩ ↔ |+⟩ and |1⟩ ↔ |−⟩. Swaps the Z view and the X view."
          },
          {
            "term": "CNOT12",
            "aka": ["CNOT"],
            "means": "Flips qubit 2 (target) if qubit 1 (control) is 1. Does nothing if it is 0.",
            "more": "H on qubit 1, then CNOT12, turns |00⟩ into a Bell pair."
          },
          {
            "term": "H1, X2, Z3",
            "means": "A gate and the qubit it acts on: H1 = H on qubit 1, X2 = X on qubit 2."
          }
        ]
      },
      {
        "group": "Two-qubit states",
        "note": "The presets in the Try it boxes.",
        "items": [
          {
            "term": "|00⟩",
            "means": "Both qubits read 0, every time. Independent."
          },
          {
            "term": "|+⟩|0⟩",
            "means": "Qubit 1 a fair coin, qubit 2 is 0. Reads 00 or 10, 50/50. Independent."
          },
          {
            "term": "|+⟩|+⟩",
            "means": "Two separate fair coins: ½(|00⟩ + |01⟩ + |10⟩ + |11⟩). Each pattern 25%. Independent."
          },
          {
            "term": "Bell (00+11)",
            "aka": ["Bell state", "Bell pair"],
            "means": "(|00⟩ + |11⟩)/√2. Glued pair: 00 or 11, 50/50, never 01 or 10. Entangled.",
            "more": "Each qubit alone is a fair coin. They also agree in the X readout."
          },
          {
            "term": "Bell (00−11)",
            "means": "(|00⟩ − |11⟩)/√2. Same 0/1 chances as the other Bell state; only the sign of 11 differs. Entangled.",
            "more": "Z on either qubit switches between the two. In the X readout these two always disagree."
          },
          {
            "term": "0.6|00⟩+0.8|11⟩",
            "means": "Lopsided glue: 00 36%, 11 64%, never 01 or 10. Entangled, because 0.6·0.8 ≠ 0·0."
          }
        ]
      },
      {
        "group": "Independent or entangled",
        "items": [
          {
            "term": "Independent",
            "means": "Each qubit has its own (α, β). The four amplitudes form a multiplication table, like separate coins."
          },
          {
            "term": "Entangled",
            "aka": ["entanglement"],
            "means": "Not independent. Only the pair has a state; no (α, β) exists for one qubit alone. Like glued coins."
          },
          {
            "term": "The test",
            "hover": false,
            "means": "*a₀₀·a₁₁ = a₀₁·a₁₀* exactly when the two qubits are independent."
          }
        ]
      },
      {
        "group": "Codes",
        "note": "Sections 4 to 6.",
        "items": [
          {
            "term": "Code",
            "hover": false,
            "means": "A rule for storing a little information in more bits or qubits, so that damage shows and can be undone."
          },
          {
            "term": "Error zone",
            "means": "The six patterns of three qubits the code never uses (all but 000 and 111). Weight there means something went wrong."
          },
          {
            "term": "Codeword",
            "means": "An allowed pattern of a code. The repetition code has two: 000 and 111. Anything else means an error."
          },
          {
            "term": "Encode",
            "aka": [
              "encoding"
            ],
            "means": "Turn the information into its codeword form. Bits: 0 → 000. Qubits: α|0⟩+β|1⟩ → α|000⟩+β|111⟩, with two CNOTs."
          },
          {
            "term": "Decode",
            "aka": [
              "decoding"
            ],
            "means": "Map a damaged pattern back to the nearest codeword, and so to the stored information."
          },
          {
            "term": "Majority vote",
            "means": "Bits only: read all three and keep the value that appears at least twice. Fixes one flip."
          },
          {
            "term": "X error",
            "means": "An X gate nobody asked for, caused by noise. Swaps α and β, so |0⟩ ↔ |1⟩."
          },
          {
            "term": "Z error",
            "means": "A Z gate caused by noise. Flips the sign of β. Parity checks on 0/1 cannot see it."
          },
          {
            "term": "No copying",
            "means": "No gate turns an unknown qubit plus a blank one into two copies. CNOT on |+⟩|0⟩ gives a Bell pair, not |+⟩|+⟩."
          },
          {
            "term": "No peeking",
            "means": "Reading a qubit collapses it, so a code must find errors without reading the stored data."
          },
          {
            "term": "Logical qubit",
            "means": "The one protected qubit stored across several physical qubits, e.g. α|000⟩ + β|111⟩."
          },
          {
            "term": "Physical qubit",
            "means": "One real hardware qubit. The repetition code uses three to store one logical qubit."
          },
          {
            "term": "Ancilla",
            "aka": [
              "ancilla qubit"
            ],
            "means": "A helper qubit that collects a parity with CNOTs and is then read, so the data qubits never are."
          }
        ]
      },
      {
        "group": "Three qubits and parity",
        "items": [
          {
            "term": "|000⟩, |111⟩",
            "means": "All three read 0, or all three read 1."
          },
          {
            "term": "|+⟩|00⟩",
            "means": "Qubit 1 a fair coin, qubits 2 and 3 at 0. CNOT12 then CNOT13 turns it into GHZ."
          },
          {
            "term": "GHZ",
            "aka": ["GHZ state"],
            "means": "(|000⟩ + |111⟩)/√2. Three glued qubits: 000 or 111, 50/50."
          },
          {
            "term": "α|000⟩ + β|111⟩",
            "aka": ["repetition code"],
            "means": "The repetition code: one qubit (α, β) spread over three. Not three copies.",
            "more": "Reading any one qubit would collapse it. Parity checks ask only whether neighbours agree."
          },
          {
            "term": "(α|0⟩+β|1⟩)|00⟩",
            "means": "The qubit to protect plus two helpers at 0. CNOT12 and CNOT13 turn it into α|000⟩ + β|111⟩."
          },
          {
            "term": "Parity",
            "means": "Whether two qubits agree (even, 0) or disagree (odd, 1). Can be read without learning α or β."
          },
          {
            "term": "Syndrome",
            "means": "The two parity results, (q1,q2) and (q2,q3). Points at the flipped qubit: 10 → q1, 11 → q2, 01 → q3."
          }
        ]
      }
    ],
    sections: [
      /* ============================ SECTION 1 ============================ */
      {
        title: 'One qubit',
        intro: 'A qubit is not a spinning coin. It is a pair of numbers that fixes what every readout can show.',
        bridge: 'You now hold a qubit as a pair (α, β), you know readouts square it, and you know phase is invisible to some readouts. Section 2 turns that pair into a picture, the Bloch sphere, and shows gates as moves on it.',
        tabs: [
          {
            title: 'A qubit is a pair of amplitudes',
            buildsOn: 'This is the start of the notebook. It only assumes you know a classical bit is 0 or 1.',
            leadsTo: 'Next tab asks how big α and β can be. That gives the rule that makes the pair behave like odds.',
            idea: [
              'A bit is 0 or 1. A qubit state is *α|0⟩ + β|1⟩*.',
              'α and β are *amplitudes*. They can be negative or complex.',
              'An amplitude is not a probability. You square its size to get one.'
            ],
            sketch: [
              T(120, 40, 'classical bit', { anchor: 'middle', c: 'blue', size: 28 }),
              B(40, 58, 160, 90),
              T(120, 118, '0  or  1', { anchor: 'middle', size: 38, keep: true }),
              T(120, 180, 'one of two\nvalues', { anchor: 'middle', size: 24 }),
              A(215, 102, 275, 102),
              T(450, 40, 'qubit', { anchor: 'middle', c: 'red', size: 28 }),
              B(290, 58, 320, 90),
              H(336, 82, 28, 46, { c: 'yellow' }),
              T(340, 118, 'α', { size: 40, c: 'red' }),
              T(375, 118, '|0⟩ +', { size: 38 }),
              H(466, 82, 28, 46, { c: 'pink' }),
              T(470, 118, 'β', { size: 40, c: 'blue' }),
              T(505, 118, '|1⟩', { size: 38 }),
              A(335, 158, 335, 205, { c: 'red' }),
              T(335, 238, 'α: how much\nof 0', { anchor: 'middle', c: 'red', size: 24 }),
              A(500, 158, 500, 205, { c: 'blue' }),
              T(505, 238, 'β: how much\nof 1', { anchor: 'middle', c: 'blue', size: 24 })
            ],
            takeaway: 'A qubit state is a pair (α, β), not a 0 or a 1.',
            widget: { type: 'qubit', sliders: ['theta'], start: { theta: 90, phi: 0 } },
            check: {
              q: 'In α|0⟩ + β|1⟩, what is α?',
              options: [
                'The probability of reading 0',
                'The amplitude on |0⟩. Its squared size is the chance of reading 0',
                'The angle of the qubit',
                'The number of qubits'
              ],
              answer: 1,
              why: 'Amplitudes are the raw numbers. Squaring their size gives probabilities.'
            }
          },
          {
            title: 'Squares add to 1',
            buildsOn: 'The last tab gave you α and β as raw amplitudes. This tab fixes how large they may be.',
            leadsTo: 'Next, measuring. The squares |α|² and |β|² become the odds of each readout.',
            idea: [
              '|α|² is the weight on 0 and |β|² the weight on 1.',
              'All weight sums to one: *|α|² + |β|² = 1*.',
              'So α fixes the size of β. One free angle θ is left.'
            ],
            sketch: [
              L([[90, 260], [250, 260], [250, 140], [90, 260]], { c: 'ink' }),
              K([[290, 260], [284, 220], [262, 178], [232, 144], [190, 112]], { c: 'blue', dash: true }),
              T(170, 296, 'α', { anchor: 'middle', c: 'red', size: 32 }),
              T(278, 208, 'β', { anchor: 'middle', c: 'blue', size: 32 }),
              T(150, 190, '1', { anchor: 'middle', size: 30 }),
              T(128, 250, 'θ/2', { anchor: 'middle', size: 22 }),
              H(330, 66, 260, 52, { c: 'yellow' }),
              T(460, 104, '|α|² + |β|² = 1', { anchor: 'middle', size: 36 }),
              T(460, 160, 'the weights add up', { anchor: 'middle', c: 'blue', size: 26 }),
              A(460, 172, 460, 205),
              T(460, 238, '0.6² + 0.8² = 1', { anchor: 'middle', size: 30 }),
              T(460, 280, 'Pythagoras, in disguise', { anchor: 'middle', c: 'green', size: 24 })
            ],
            takeaway: '|α|² + |β|² = 1. Always.',
            widget: { type: 'qubit', sliders: ['theta'], start: { theta: 74, phi: 0 } },
            check: {
              q: 'α = 0.6 (real). What is |β|?',
              options: ['0.8', '0.4', '0.64', '1'],
              answer: 0,
              why: '0.6² = 0.36, so |β|² = 0.64 and |β| = 0.8.'
            }
          },
          {
            title: 'Measuring collapses the qubit',
            buildsOn: 'The squares tab made |α|² and |β|² into weights that sum to 1. Here they become real odds.',
            leadsTo: 'Next, phase. It is the one part of (α, β) that a plain 0/1 readout never reveals.',
            idea: [
              'A readout gives 0 with chance |α|² and 1 with chance |β|².',
              'After the readout the qubit *is* the result you saw. The rest is gone.',
              'One shot says little. Many shots on fresh copies show the odds.'
            ],
            sketch: [
              B(40, 40, 170, 70),
              T(125, 86, 'α|0⟩ + β|1⟩', { anchor: 'middle', size: 30 }),
              A(220, 75, 300, 75, { c: 'red' }),
              T(260, 58, 'measure', { anchor: 'middle', c: 'red', size: 22 }),
              A(312, 70, 395, 40),
              A(312, 82, 395, 125),
              T(405, 50, '0   chance |α|²', { c: 'blue', size: 26 }),
              T(405, 138, '1   chance |β|²', { c: 'blue', size: 26 }),
              H(36, 190, 330, 40, { c: 'yellow' }),
              T(40, 220, 'after: the qubit IS the result', { size: 28 }),
              T(40, 266, 'one shot = one sample', { size: 26 }),
              T(40, 300, 'many shots on fresh copies show the odds', { size: 26, c: 'green' }),
              B(560, 226, 30, 64),
              B(600, 258, 30, 32)
            ],
            takeaway: 'A readout picks one outcome and the qubit stays there.',
            widget: { type: 'qubit', sliders: ['theta'], shots: true, collapse: true, start: { theta: 74, phi: 0 } },
            check: {
              q: 'You read 1. What state is the qubit in now?',
              options: ['Still α|0⟩ + β|1⟩', '|1⟩', '|0⟩', 'Unchanged, but hidden'],
              answer: 1,
              why: 'Measurement collapses the state to the outcome you saw.'
            }
          },
          {
            title: 'Phase: global and relative',
            buildsOn: 'The measuring tab showed a 0/1 readout only sees the sizes |α| and |β|. Phase lives in the part it ignores.',
            leadsTo: 'Section 2 gives phase a place on a map (the Bloch sphere) and names the readouts that can see it.',
            idea: [
              'Phase is the angle of an amplitude, written e^(iφ).',
              'Turning *both* α and β by the same angle changes nothing you can ever see. That is global phase.',
              'Turning only β against α is real. A Z readout cannot see it. X and Y readouts can.'
            ],
            sketch: [
              O(150, 175, 90, { dash: true, c: 'ink' }),
              A(150, 175, 240, 175, { c: 'red' }),
              T(252, 182, 'α', { c: 'red', size: 30 }),
              A(150, 175, 195, 100, { c: 'blue' }),
              T(200, 92, 'β', { c: 'blue', size: 30 }),
              K([[200, 175], [196, 160], [188, 146]], { c: 'green' }),
              T(214, 152, 'φ', { c: 'green', size: 26 }),
              T(150, 292, 'relative angle φ', { anchor: 'middle', size: 24 }),
              H(330, 50, 290, 40, { c: 'mint' }),
              T(335, 80, 'spin both together', { size: 26 }),
              T(335, 112, 'nothing changes, ever', { size: 26, c: 'green' }),
              H(330, 170, 290, 40, { c: 'pink' }),
              T(335, 200, 'spin only β', { size: 26 }),
              T(335, 232, 'Z readout: blind', { size: 26, c: 'red' }),
              T(335, 264, 'X, Y readouts: see it', { size: 26, c: 'blue' })
            ],
            takeaway: 'Relative phase is real. Global phase is not.',
            widget: { type: 'qubit', sliders: ['phi'], readouts: true, start: { theta: 90, phi: 0 } },
            check: {
              q: 'Which change can a Z readout detect?',
              options: [
                'Rotating the phase of β alone',
                'Multiplying both amplitudes by the same phase',
                'Changing |α| and |β|',
                'None of these'
              ],
              answer: 2,
              why: 'Z sees only the sizes |α|² and |β|². Both phase changes are invisible to it.'
            }
          }
        ]
      },

      /* ============================ SECTION 2 ============================ */
      {
        title: 'Gates and the Bloch sphere',
        intro: 'A gate is a rule that turns (α, β) into a new pair. The Bloch sphere is a map where every qubit state is a point.',
        bridge: 'You can now move one qubit around, read it three ways, and see both on a sphere. Section 3 puts two qubits together, where one pair of numbers is no longer enough.',
        tabs: [
          {
            title: 'Gates turn the pair',
            buildsOn: 'Section 1 ended with a state being the pair (α, β). A gate is a rule acting on that pair.',
            leadsTo: 'Next tab names the three ways to read a qubit, so you can see what each gate changes.',
            idea: [
              '*X* swaps α and β. *Z* flips the sign of β. *H* mixes them.',
              'Gates keep |α|² + |β|² = 1. They never break the weights.',
              'Gates can be undone. H twice gives back the start.'
            ],
            sketch: [
              T(40, 66, '(α, β)', { size: 30 }),
              A(125, 56, 190, 56),
              B(196, 32, 50, 48), T(221, 66, 'X', { anchor: 'middle', size: 30, c: 'red' }),
              A(252, 56, 320, 56),
              T(335, 66, '(β, α)', { size: 30 }),
              T(470, 66, 'swap', { c: 'red', size: 26 }),
              T(40, 160, '(α, β)', { size: 30 }),
              A(125, 150, 190, 150),
              B(196, 126, 50, 48), T(221, 160, 'Z', { anchor: 'middle', size: 30, c: 'blue' }),
              A(252, 150, 320, 150),
              T(335, 160, '(α, −β)', { size: 30 }),
              T(470, 160, 'flip sign', { c: 'blue', size: 26 }),
              T(40, 254, '(α, β)', { size: 30 }),
              A(125, 244, 190, 244),
              B(196, 220, 50, 48), T(221, 254, 'H', { anchor: 'middle', size: 30, c: 'green' }),
              A(252, 244, 320, 244),
              T(335, 254, '(α+β, α−β)/√2', { size: 28 }),
              T(540, 254, 'mix', { c: 'green', size: 26 })
            ],
            takeaway: 'A gate is a rule on (α, β). Reversible, weights preserved.',
            widget: { type: 'qubit', sliders: [], gates: ['X', 'Y', 'Z', 'H'], start: { theta: 60, phi: 0 } },
            check: {
              q: 'Start with |0⟩ = (1, 0) and apply X. What do you get?',
              options: ['|0⟩', '|1⟩', '(|0⟩ + |1⟩)/√2', '−|0⟩'],
              answer: 1,
              why: 'X swaps α and β, so (1, 0) becomes (0, 1), which is |1⟩.'
            }
          },
          {
            title: 'Three readouts: Z, X, Y',
            buildsOn: 'The gates tab gave you gates. To see what a gate really does you need more than one way to read the qubit.',
            leadsTo: 'Next, the Bloch sphere puts all three readouts on one picture, one axis each.',
            idea: [
              '*Z* asks 0 or 1. *X* asks + or −. *Y* asks +i or −i.',
              'Each readout is blind to something the others see.',
              'Z cannot see the sign between α and β. X can. QEC will need both kinds of check.'
            ],
            sketch: [
              B(20, 40, 180, 90), B(230, 40, 180, 90), B(440, 40, 180, 90),
              T(110, 80, 'Z readout', { anchor: 'middle', c: 'blue', size: 28 }),
              T(110, 114, '0 or 1 ?', { anchor: 'middle', size: 28 }),
              T(320, 80, 'X readout', { anchor: 'middle', c: 'red', size: 28 }),
              T(320, 114, '+ or − ?', { anchor: 'middle', size: 28 }),
              T(530, 80, 'Y readout', { anchor: 'middle', c: 'green', size: 28 }),
              T(530, 114, '+i or −i ?', { anchor: 'middle', size: 28 }),
              A(110, 140, 110, 180, { c: 'blue' }),
              T(110, 212, 'sees |α|, |β|\nblind to sign\nof β', { anchor: 'middle', size: 24 }),
              A(320, 140, 320, 180, { c: 'red' }),
              T(320, 212, 'sees the sign\nbetween α, β', { anchor: 'middle', size: 24 }),
              A(530, 140, 530, 180, { c: 'green' }),
              T(530, 212, 'sees the i-phase\nbetween α, β', { anchor: 'middle', size: 24 }),
              H(60, 270, 520, 36, { c: 'yellow' }),
              T(320, 298, 'one qubit, three questions', { anchor: 'middle', size: 28 })
            ],
            takeaway: 'Z, X, Y are three different questions about one qubit.',
            widget: { type: 'qubit', sliders: ['theta', 'phi'], readouts: true, shots: true, start: { theta: 90, phi: 0 } },
            check: {
              q: '|+⟩ = (|0⟩ + |1⟩)/√2. Which readout gives a certain answer?',
              options: ['Z', 'X', 'Y', 'All three'],
              answer: 1,
              why: '|+⟩ is the + outcome of the X readout. Z and Y give 50/50.'
            }
          },
          {
            title: 'The Bloch sphere',
            buildsOn: 'The readouts tab had three readouts. This tab lays them on three perpendicular axes of one sphere.',
            leadsTo: 'Next, gates become half turns of this sphere. That is the easiest way to see what they do.',
            idea: [
              '*θ* and *φ* turn (α, β) into a point on a sphere: α = cos(θ/2), β = e^(iφ) sin(θ/2).',
              'θ is the latitude from the north pole |0⟩. φ is the longitude, the relative phase.',
              'Opposite points are perfectly distinguishable. Poles: |0⟩, |1⟩. Equator: |±⟩ and |±i⟩.'
            ],
            sketch: [
              O(210, 165, 112),
              E(210, 165, 112, 32, { dash: true }),
              L([[210, 40], [210, 292]], { c: 'ink', dash: true }),
              T(210, 30, '|0⟩', { anchor: 'middle', c: 'blue', size: 28 }),
              T(210, 316, '|1⟩', { anchor: 'middle', c: 'blue', size: 28 }),
              T(340, 160, '|+⟩', { c: 'red', size: 28 }),
              T(60, 160, '|−⟩', { anchor: 'middle', c: 'red', size: 28 }),
              A(210, 165, 285, 95, { c: 'green' }),
              D(285, 95, { c: 'green' }),
              K([[210, 120], [223, 123], [236, 128]], { c: 'red' }),
              T(246, 116, 'θ', { c: 'red', size: 28 }),
              K([[262, 183], [286, 188], [310, 182]], { c: 'blue' }),
              T(300, 214, 'φ', { c: 'blue', size: 28 }),
              T(380, 72, 'θ: from the north pole', { size: 26, c: 'red' }),
              T(380, 110, 'φ: around the equator', { size: 26, c: 'blue' }),
              H(380, 150, 250, 78, { c: 'yellow' }),
              T(386, 182, 'α = cos(θ/2)', { size: 28 }),
              T(386, 216, 'β = e^(iφ) sin(θ/2)', { size: 28 })
            ],
            takeaway: 'Every qubit state is a point on a sphere.',
            widget: { type: 'qubit', sliders: ['theta', 'phi'], bloch: true, readouts: true, start: { theta: 90, phi: 0 } },
            check: {
              q: 'Where is |+⟩ = (|0⟩ + |1⟩)/√2 on the sphere?',
              options: ['North pole', 'On the equator, on the +x side', 'South pole', 'At the centre'],
              answer: 1,
              why: 'θ = 90° puts it on the equator, and φ = 0 puts it on the +x side.'
            }
          },
          {
            title: 'Gates are half turns',
            buildsOn: 'The Bloch sphere tab gave every state a position. Now each gate from the gates tab becomes a move of that point.',
            leadsTo: 'Next, the one gate that links the readouts: H turns a Z question into an X question.',
            idea: [
              '*X, Y, Z* are half turns (180°) about the x, y, z axes.',
              '*H* is a half turn about the line between x and z.',
              'A turn keeps the point on the sphere, so weights always stay valid.'
            ],
            sketch: [
              O(150, 160, 95),
              E(150, 160, 95, 28, { dash: true }),
              L([[150, 50], [150, 270]], { dash: true }),
              L([[60, 215], [240, 105]], { c: 'green', dash: true }),
              K([[180, 90], [220, 120], [215, 165], [186, 188]], { c: 'red' }),
              A(186, 188, 176, 193, { c: 'red' }),
              T(320, 50, 'X : half turn about x', { size: 28, c: 'red' }),
              T(320, 100, 'Y : half turn about y', { size: 28, c: 'green' }),
              T(320, 150, 'Z : half turn about z', { size: 28, c: 'blue' }),
              H(316, 176, 300, 40, { c: 'yellow' }),
              T(320, 206, 'H : half turn about x+z', { size: 28 }),
              T(320, 270, 'always stays on the sphere', { size: 26, c: 'green' })
            ],
            takeaway: 'Gates are rotations of the Bloch sphere.',
            widget: { type: 'qubit', sliders: [], bloch: true, gates: ['X', 'Y', 'Z', 'H', 'S'], readouts: true, start: { theta: 60, phi: 40 } },
            check: {
              q: 'You apply Z to a state on the equator. What happens to its Bloch point?',
              options: [
                'It moves to the south pole',
                'It turns half way around the z axis, staying on the equator',
                'It does not move',
                'It leaves the sphere'
              ],
              answer: 1,
              why: 'Z is a half turn about z. A point on the equator stays on it, at the opposite longitude.'
            }
          },
          {
            title: 'H swaps the Z and X views',
            buildsOn: 'The half-turns tab made H a half turn about x+z. Here is the one consequence QEC leans on.',
            leadsTo: 'Section 3 adds a second qubit. The same H and the same readouts will act on one qubit of a pair.',
            idea: [
              'H sends z → x, x → z and y → −y.',
              'So *HZH = X* and *HXH = Z*. H turns a Z-type view into an X-type view.',
              'To catch a phase flip with a Z readout, apply H first.'
            ],
            sketch: [
              B(40, 40, 90, 54), T(85, 76, '|+⟩', { anchor: 'middle', size: 30 }),
              A(140, 67, 230, 67, { c: 'red' }), T(185, 52, 'H', { anchor: 'middle', c: 'red', size: 28 }),
              B(240, 40, 90, 54), T(285, 76, '|0⟩', { anchor: 'middle', size: 30 }),
              B(40, 130, 90, 54), T(85, 166, '|−⟩', { anchor: 'middle', size: 30 }),
              A(140, 157, 230, 157, { c: 'red' }), T(185, 142, 'H', { anchor: 'middle', c: 'red', size: 28 }),
              B(240, 130, 90, 54), T(285, 166, '|1⟩', { anchor: 'middle', size: 30 }),
              T(40, 22, 'Z readout sees 50/50', { size: 22, c: 'blue' }),
              T(240, 22, 'now certain', { size: 22, c: 'green' }),
              H(36, 226, 560, 40, { c: 'yellow' }),
              T(40, 256, 'phase flip (+ → −)  becomes  bit flip (0 → 1)', { size: 30 }),
              T(40, 300, 'so: H first, then read Z', { size: 28, c: 'red' }),
              T(400, 100, 'HZH = X', { size: 30, c: 'blue' }),
              T(400, 150, 'HXH = Z', { size: 30, c: 'blue' })
            ],
            takeaway: 'H converts phase information into bit information.',
            widget: { type: 'qubit', sliders: [], bloch: true, gates: ['H', 'X', 'Z'], readouts: true, start: { theta: 90, phi: 0 } },
            check: {
              q: 'The state is |+⟩ and you apply H. What does a Z readout give?',
              options: ['Always 0', 'Always 1', '50/50', 'Depends on φ'],
              answer: 0,
              why: 'H sends |+⟩ to |0⟩, so a Z readout gives 0 every time.'
            }
          }
        ]
      },

      /* ============================ SECTION 3 ============================ */
      {
        title: 'Two qubits',
        intro: 'Two qubits are not two copies of the one-qubit picture. They share four amplitudes.',
        bridge: 'You can tell independent from entangled, make entanglement with CNOT, and see what a readout of one qubit does to its partner. Section 4 asks why a qubit needs protecting, and what a code is.',
        tabs: [
          {
            title: 'Two qubits, four amplitudes',
            buildsOn: 'Section 2 described one qubit by (α, β), one number per readout result. Two qubits need one number per readout pattern.',
            leadsTo: 'Next, two ordinary coins show what it means for four numbers to split into one pair per coin, before any amplitudes.',
            idea: [
              'Readout patterns are 00, 01, 10, 11. Each one gets an amplitude.',
              'State = a₀₀|00⟩ + a₀₁|01⟩ + a₁₀|10⟩ + a₁₁|11⟩.',
              '*n* qubits need *2ⁿ* amplitudes. They belong to whole patterns, not to single qubits.'
            ],
            sketch: [
              T(70, 40, '|00⟩', { anchor: 'middle', size: 28 }), T(210, 40, '|01⟩', { anchor: 'middle', size: 28 }),
              T(350, 40, '|10⟩', { anchor: 'middle', size: 28 }), T(490, 40, '|11⟩', { anchor: 'middle', size: 28 }),
              B(20, 54, 100, 60), B(160, 54, 100, 60), B(300, 54, 100, 60), B(440, 54, 100, 60),
              T(70, 96, 'a₀₀', { anchor: 'middle', c: 'red', size: 30 }), T(210, 96, 'a₀₁', { anchor: 'middle', c: 'red', size: 30 }),
              T(350, 96, 'a₁₀', { anchor: 'middle', c: 'red', size: 30 }), T(490, 96, 'a₁₁', { anchor: 'middle', c: 'red', size: 30 }),
              B(48, 156, 44, 60, { c: 'blue' }), B(188, 176, 44, 40, { c: 'blue' }),
              B(328, 196, 44, 20, { c: 'blue' }), B(468, 166, 44, 50, { c: 'blue' }),
              L([[20, 220], [560, 220]]),
              T(300, 262, 'one number per whole pattern', { anchor: 'middle', size: 30 }),
              H(150, 276, 300, 36, { c: 'yellow' }),
              T(300, 304, 'n qubits → 2ⁿ numbers', { anchor: 'middle', c: 'green', size: 28 })
            ],
            takeaway: 'Amplitudes belong to whole patterns.',
            widget: { type: 'multi', n: 2, presets: ['zero2', 'plus0', 'plusplus', 'bell'], start: 'plus0', ops: ['H1', 'H2', 'X1', 'X2', 'Z1', 'Z2'] },
            check: {
              q: 'How many amplitudes describe 3 qubits?',
              options: ['3', '6', '8', '9'],
              answer: 2,
              why: '2³ = 8, one amplitude per readout pattern from 000 to 111.'
            }
          },
          {
            title: 'Separate coins or glued coins',
            buildsOn: 'The four-amplitudes tab gave two qubits a table of four numbers. Ordinary coins show the key question with plain chances first.',
            leadsTo: 'Next, the same diagonal check on qubit amplitudes instead of coin chances.',
            idea: [
              'Two *separate* coins: the chance of each pair is coin A times coin B. The table is a multiplication table.',
              'Two *glued* coins always land the same way: HH 0.5, TT 0.5, never HT or TH.',
              'Each glued coin alone is 50/50, but 50/50 times 50/50 gives 0.25 in every box. No pair of separate coins fits.',
              'Quick check: top-left × bottom-right equals top-right × bottom-left exactly when the coins are separate.'
            ],
            sketch: [
              T(150, 34, 'separate', { anchor: 'middle', size: 28, c: 'blue' }),
              B(60, 50, 90, 60), B(150, 50, 90, 60), B(60, 110, 90, 60), B(150, 110, 90, 60),
              T(105, 90, '0.4', { anchor: 'middle', size: 28 }), T(195, 90, '0.1', { anchor: 'middle', size: 28 }),
              T(105, 150, '0.4', { anchor: 'middle', size: 28 }), T(195, 150, '0.1', { anchor: 'middle', size: 28 }),
              T(150, 210, '0.4·0.1 = 0.1·0.4', { anchor: 'middle', size: 26, c: 'green' }),
              T(450, 34, 'glued', { anchor: 'middle', size: 28, c: 'red' }),
              B(360, 50, 90, 60), B(450, 50, 90, 60), B(360, 110, 90, 60), B(450, 110, 90, 60),
              T(405, 90, '0.5', { anchor: 'middle', size: 28 }), T(495, 90, '0', { anchor: 'middle', size: 28 }),
              T(405, 150, '0', { anchor: 'middle', size: 28 }), T(495, 150, '0.5', { anchor: 'middle', size: 28 }),
              T(450, 210, '0.5·0.5 ≠ 0·0', { anchor: 'middle', size: 26, c: 'red' }),
              H(60, 248, 480, 42, { c: 'yellow' }),
              T(300, 278, 'diagonals match  ⇔  separate', { anchor: 'middle', size: 30 })
            ],
            takeaway: 'Separate coins make a multiplication table. Glued coins do not.',
            widget: { type: 'steps', steps: [
              { say: 'Coin A is fair. Coin B is weighted towards heads.', show: 'A: heads 0.5, tails 0.5 · B: heads 0.8, tails 0.2' },
              { say: '*Separate* coins: the chance of a pair is A times B.', show: 'HH 0.4 · HT 0.1 · TH 0.4 · TT 0.1' },
              { say: 'Multiply diagonally: HH·TT and HT·TH.', show: '0.4 × 0.1 = 0.04 · 0.1 × 0.4 = 0.04 · same' },
              { say: 'They match because each product uses all four coin numbers once: (A heads)(B heads)(A tails)(B tails).', show: '0.5 × 0.8 × 0.5 × 0.2 = 0.04' },
              { say: 'Now *glued* coins: they always land the same way, half HH, half TT.', show: 'HH 0.5 · HT 0 · TH 0 · TT 0.5' },
              { say: 'Each coin alone is 50/50. Separate 50/50 coins would give 0.25 in every box. That is not this table.', show: '0.25, 0.25, 0.25, 0.25  ≠  0.5, 0, 0, 0.5' },
              { say: 'The diagonal check catches it at once.', show: '0.5 × 0.5 = 0.25 · 0 × 0 = 0 · different, so glued' }
            ] },
            check: {
              q: 'Two coins give HH 0.3, HT 0.3, TH 0.2, TT 0.2. Separate or glued?',
              options: ['Separate: 0.3·0.2 = 0.3·0.2', 'Glued: HH is not 0.25', 'Glued: the four numbers differ', 'Cannot tell'],
              answer: 0,
              why: 'HH·TT = 0.06 and HT·TH = 0.06. Same, so separate: coin A is heads 0.6, coin B is heads 0.5, and 0.6 × 0.5 = 0.3.'
            }
          },
          {
            title: 'Independent states and the test',
            buildsOn: 'The coins tab showed that separate coins make a multiplication table and pass the diagonal check. Qubits work the same way with amplitudes.',
            leadsTo: 'Next, what it means when the split is impossible. That is entanglement.',
            idea: [
              'Same as the coins, with amplitudes. Independent: each qubit has its own (α, β), and a₀₀ = α₁α₂, a₀₁ = α₁β₂, a₁₀ = β₁α₂, a₁₁ = β₁β₂.',
              'Test: *a₀₀·a₁₁ = a₀₁·a₁₀*. If independent, both sides are α₁β₁α₂β₂. Different products mean no split exists.',
              'Example: |+⟩|0⟩ has a₀₀ = a₁₀ = 0.707, a₀₁ = a₁₁ = 0. Products 0 and 0, equal: independent. Try the presets below.'
            ],
            sketch: [
              B(20, 40, 150, 60), T(95, 78, '(α₁, β₁)', { anchor: 'middle', size: 28, c: 'red' }),
              B(20, 130, 150, 60), T(95, 168, '(α₂, β₂)', { anchor: 'middle', size: 28, c: 'blue' }),
              A(190, 115, 260, 115),
              B(270, 40, 130, 70), B(400, 40, 130, 70), B(270, 110, 130, 70), B(400, 110, 130, 70),
              T(335, 84, 'α₁α₂', { anchor: 'middle', size: 26 }), T(465, 84, 'α₁β₂', { anchor: 'middle', size: 26 }),
              T(335, 154, 'β₁α₂', { anchor: 'middle', size: 26 }), T(465, 154, 'β₁β₂', { anchor: 'middle', size: 26 }),
              L([[280, 50], [525, 105]], { c: 'red' }), L([[525, 50], [280, 175]], { c: 'blue' }),
              H(20, 214, 560, 44, { c: 'yellow' }),
              T(300, 246, 'a₀₀·a₁₁ = a₀₁·a₁₀  ⇔  independent', { anchor: 'middle', size: 32 }),
              T(300, 296, 'both sides equal α₁β₁α₂β₂', { anchor: 'middle', size: 26, c: 'green' })
            ],
            takeaway: 'Independent ⇔ the diagonal products match.',
            widget: { type: 'multi', n: 2, presets: ['plus0', 'plusplus', 'skew', 'bell'], start: 'plus0', ops: ['H1', 'H2'], independence: true },
            check: {
              q: 'a₀₀ = 0.6, a₁₁ = 0.8, a₀₁ = a₁₀ = 0. Independent?',
              options: ['Yes, products 0.48 and 0', 'No, 0.48 ≠ 0', 'Yes, because the weights sum to 1', 'Cannot tell'],
              answer: 1,
              why: 'The diagonal products are 0.6·0.8 = 0.48 and 0·0 = 0. They differ, so no single (α, β) per qubit exists.'
            }
          },
          {
            title: 'Entanglement',
            buildsOn: 'The independence tab gave a test. A state that fails it is entangled. This tab says what that means.',
            leadsTo: 'Next, the gate that builds entanglement from independent qubits: CNOT.',
            idea: [
              'If the test fails, there is *no* (α, β) for qubit 1 alone. The pair owns the state.',
              'The Bell state (|00⟩ + |11⟩)/√2 is the glued coins: 0.707 on 00 and 11, 0 on 01 and 10. Squared: 00 or 11, 50/50.',
              'Unlike glued coins, they also agree when both are read with the X readout (+ or −). No note fixed in advance explains that.',
              'Asking "what is qubit 1\'s α?" has no answer. This is the root of most early confusion.'
            ],
            sketch: [
              T(300, 50, '(|00⟩ + |11⟩) / √2', { anchor: 'middle', size: 40 }),
              H(140, 18, 320, 44, { c: 'yellow' }),
              A(210, 84, 120, 150, { c: 'blue' }), A(390, 84, 480, 150, { c: 'blue' }),
              T(120, 180, 'qubit 1 alone:\nfair coin', { anchor: 'middle', size: 26, c: 'blue' }),
              T(480, 180, 'qubit 2 alone:\nfair coin', { anchor: 'middle', size: 26, c: 'blue' }),
              A(300, 100, 300, 160, { c: 'green' }),
              T(300, 190, 'together:\nalways equal', { anchor: 'middle', size: 26, c: 'green' }),
              B(130, 244, 340, 52),
              T(300, 280, 'qubit 1 has its own (α, β)', { anchor: 'middle', size: 28 }),
              L([[136, 250], [464, 292]], { c: 'red' }), L([[464, 250], [136, 292]], { c: 'red' })
            ],
            takeaway: 'Entangled: only the pair has a state, not each qubit.',
            widget: { type: 'multi', n: 2, presets: ['bell', 'bellm', 'skew', 'plusplus'], start: 'bell', ops: ['H1', 'Z1', 'X2'], independence: true, measure: [1, 2] },
            check: {
              q: 'In the Bell state, what does a readout of qubit 1 alone give?',
              options: ['Always 0', 'Always 1', '0 or 1, 50/50', 'It has no readout'],
              answer: 2,
              why: 'Qubit 1 alone looks like a fair coin. Only the pair shows the agreement.'
            }
          },
          {
            title: 'CNOT makes entanglement',
            buildsOn: 'The entanglement tab defined entanglement. This tab builds it with the two gates you already know plus one new gate.',
            leadsTo: 'Next, what happens to the partner when you read one qubit of an entangled pair.',
            idea: [
              '*CNOT* flips the target qubit when the control is 1.',
              'H on qubit 1 then CNOT gives the Bell state from |00⟩.',
              'CNOT is reversible. Applying it again undoes the entanglement.'
            ],
            sketch: [
              T(24, 108, '|0⟩', { size: 30 }), T(24, 208, '|0⟩', { size: 30 }),
              L([[70, 100], [490, 100]]), L([[70, 200], [490, 200]]),
              B(130, 76, 50, 48), T(155, 110, 'H', { anchor: 'middle', size: 30, c: 'green' }),
              D(300, 100, { c: 'red' }), L([[300, 100], [300, 216]], { c: 'red' }),
              O(300, 200, 16, { c: 'red' }), L([[284, 200], [316, 200]], { c: 'red' }),
              T(300, 62, 'control', { anchor: 'middle', size: 24, c: 'red' }),
              T(360, 248, 'target', { anchor: 'middle', size: 24, c: 'red' }),
              T(505, 130, 'Bell\nstate', { size: 30 }),
              H(36, 266, 520, 36, { c: 'yellow' }),
              T(40, 294, 'control = 1  →  flip the target', { size: 30 })
            ],
            takeaway: 'H then CNOT turns |00⟩ into a Bell pair.',
            widget: { type: 'multi', n: 2, presets: ['zero2', 'plus0'], start: 'zero2', ops: ['H1', 'CNOT12', 'X1'], independence: true },
            check: {
              q: 'You apply CNOT (control q1, target q2) to |10⟩. Result?',
              options: ['|10⟩', '|11⟩', '|00⟩', '|01⟩'],
              answer: 1,
              why: 'The control is 1, so the target flips: |10⟩ becomes |11⟩.'
            }
          },
          {
            title: 'Reading one qubit of a pair',
            buildsOn: 'The CNOT tab made a Bell pair. Now read one of its qubits and watch the other.',
            leadsTo: 'Section 4 turns to protecting a qubit. Gluing qubits like this turns out to be how a quantum code stores one.',
            idea: [
              'Reading qubit 1 of a Bell pair gives 0 or 1 at random.',
              'Qubit 2 then matches, every time.',
              'Nothing is sent. The state belonged to the pair, and the readout picked one pattern.'
            ],
            sketch: [
              T(300, 46, '(|00⟩ + |11⟩) / √2', { anchor: 'middle', size: 36 }),
              A(240, 70, 150, 128, { c: 'red' }),
              T(160, 100, 'read q1', { size: 24, c: 'red' }),
              B(60, 134, 170, 56), T(145, 172, 'q1 = 1', { anchor: 'middle', size: 30 }),
              A(360, 70, 450, 128, { c: 'blue' }),
              B(380, 134, 200, 56), T(480, 172, 'q2 = 1, for sure', { anchor: 'middle', size: 28 }),
              H(60, 226, 520, 36, { c: 'yellow' }),
              T(320, 254, 'no message sent', { anchor: 'middle', size: 30 }),
              T(320, 296, 'the pair had one state; the readout picked a pattern', { anchor: 'middle', size: 24, c: 'green' })
            ],
            takeaway: 'One readout picks a whole pattern, for both qubits.',
            widget: { type: 'multi', n: 2, presets: ['bell', 'bellm'], start: 'bell', measure: [1, 2], ops: [] },
            check: {
              q: 'You read q1 = 0 on a Bell pair (|00⟩ + |11⟩)/√2. What is q2?',
              options: ['0, for sure', '1, for sure', '50/50', 'Unknown until read'],
              answer: 0,
              why: 'Only the pattern 00 survives, so q2 is 0 for sure.'
            }
          }
        ]
      },

      /* ============================ SECTION 4 ============================ */
      {
        title: 'Why protect a qubit, and what a code is',
        intro: 'Real qubits get nudged by noise. A code stores a little information in more bits, so damage can be spotted and undone. We start with plain bits.',
        bridge: 'You know what a code is, and the two rules a quantum code must obey: no copying, no peeking. Section 5 builds a three-qubit code that obeys both.',
        tabs: [
          {
            title: 'Errors: a qubit gets flipped',
            buildsOn: 'Sections 1 to 3 treated gates as moves you choose. Noise makes the same moves without asking, starting with X.',
            leadsTo: 'Next, how ordinary computers survive flips: store each bit three times and take a vote.',
            idea: [
              'Real qubits sit in noisy hardware. Stray heat and fields nudge them. The simplest damage is an *X error*: an X gate nobody asked for.',
              'X swaps α and β. So α|0⟩ + β|1⟩ becomes β|0⟩ + α|1⟩. The stored numbers are now wrong.',
              'Nothing warns you. A readout only gives 0 or 1, and it collapses the qubit anyway.',
              'Noise can also drift α and β a little instead of a full flip. Codes handle that too; QEC basics shows how.'
            ],
            sketch: [
              B(30, 70, 200, 70), T(130, 114, 'α|0⟩ + β|1⟩', { anchor: 'middle', size: 28 }),
              T(130, 172, 'stored', { anchor: 'middle', size: 24, c: 'blue' }),
              A(240, 105, 380, 105, { c: 'red' }), T(310, 88, 'noise: X', { anchor: 'middle', size: 24, c: 'red' }),
              B(390, 70, 200, 70, { c: 'red' }), T(490, 114, 'β|0⟩ + α|1⟩', { anchor: 'middle', size: 28, c: 'red' }),
              T(490, 172, 'α and β swapped', { anchor: 'middle', size: 24, c: 'red' }),
              H(80, 226, 480, 44, { c: 'yellow' }),
              T(320, 258, 'a readout cannot tell you it happened', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'An X error swaps α and β. Nothing warns you.',
            widget: { type: 'qubit', sliders: ['theta'], gates: ['X'], readouts: true, start: { theta: 60, phi: 0 } },
            check: {
              q: 'A qubit is 0.8|0⟩ + 0.6|1⟩. An X error hits it. What is it now?',
              options: ['0.6|0⟩ + 0.8|1⟩', '0.8|0⟩ + 0.6|1⟩', '0.8|0⟩ − 0.6|1⟩', '|1⟩'],
              answer: 0,
              why: 'X swaps the two amplitudes: the 0.8 moves to the 1 side, the 0.6 to the 0 side.'
            }
          },
          {
            title: 'The bit fix: say it three times',
            buildsOn: 'The errors tab showed that a flip ruins a qubit silently. Ordinary bits get flipped too, and they have an old, simple fix.',
            leadsTo: 'Next, the general words for this trick: code, encode, codeword, decode. They carry over to qubits.',
            idea: [
              'Ordinary computers can protect a bit by repeating it: store 0 as 000 and 1 as 111.',
              'Noise flips one bit: 000 becomes 010. Two of the three still say 0.',
              'A *majority vote* gives back 0. One flip is fixed, whichever bit it hit. Two flips fool the vote.'
            ],
            sketch: [
              T(50, 112, '0', { anchor: 'middle', size: 40 }),
              A(76, 100, 142, 100), B(150, 70, 120, 60), T(210, 110, '000', { anchor: 'middle', size: 30 }),
              T(210, 162, 'repeat', { anchor: 'middle', size: 24, c: 'blue' }),
              A(280, 100, 342, 100, { c: 'red' }), T(311, 84, 'flip', { anchor: 'middle', size: 22, c: 'red' }),
              B(350, 70, 120, 60, { c: 'red' }), T(410, 110, '010', { anchor: 'middle', size: 30, c: 'red' }),
              T(410, 162, 'two 0s, one 1', { anchor: 'middle', size: 22 }),
              A(480, 100, 544, 100, { c: 'green' }), T(575, 112, '0', { anchor: 'middle', size: 40, c: 'green' }),
              T(570, 162, 'vote', { anchor: 'middle', size: 24, c: 'green' }),
              H(60, 220, 520, 44, { c: 'yellow' }),
              T(320, 252, 'a majority vote fixes any one flip', { anchor: 'middle', size: 28 })
            ],
            takeaway: 'Repeat the bit three times. A vote fixes one flip.',
            widget: { type: 'steps', steps: [
              { say: 'Store one bit, 0, as three copies.', show: '0  →  000' },
              { say: 'Noise flips the middle bit.', show: '000  →  010' },
              { say: 'Count the votes.', show: '010: two 0s, one 1' },
              { say: 'The majority wins.', show: 'vote → 0, correct' },
              { say: 'Same for 1: flip any one bit of 111 and the vote still says 1.', show: '111 → 101 → vote → 1' },
              { say: 'Two flips are too many. The vote now picks the wrong bit.', show: '000 → 110 → vote → 1, wrong' }
            ] },
            check: {
              q: 'You stored 1 as 111 and later read 011. What does the vote give?',
              options: ['1', '0', 'Cannot tell', 'Two bits flipped'],
              answer: 0,
              why: 'Two of the three bits say 1, so the vote gives 1. Only the first bit was flipped.'
            }
          },
          {
            title: 'What a code is',
            buildsOn: 'The repetition tab stored 0 as 000 and 1 as 111. That is the simplest example of a code. This tab names its parts.',
            leadsTo: 'Next, why the same trick fails for a qubit as it stands: you cannot copy α and β, and you cannot look at them.',
            idea: [
              'A *code* is a rule for storing a little information in more bits, so that damage shows. Here: 1 bit stored in 3.',
              '*Encode*: 0 → 000, 1 → 111. These allowed patterns are the *codewords*.',
              'The other six patterns are never stored. Seeing one means an error happened.',
              '*Decode*: map a damaged pattern back to the nearest codeword. Each of the six is one flip from just one codeword.'
            ],
            sketch: [
              T(110, 50, 'codewords', { anchor: 'middle', size: 26, c: 'green' }),
              T(410, 50, 'one flip away', { anchor: 'middle', size: 26, c: 'red' }),
              B(50, 80, 120, 60, { c: 'green' }), T(110, 120, '000', { anchor: 'middle', size: 30 }),
              B(50, 170, 120, 60, { c: 'green' }), T(110, 210, '111', { anchor: 'middle', size: 30 }),
              T(410, 120, '001  010  100', { anchor: 'middle', size: 28, c: 'red' }),
              T(410, 210, '011  101  110', { anchor: 'middle', size: 28, c: 'red' }),
              A(300, 110, 182, 110, { c: 'blue' }), A(300, 200, 182, 200, { c: 'blue' }),
              T(240, 162, 'decode', { anchor: 'middle', size: 22, c: 'blue' }),
              H(70, 262, 500, 44, { c: 'yellow' }),
              T(320, 294, 'never stored, so seeing one means damage', { anchor: 'middle', size: 24 })
            ],
            takeaway: 'A code: few allowed patterns, so damage shows.',
            widget: { type: 'steps', steps: [
              { say: 'The information: one bit.', show: '0 or 1' },
              { say: '*Encode* it into three bits.', show: '0 → 000 · 1 → 111' },
              { say: 'The *codewords* are the only patterns you ever store.', show: '000, 111' },
              { say: 'Any other pattern is a sign of damage.', show: '001 010 100 011 101 110' },
              { say: 'Each sits one flip from one codeword and two flips from the other.', show: '010: one flip from 000, two from 111' },
              { say: '*Decode* to the nearest codeword.', show: '010 → 000 → 0' },
              { say: 'The cost and the gain.', show: '3 physical bits store 1 protected bit · any one flip is fixed' }
            ] },
            check: {
              q: 'Which of these is a codeword of the three-bit repetition code?',
              options: ['111', '101', '011', '110'],
              answer: 0,
              why: 'Only 000 and 111 are codewords. The other patterns only appear after an error.'
            }
          },
          {
            title: 'Two rules a quantum code must obey',
            buildsOn: 'The code tab used two moves: copy the bit three times, then read all three to vote. A qubit allows neither as it stands.',
            leadsTo: 'Section 5 gets around both rules: spread the qubit with CNOTs instead of copying, and later check relations instead of values.',
            idea: [
              '*No copying*: no gate turns (α|0⟩ + β|1⟩)|0⟩ into two copies for every α and β. Try CNOT on |+⟩|0⟩ below.',
              'You get the Bell state, not |+⟩|+⟩. CNOT repeats the 0/1 pattern, not the amplitudes.',
              '*No peeking*: reading the qubits to vote collapses them to 0s and 1s. α and β are lost.',
              'So a quantum code must store the qubit without copies, and find errors without reading the data.'
            ],
            sketch: [
              T(160, 40, 'no copying', { anchor: 'middle', size: 28, c: 'red' }),
              T(160, 96, '|+⟩|0⟩', { anchor: 'middle', size: 30 }),
              A(160, 112, 160, 160), T(176, 142, 'CNOT', { size: 22 }),
              T(160, 196, 'Bell, not |+⟩|+⟩', { anchor: 'middle', size: 24, c: 'green' }),
              L([[320, 30], [320, 220]], { dash: true }),
              T(480, 40, 'no peeking', { anchor: 'middle', size: 28, c: 'red' }),
              T(480, 96, 'α|0⟩ + β|1⟩', { anchor: 'middle', size: 28 }),
              A(480, 112, 480, 160), T(496, 142, 'read', { size: 22 }),
              T(480, 196, '0 or 1: α, β gone', { anchor: 'middle', size: 24, c: 'red' }),
              H(40, 246, 560, 44, { c: 'yellow' }),
              T(320, 278, 'spread it out, and check only relations', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'A quantum code can neither copy the qubit nor read it.',
            widget: { type: 'multi', n: 2, presets: ['plus0', 'plusplus'], start: 'plus0', ops: ['CNOT12'], independence: true, reset: true },
            check: {
              q: 'You apply CNOT12 to |+⟩|0⟩. Do you get two copies of |+⟩?',
              options: ['No, you get the Bell state (|00⟩ + |11⟩)/√2', 'Yes, |+⟩|+⟩', 'Yes, but only half the time', 'No, you get |00⟩'],
              answer: 0,
              why: 'CNOT acts on 00 and 10 separately: 00 stays, 10 becomes 11. Two copies of |+⟩ would put 25% on all four patterns.'
            }
          }
        ]
      },

      /* ============================ SECTION 5 ============================ */
      {
        title: 'Spreading one qubit over three',
        intro: 'The bit code stored 0 as 000. The qubit version stores α|0⟩ + β|1⟩ as α|000⟩ + β|111⟩, without making copies.',
        bridge: 'You can build α|000⟩ + β|111⟩ and you know it is one qubit spread out, not three copies. Section 6 lets noise flip one qubit and finds it without reading the data.',
        tabs: [
          {
            title: 'Three qubits, eight amplitudes',
            buildsOn: 'Section 3 gave two qubits four amplitudes, one per readout pattern. Three qubits also get one per pattern, and there are eight.',
            leadsTo: 'Next, how to prepare such a state. First, how a gate like CNOT acts on a sum of several patterns.',
            idea: [
              'Three qubits: eight patterns, 000 up to 111, so eight amplitudes. Their squares still add to 1.',
              'Three qubits *can* put weight on all eight. The code is a choice: we only ever prepare states that use 000 and 111.',
              'Same codewords as the bit code. Bits hold one of them at a time; qubits hold both at once, weighted: *α|000⟩ + β|111⟩*.',
              'The other six patterns are the *error zone*. Weight showing up there means something disturbed the qubits.'
            ],
            sketch: [
              T(60, 40, '000', { anchor: 'middle', size: 26 }), T(132, 40, '001', { anchor: 'middle', size: 26 }),
              T(204, 40, '010', { anchor: 'middle', size: 26 }), T(276, 40, '011', { anchor: 'middle', size: 26 }),
              T(348, 40, '100', { anchor: 'middle', size: 26 }), T(420, 40, '101', { anchor: 'middle', size: 26 }),
              T(492, 40, '110', { anchor: 'middle', size: 26 }), T(564, 40, '111', { anchor: 'middle', size: 26 }),
              H(30, 52, 60, 150, { c: 'yellow' }), H(534, 52, 60, 150, { c: 'yellow' }),
              B(36, 80, 48, 120, { c: 'blue' }), B(540, 120, 48, 80, { c: 'blue' }),
              B(108, 196, 48, 4), B(180, 196, 48, 4), B(252, 196, 48, 4), B(324, 196, 48, 4), B(396, 196, 48, 4), B(468, 196, 48, 4),
              L([[20, 204], [600, 204]]),
              T(60, 236, 'α', { anchor: 'middle', c: 'red', size: 32 }), T(564, 236, 'β', { anchor: 'middle', c: 'red', size: 32 }),
              T(300, 274, 'code state: only 000 and 111 carry weight', { anchor: 'middle', size: 30 }),
              T(300, 308, 'α|000⟩ + β|111⟩', { anchor: 'middle', size: 30, c: 'green' })
            ],
            takeaway: 'We choose to use only 000 and 111. The other six flag errors.',
            widget: { type: 'multi', n: 3, presets: ['zero3', 'plus00', 'ghz', 'log'], start: 'log', slider: 'log', ops: ['H1', 'X1', 'X2', 'X3'] },
            check: {
              q: 'Which patterns does α|000⟩ + β|111⟩ put weight on?',
              options: ['000 and 111', 'All eight', '001 and 110', 'Only 000'],
              answer: 0,
              why: 'Only 000 and 111 have nonzero amplitude.'
            }
          },
          {
            title: 'A gate acts on each pattern',
            buildsOn: 'The eight-amplitudes tab wrote states as sums of patterns. CNOT in Section 3 was described on single patterns like |10⟩.',
            leadsTo: 'Next, the same rule with two CNOTs on three qubits. That builds the code state.',
            idea: [
              'A state like α|00⟩ + β|10⟩ is a sum of patterns. A gate acts on each pattern on its own, and each keeps its amplitude.',
              'CNOT12 on |00⟩: control is 0, nothing happens. On |10⟩: control is 1, so qubit 2 flips, giving |11⟩.',
              'So CNOT12 turns α|00⟩ + β|10⟩ into *α|00⟩ + β|11⟩*. The amplitudes ride along unchanged.'
            ],
            sketch: [
              T(320, 46, 'α|00⟩ + β|10⟩', { anchor: 'middle', size: 32 }),
              A(260, 66, 170, 124, { c: 'blue' }), A(380, 66, 470, 124, { c: 'red' }),
              B(60, 130, 210, 56, { c: 'blue' }), T(165, 166, '|00⟩ → |00⟩', { anchor: 'middle', size: 26, c: 'blue' }),
              B(370, 130, 210, 56, { c: 'red' }), T(475, 166, '|10⟩ → |11⟩', { anchor: 'middle', size: 26, c: 'red' }),
              T(165, 214, 'control 0: stay', { anchor: 'middle', size: 22 }),
              T(475, 214, 'control 1: flip q2', { anchor: 'middle', size: 22 }),
              H(170, 238, 300, 44, { c: 'yellow' }),
              T(320, 270, 'α|00⟩ + β|11⟩', { anchor: 'middle', size: 30 }),
              T(320, 312, 'amplitudes ride along', { anchor: 'middle', size: 22, c: 'green' })
            ],
            takeaway: 'A gate acts on each pattern. The amplitudes ride along.',
            widget: { type: 'steps', steps: [
              { say: 'Start: qubit 1 is α|0⟩ + β|1⟩, qubit 2 is |0⟩.', show: '(α|0⟩ + β|1⟩)|0⟩' },
              { say: 'Multiply out, like the coin table.', show: 'α|00⟩ + β|10⟩' },
              { say: 'CNOT12 on the first pattern: the control is 0, no change.', show: 'α|00⟩  →  α|00⟩' },
              { say: 'On the second pattern: the control is 1, so qubit 2 flips.', show: 'β|10⟩  →  β|11⟩' },
              { say: 'Add the pieces back up.', show: 'α|00⟩ + β|11⟩' },
              { say: 'With α = β = 0.707 this is the Bell state from Section 3.', show: '0.707|00⟩ + 0.707|11⟩' }
            ] },
            check: {
              q: 'CNOT12 acts on 0.6|00⟩ + 0.8|10⟩. Result?',
              options: ['0.6|00⟩ + 0.8|11⟩', '0.6|01⟩ + 0.8|11⟩', '0.8|00⟩ + 0.6|11⟩', '0.6|00⟩ + 0.8|10⟩'],
              answer: 0,
              why: '|00⟩ has control 0 and stays. |10⟩ has control 1 and becomes |11⟩. Each keeps its amplitude.'
            }
          },
          {
            title: 'Encoding, one gate at a time',
            buildsOn: 'The per-pattern tab ran one CNOT on a sum of two patterns. Encoding does the same thing twice, on three qubits.',
            leadsTo: 'Next, run the two CNOTs yourself and watch the weight jump from pattern to pattern.',
            idea: [
              'Start: q1 = α|0⟩ + β|1⟩, q2 = q3 = |0⟩. Multiplied out: *α|000⟩ + β|100⟩*. Only two patterns, since q2 and q3 are surely 0.',
              'CNOT q1→q2 moves β from 100 to 110: *α|000⟩ + β|110⟩*. 100 is now empty, so a readout can no longer give 100.',
              'CNOT q1→q3 moves β from 110 to 111: *α|000⟩ + β|111⟩*. 000 never moves, because its q1 is 0.',
              'A CNOT only moves weight from one pattern to another. It never splits one into several. Two patterns in, two out.'
            ],
            sketch: [
              T(250, 40, 'state', { anchor: 'middle', size: 24, c: 'blue' }),
              T(500, 40, 'empty now', { anchor: 'middle', size: 24, c: 'red' }),
              L([[20, 56], [620, 56]]),
              T(30, 100, 'start', { size: 24 }), T(250, 100, 'α|000⟩ + β|100⟩', { anchor: 'middle', size: 28 }), T(500, 100, 'the other 6', { anchor: 'middle', size: 24, c: 'red' }),
              T(30, 160, 'CNOT q1→q2', { size: 22 }), T(270, 160, 'α|000⟩ + β|110⟩', { anchor: 'middle', size: 28 }), T(500, 160, '+ 100', { anchor: 'middle', size: 24, c: 'red' }),
              H(160, 194, 220, 40, { c: 'yellow' }),
              T(30, 222, 'CNOT q1→q3', { size: 22 }), T(270, 222, 'α|000⟩ + β|111⟩', { anchor: 'middle', size: 28 }), T(500, 222, '+ 110', { anchor: 'middle', size: 24, c: 'red' }),
              T(320, 296, 'weight moves, it never splits: 2 in, 2 out', { anchor: 'middle', size: 24, c: 'green' })
            ],
            takeaway: 'Each CNOT moves β to a new pattern. 2 patterns in, 2 out.',
            widget: { type: 'steps', steps: [
              { say: 'Start: q1 holds the data, q2 and q3 are blank.', show: 'q1 = α|0⟩ + β|1⟩ · q2 = |0⟩ · q3 = |0⟩' },
              { say: 'Multiply out. q2 and q3 are surely 0, so only two of the eight patterns get weight.', show: 'α|000⟩ + β|100⟩ · the other six: 0' },
              { say: 'CNOT q1→q2 on 000: q1 is 0, so nothing happens.', show: 'α|000⟩  →  α|000⟩' },
              { say: 'CNOT q1→q2 on 100: q1 is 1, so q2 flips.', show: 'β|100⟩  →  β|110⟩' },
              { say: 'The β weight *moved*. 100 is now empty: its chance is 0.', show: 'α|000⟩ + β|110⟩ · 100: 0' },
              { say: 'CNOT q1→q3 on 000: nothing. On 110: q1 is 1, so q3 flips.', show: 'β|110⟩  →  β|111⟩' },
              { say: 'β moved again, so 110 is empty too.', show: 'α|000⟩ + β|111⟩ · 100: 0 · 110: 0' },
              { say: 'Two patterns in, two patterns out. α and β never changed. This is *encoding*.', show: 'only 000 and 111 carry weight' }
            ] },
            check: {
              q: 'Right after CNOT q1→q2, what is the chance of reading 100?',
              options: ['0', '|β|²', '|α|²', '1/8'],
              answer: 0,
              why: 'CNOT moved all of the β weight from 100 to 110. 100 has amplitude 0 now, so its chance is 0.'
            }
          },
          {
            title: 'Encoding: try it',
            buildsOn: 'The previous tab did encoding on paper, one gate at a time. Here you press the two CNOTs yourself.',
            leadsTo: 'Next, why the result is not three copies of the qubit, even though each pattern repeats one bit.',
            idea: [
              'Below, the bars start on 000 (α) and 100 (β). Press CNOT q1→q2: the β bar jumps to 110 and 100 empties. Then CNOT q1→q3.',
              'The α bar on 000 never moves. The slider changes α and β: the bars change size, but still only two patterns are used.',
              'Result: *α|000⟩ + β|111⟩*. One *logical qubit* stored in three physical qubits. This step is *encoding*.'
            ],
            sketch: [
              T(10, 88, 'α|0⟩+β|1⟩', { size: 24 }), T(24, 168, '|0⟩', { size: 28 }), T(24, 248, '|0⟩', { size: 28 }),
              L([[100, 80], [420, 80]]), L([[70, 160], [420, 160]]), L([[70, 240], [420, 240]]),
              D(220, 80, { c: 'red' }), L([[220, 80], [220, 160]], { c: 'red' }), O(220, 160, 14, { c: 'red' }),
              L([[206, 160], [234, 160]], { c: 'red' }),
              D(320, 80, { c: 'blue' }), L([[320, 80], [320, 240]], { c: 'blue' }), O(320, 240, 14, { c: 'blue' }),
              L([[306, 240], [334, 240]], { c: 'blue' }),
              T(440, 150, 'α|000⟩\n+ β|111⟩', { size: 32 }),
              H(436, 108, 170, 78, { c: 'yellow' }),
              T(320, 296, 'repeats the pattern, not (α, β)', { anchor: 'middle', size: 28, c: 'red' })
            ],
            takeaway: 'Two CNOTs encode: α|0⟩+β|1⟩ → α|000⟩+β|111⟩.',
            widget: { type: 'multi', n: 3, presets: [], start: 'enc', slider: 'enc', ops: ['CNOT12', 'CNOT13'], reset: true },
            check: {
              q: 'After CNOT12 only (before CNOT13), the state is…',
              options: ['α|000⟩ + β|110⟩', 'α|000⟩ + β|111⟩', 'α|000⟩ + β|100⟩', 'α|110⟩ + β|000⟩'],
              answer: 0,
              why: 'CNOT12 flips qubit 2 only in the pattern 100, giving 110. Qubit 3 waits for CNOT13.'
            }
          },
          {
            title: 'Spread out, not three copies',
            buildsOn: 'The encoding tab built α|000⟩ + β|111⟩. Each pattern repeats one bit, so it is tempting to call it three copies.',
            leadsTo: 'Section 6 lets noise flip one of the three qubits and asks how to find it without reading.',
            idea: [
              'Three real copies would be (α|0⟩+β|1⟩)(α|0⟩+β|1⟩)(α|0⟩+β|1⟩). Multiplied out, that fills all eight patterns.',
              'The code state fills only 000 and 111. Like the Bell state, the three qubits are glued: entangled.',
              'Read q1 of |+++⟩ (copies): q2 and q3 are untouched. Read q1 of the code: all three collapse together.'
            ],
            sketch: [
              T(30, 74, '3 copies', { size: 26, c: 'blue' }),
              H(180, 44, 36, 40, { c: 'mint' }), H(232, 44, 36, 40, { c: 'mint' }), H(284, 44, 36, 40, { c: 'mint' }), H(336, 44, 36, 40, { c: 'mint' }),
              H(388, 44, 36, 40, { c: 'mint' }), H(440, 44, 36, 40, { c: 'mint' }), H(492, 44, 36, 40, { c: 'mint' }), H(544, 44, 36, 40, { c: 'mint' }),
              L([[170, 86], [600, 86]]),
              T(30, 160, 'code', { size: 26, c: 'green' }),
              H(180, 110, 36, 60, { c: 'yellow' }), H(544, 110, 36, 60, { c: 'yellow' }),
              L([[170, 172], [600, 172]]),
              T(198, 200, '000', { anchor: 'middle', size: 20 }), T(562, 200, '111', { anchor: 'middle', size: 20 }),
              T(320, 252, 'copies: all 8 patterns, separate qubits', { anchor: 'middle', size: 24, c: 'blue' }),
              T(320, 292, 'code: 2 patterns, glued like a Bell pair', { anchor: 'middle', size: 24, c: 'green' })
            ],
            takeaway: 'One qubit spread over three is entangled, not copied.',
            widget: { type: 'multi', n: 3, presets: ['ghz', 'plus3'], start: 'ghz', measure: [1], ops: [], reset: true },
            check: {
              q: 'You read q1 of α|000⟩ + β|111⟩ and get 1. What are q2 and q3 now?',
              options: ['Both 1, for sure', 'Each still α|0⟩ + β|1⟩', 'Random', 'Both 0'],
              answer: 0,
              why: 'Only the pattern 111 has q1 = 1, so the whole state becomes |111⟩. Like the Bell pair, the three are glued.'
            }
          }
        ]
      },

      /* ============================ SECTION 6 ============================ */
      {
        title: 'Finding a flip without looking',
        intro: 'A flip moves the code state off its codewords. Parity checks find which qubit moved, without reading α or β.',
        bridge: 'You can encode a qubit, find a single flip without reading the data, and undo it. QEC basics picks up here: other kinds of error, small drifts, the limits of this code, and bigger codes.',
        tabs: [
          {
            title: 'What a flip does to the code',
            buildsOn: 'Section 5 built α|000⟩ + β|111⟩. Section 4 showed an X error swapping 0 and 1. Now X hits one of the three qubits.',
            leadsTo: 'Next, the obvious fix for bits, reading all three and voting, and why it destroys the qubit.',
            idea: [
              'X on q2 flips the middle bit of every pattern: α|000⟩ + β|111⟩ becomes *α|010⟩ + β|101⟩*.',
              'α and β are still intact. They just moved to two patterns outside the code.',
              'Each single flip has its own pair: q1 gives 100, 011. q2 gives 010, 101. q3 gives 001, 110.'
            ],
            sketch: [
              T(330, 40, 'with α', { anchor: 'middle', size: 22, c: 'red' }),
              T(490, 40, 'with β', { anchor: 'middle', size: 22, c: 'blue' }),
              H(30, 64, 580, 38, { c: 'mint' }),
              T(40, 92, 'no flip', { size: 24 }), T(330, 92, '000', { anchor: 'middle', size: 28 }), T(490, 92, '111', { anchor: 'middle', size: 28 }),
              T(40, 142, 'X on q1', { size: 24, c: 'red' }), T(330, 142, '100', { anchor: 'middle', size: 28 }), T(490, 142, '011', { anchor: 'middle', size: 28 }),
              T(40, 192, 'X on q2', { size: 24, c: 'red' }), T(330, 192, '010', { anchor: 'middle', size: 28 }), T(490, 192, '101', { anchor: 'middle', size: 28 }),
              T(40, 242, 'X on q3', { size: 24, c: 'red' }), T(330, 242, '001', { anchor: 'middle', size: 28 }), T(490, 242, '110', { anchor: 'middle', size: 28 }),
              T(320, 298, 'each flip has its own pair of patterns', { anchor: 'middle', size: 26, c: 'green' })
            ],
            takeaway: 'A flip moves α and β to a pair of its own.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X1', 'X2', 'X3'], codeSpace: true, reset: true },
            check: {
              q: 'X hits q3 of α|000⟩ + β|111⟩. Result?',
              options: ['α|001⟩ + β|110⟩', 'α|100⟩ + β|011⟩', 'β|000⟩ + α|111⟩', 'α|000⟩ + β|111⟩'],
              answer: 0,
              why: 'X flips the last bit in both patterns: 000 → 001 and 111 → 110. α and β stay with their patterns.'
            }
          },
          {
            title: 'Why not just read and vote?',
            buildsOn: 'The flip tab showed each error has its own pair of patterns. For bits, Section 4 found the flip by reading all three and voting.',
            leadsTo: 'Next, a gentler question to ask the qubits: not "what are you?" but "do you two agree?".',
            idea: [
              'Read all three of α|010⟩ + β|101⟩ and you get 010 or 101. Both say "q2 is the odd one out". The flip is found.',
              'But the readout collapsed the state. You now hold |010⟩ or |101⟩, and α and β are gone for good.',
              'Fixing q2 then gives |000⟩ or |111⟩: a plain bit, not the qubit you stored. We must find the flip *without* reading values.'
            ],
            sketch: [
              T(320, 46, 'α|010⟩ + β|101⟩', { anchor: 'middle', size: 32 }),
              A(320, 64, 320, 110, { c: 'red' }), T(340, 94, 'read all three', { size: 22, c: 'red' }),
              B(220, 116, 200, 56), T(320, 152, '010  or  101', { anchor: 'middle', size: 28 }),
              A(220, 160, 130, 206, { c: 'green' }), T(120, 236, 'q2 is the odd one', { anchor: 'middle', size: 22, c: 'green' }),
              A(420, 160, 510, 206, { c: 'red' }), T(520, 236, 'α, β gone', { anchor: 'middle', size: 24, c: 'red' }),
              H(70, 262, 500, 44, { c: 'yellow' }),
              T(320, 294, 'find the flip without reading values', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'Reading finds the flip but destroys α and β.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X2'], measure: [1, 2, 3], codeSpace: true, reset: true },
            check: {
              q: 'You read all three qubits of α|010⟩ + β|101⟩. Can you still recover α and β?',
              options: ['No, the readout collapsed the state', 'Yes, flip q2 back', 'Yes, from the vote', 'Only if α = β'],
              answer: 0,
              why: 'The readout left a single pattern, 010 or 101. The numbers α and β are not stored anywhere any more.'
            }
          },
          {
            title: 'Parity: ask about a relation',
            buildsOn: 'The reading tab showed that full readouts destroy the qubit. Parity asks for less: only whether two qubits agree.',
            leadsTo: 'Next, how a helper qubit, the ancilla, measures parity without reading q1 or q2.',
            idea: [
              '*Parity* of two bits: 0 (even) if they match, 1 (odd) if they differ. 00 and 11 give 0; 01 and 10 give 1.',
              'In α|000⟩ + β|111⟩ every pair matches in both patterns, so the parity is 0 for sure. It says nothing about α or β.',
              'After a flip it changes: in 010 and in 101, q1 and q2 differ. Their parity is 1, so the error shows.'
            ],
            sketch: [
              T(80, 50, 'q1 q2', { anchor: 'middle', size: 26 }), T(240, 50, 'parity', { anchor: 'middle', size: 26 }),
              L([[30, 64], [320, 64]]),
              T(80, 100, '0 0', { anchor: 'middle', size: 28 }), T(240, 100, '0  even', { anchor: 'middle', size: 26, c: 'green' }),
              T(80, 145, '1 1', { anchor: 'middle', size: 28 }), T(240, 145, '0  even', { anchor: 'middle', size: 26, c: 'green' }),
              T(80, 190, '0 1', { anchor: 'middle', size: 28 }), T(240, 190, '1  odd', { anchor: 'middle', size: 26, c: 'red' }),
              T(80, 235, '1 0', { anchor: 'middle', size: 28 }), T(240, 235, '1  odd', { anchor: 'middle', size: 26, c: 'red' }),
              B(370, 70, 240, 120, { c: 'blue' }),
              T(490, 118, 'same or', { anchor: 'middle', size: 28, c: 'blue' }), T(490, 158, 'different?', { anchor: 'middle', size: 28, c: 'blue' }),
              H(40, 262, 560, 44, { c: 'yellow' }),
              T(320, 294, 'a relation, never the values', { anchor: 'middle', size: 28 })
            ],
            takeaway: 'Parity reads a relation, not a value.',
            widget: { type: 'multi', n: 3, presets: ['log', 'ghz'], start: 'log', slider: 'log', ops: ['X1', 'X2', 'X3'], parity: [[1, 2], [2, 3]], codeSpace: true, reset: true },
            check: {
              q: 'Parity of q1 and q2 in α|000⟩ + β|111⟩ is…',
              options: ['Odd, always', 'Even, always', '50/50', 'Depends on α'],
              answer: 1,
              why: 'In 000 and 111 the two qubits match, so the parity is even whatever α and β are.'
            }
          },
          {
            title: 'How the ancilla reads parity',
            buildsOn: 'The parity tab defined the question. This tab builds the circuit that asks it, with one extra qubit and two CNOTs.',
            leadsTo: 'Next, two such checks together. Their answers point at exactly which qubit flipped.',
            idea: [
              'Add a helper qubit, the *ancilla*, starting at |0⟩. CNOT from q1 flips it if q1 is 1. CNOT from q2 flips it if q2 is 1.',
              'Flipped twice is back to 0. So the ancilla ends at 0 when q1 and q2 match, and at 1 when they differ.',
              'Then read the ancilla, not q1 or q2. The data qubits are never measured.'
            ],
            sketch: [
              T(24, 88, 'q1', { size: 28 }), T(24, 158, 'q2', { size: 28 }), T(14, 238, 'ancilla\n|0⟩', { size: 22, c: 'green' }),
              L([[70, 80], [420, 80]]), L([[70, 150], [420, 150]]), L([[84, 232], [420, 232]], { c: 'green' }),
              D(190, 80, { c: 'red' }), L([[190, 80], [190, 232]], { c: 'red' }), O(190, 232, 14, { c: 'red' }), L([[176, 232], [204, 232]], { c: 'red' }),
              D(290, 150, { c: 'blue' }), L([[290, 150], [290, 232]], { c: 'blue' }), O(290, 232, 14, { c: 'blue' }), L([[276, 232], [304, 232]], { c: 'blue' }),
              B(380, 208, 54, 48, { c: 'green' }), T(407, 242, 'M', { anchor: 'middle', size: 30, c: 'green' }),
              T(440, 100, 'ancilla =\nq1 ⊕ q2', { size: 26 }),
              H(436, 146, 160, 34, { c: 'yellow' }),
              T(440, 172, 'even → 0', { size: 26, c: 'green' }),
              T(440, 208, 'odd → 1', { size: 26, c: 'red' }),
              T(300, 304, 'we learn "same or different", never the values', { anchor: 'middle', size: 26 })
            ],
            takeaway: 'The ancilla flips once per 1, so it ends at the parity.',
            widget: { type: 'steps', steps: [
              { say: 'The ancilla starts at 0. Take q1 q2 = 00: neither CNOT fires.', show: 'flips: 0 · ancilla 0 · even' },
              { say: 'q1 q2 = 10: the CNOT from q1 fires.', show: 'flips: 1 · ancilla 1 · odd' },
              { say: 'q1 q2 = 01: the CNOT from q2 fires.', show: 'flips: 1 · ancilla 1 · odd' },
              { say: 'q1 q2 = 11: both fire, and the ancilla is back at 0.', show: 'flips: 2 · ancilla 0 · even' },
              { say: 'On the code state, 000 and 111 both leave the ancilla at 0.', show: 'α|000⟩|0⟩ + β|111⟩|0⟩' },
              { say: 'The ancilla is the same in both patterns, so reading it gives 0 and leaves α and β in place.', show: 'read ancilla → 0 · data untouched' }
            ] },
            check: {
              q: 'q1 = 1 and q2 = 1. The ancilla starts at 0. After both CNOTs it is…',
              options: ['0', '1', 'Random', 'Depends on α'],
              answer: 0,
              why: 'Each CNOT flips it once. Two flips bring it back to 0, meaning even: the qubits match.'
            }
          },
          {
            title: 'A flip shows up as a syndrome',
            buildsOn: 'The ancilla tab measured one parity. The code uses two: q1 with q2, and q2 with q3. Here one qubit gets flipped.',
            leadsTo: 'Next, why running these checks does not wipe out α and β, even though it is a readout.',
            idea: [
              'Two checks: check 1 asks "q1 = q2?", check 2 asks "q2 = q3?". Each answers 0 (match) or 1 (differ).',
              'The pair of answers is the *syndrome*. Each single flip gives a different one.',
              '(0,0) none, (1,0) q1, (1,1) q2, (0,1) q3. Flip that qubit back to repair.'
            ],
            sketch: [
              B(40, 60, 70, 70), B(130, 60, 70, 70, { c: 'red' }), B(220, 60, 70, 70),
              T(75, 105, 'q1', { anchor: 'middle', size: 28 }), T(165, 105, 'q2', { anchor: 'middle', size: 28, c: 'red' }), T(255, 105, 'q3', { anchor: 'middle', size: 28 }),
              O(165, 95, 56, { c: 'red', dash: true }),
              K([[75, 140], [90, 166], [150, 166], [165, 140]], { c: 'blue' }),
              T(120, 196, 'check 1: differ', { anchor: 'middle', size: 24, c: 'blue' }),
              K([[165, 140], [180, 166], [240, 166], [255, 140]], { c: 'blue' }),
              T(210, 236, 'check 2: differ', { anchor: 'middle', size: 24, c: 'blue' }),
              T(330, 70, 'syndrome   →   fix', { size: 28, c: 'green' }),
              T(330, 112, '(0,0)    none', { size: 28 }),
              T(330, 150, '(1,0)    flip q1 back', { size: 28 }),
              H(326, 166, 270, 40, { c: 'yellow' }),
              T(330, 192, '(1,1)    flip q2 back', { size: 28 }),
              T(330, 232, '(0,1)    flip q3 back', { size: 28 }),
              T(300, 298, 'the syndrome names the broken qubit, not the data', { anchor: 'middle', size: 26, c: 'red' })
            ],
            takeaway: 'Two parity answers pinpoint a single flip.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X1', 'X2', 'X3'], syndrome: true, codeSpace: true, reset: true },
            check: {
              q: 'The syndrome reads (1,1). Which qubit flipped?',
              options: ['q1', 'q2', 'q3', 'None'],
              answer: 1,
              why: '(1,1) means both checks fire, and only q2 sits in both pairs.'
            }
          },
          {
            title: 'Why the check leaves α and β alone',
            buildsOn: 'The syndrome tab read the syndrome, which is a readout. This tab shows why that readout does not destroy the encoded data.',
            leadsTo: 'Next, the whole cycle in one place, and what this code still cannot fix.',
            idea: [
              'Parity gives the same answer for 000 and 111, so it cannot tell them apart. Both keep their weights.',
              'Only the relation is read. The encoded (α, β) survives the check.',
              'Small drifts instead of full flips? The checks handle those too. That needs one more idea, saved for QEC basics, Section 2.'
            ],
            sketch: [
              B(30, 40, 130, 56), T(95, 78, '000', { anchor: 'middle', size: 30 }), T(95, 118, 'weight α', { anchor: 'middle', size: 22, c: 'red' }),
              B(30, 156, 130, 56), T(95, 194, '111', { anchor: 'middle', size: 30 }), T(95, 234, 'weight β', { anchor: 'middle', size: 22, c: 'red' }),
              A(170, 68, 260, 120, { c: 'blue' }), A(170, 184, 260, 132, { c: 'blue' }),
              B(262, 90, 200, 64, { c: 'blue' }), T(362, 114, 'check asks:', { anchor: 'middle', size: 22 }), T(362, 142, 'same or different?', { anchor: 'middle', size: 22, c: 'blue' }),
              A(470, 122, 524, 122, { c: 'green' }),
              H(526, 96, 100, 54, { c: 'mint' }),
              T(530, 124, 'α, β\nkept', { size: 26, c: 'green' }),
              T(40, 284, 'small drifts, not full flips?', { size: 26 }),
              T(40, 314, 'handled in QEC basics, Section 2', { size: 26, c: 'red' })
            ],
            takeaway: 'Checks read the relation, so α and β survive.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X2'], syndrome: true, parity: [[1, 2], [2, 3]], codeSpace: true, reset: true },
            check: {
              q: 'Why does the parity check not collapse α|000⟩ + β|111⟩?',
              options: [
                'It is not a real measurement',
                'Both 000 and 111 give the same parity, so it cannot separate them',
                'The ancilla absorbs α and β',
                'It only works for α = β'
              ],
              answer: 1,
              why: 'A readout only collapses what its answers distinguish. Both patterns give "even", so they stay together.'
            }
          },
          {
            title: 'One full round',
            buildsOn: 'The earlier tabs gave each step on its own: encode, error, parity checks, syndrome, fix. This tab runs them in order.',
            leadsTo: 'QEC basics starts from here: the errors this code misses, how many flips it survives, and bigger codes.',
            idea: [
              'One round: encode with two CNOTs, noise acts, measure both checks, read the syndrome, flip the named qubit back.',
              'Any single flip, on any of the three qubits, is found and undone. α and β come out exactly as they went in.',
              'The code is not perfect. What it misses, and how bigger codes catch it, is where QEC basics begins.'
            ],
            sketch: [
              B(20, 50, 130, 56), T(85, 86, 'encode', { anchor: 'middle', size: 24 }),
              A(152, 78, 182, 78), B(184, 50, 130, 56, { c: 'red' }), T(249, 86, 'noise', { anchor: 'middle', size: 24, c: 'red' }),
              A(316, 78, 346, 78), B(348, 50, 130, 56, { c: 'blue' }), T(413, 86, 'checks', { anchor: 'middle', size: 24, c: 'blue' }),
              A(480, 78, 510, 78), B(512, 50, 108, 56, { c: 'green' }), T(566, 86, 'fix', { anchor: 'middle', size: 24, c: 'green' }),
              H(36, 140, 330, 40, { c: 'mint' }),
              T(40, 170, '1 flip  →  fixed', { size: 26, c: 'green' }),
              T(40, 224, 'α and β  →  unchanged', { size: 26, c: 'green' }),
              T(40, 278, 'what it misses  →  QEC basics', { size: 26, c: 'blue' })
            ],
            takeaway: 'Encode, flip, check, fix: any single flip is undone.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['X1', 'X2', 'X3'], syndrome: true, codeSpace: true, reset: true },
            check: {
              q: 'Noise flips q3. The syndrome reads (0,1). What do you do, and what is left?',
              options: ['Flip q3 back: α|000⟩ + β|111⟩ again', 'Flip q1 back: the state is fixed', 'Read all three and vote', 'Nothing: (0,1) means no error'],
              answer: 0,
              why: '(0,1) means q1 and q2 match but q2 and q3 differ, so q3 is the odd one out. Flipping it back restores α|000⟩ + β|111⟩.'
            }
          }
        ]
      }
    ]
  });
})();
