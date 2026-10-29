(function () {
  const { T, B, A, L, K, O, E, H, D } = NB.sk;

  NB.register({
    id: 'quantum-basics',
    title: 'Quantum basics',
    subtitle: 'From one qubit to the three-qubit repetition code. Only what QEC needs.',
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
        bridge: 'You can tell independent from entangled, make entanglement with CNOT, and see what a readout of one qubit does to its partner. Section 4 stretches this to three qubits, the smallest code that detects a flip.',
        tabs: [
          {
            title: 'Two qubits, four amplitudes',
            buildsOn: 'Section 2 described one qubit by (α, β), one number per readout result. Two qubits need one number per readout pattern.',
            leadsTo: 'Next, the special case where the four numbers still split into one (α, β) per qubit.',
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
            title: 'Independent states and the test',
            buildsOn: 'The four-amplitudes tab had four free amplitudes. Here: when can they still be split into one (α, β) per qubit?',
            leadsTo: 'Next, what it means when the split is impossible. That is entanglement.',
            idea: [
              'Independent means each qubit has its own (α, β). Then a₀₀ = α₁α₂, a₀₁ = α₁β₂, and so on.',
              'Test: *a₀₀·a₁₁ = a₀₁·a₁₀* holds exactly when the state is independent.',
              'Try the presets. Watch the two products.'
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
              'Bell state (|00⟩ + |11⟩)/√2: the two readouts always agree, yet each alone is a fair coin.',
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
            leadsTo: 'Section 4 uses the same fact in reverse: a smart readout of a relation between qubits leaves the pattern weights alone.',
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
        title: 'Three qubits and parity',
        intro: 'Three qubits in the pattern α|000⟩ + β|111⟩ carry one qubit of information in a form that can survive a flip.',
        bridge: 'You hold the repetition code and the parity trick. The next notebook, QEC basics, starts here: errors, syndromes, and why Z-type and X-type checks are both needed.',
        tabs: [
          {
            title: 'Three qubits, eight amplitudes',
            buildsOn: 'Section 3 used four amplitudes for two qubits. Three qubits add a third bit to every pattern.',
            leadsTo: 'Next, we choose a state that uses only two of the eight patterns and see how to build it.',
            idea: [
              'Eight patterns, 000 up to 111, so eight amplitudes.',
              'A code state puts weight on only a few patterns. The rest stay zero.',
              'Here only 000 and 111 are used.'
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
            takeaway: 'The code uses two of the eight patterns.',
            widget: { type: 'multi', n: 3, presets: ['zero3', 'plus00', 'ghz', 'log'], start: 'log', slider: 'log', ops: ['H1', 'X1', 'X2', 'X3'] },
            check: {
              q: 'Which patterns does α|000⟩ + β|111⟩ put weight on?',
              options: ['000 and 111', 'All eight', '001 and 110', 'Only 000'],
              answer: 0,
              why: 'Only 000 and 111 have nonzero amplitude.'
            }
          },
          {
            title: 'Spreading one qubit over three',
            buildsOn: 'The eight-amplitudes tab named the target state. This tab builds it from one qubit and two blank ones using CNOT from the CNOT tab.',
            leadsTo: 'Next, the check that tells you whether the three qubits still agree, without reading them.',
            idea: [
              'Start with (α|0⟩ + β|1⟩)|00⟩. Two CNOTs copy the *pattern*, not the amplitudes.',
              'Result: *α|000⟩ + β|111⟩*. That is one logical qubit stored in three.',
              'The unknown (α, β) was never copied. It belongs to the whole triple.'
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
              T(320, 296, 'copies the pattern, not (α, β)', { anchor: 'middle', size: 28, c: 'red' })
            ],
            takeaway: 'Two CNOTs encode: α|0⟩+β|1⟩ → α|000⟩+β|111⟩.',
            widget: { type: 'multi', n: 3, presets: [], start: 'enc', slider: 'enc', ops: ['CNOT12', 'CNOT13'], reset: true },
            check: {
              q: 'After encoding, do the three qubits each hold a copy of (α, β)?',
              options: ['Yes, three copies', 'No. The triple holds (α, β) together', 'Only qubit 1', 'Only qubits 2 and 3'],
              answer: 1,
              why: 'Copying an unknown state is not allowed. Encoding spreads it across the three as one entangled state.'
            }
          },
          {
            title: 'Parity: ask about a relation',
            buildsOn: 'The encoding tab gave us α|000⟩ + β|111⟩. In both patterns the qubits agree. A readout should ask exactly that.',
            leadsTo: 'Next, what happens when one qubit gets flipped: the agreement breaks and the check notices.',
            idea: [
              '*Parity* of two qubits: do they match (even, 0) or differ (odd, 1)?',
              'An extra qubit, the ancilla, collects it with two CNOTs. Reading the ancilla gives the parity.',
              'In α|000⟩ + β|111⟩ every pair matches, so parity is even for sure.'
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
            title: 'A flip shows up as a syndrome',
            buildsOn: 'The parity tab built two parity checks. Here one qubit gets flipped and the two checks give a pattern.',
            leadsTo: 'Next, why running these checks does not wipe out α and β, even though it is a readout.',
            idea: [
              'Flip one qubit: now one pair differs.',
              'The two check answers together are the *syndrome*.',
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
            leadsTo: 'The QEC basics notebook takes this on: errors that are not full flips, and phase flips that these checks cannot see.',
            idea: [
              'Parity gives the same answer for 000 and 111, so it cannot tell them apart. Both keep their weights.',
              'Only the relation is read. The encoded (α, β) survives the check.',
              'A partial error is forced by the check to become either "none" or "fully flipped". Both are fixable.'
            ],
            sketch: [
              B(30, 40, 130, 56), T(95, 78, '000', { anchor: 'middle', size: 30 }), T(95, 118, 'weight α', { anchor: 'middle', size: 22, c: 'red' }),
              B(30, 156, 130, 56), T(95, 194, '111', { anchor: 'middle', size: 30 }), T(95, 234, 'weight β', { anchor: 'middle', size: 22, c: 'red' }),
              A(170, 68, 260, 120, { c: 'blue' }), A(170, 184, 260, 132, { c: 'blue' }),
              B(262, 90, 200, 64, { c: 'blue' }), T(362, 114, 'check asks:', { anchor: 'middle', size: 22 }), T(362, 142, 'same or different?', { anchor: 'middle', size: 22, c: 'blue' }),
              A(470, 122, 524, 122, { c: 'green' }),
              H(526, 96, 100, 54, { c: 'mint' }),
              T(530, 124, 'α, β\nkept', { size: 26, c: 'green' }),
              T(40, 284, 'small tilt → the check forces a choice:', { size: 26 }),
              T(40, 314, 'clean, or fully flipped. Then fix.', { size: 26, c: 'red' })
            ],
            takeaway: 'Checks read the relation, so α and β survive.',
            widget: { type: 'multi', n: 3, presets: ['log'], start: 'log', slider: 'log', ops: ['RX2', 'X2'], syndrome: true, parity: [[1, 2], [2, 3]], codeSpace: true, reset: true },
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
          }
        ]
      }
    ]
  });
})();
